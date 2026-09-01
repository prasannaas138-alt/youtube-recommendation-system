import React from 'react';
import { Play, Sparkles, MoreVertical } from 'lucide-react';

/**
 * VideoCard Component
 * Displays individual video item details: thumbnail placeholder, duration,
 * title, channel avatar & name, category badge, and view count.
 */
export const VideoCard = ({ video }) => {
  const {
    title,
    channel,
    channel_avatar,
    category,
    views,
    published_at,
    duration,
    badge,
    gradient
  } = video;

  return (
    <div className="video-card">
      {/* Thumbnail Container */}
      <div className="thumbnail-wrapper" style={{ background: gradient }}>
        <div className="thumbnail-overlay">
          <div className="play-circle">
            <Play size={24} fill="#ffffff" color="#ffffff" />
          </div>
        </div>

        {/* Badge Indicator (e.g. RECOMMENDED, NEW, TRENDING) */}
        {badge && (
          <span className="badge-tag">
            {badge === 'RECOMMENDED' && <Sparkles size={12} className="inline-sparkle" />}
            {badge}
          </span>
        )}

        {/* Duration Badge */}
        <span className="duration-badge">{duration || '12:45'}</span>
      </div>

      {/* Details Container */}
      <div className="card-details">
        <div className="avatar-wrapper">
          {channel_avatar ? (
            <img src={channel_avatar} alt={channel} className="channel-avatar" />
          ) : (
            <div className="avatar-placeholder">{channel ? channel[0] : 'V'}</div>
          )}
        </div>

        <div className="text-metadata">
          <h3 className="video-title" title={title}>
            {title}
          </h3>

          <div className="channel-name">{channel}</div>

          <div className="stats-row">
            <span className="category-tag">{category}</span>
            <span className="dot-separator">•</span>
            <span>{views}</span>
            <span className="dot-separator">•</span>
            <span>{published_at || 'Recently'}</span>
          </div>
        </div>

        <button className="more-btn" title="Options">
          <MoreVertical size={16} />
        </button>
      </div>

      {/* Component Styles */}
      <style>{`
        .video-card {
          display: flex;
          flex-direction: column;
          gap: 12px;
          cursor: pointer;
          transition: transform 0.2s ease;
        }

        .video-card:hover {
          transform: translateY(-4px);
        }

        .thumbnail-wrapper {
          position: relative;
          width: 100%;
          aspect-ratio: 16 / 9;
          border-radius: 14px;
          overflow: hidden;
          box-shadow: 0 4px 14px rgba(0, 0, 0, 0.4);
          transition: box-shadow 0.2s ease;
        }

        .video-card:hover .thumbnail-wrapper {
          box-shadow: 0 8px 24px rgba(0, 0, 0, 0.6);
        }

        .thumbnail-overlay {
          position: absolute;
          inset: 0;
          background: rgba(0, 0, 0, 0.25);
          display: flex;
          align-items: center;
          justify-content: center;
          opacity: 0;
          transition: opacity 0.2s ease;
        }

        .video-card:hover .thumbnail-overlay {
          opacity: 1;
        }

        .play-circle {
          width: 48px;
          height: 48px;
          border-radius: 50%;
          background: rgba(255, 46, 85, 0.9);
          display: flex;
          align-items: center;
          justify-content: center;
          transform: scale(0.9);
          transition: transform 0.2s ease;
          padding-left: 3px;
        }

        .video-card:hover .play-circle {
          transform: scale(1.05);
        }

        .badge-tag {
          position: absolute;
          top: 10px;
          left: 10px;
          background: rgba(15, 15, 19, 0.85);
          backdrop-filter: blur(8px);
          color: var(--accent-red);
          border: 1px solid var(--border-highlight);
          padding: 4px 8px;
          border-radius: 6px;
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 0.5px;
          display: flex;
          align-items: center;
          gap: 4px;
        }

        .duration-badge {
          position: absolute;
          bottom: 10px;
          right: 10px;
          background: rgba(0, 0, 0, 0.8);
          color: #ffffff;
          padding: 3px 6px;
          border-radius: 4px;
          font-size: 12px;
          font-weight: 600;
        }

        .card-details {
          display: flex;
          gap: 12px;
          align-items: flex-start;
        }

        .avatar-wrapper {
          flex-shrink: 0;
        }

        .channel-avatar {
          width: 36px;
          height: 36px;
          border-radius: 50%;
          object-fit: cover;
        }

        .avatar-placeholder {
          width: 36px;
          height: 36px;
          border-radius: 50%;
          background: var(--accent-purple);
          color: white;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 700;
          font-size: 14px;
        }

        .text-metadata {
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 4px;
          min-width: 0;
        }

        .video-title {
          font-size: 15px;
          font-weight: 600;
          color: var(--text-primary);
          line-height: 1.35;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }

        .channel-name {
          font-size: 13px;
          color: var(--text-secondary);
          margin-top: 2px;
        }

        .stats-row {
          display: flex;
          align-items: center;
          flex-wrap: wrap;
          gap: 6px;
          font-size: 12px;
          color: var(--text-muted);
        }

        .category-tag {
          color: var(--accent-purple);
          font-weight: 600;
        }

        .dot-separator {
          color: var(--text-muted);
        }

        .more-btn {
          background: transparent;
          border: none;
          color: var(--text-muted);
          cursor: pointer;
          padding: 4px;
          border-radius: 50%;
          opacity: 0;
          transition: opacity 0.2s ease;
        }

        .video-card:hover .more-btn {
          opacity: 1;
        }
      `}</style>
    </div>
  );
};
