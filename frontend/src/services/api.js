/**
 * API Service for MLTube Frontend
 * 
 * Target Backend: FastAPI running on http://127.0.0.1:8000
 * 
 * Endpoints available on backend:
 * 1. GET  /          -> Health Check
 * 2. POST /search    -> Search videos by keyword (Body: { query: string })
 * 3. POST /recommend -> Get ML recommendations (Body: { query: string })
 * 
 * CURRENT STATUS:
 * USE_MOCK_DATA is set to true by default so the UI functions standalone
 * without requiring the Python FastAPI backend to be running.
 * 
 * TO CONNECT TO FASTAPI BACKEND:
 * 1. Ensure Python FastAPI is running at http://127.0.0.1:8000
 * 2. Change `const USE_MOCK_DATA = true;` to `const USE_MOCK_DATA = false;` below.
 */

import { MOCK_VIDEOS } from '../mock/mockVideos';

const BASE_URL = 'https://youtube-recommendation-system.onrender.com';
const USE_MOCK_DATA = false; // Toggle to false when ready to connect FastAPI

/**
 * Helper to normalize backend video format to frontend schema if needed
 */
const formatBackendVideo = (item, index) => ({
  video_id: item.video_id || `vid-${index}`,
  title: item.title || 'Untitled Video',
  channel: item.channel || 'ML Channel',
  category: item.category || 'Machine Learning',
  views: item.views || '120K views',
  published_at: item.published_at || 'Recently',
  duration: item.duration || '15:00',
  gradient: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)'
});

/**
 * Health check call for GET /
 */
export const checkHealth = async () => {
  if (USE_MOCK_DATA) {
    return { status: 'success', message: 'MLTube Mock Frontend Service Active' };
  }

  try {
    const response = await fetch(`${BASE_URL}/`);
    if (!response.ok) throw new Error(`HTTP error ${response.status}`);
    return await response.json();
  } catch (error) {
    console.error('FastAPI Health Check Error:', error);
    return { status: 'error', message: 'Backend unreachable. Using local fallback mode.' };
  }
};

/**
 * Video Keyword Search call for POST /search
 * Request payload: { query: "python" }
 * Expected response: { status: "success", query: "python", count: 20, videos: [...] }
 */
export const searchVideos = async (
  query = '',
  offset = 0,
  limit = 12
) => {
  if (USE_MOCK_DATA) {
    await new Promise((resolve) => setTimeout(resolve, 200));

    const lowerQuery = query.toLowerCase().trim();

    const filtered = !lowerQuery
      ? MOCK_VIDEOS
      : MOCK_VIDEOS.filter(
          (v) =>
            v.title.toLowerCase().includes(lowerQuery) ||
            v.category.toLowerCase().includes(lowerQuery) ||
            v.channel.toLowerCase().includes(lowerQuery)
        );

    const videos = filtered.slice(offset, offset + limit);

    return {
      status: 'success',
      query,
      count: filtered.length,
      videos,
      hasMore: offset + limit < filtered.length
    };
  }

  try {
    const response = await fetch(`${BASE_URL}/search`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        query,
        offset,
        limit
      })
    });

    if (!response.ok) {
      throw new Error(`HTTP error ${response.status}`);
    }

    const data = await response.json();

    return {
      ...data,
      videos: (data.videos || []).map(formatBackendVideo),
      hasMore: data.has_more
    };
  } catch (error) {
    console.error('FastAPI Search Error:', error);

    return {
      status: 'error',
      query,
      count: 0,
      videos: [],
      hasMore: false
    };
  }
};

export const getHomeVideos = async (
  searchHistory = [],
  offset = 0,
  limit = 12
) => {
  if (USE_MOCK_DATA) {
    return {
      status: 'success',
      count: MOCK_VIDEOS.length,
      videos: MOCK_VIDEOS.slice(offset, offset + limit),
      hasMore: offset + limit < MOCK_VIDEOS.length
    };
  }

  try {
    const response = await fetch(`${BASE_URL}/home`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        search_history: searchHistory,
        offset,
        limit
      })
    });

    if (!response.ok) {
      throw new Error(`HTTP error ${response.status}`);
    }

    const data = await response.json();

    return {
      ...data,
      videos: (data.videos || []).map(formatBackendVideo),
      hasMore: data.has_more
    };
  } catch (error) {
    console.error('Home Recommendation Error:', error);

    return {
      status: 'error',
      count: 0,
      videos: [],
      hasMore: false
    };
  }
};


/**
 * ML Recommendation engine call for POST /recommend
 * Request payload: { query: "machine learning" }
 * Expected response: { status: "success", query: "machine learning", count: 10, recommendations: [...] }
 */
export const getRecommendations = async (query = '') => {
  if (USE_MOCK_DATA) {
    await new Promise((resolve) => setTimeout(resolve, 350));

    // Simple mock TF-IDF / similarity ranking simulation
    const lowerQuery = (query || 'machine learning').toLowerCase().trim();
    const scored = MOCK_VIDEOS.map((video) => {
      let score = 0;
      if (video.title.toLowerCase().includes(lowerQuery)) score += 3;
      if (video.category.toLowerCase().includes(lowerQuery)) score += 2;
      if (video.description?.toLowerCase().includes(lowerQuery)) score += 1;
      return { ...video, score };
    }).sort((a, b) => b.score - a.score);

    return {
      status: 'success',
      query: query || 'machine learning',
      count: scored.length,
      recommendations: scored
    };
  }

  try {
    const response = await fetch(`${BASE_URL}/recommend`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query: query || 'machine learning' })
    });

    if (!response.ok) throw new Error(`HTTP error ${response.status}`);
    const data = await response.json();

    return {
      ...data,
      recommendations: (data.recommendations || []).map(formatBackendVideo)
    };
  } catch (error) {
    console.error('FastAPI Recommendation Error:', error);
    return getRecommendations(query);
  }
};
