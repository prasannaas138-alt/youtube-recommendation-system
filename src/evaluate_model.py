from model_loader import load_model
from similarity import calculate_similarity
from recommendation import get_recommendations


# Load saved model
tfidf, tfidf_matrix, df = load_model()

print("Model loaded successfully!")
print("Total videos:", len(df))


def evaluate_query(query, threshold=0.10):

    # Convert query into TF-IDF vector
    query_vector = tfidf.transform([query])

    # Calculate similarity
    similarity_scores = calculate_similarity(
        query_vector,
        tfidf_matrix
    )

    # Get top 10 recommendations
    recommendations = get_recommendations(
        similarity_scores,
        df,
        n=10,
        threshold=threshold
    )

    if recommendations is None:
        print(f"\nQuery: {query}")
        print("No relevant videos found.")
        return

    # Calculate average similarity
    average_similarity = (
        recommendations["similarity_score"].mean()
    )

    # Count relevant recommendations
    relevant = (
        recommendations["similarity_score"] >= threshold
    ).sum()

    precision_at_10 = relevant / 10

    print(f"\nQuery: {query}")
    print(
        f"Average Similarity: "
        f"{average_similarity:.4f}"
    )
    print(
        f"Precision@10: "
        f"{precision_at_10:.2f}"
    )

    print("\nRecommended Videos:")
    print(
        recommendations[
            ["title", "similarity_score"]
        ].to_string(index=False)
    )


# Test queries
queries = [
    "machine learning",
    "python programming",
    "data science",
    "web development",
    "artificial intelligence"
]


for query in queries:
    evaluate_query(query)