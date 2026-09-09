import React, { useState, useEffect, useCallback } from 'react';
import { HomePage } from './pages/HomePage';
import { searchVideos, getHomeVideos, getRecommendations, checkHealth } from './services/api';

/**
 * Main MLTube App Component
 * Manages video collection state, search query, active mode ('search' vs 'recommend'),
 * category filtering, and drawer toggle state.
 */
function App() {
  const [allResults, setAllResults] = useState([]);        // All results from backend
  const [displayedVideos, setDisplayedVideos] = useState([]); // Currently displayed videos
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);   // Loading state for infinite scroll
  const [searchQuery, setSearchQuery] = useState('');
  const [searchHistory, setSearchHistory] = useState([]);
  const [activeCategory, setActiveCategory] = useState('All');
  const [activeMode, setActiveMode] = useState('search'); // 'search' | 'recommend'
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [count, setCount] = useState(0);
  const [currentBatch, setCurrentBatch] = useState(0);     // Current batch for search/home
  const [maxBatches, setMaxBatches] = useState(Infinity);  // Max batches (4 for search, unlimited for home)
  const [batchSize, setBatchSize] = useState(20);          // 12 for search, 20 for home
  const [canLoadMore, setCanLoadMore] = useState(true);
  
  const [homeSeed, setHomeSeed] = useState(
  () => Math.floor(Math.random() * 1000000)
  );
  // Can load more results

  // Initial load & health check
  useEffect(() => {
    checkHealth().then((res) => {
      console.log('API Service Health Status:', res);
    });
    
    // Initialize search history as empty to start fresh for testing
    // Comment this line out after testing if you want to preserve history
  loadSearchHistory();

  const history = JSON.parse(
    localStorage.getItem('searchHistory') || '[]'
  );

  const frequency = JSON.parse(
    localStorage.getItem('searchFrequency') || '{}'
  );

  fetchHomeVideos(history, frequency, 0, newSeed);}, []);

  /**
   * Perform Video Search (calls API service searchVideos)
   * Sets initial page with 12 results
   */
const fetchSearchVideos = async (query, category = 'All') => {
  setLoading(true);

  try {
    const data = await searchVideos(query, 0, 12);

    console.log('Search response:', data);

    let videos = data.videos || [];

    if (category !== 'All') {
      videos = videos.filter(
        (video) => video.category === category
      );
    }

    setAllResults(videos);
    setDisplayedVideos(videos);
    setCurrentBatch(0);
    setBatchSize(12);

    // Use backend pagination information
    setCanLoadMore(data.hasMore === true);

    setCount(data.count || 0);
  } catch (error) {
    console.error('Search error:', error);
    setAllResults([]);
    setDisplayedVideos([]);
    setCanLoadMore(false);
    setCount(0);
  } finally {
    setLoading(false);
  }
};

const fetchHomeVideos = async (
  history = [],
  frequency = {},
  offset = 0,
  seed = homeSeed

) => {
  setLoading(offset === 0);
  setLoadingMore(offset > 0);

  try {
    const data = await getHomeVideos(
    history,
    frequency,
    offset,
    12,
    seed
  );

    const videos = data.videos || [];

    if (offset === 0) {
      setAllResults(videos);
      setDisplayedVideos(videos);
      setCurrentBatch(0);
    } else {
      setAllResults((prev) => [...prev, ...videos]);
      setDisplayedVideos((prev) => [...prev, ...videos]);
      setCurrentBatch((prev) => prev + 1);
    }

    setBatchSize(12);
    setCanLoadMore(data.hasMore ?? false);
    setCount(data.count || 0);
  } catch (error) {
    console.error('Home recommendation error:', error);

    if (offset === 0) {
      setAllResults([]);
      setDisplayedVideos([]);
    }

    setCanLoadMore(false);
  } finally {
    setLoading(false);
    setLoadingMore(false);
  }
};
  /**
   * Get ML Recommendations (calls API service getRecommendations)
   * Sets initial page with 20 results
   */
  const fetchRecommendations = async (query = 'machine learning') => {
    setLoading(true);
    setLoadingMore(false);
    setActiveMode('recommend');
    setSearchQuery(query);
    setCurrentBatch(0);
    setBatchSize(20);
    setMaxBatches(Infinity); // Unlimited batches for home

    const result = await getRecommendations(query);
    const list = result.recommendations || [];

    // Store all results and display first batch
    setAllResults(list);
    const firstBatch = list.slice(0, 20);
    setDisplayedVideos(firstBatch);
    setCount(result.count || list.length);
    setCanLoadMore(list.length > 20);
    setLoading(false);
  };

  /**
   * Load more videos on infinite scroll
   */
