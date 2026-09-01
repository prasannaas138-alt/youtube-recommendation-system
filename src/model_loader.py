import joblib


def load_model():

    tfidf = joblib.load(
        "models/tfidf_vectorizer.pkl"
    )

    tfidf_matrix = joblib.load(
        "models/tfidf_matrix.pkl"
    )

    df = joblib.load(
        "models/video_data.pkl"
    )

    return tfidf, tfidf_matrix, df