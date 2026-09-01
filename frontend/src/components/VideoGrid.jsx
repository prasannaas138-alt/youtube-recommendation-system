import React, { useEffect, useRef } from 'react';
import { VideoCard } from './VideoCard';
import { Sparkles, Search, Film, Loader } from 'lucide-react';

/**
 * VideoGrid Component
 * Container for video card items with header title, result count, empty state, and infinite scroll.
 */
export const VideoGrid = ({ 
  videos, 
  loading, 
  loadingMore, 
  canLoadMore, 
  activeMode, 
  searchQuery, 
  count,
  onLoadMore,
  batchSize
}) => {
  const observerTarget = useRef(null);

  // Setup infinite scroll with IntersectionObserver
  useEffect(() => {
    if (!canLoadMore || loading) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && canLoadMore && !loadingMore) {
          onLoadMore();
        }
      },
      { threshold: 0.1 }
    );

    if (observerTarget.current) {
      observer.observe(observerTarget.current);
    }

    return () => observer.disconnect();
  }, [canLoadMore, loadingMore, onLoadMore, loading]);
  return (
    <div className="grid-section">
      {/* Header Banner for Grid Context */}
      <div className="grid-header">
        <div className="grid-title-row">
          {activeMode === 'recommend' ? (
            <>
              <div className="icon-badge recommend-icon-badge">
                <Sparkles size={18} />
              </div>
              <div>
                <h2 className="grid-heading">
                  AI Recommendations {searchQuery ? `for "${searchQuery}"` : ''}
                </h2>
                <p className="grid-subtitle">
                  Ranked by ML Cosine Similarity Algorithm • {videos.length} of {count || 0} videos shown
                </p>
              </div>
            </>
          ) : (
            <>
              <div className="icon-badge search-icon-badge">
                <Search size={18} />
              </div>
              <div>
                <h2 className="grid-heading">
                  {searchQuery ? `Search Results for "${searchQuery}"` : 'Recommended Videos'}
                </h2>
                <p className="grid-subtitle">
                  {searchQuery 
                    ? `${videos.length} of ${count || 0} matching videos shown`
                    : `${videos.length} of 5,000 videos available`
                  }
                </p>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Loading Skeleton View */}
      {loading ? (
        <div className="video-grid">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="skeleton-card">
              <div className="skeleton-thumb"></div>
              <div className="skeleton-details">
                <div className="skeleton-avatar"></div>
                <div className="skeleton-lines">
                  <div className="skeleton-line title-line"></div>
                  <div className="skeleton-line short-line"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : videos.length === 0 ? (
        /* Empty State View */
        <div className="empty-state">
          <div className="empty-icon-wrapper">
            <Film size={48} />
          </div>
          <h3>No videos match your request</h3>
          <p>Try searching for "python", "machine learning", or "deep learning".</p>
        </div>
      ) : (
        /* Video Cards Grid */
        <>
          <div className="video-grid">
            {videos.map((video, index) => (
              <VideoCard key={video.video_id || index} video={video} />
            ))}
          </div>

          {/* Infinite Scroll Trigger & Loading Indicator */}
          {canLoadMore && (
            <div className="scroll-container">
              <div ref={observerTarget} className="scroll-observer"></div>
              {loadingMore && (
                <div className="loading-more">
                  <Loader size={20} className="spinner" />
                  <span>Loading more videos...</span>
                </div>
              )}
            </div>
          )}

          {/* End of Results Message */}
          {!canLoadMore && videos.length > 0 && (
            <div className="end-of-results">
              <p>End of results</p>
            </div>
          )}
        </>
      )}

      {/* Component Styles */}
      <style>{`
        .grid-section {
          width: 100%;
        }

        .grid-header {
          margin-bottom: 24px;
          padding: 16px 20px;
          background: rgba(24, 24, 31, 0.6);
          border: 1px solid var(--border-color);
          border-radius: 16px;
          backdrop-filter: blur(8px);
        }

        .grid-title-row {
          display: flex;
          align-items: center;
          gap: 14px;
        }

        .icon-badge {
          width: 44px;
          height: 44px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .recommend-icon-badge {
          background: linear-gradient(135deg, rgba(168, 85, 247, 0.2) 0%, rgba(255, 46, 85, 0.2) 100%);
          border: 1px solid rgba(168, 85, 247, 0.4);
          color: var(--accent-purple);
        }

        .search-icon-badge {
          background: rgba(59, 130, 246, 0.15);
          border: 1px solid rgba(59, 130, 246, 0.3);
          color: var(--accent-blue);
        }

        .grid-heading {
          font-family: 'Outfit', sans-serif;
          font-size: 20px;
          font-weight: 700;
          color: var(--text-primary);
        }

        .grid-subtitle {
          font-size: 13px;
          color: var(--text-secondary);
          margin-top: 2px;
        }

        .video-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
          gap: 24px 20px;
        }

        .empty-state {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 80px 20px;
          text-align: center;
          background: var(--bg-card);
          border: 1px dashed var(--border-color);
          border-radius: 16px;
        }

        .empty-icon-wrapper {
          width: 80px;
          height: 80px;
          border-radius: 50%;
          background: rgba(255, 255, 255, 0.05);
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--text-muted);
          margin-bottom: 16px;
        }

        .empty-state h3 {
          font-size: 18px;
          color: var(--text-primary);
          margin-bottom: 8px;
        }

        .empty-state p {
          font-size: 14px;
          color: var(--text-secondary);
        }

        /* Skeleton Loading Animation */
        .skeleton-card {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .skeleton-thumb {
          width: 100%;
          aspect-ratio: 16 / 9;
          border-radius: 14px;
          background: #1e1e28;
          animation: pulse 1.5s infinite ease-in-out;
        }

        .skeleton-details {
          display: flex;
          gap: 12px;
        }

        .skeleton-avatar {
          width: 36px;
          height: 36px;
          border-radius: 50%;
          background: #1e1e28;
          animation: pulse 1.5s infinite ease-in-out;
        }

        .skeleton-lines {
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .skeleton-line {
          height: 14px;
          border-radius: 4px;
          background: #1e1e28;
          animation: pulse 1.5s infinite ease-in-out;
        }

        .title-line { width: 90%; }
        .short-line { width: 50%; }

        @keyframes pulse {
          0% { opacity: 0.5; }
          50% { opacity: 1; }
          100% { opacity: 0.5; }
        }

        /* Infinite Scroll Styles */
        .scroll-container {
          width: 100%;
          display: flex;
          justify-content: center;
          padding: 40px 20px;
        }

        .scroll-observer {
          width: 100%;
          height: 10px;
        }

        .loading-more {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 20px 30px;
          background: rgba(59, 130, 246, 0.1);
          border: 1px solid rgba(59, 130, 246, 0.3);
          border-radius: 12px;
          color: var(--accent-blue);
          font-size: 14px;
          font-weight: 500;
        }

        .spinner {
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        .end-of-results {
          display: flex;
          justify-content: center;
          padding: 40px 20px;
          color: var(--text-muted);
          font-size: 14px;
        }

        .end-of-results p {
          margin: 0;
        }
      `}</style>
    </div>
  );
};
