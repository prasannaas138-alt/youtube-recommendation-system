import React from 'react';
import { Header } from '../components/Header';
import { Sidebar } from '../components/Sidebar';
import { CategoryPills } from '../components/CategoryPills';
import { VideoGrid } from '../components/VideoGrid';

/**
 * HomePage Component
 * Main page layout combining top header, side navigation drawer,
 * topic filtering pills, and video grid results.
 */
export const HomePage = ({
  videos,
  allResults,
  loading,
  loadingMore,
  canLoadMore,
  searchQuery,
  searchHistory,
  activeCategory,
  activeMode,
  sidebarOpen,
  count,
  onSearch,
  onRecommend,
  onSelectCategory,
  onToggleSidebar,
  onHomeClick,
  onLoadMore,
  onDeleteHistoryItem,
  onClearAllHistory,
  batchSize
}) => {
  return (
    <div className="app-container">
      {/* Header Navbar */}
      <Header
        searchQuery={searchQuery}
        setSearchQuery={onSearch}
        onSearch={onSearch}
        onRecommend={onRecommend}
        toggleSidebar={onToggleSidebar}
        activeMode={activeMode}
        searchHistory={searchHistory}
        onDeleteHistoryItem={onDeleteHistoryItem}
        onClearAllHistory={onClearAllHistory}
      />

      {/* Main Layout Area */}
      <div className="main-layout">
        {/* Sidebar Drawer */}
        <Sidebar
          isOpen={sidebarOpen}
          activeCategory={activeCategory}
          onCategorySelect={onSelectCategory}
          activeMode={activeMode}
          onRecommendClick={() => onRecommend(searchQuery || 'machine learning')}
          onHomeClick={onHomeClick}
        />

        {/* Dynamic Content Body */}
        <main className={`content-area ${sidebarOpen ? 'sidebar-open' : 'sidebar-collapsed'}`}>
          {/* Category Horizontal Bar */}
          <CategoryPills
            activeCategory={activeCategory}
            onSelectCategory={onSelectCategory}
          />


          {/* Video Grid Section */}
          <VideoGrid
            videos={videos}
            loading={loading}
            loadingMore={loadingMore}
            canLoadMore={canLoadMore}
            activeMode={activeMode}
            searchQuery={searchQuery}
            count={count}
            onLoadMore={onLoadMore}
            batchSize={batchSize}
          />
        </main>
      </div>

      {/* Page Layout CSS */}
      <style>{`
        .content-area.sidebar-open {
          margin-left: var(--sidebar-width);
        }

        .content-area.sidebar-collapsed {
          margin-left: var(--sidebar-collapsed-width);
        }

        @media (max-width: 768px) {
          .content-area.sidebar-open,
          .content-area.sidebar-collapsed {
            margin-left: 0;
          }
        }
      `}</style>
    </div>
  );
};
