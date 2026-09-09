import re

def get_recommendations(
    similarity_scores,
    df,
    query,
    n=100,
    threshold=0.10
):
    query = query.lower().strip()
    scores = similarity_scores.copy()

    # --------------------------------------------------
    # 1. Direct phrase matching
    # --------------------------------------------------
    for index, row in df.iterrows():

        title = str(row["title"]).lower()
        tags = str(row["tags"]).lower()
        category = str(row["category"]).lower()
        description = str(row["description"]).lower()

        direct_score = 0

        # Exact phrase in title
        if query in title:
            direct_score += 0.40

        # Exact phrase in tags
        if query in tags:
            direct_score += 0.30

        # Exact phrase in category
        if query in category:
            direct_score += 0.20

        # Exact phrase in description
        if query in description:
            direct_score += 0.10

        scores[index] += direct_score

    # --------------------------------------------------
    # 2. Sort by final score
    # --------------------------------------------------
    ranked_indices = scores.argsort()[::-1]

    top_indices = ranked_indices[:n]

    # --------------------------------------------------
    # 3. Threshold check
    # --------------------------------------------------

    if scores[top_indices[0]] < threshold:
        return None

    recommendations = df.iloc[top_indices].copy()

    recommendations["similarity_score"] = scores[top_indices]


    return recommendations[
        [
            "video_id",
            "title",
            "category",
            "channel",
            "similarity_score"
        ]
    ]