import pandas as pd

def load_data():
    df = pd.read_csv("data/youtube_videos_03.csv")
    return df