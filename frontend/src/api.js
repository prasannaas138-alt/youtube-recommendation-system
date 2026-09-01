const API_URL = "http://127.0.0.1:8000";

export async function getRecommendations(query) {
  const response = await fetch(`${API_URL}/recommend`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      query: query,
    }),
  });

  if (!response.ok) {
    throw new Error("Failed to get recommendations");
  }

  return response.json();
}