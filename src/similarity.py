from sklearn.metrics.pairwise import cosine_similarity


def calculate_similarity(query_vector, tfidf_matrix):
    similarity_scores = cosine_similarity(
        query_vector,
        tfidf_matrix
    ).flatten()

    return similarity_scores