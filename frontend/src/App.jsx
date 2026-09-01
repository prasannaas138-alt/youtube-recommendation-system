import React, { useState, useEffect, useCallback } from 'react';
import { HomePage } from './pages/HomePage';
import { searchVideos, getRecommendations, checkHealth } from './services/api';

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
  const [canLoadMore, setCanLoadMore] = useState(true);    // Can load more results

  // Initial load & health check
  useEffect(() => {
    checkHealth().then((res) => {
      console.log('API Service Health Status:', res);
    });
    
    // Initialize search history as empty to start fresh for testing
    // Comment this line out after testing if you want to preserve history
    localStorage.setItem('searchHistory', JSON.stringify([]));
    
    loadSearchHistory();
    fetchSearchVideos('', 'All');
  }, []);

  /**
   * Perform Video Search (calls API service searchVideos)
   * Sets initial page with 12 results
   */
  const fetchSearchVideos = async (query = '', category = 'All') => {
    setLoading(true);
    setLoadingMore(false);
    setActiveMode('search');
    setCurrentBatch(0);
    setBatchSize(12);
    setMaxBatches(4); // Max 4 batches for search = 48 videos

    const result = await searchVideos(query);
    let list = result.videos || [];

    // Apply client-side category filter if a specific category is chosen
    if (category && category !== 'All') {
      list = list.filter((v) => v.category.toLowerCase() === category.toLowerCase());
    }

    // Store all results and display first batch
    setAllResults(list);
    const firstBatch = list.slice(0, 12);
    setDisplayedVideos(firstBatch);
    setCount(list.length);
    setCanLoadMore(list.length > 12);
    setLoading(false);
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
  const handleLoadMore = useCallback(() => {
    if (loadingMore || !canLoadMore) {
      return;
    }

    setLoadingMore(true);
    
    // Simulate network delay
    setTimeout(() => {
      const nextBatch = currentBatch + 1;
      
      // For search mode, enforce 4-batch limit
      if (activeMode === 'search' && nextBatch >= maxBatches) {
        setCanLoadMore(false);
        setLoadingMore(false);
        return;
      }

      const startIdx = nextBatch * batchSize;
      const endIdx = startIdx + batchSize;
      
      const newVideos = allResults.slice(startIdx, endIdx);
      
      if (newVideos.length === 0) {
        setCanLoadMore(false);
        setLoadingMore(false);
        return;
      }

      setDisplayedVideos((prev) => [...prev, ...newVideos]);
      setCurrentBatch(nextBatch);
      
      // Determine if we can load more
      const hasMoreData = endIdx < allResults.length;
      const withinBatchLimit = activeMode === 'recommend' || (nextBatch + 1) < maxBatches;
      setCanLoadMore(hasMoreData && withinBatchLimit);
      setLoadingMore(false);
    }, 300);
  }, [currentBatch, batchSize, maxBatches, loadingMore, canLoadMore, allResults, activeMode]);
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
    const existingHistory = JSON.parse(localStorage.getItem('searchHistory')) || [];

    // Remove if already exists (will add it to the top)
    const filteredHistory = existingHistory.filter(
        (item) => item.toLowerCase() !== trimmedQuery.toLowerCase()
    );

    // Add to the beginning (newest first)
    const updatedHistory = [trimmedQuery, ...filteredHistory];

    localStorage.setItem('searchHistory', JSON.stringify(updatedHistory));
    setSearchHistory(updatedHistory);
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
    setSearchQuery('');
    setActiveCategory('All');
    fetchSearchVideos('', 'All');
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
