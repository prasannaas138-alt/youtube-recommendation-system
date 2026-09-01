import React from 'react';
import { 
  Home, 
  Sparkles, 
  Flame, 
  Tv, 
  History, 
  Bookmark, 
  ThumbsUp, 
  Brain, 
  Code, 
  Cpu, 
  Database, 
  Layers, 
  Eye
} from 'lucide-react';

/**
 * Sidebar Component
 * Provides side navigation links for ML topics, categories, and user libraries.
 */
export const Sidebar = ({ 
  isOpen, 
  activeCategory, 
  onCategorySelect, 
  activeMode, 
  onRecommendClick,
  onHomeClick
}) => {
  const mainNav = [
    { label: 'Home', icon: Home, action: 'home' },
    { label: 'AI Recommendations', icon: Sparkles, action: 'recommend' },
    { label: 'Trending', icon: Flame, action: 'trending' },
    { label: 'Subscriptions', icon: Tv, action: 'subscriptions' }
  ];

  const mlTopics = [
    { label: 'Machine Learning', icon: Brain },
    { label: 'Python', icon: Code },
    { label: 'Deep Learning', icon: Cpu },
    { label: 'NLP & LLMs', icon: Layers },
    { label: 'Data Science', icon: Database },
    { label: 'Computer Vision', icon: Eye }
  ];

  const libraryNav = [
    { label: 'History', icon: History },
    { label: 'Saved Videos', icon: Bookmark },
    { label: 'Liked Videos', icon: ThumbsUp }
  ];

  return (
    <aside className={`sidebar-container ${isOpen ? 'open' : 'collapsed'}`}>
      <div className="sidebar-inner">
        {/* Main Navigation Group */}
        <div className="nav-group">
          {mainNav.map((item) => {
            const Icon = item.icon;
            const isActive = 
              (item.action === 'home' && activeCategory === 'All' && activeMode === 'search') ||
              (item.action === 'recommend' && activeMode === 'recommend');

            return (
              <button
                key={item.label}
                className={`nav-item ${isActive ? 'active' : ''}`}
                onClick={() => {
                  if (item.action === 'recommend') onRecommendClick();
                  else if (item.action === 'home') onHomeClick();
                }}
              >
                <Icon size={20} className="nav-icon" />
                <span className="nav-text">{item.label}</span>
              </button>
            );
          })}
        </div>

        <hr className="nav-divider" />

        {/* ML Topics Group */}
        <div className="nav-group">
          <h4 className="group-title">ML Topics</h4>
          {mlTopics.map((topic) => {
            const Icon = topic.icon;
            const isActive = activeCategory === topic.label && activeMode === 'search';

            return (
              <button
                key={topic.label}
                className={`nav-item ${isActive ? 'active' : ''}`}
                onClick={() => onCategorySelect(topic.label)}
              >
                <Icon size={18} className="nav-icon" />
                <span className="nav-text">{topic.label}</span>
              </button>
            );
          })}
        </div>

        <hr className="nav-divider" />

        {/* Library Group */}
        <div className="nav-group">
          <h4 className="group-title">Library</h4>
          {libraryNav.map((item) => {
            const Icon = item.icon;
            return (
              <button key={item.label} className="nav-item">
                <Icon size={18} className="nav-icon" />
                <span className="nav-text">{item.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Component Styles */}
      <style>{`
        .sidebar-container {
          width: var(--sidebar-width);
          background-color: var(--bg-sidebar);
          border-right: 1px solid var(--border-color);
          position: fixed;
          top: var(--header-height);
          bottom: 0;
          left: 0;
          overflow-y: auto;
          transition: width 0.25s ease, transform 0.25s ease;
          z-index: 900;
        }

        .sidebar-container.collapsed {
          width: var(--sidebar-collapsed-width);
        }

        .sidebar-inner {
          padding: 12px 8px;
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .nav-group {
          display: flex;
          flex-direction: column;
          gap: 2px;
        }

        .group-title {
          font-size: 11px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.8px;
          color: var(--text-muted);
          padding: 12px 14px 6px 14px;
          white-space: nowrap;
        }

        .collapsed .group-title {
          display: none;
        }

        .nav-item {
          display: flex;
          align-items: center;
          gap: 16px;
          width: 100%;
          height: 42px;
          padding: 0 14px;
          border: none;
          border-radius: 10px;
          background: transparent;
          color: var(--text-secondary);
          font-family: inherit;
          font-size: 14px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s ease;
          white-space: nowrap;
        }

        .nav-item:hover {
          background: rgba(255, 255, 255, 0.08);
          color: var(--text-primary);
        }

        .nav-item.active {
          background: rgba(255, 46, 85, 0.15);
          color: var(--accent-red);
          font-weight: 600;
        }

        .nav-item.active .nav-icon {
          color: var(--accent-red);
        }

        .nav-icon {
          flex-shrink: 0;
        }

        .collapsed .nav-text {
          display: none;
        }

        .collapsed .nav-item {
          justify-content: center;
          padding: 0;
        }

        .nav-divider {
          border: none;
          border-top: 1px solid var(--border-color);
          margin: 8px 6px;
        }

        @media (max-width: 768px) {
          .sidebar-container {
            transform: translateX(-100%);
          }
          .sidebar-container.open {
            transform: translateX(0);
            width: var(--sidebar-width);
            box-shadow: var(--shadow-md);
          }
        }
      `}</style>
    </aside>
  );
};
