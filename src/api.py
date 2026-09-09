import pandas as pd

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from .model_loader import load_model
from .similarity import calculate_similarity
from .recommendation import get_recommendations


app = FastAPI(
    title="YouTube Recommendation API",
    description="ML-based YouTube video recommendation system",
    version="1.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://youtube-recommendation-system.vercel.app"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
# Load saved ML model
tfidf, tfidf_matrix, df = load_model()


class SearchRequest(BaseModel):
    query: str
    offset: int = 0
    limit: int = 12

class HomeRequest(BaseModel):
    search_history: list[str] = []
    search_frequency: dict[str, int] = {}
    offset: int = 0
    limit: int = 12
    seed: int = 0

@app.get("/")
def home():
    return {
        "message": "YouTube Recommendation API is running"
    }


@app.post("/recommend")
def recommend(request: SearchRequest):

    query_vector = tfidf.transform([request.query])

    similarity_scores = calculate_similarity(
        query_vector,
        tfidf_matrix
    )

    recommendations = get_recommendations(
        similarity_scores,
        df,
        n=100
    )

    if recommendations is None:
        return {
            "status": "success",
            "message": "No relevant videos found",
            "recommendations": []
        }

    return {
        "status": "success",
        "query": request.query,
        "count": len(recommendations),
        "recommendations": recommendations.to_dict(
            orient="records"
        )
    }

@app.post("/search")
def search(request: SearchRequest):
    query = request.query.strip()

    # Convert query into TF-IDF vector
    query_vector = tfidf.transform([query])

    # Calculate similarity against all 5,000 videos
    similarity_scores = calculate_similarity(
        query_vector,
        tfidf_matrix
    )

    # Rank the full dataset using our improved ranking
    results = get_recommendations(
        similarity_scores,
        df,
        query=query,
        n=len(df)
    )

    if results is None:
        return {
            "query": request.query,
            "count": 0,
            "videos": [],
            "has_more": False
        }

    # Get only the requested 12 videos
    start = request.offset
    end = start + request.limit

    paginated_results = results.iloc[start:end]

    return {
        "query": request.query,
        "count": len(results),
        "videos": paginated_results[
            ["video_id", "title", "category", "channel"]
        ].to_dict(orient="records"),
        "offset": request.offset,
        "limit": request.limit,
        "has_more": end < len(results)
    }

@app.post("/home")
def home(request: HomeRequest):
    history = request.search_history
    frequency = request.search_frequency

    # If there is no search history, return the normal video pool
    if not history:
        start = request.offset
        end = start + request.limit

        videos = df.iloc[start:end][
            ["video_id", "title", "category", "channel"]
        ]

        return {
            "count": len(df),
            "videos": videos.to_dict(orient="records"),
            "offset": request.offset,
            "limit": request.limit,
            "has_more": end < len(df)
        }

    # If frequency data is not available,
    # give every search topic a frequency of 1
    if not frequency:
        frequency = {
            query: 1
            for query in history
        }

    # Sort topics by:
    # 1. Search frequency
    # 2. Recent search order when frequency is tied
    history_position = {
        query.lower(): index
        for index, query in enumerate(history)
    }

    ranked_topics = sorted(
        frequency.items(),
        key=lambda item: (
            item[1],
            -history_position.get(item[0].lower(), 9999)
        ),
        reverse=True
    )

    # Get the search topics
    most_searched = (
        ranked_topics[0][0]
        if len(ranked_topics) > 0
        else None
    )

    second_searched = (
        ranked_topics[1][0]
        if len(ranked_topics) > 1
        else None
    )

    least_searched = (
        ranked_topics[-1][0]
        if len(ranked_topics) > 0
        else None
    )

    # Keep track of videos already assigned
    selected_indexes = set()

    def find_topic_videos(query):
        if not query:
            return df.iloc[0:0]

        query = query.lower().strip()

        matches = df[
            df["title"].fillna("").str.lower().str.contains(
                query,
                regex=False
            )
            |
            df["tags"].fillna("").str.lower().str.contains(
                query,
                regex=False
            )
            |
            df["category"].fillna("").str.lower().str.contains(
                query,
                regex=False
            )
        ]

        return matches[
            ~matches.index.isin(selected_indexes)
        ]

    # Build separate pools for each search level
    most_pool = find_topic_videos(most_searched)

    if second_searched:
        second_pool = find_topic_videos(second_searched)
    else:
        second_pool = df.iloc[0:0]

    if least_searched:
        least_pool = find_topic_videos(least_searched)
    else:
        least_pool = df.iloc[0:0]

    # Shuffle each personalized pool
    most_pool = most_pool.sample(frac=1, random_state=request.seed)
    second_pool = second_pool.sample(frac=1, random_state=request.seed + 1)
    least_pool = least_pool.sample(frac=1, random_state=request.seed + 2)
    # Discovery pool
    discovery_pool = df[
        ~df.index.isin(
            most_pool.index
            .union(second_pool.index)
            .union(least_pool.index)
        )
    ].sample(frac=1, random_state=request.seed + 3)
    # Build a large recommendation pool.
    #
    # Every batch tries to follow:
    # 4 most searched
    # 3 second searched
    # 1 least searched
    # 4 discovery

    recommendations_list = []

    most_position = 0
    second_position = 0
    least_position = 0
    discovery_position = 0

    while (
        most_position < len(most_pool)
        or second_position < len(second_pool)
        or least_position < len(least_pool)
        or discovery_position < len(discovery_pool)
    ):

        batch = []

        # 4 most searched
        most_batch = most_pool.iloc[
            most_position:most_position + 4
        ]

        batch.append(most_batch)
        most_position += len(most_batch)

        # 3 second searched
        second_batch = second_pool.iloc[
            second_position:second_position + 3
        ]

        batch.append(second_batch)
        second_position += len(second_batch)

        # 1 least searched
        least_batch = least_pool.iloc[
            least_position:least_position + 1
        ]

        batch.append(least_batch)
        least_position += len(least_batch)

        # 4 discovery
        discovery_batch = discovery_pool.iloc[
            discovery_position:discovery_position + 4
        ]

        batch.append(discovery_batch)
        discovery_position += len(discovery_batch)

        # Combine this batch
        batch_df = pd.concat(batch)

        if len(batch_df) == 0:
            break

        # Shuffle the batch so the user doesn't see
        # 4 + 3 + 1 + 4 in a fixed order
        batch_df = batch_df.sample(
        frac=1,
        random_state=request.seed + len(recommendations_list)
    )

        recommendations_list.append(batch_df)

    # Combine all batches
    recommendations = pd.concat(
        recommendations_list
    ).reset_index(drop=True)

    # Pagination
    start = request.offset
    end = start + request.limit

    paginated_results = recommendations.iloc[start:end]

    return {
        "count": len(recommendations),
        "videos": paginated_results[
            ["video_id", "title", "category", "channel"]
        ].to_dict(orient="records"),
        "offset": request.offset,
        "limit": request.limit,
        "has_more": end < len(recommendations)
    }