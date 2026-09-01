import joblib
import os


def save_model(tfidf, tfidf_matrix, df):

    os.makedirs("models", exist_ok=True)

    joblib.dump(tfidf, "models/tfidf_vectorizer.pkl")

    joblib.dump(tfidf_matrix, "models/tfidf_matrix.pkl")

    joblib.dump(df, "models/video_data.pkl")

    print("ML model saved successfully!")