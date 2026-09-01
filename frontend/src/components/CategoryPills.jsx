import React from 'react';
import { CATEGORIES } from '../mock/mockVideos';

/**
 * CategoryPills Component
 * Horizontally scrollable list of category pills for quick topic filtering.
 */
export const CategoryPills = ({ activeCategory, onSelectCategory }) => {
  return (
    <div className="pills-container">
      <div className="pills-scroll-wrapper">
        {CATEGORIES.map((category) => {
          const isActive = activeCategory === category;
          return (
            <button
              key={category}
              className={`pill ${isActive ? 'active' : ''}`}
              onClick={() => onSelectCategory(category)}
            >
              {category}
            </button>
          );
        })}
      </div>

      {/* Component Styles */}
      <style>{`
        .pills-container {
          position: sticky;
          top: var(--header-height);
          background-color: var(--bg-dark);
          padding: 12px 0;
          margin-bottom: 20px;
          z-index: 800;
          border-bottom: 1px solid rgba(255, 255, 255, 0.04);
        }

        .pills-scroll-wrapper {
          display: flex;
          align-items: center;
          gap: 10px;
          overflow-x: auto;
          scrollbar-width: none; /* Firefox */
          -ms-overflow-style: none; /* IE/Edge */
          padding-bottom: 4px;
        }

        .pills-scroll-wrapper::-webkit-scrollbar {
          display: none; /* Chrome/Safari */
        }
      `}</style>
    </div>
  );
};
