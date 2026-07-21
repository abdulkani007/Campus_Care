import React from 'react';
import './DashboardSkeleton.css';

export default function DashboardSkeleton() {
  return (
    <div className="skeleton-container" aria-hidden="true">
      {/* Top Header Skeleton */}
      <div className="skeleton-header">
        <div className="skeleton-pill skeleton-shimmer" style={{ width: '220px', height: '36px' }}></div>
        <div className="skeleton-pill skeleton-shimmer" style={{ width: '280px', height: '40px' }}></div>
        <div className="skeleton-circle skeleton-shimmer" style={{ width: '40px', height: '40px' }}></div>
      </div>

      {/* Hero Card Skeleton */}
      <div className="skeleton-banner skeleton-shimmer"></div>

      {/* Stat Grid Skeleton */}
      <div className="skeleton-stat-grid">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="skeleton-stat-card skeleton-shimmer"></div>
        ))}
      </div>

      {/* Content Columns Skeleton */}
      <div className="skeleton-content-row">
        <div className="skeleton-panel skeleton-shimmer" style={{ flex: 2, height: '300px' }}></div>
        <div className="skeleton-panel skeleton-shimmer" style={{ flex: 1, height: '300px' }}></div>
      </div>
    </div>
  );
}
