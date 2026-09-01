# import pandas as pd

# # Load dataset
# df = pd.read_csv("data/youtube_videos_03.csv")

# # Text columns
# text_columns = ['title', 'description', 'tags', 'category']

# for column in text_columns:
#     df[column] = df[column].fillna("").astype(str)

# # Combine text columns
# df['combined_text'] = (
#     df['title'] + " " +
#     df['description'] + " " +
#     df['tags'] + " " +
#     df['category']
# )

# # Convert to lowercase
# df['combined_text'] = df['combined_text'].str.lower()

# # Remove extra spaces
# df['combined_text'] = (
#     df['combined_text']
#     .str.replace(r"\s+", " ", regex=True)
#     .str.strip()
# )

# # TF-IDF
# from sklearn.feature_extraction.text import TfidfVectorizer

# tfidf = TfidfVectorizer()

# tfidf_matrix = tfidf.fit_transform(df['combined_text'])

# # Cosine similarity
# from sklearn.metrics.pairwise import cosine_similarity

# def search_video(query, n=10, threshold=0.10):

#     query_vector = tfidf.transform([query])

#     similarity_scores = cosine_similarity(
#         query_vector,
#         tfidf_matrix
#     ).flatten()

#     similarity_indices = similarity_scores.argsort()[::-1]

#     top_indices = similarity_indices[:n]

#     # Check similarity threshold
#     if similarity_scores[top_indices[0]] < threshold:
#         print("Video does not exist")
#         return None

#     # Get recommendations
#     recommendation = df.iloc[top_indices].copy()

#     recommendation['similarity_score'] = (
#         similarity_scores[top_indices]
#     )

#     return recommendation[
#         [
#             'video_id',
#             'title',
#             'category',
#             'channel',
#             'similarity_score'
#         ]
#     ]


# # Test the recommendation system
# query = input("Enter your query: ")

# result = search_video(query)

# print(result)


# from data_loader import load_data

# df = load_data()

# print(df.head())
# print("Number of videos:",len(df))

# from data_loader import load_data
# from preprocessing import preprocess_data


# df = load_data()

# df = preprocess_data(df)

# print(df[["title", "combined_text"]].head())


from data_loader import load_data
from preprocessing import preprocess_data
from tfidf_model import create_tfidf_model
from similarity import calculate_similarity
from recommendation import get_recommendations
from model_saver import save_model



# 1. Load data
df = load_data()

# 2. Preprocess data
df = preprocess_data(df)

# 3. Create TF-IDF model
tfidf, tfidf_matrix = create_tfidf_model(df)

save_model(tfidf, tfidf_matrix, df)


def search_video(query, n=10, threshold=0.10):

    # Convert user query into TF-IDF vector
    query_vector = tfidf.transform([query])

    # Calculate similarity
    similarity_scores = calculate_similarity(
        query_vector,
        tfidf_matrix
    )

    # Get recommendations
    recommendations = get_recommendations(
        similarity_scores,
        df,
        n,
        threshold
    )

    if recommendations is None:
        print("Video does not exist")
        return

    return recommendations


# User input
query = input("Enter your query: ")

results = search_video(query)

print(results)