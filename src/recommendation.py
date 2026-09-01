def get_recommendations(
    similarity_scores,
    df,
    n=10,
    threshold=0.10
):

    similarity_indices = similarity_scores.argsort()[::-1]

    top_indices = similarity_indices[:n]

    if similarity_scores[top_indices[0]] < threshold:
        return None

    recommendations = df.iloc[top_indices].copy()

    recommendations["similarity_score"] = (
        similarity_scores[top_indices]
    )

    return recommendations[
        [
            "video_id",
            "title",
            "category",
            "channel",
            "similarity_score"
        ]
    ]