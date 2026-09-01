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
        "http://localhost:3000"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
# Load saved ML model
tfidf, tfidf_matrix, df = load_model()


class SearchRequest(BaseModel):
    query: str


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

    query = request.query.lower()

    matching_videos = df[
        df["combined_text"].str.contains(
            query,
            case=False,
            na=False
        )
    ]

    # Return all matching results (no limit) for client-side pagination
    results = matching_videos

    return {
        "status": "success",
        "query": request.query,
        "count": len(results),
        "videos": results[
            [
                "video_id",
                "title",
                "category",
                "channel"
            ]
        ].to_dict(
            orient="records"
        )
    }
    