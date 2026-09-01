import React, { useState, useRef, useEffect } from 'react';
import { Search, Menu, Bell, User, Video, X, Clock, Trash2 } from 'lucide-react';
import logoSvg from '../assets/logo.svg';

/**
 * Header Component
 * Provides top navbar with MLTube logo, interactive search bar,
 * mobile drawer toggle, and search history dropdown with deletion.
 */
export const Header = ({
  searchQuery,
  setSearchQuery,
  onSearch,
  onRecommend,
  toggleSidebar,
  activeMode,
  searchHistory = [],
  onDeleteHistoryItem,
  onClearAllHistory
}) => {
  const [localQuery, setLocalQuery] = useState(searchQuery || '');
  const [showHistoryDropdown, setShowHistoryDropdown] = useState(false);
  const searchInputRef = useRef(null);
  const historyDropdownRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (
        historyDropdownRef.current &&
        !historyDropdownRef.current.contains(e.target) &&
        !searchInputRef.current?.contains(e.target)
      ) {
        setShowHistoryDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    onSearch(localQuery);
    setShowHistoryDropdown(false);
  };

  const handleClear = () => {
    setLocalQuery('');
    onSearch('');
    setShowHistoryDropdown(false);
  };

  const handleSearchInputFocus = () => {
    if (searchHistory && searchHistory.length > 0) {
      setShowHistoryDropdown(true);
    }
  };

  const handleHistoryItemClick = (query) => {
    setLocalQuery(query);
    setShowHistoryDropdown(false);
    // Trigger search with the history item
    setTimeout(() => {
      onSearch(query);
    }, 0);
  };

  const handleDeleteHistoryItem = (e, query) => {
    e.stopPropagation(); // Prevent triggering the search
    onDeleteHistoryItem(query);
  };

  const handleClearAllHistoryClick = (e) => {
    e.stopPropagation();
    onClearAllHistory();
    setShowHistoryDropdown(false);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Escape') {
      setShowHistoryDropdown(false);
    }
  };

  return (
    <header className="header-container">
      {/* Left Section: Menu Toggle & Brand Logo */}
      <div className="header-left">
        <button
          className="icon-btn menu-toggle"
          onClick={toggleSidebar}
          title="Toggle Navigation Menu"
          aria-label="Toggle Navigation Menu"
        >
          <Menu size={22} />
        </button>

        <div className="brand-wrapper" onClick={() => handleClear()} style={{ cursor: 'pointer' }}>
          <img src={logoSvg} alt="MLTube Logo" className="brand-logo" />
        </div>
      </div>

      {/* Middle Section: Search Bar & Search Buttons */}
      <div className="header-center">
        <div className="search-container" ref={historyDropdownRef}>
          <form className="search-form" onSubmit={handleSearchSubmit}>
            <div className="search-input-wrapper">
              <Search size={18} className="search-icon-muted" />
              <input
                ref={searchInputRef}
                type="text"
                placeholder="Search ML topics, Python, models..."
                value={localQuery}
                onChange={(e) => setLocalQuery(e.target.value)}
                onFocus={handleSearchInputFocus}
                onKeyDown={handleKeyDown}
                className="search-input"
              />
              {localQuery && (
                <button
                  type="button"
                  className="clear-btn"
                  onClick={handleClear}
                  title="Clear search"
                >
                  <X size={16} />
                </button>
              )}
            </div>

            <button
              type="submit"
              className="search-btn"
              title="Perform Search"
            >
              <Search size={18} />
            </button>
          </form>

          {/* Search History Dropdown */}
          {showHistoryDropdown && searchHistory && searchHistory.length > 0 && (
            <div className="search-history-dropdown">
              <div className="history-header">
                <Clock size={14} className="history-header-icon" />
                <span className="history-header-text">Recent Searches</span>
              </div>
              
              {searchHistory.map((query, index) => (
                <div
                  key={index}
                  className="history-item-wrapper"
                >
                  <button
                    className="history-item"
                    onClick={() => handleHistoryItemClick(query)}
                    type="button"
                  >
                    <Search size={16} className="history-icon" />
                    <span className="history-text">{query}</span>
                  </button>
                  <button
                    className="history-delete-btn"
                    onClick={(e) => handleDeleteHistoryItem(e, query)}
                    type="button"
                    title="Delete from history"
                  >
                    <X size={16} />
                  </button>
                </div>
              ))}

              {/* Clear All Button */}
              {searchHistory.length > 0 && (
                <button
                  className="history-clear-all-btn"
                  onClick={handleClearAllHistoryClick}
                  type="button"
                >
                  <Trash2 size={14} />
                  <span>Clear All</span>
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Right Section: User & Actions */}
      <div className="header-right">
        <button className="icon-btn action-icon" title="Create Video">
          <Video size={20} />
        </button>
        <button className="icon-btn action-icon" title="Notifications">
          <Bell size={20} />
          <span className="notification-badge"></span>
        </button>
        <div className="user-avatar" title="User Account">
          <User size={18} />
        </div>
      </div>

      {/* Component Styles */}
      <style>{`
        .header-container {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          height: var(--header-height);
          background-color: var(--bg-header);
          backdrop-filter: var(--backdrop-blur);
          -webkit-backdrop-filter: var(--backdrop-blur);
          border-bottom: 1px solid var(--border-color);
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0 20px;
          z-index: 1000;
        }

        .header-left {
          display: flex;
          align-items: center;
          gap: 16px;
        }

        .icon-btn {
          background: transparent;
          border: none;
          color: var(--text-primary);
          width: 40px;
          height: 40px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: background 0.2s ease;
        }

        .icon-btn:hover {
          background: rgba(255, 255, 255, 0.1);
        }

        .brand-logo {
          height: 38px;
          width: auto;
          display: block;
        }

        .header-center {
          display: flex;
          align-items: center;
          gap: 12px;
          flex: 1;
          max-width: 720px;
          margin: 0 20px;
        }

        .search-container {
          position: relative;
          flex: 1;
        }

        .search-form {
          display: flex;
          align-items: center;
          flex: 1;
        }

        .search-input-wrapper {
          display: flex;
          align-items: center;
          background: #09090c;
          border: 1px solid rgba(255, 255, 255, 0.12);
          border-radius: 24px 0 0 24px;
          padding: 0 14px;
          height: 40px;
          flex: 1;
          transition: border-color 0.2s ease;
        }

        .search-input-wrapper:focus-within {
          border-color: var(--accent-blue);
          box-shadow: 0 0 8px rgba(59, 130, 246, 0.25);
        }

        .search-icon-muted {
          color: var(--text-muted);
          margin-right: 8px;
        }

        .search-input {
          background: transparent;
          border: none;
          outline: none;
          color: var(--text-primary);
          font-size: 14px;
          width: 100%;
        }

        .clear-btn {
          background: transparent;
          border: none;
          color: var(--text-muted);
          cursor: pointer;
          padding: 4px;
          display: flex;
          align-items: center;
        }

        .clear-btn:hover {
          color: var(--text-primary);
        }

        .search-btn {
          height: 40px;
          padding: 0 20px;
          background: rgba(255, 255, 255, 0.08);
          border: 1px solid rgba(255, 255, 255, 0.12);
          border-left: none;
          border-radius: 0 24px 24px 0;
          color: var(--text-primary);
          cursor: pointer;
          transition: background 0.2s ease;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .search-btn:hover {
          background: rgba(255, 255, 255, 0.16);
        }

        /* Search History Dropdown Styles */
        .search-history-dropdown {
          position: absolute;
          top: 100%;
          left: 0;
          right: 0;
          background: #09090c;
          border: 1px solid rgba(255, 255, 255, 0.12);
          border-top: none;
          border-radius: 0 0 24px 24px;
          max-height: 360px;
          overflow-y: auto;
          z-index: 1001;
          box-shadow: 0 8px 24px rgba(0, 0, 0, 0.4);
        }

        .history-header {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 10px 14px;
          border-bottom: 1px solid rgba(255, 255, 255, 0.08);
          font-size: 12px;
          font-weight: 600;
          color: var(--text-muted);
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .history-header-icon {
          color: var(--accent-blue);
        }

        .history-header-text {
          flex: 1;
        }

        .history-item-wrapper {
          display: flex;
          align-items: center;
          width: 100%;
          transition: background 0.15s ease;
        }

        .history-item-wrapper:hover {
          background: rgba(255, 255, 255, 0.08);
        }

        .history-item {
          flex: 1;
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 12px 14px;
          background: transparent;
          border: none;
          color: var(--text-primary);
          cursor: pointer;
          transition: none;
          text-align: left;
          font-size: 14px;
        }

        .history-item:hover {
          background: transparent;
        }

        .history-icon {
          color: var(--text-muted);
          flex-shrink: 0;
        }

        .history-text {
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
          flex: 1;
        }

        .history-delete-btn {
          background: transparent;
          border: none;
          color: var(--text-muted);
          cursor: pointer;
          padding: 6px;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-right: 8px;
          transition: color 0.15s ease;
        }

        .history-delete-btn:hover {
          color: var(--accent-red);
        }

        .history-clear-all-btn {
          width: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          padding: 10px 14px;
          background: transparent;
          border-top: 1px solid rgba(255, 255, 255, 0.08);
          color: var(--text-muted);
          cursor: pointer;
          font-size: 13px;
          font-weight: 500;
          transition: all 0.15s ease;
        }

        .history-clear-all-btn:hover {
          background: rgba(255, 46, 85, 0.1);
          color: var(--accent-red);
        }

        .header-right {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .action-icon {
          position: relative;
        }

        .notification-badge {
          position: absolute;
          top: 8px;
          right: 8px;
          width: 8px;
          height: 8px;
          background-color: var(--accent-red);
          border-radius: 50%;
        }

        .user-avatar {
          width: 36px;
          height: 36px;
          border-radius: 50%;
          background: linear-gradient(135deg, #6366f1 0%, #a855f7 100%);
          display: flex;
          align-items: center;
          justify-content: center;
          color: #ffffff;
          cursor: pointer;
        }

        @media (max-width: 768px) {
          .header-center {
            margin: 0 8px;
          }
          .search-btn {
            padding: 0 14px;
          }
          .search-history-dropdown {
            max-height: 240px;
          }
        }
      `}</style>
    </header>
  );
};
