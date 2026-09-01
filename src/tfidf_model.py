from sklearn.feature_extraction.text import TfidfVectorizer


def create_tfidf_model(df):

    tfidf = TfidfVectorizer()

    tfidf_matrix = tfidf.fit_transform(
        df["combined_text"]
    )

    return tfidf, tfidf_matrix