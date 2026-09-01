def preprocess_data(df):

    text_columns = [
        "title",
        "description",
        "tags",
        "category"
    ]

    # Handle missing values
    for column in text_columns:
        df[column] = df[column].fillna("").astype(str)

    # Combine text columns
    df["combined_text"] = (
        df["title"] + " " +
        df["description"] + " " +
        df["tags"] + " " +
        df["category"]
    )

    # Convert to lowercase
    df["combined_text"] = df["combined_text"].str.lower()

    # Remove extra spaces
    df["combined_text"] = (
        df["combined_text"]
        .str.replace(r"\s+", " ", regex=True)
        .str.strip()
    )

    return df