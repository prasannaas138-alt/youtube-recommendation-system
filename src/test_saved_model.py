from model_loader import load_model
from similarity import calculate_similarity
from recommendation import get_recommendations


# Load saved model
tfidf, tfidf_matrix, df = load_model()

print("Saved model loaded successfully!")
print("Number of videos:", len(df))


# Get user query
query = input("Enter your query: ")


# Convert query into TF-IDF vector
query_vector = tfidf.transform([query])


# Calculate similarity
similarity_scores = calculate_similarity(
    query_vector,
    tfidf_matrix
)


# Get recommendations
recommendations = get_recommendations(
    similarity_scores,
    df
)


if recommendations is None:
    print("Video does not exist")
else:
    print("\nRecommended Videos:")
    print(recommendations)