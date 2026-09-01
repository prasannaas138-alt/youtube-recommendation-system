# YouTube Recommendation System 🎥

An ML-based YouTube-style recommendation system built using **Python, Pandas, NumPy, Scikit-learn, FastAPI, and React**.

The project, called **MLTube**, uses a content-based recommendation approach to recommend videos based on the user's search query and video content.

The dataset contains **5,000 YouTube videos**.

---

## 📌 Project Overview

Recommendation systems are widely used by platforms such as YouTube, Netflix, Spotify, and Amazon to help users discover relevant content.

In this project, I built a **content-based YouTube recommendation system** using machine learning.

The system analyzes video information such as:

- Title
- Description
- Tags
- Category

These features are combined into text and processed using **TF-IDF Vectorization**.

Then **Cosine Similarity** is used to find videos that are most similar to the user's search query.

### Example

User searches:

```text
python