const handleLoadMore = useCallback(async () => {
  if (loadingMore || !canLoadMore) {
    return;
  }

  const nextOffset = displayedVideos.length;

  if (searchQuery.trim() === '') {
    const frequency = JSON.parse(
      localStorage.getItem('searchFrequency') || '{}'
    );

    await fetchHomeVideos(
      searchHistory,
      frequency,
      nextOffset
    );

    return;
  }
  setLoadingMore(true);

  try {
    const data = await searchVideos(
      searchQuery,
      nextOffset,
      12
    );

    let newVideos = data.videos || [];

    if (activeCategory !== 'All') {
      newVideos = newVideos.filter(
        (video) => video.category === activeCategory
      );
    }

    if (newVideos.length === 0) {
      setCanLoadMore(false);
      return;
    }

    setDisplayedVideos((prev) => [
      ...prev,
      ...newVideos
    ]);

    setAllResults((prev) => [
      ...prev,
      ...newVideos
    ]);

    setCurrentBatch((prev) => prev + 1);
    setCanLoadMore(data.hasMore ?? false);

  } catch (error) {
    console.error('Load more error:', error);
  } finally {
    setLoadingMore(false);
  }
}, [
  loadingMore,
  canLoadMore,
  displayedVideos.length,
  searchQuery,
  searchHistory,
  activeCategory
]);
/**
 * Load search history from browser localStorage
 */
const loadSearchHistory = () => {
    const history = JSON.parse(localStorage.getItem('searchHistory')) || [];
    setSearchHistory(history);
};

/**
 * Save search query with deduplication - moves existing search to top instead of duplicating
 */
const saveSearchHistory = (query) => {
  if (!query || query.trim() === '') {
    return;
  }

  const trimmedQuery = query.trim();

  // Existing recent-search history
  const existingHistory =
    JSON.parse(localStorage.getItem('searchHistory')) || [];

  const filteredHistory = existingHistory.filter(
    (item) =>
      item.toLowerCase() !== trimmedQuery.toLowerCase()
  );

  const updatedHistory = [
    trimmedQuery,
    ...filteredHistory
  ];

  localStorage.setItem(
    'searchHistory',
    JSON.stringify(updatedHistory)
  );

  setSearchHistory(updatedHistory);

  // Search frequency tracking
  const searchFrequency =
    JSON.parse(localStorage.getItem('searchFrequency')) || {};

  const existingKey = Object.keys(searchFrequency).find(
    (key) =>
      key.toLowerCase() === trimmedQuery.toLowerCase()
  );

  if (existingKey) {
    searchFrequency[existingKey] += 1;
  } else {
    searchFrequency[trimmedQuery] = 1;
  }

  localStorage.setItem(
    'searchFrequency',
    JSON.stringify(searchFrequency)
  );
};
/**
 * Delete a specific search from history
 */
const handleDeleteHistoryItem = (queryToDelete) => {
    const existingHistory = JSON.parse(localStorage.getItem('searchHistory')) || [];
    const updatedHistory = existingHistory.filter(
        (item) => item.toLowerCase() !== queryToDelete.toLowerCase()
    );

    localStorage.setItem('searchHistory', JSON.stringify(updatedHistory));
    setSearchHistory(updatedHistory);
};

/**
 * Clear all search history
 */
const handleClearAllHistory = () => {
    localStorage.setItem('searchHistory', JSON.stringify([]));
    setSearchHistory([]);
};

/**
 * Handler when user submits search query from Header
 */
const handleSearch = (query) => {
  // Save to history only if query is not empty
  if (query && query.trim()) {
    saveSearchHistory(query);
  }

  setSearchQuery(query);
  setActiveCategory('All');

  // Reset previous results before starting a new search
  setDisplayedVideos([]);
  setAllResults([]);
  setCurrentBatch(0);
  setCanLoadMore(true);

  fetchSearchVideos(query, 'All');
};

  /**
   * Handler when user clicks "AI Recommend" button
   */
  const handleRecommend = (query) => {
    fetchRecommendations(query || searchQuery || 'machine learning');
  };

  /**
   * Handler when user selects a category pill
   */
  const handleSelectCategory = (category) => {
    setActiveCategory(category);
    if (activeMode === 'recommend') {
      fetchSearchVideos(searchQuery, category);
    } else {
      fetchSearchVideos(searchQuery, category);
    }
  };

  /**
   * Reset to Home view
   */
const handleHomeClick = () => {
  const newSeed = Math.floor(Math.random() * 1000000);
  setHomeSeed(newSeed);

  setSearchQuery('');
  setActiveCategory('All');
  setActiveMode('search');

  const history = JSON.parse(
    localStorage.getItem('searchHistory') || '[]'
  );

  const frequency = JSON.parse(
    localStorage.getItem('searchFrequency') || '{}'
  );
  setDisplayedVideos([]);
  setAllResults([]);
  setCurrentBatch(0);
  setCanLoadMore(true);

  fetchHomeVideos(history, frequency , 0);
};
  /**
   * Toggle sidebar navigation drawer
   */
  const handleToggleSidebar = () => {
    setSidebarOpen((prev) => !prev);
  };

return (
    <>
        <HomePage
            videos={displayedVideos}
            allResults={allResults}
            loading={loading}
            loadingMore={loadingMore}
            canLoadMore={canLoadMore}
            searchQuery={searchQuery}
            activeCategory={activeCategory}
            activeMode={activeMode}
            sidebarOpen={sidebarOpen}
            count={count}
            onSearch={handleSearch}
            onRecommend={handleRecommend}
            onSelectCategory={handleSelectCategory}
            onToggleSidebar={handleToggleSidebar}
            onHomeClick={handleHomeClick}
            onLoadMore={handleLoadMore}
            searchHistory={searchHistory}
            onDeleteHistoryItem={handleDeleteHistoryItem}
            onClearAllHistory={handleClearAllHistory}
            batchSize={batchSize}
        />
    </>
);
}

export default App;
