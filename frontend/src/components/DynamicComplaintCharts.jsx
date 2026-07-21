import React, { useState } from 'react';

// Categories Configuration
export const CATEGORY_COLORS = {
  'Electrical': '#2563eb',   // Royal Blue
  'Plumbing': '#06b6d4',     // Cyan
  'Water Supply': '#3b82f6', // Light Blue
  'Internet': '#8b5cf6',     // Purple
  'Cleaning': '#10b981',     // Emerald Green
  'Food': '#f59e0b',         // Golden Amber
  'Others': '#64748b'        // Slate Gray
};

/**
 * 1. DYNAMIC COMPLAINT TRENDS CHART (Line / Area SVG Chart)
 */
export const DynamicTrendsChart = ({ complaints = [] }) => {
  const [hoverData, setHoverData] = useState(null);

  // Generate 5 dynamic time checkpoints over the last 14 days
  const now = new Date();
  const points = [];
  
  for (let i = 4; i >= 0; i--) {
    const checkDate = new Date(now);
    checkDate.setDate(checkDate.getDate() - (i * 3));
    
    // Label format: "15 Jul"
    const label = checkDate.toLocaleDateString('en-US', { day: 'numeric', month: 'short' });

    // Count complaints logged up to checkDate
    const loggedBeforeDate = complaints.filter(c => {
      const cTime = c.createdAt ? new Date(c.createdAt) : (c.time ? new Date() : new Date());
      return cTime <= checkDate;
    });

    const totalCount = loggedBeforeDate.length;
    const resolvedCount = loggedBeforeDate.filter(c => c.status === 'Resolved').length;
    const activeCount = totalCount - resolvedCount;

    points.push({
      label,
      total: totalCount,
      resolved: resolvedCount,
      active: activeCount,
      date: checkDate
    });
  }

  // Calculate scaling max height
  const maxVal = Math.max(...points.map(p => Math.max(p.total, p.active, 1)), 5);

  // Chart dimensions
  const width = 380;
  const height = 140;
  const paddingLeft = 40;
  const paddingRight = 20;
  const paddingTop = 20;
  const paddingBottom = 30;

  const chartW = width - paddingLeft - paddingRight;
  const chartH = height - paddingTop - paddingBottom;

  // Compute SVG Coordinates for points
  const coords = points.map((pt, idx) => {
    const x = paddingLeft + (idx / (points.length - 1)) * chartW;
    const yTotal = paddingTop + chartH - (pt.total / maxVal) * chartH;
    const yActive = paddingTop + chartH - (pt.active / maxVal) * chartH;
    const yResolved = paddingTop + chartH - (pt.resolved / maxVal) * chartH;
    return { ...pt, x, yTotal, yActive, yResolved };
  });

  // Generate Smooth Bezier Path String
  const makeBezierPath = (keyY) => {
    if (coords.length === 0) return '';
    let d = `M ${coords[0].x} ${coords[0][keyY]}`;
    for (let i = 0; i < coords.length - 1; i++) {
      const p0 = coords[i];
      const p1 = coords[i + 1];
      const cp1x = p0.x + (p1.x - p0.x) / 2;
      const cp1y = p0[keyY];
      const cp2x = p0.x + (p1.x - p0.x) / 2;
      const cp2y = p1[keyY];
      d += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${p1.x} ${p1[keyY]}`;
    }
    return d;
  };

  const activePath = makeBezierPath('yActive');
  const resolvedPath = makeBezierPath('yResolved');

  // Closed Area Fill Paths
  const activeAreaPath = activePath 
    ? `${activePath} L ${coords[coords.length - 1].x} ${paddingTop + chartH} L ${coords[0].x} ${paddingTop + chartH} Z`
    : '';

  return (
    <div style={{ width: '100%', position: 'relative' }}>
      <svg viewBox={`0 0 ${width} ${height + 25}`} style={{ width: '100%', height: 'auto', overflow: 'visible' }}>
        <defs>
          <linearGradient id="activeGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#2563eb" stopOpacity="0.35" />
            <stop offset="100%" stopColor="#2563eb" stopOpacity="0.0" />
          </linearGradient>
          <linearGradient id="resolvedGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#10b981" stopOpacity="0.25" />
            <stop offset="100%" stopColor="#10b981" stopOpacity="0.0" />
          </linearGradient>
        </defs>

        {/* Y Grid Lines */}
        {[0, 0.33, 0.66, 1].map((ratio, idx) => {
          const y = paddingTop + ratio * chartH;
          const val = Math.round(maxVal * (1 - ratio));
          return (
            <g key={idx}>
              <line x1={paddingLeft} y1={y} x2={width - paddingRight} y2={y} stroke="#f1f5f9" strokeWidth="1.2" />
              <text x={paddingLeft - 8} y={y + 3} fontSize="9" fill="#94a3b8" textAnchor="end" fontFamily="inherit">
                {val}
              </text>
            </g>
          );
        })}

        {/* X Axis Date Labels */}
        {coords.map((pt, idx) => (
          <text key={idx} x={pt.x} y={height + 15} fontSize="9.5" fill="#64748b" textAnchor="middle" fontWeight="600">
            {pt.label}
          </text>
        ))}

        {/* Active Fill Area */}
        {activeAreaPath && <path d={activeAreaPath} fill="url(#activeGradient)" />}

        {/* Active Curved Line */}
        {activePath && (
          <path 
            d={activePath} 
            fill="none" 
            stroke="#2563eb" 
            strokeWidth="3" 
            strokeLinecap="round" 
            style={{ transition: 'all 0.5s ease' }}
          />
        )}

        {/* Resolved Curved Line */}
        {resolvedPath && (
          <path 
            d={resolvedPath} 
            fill="none" 
            stroke="#10b981" 
            strokeWidth="2.2" 
            strokeDasharray="4 3" 
            strokeLinecap="round"
            style={{ transition: 'all 0.5s ease' }}
          />
        )}

        {/* Interactive Data Point Circles */}
        {coords.map((pt, idx) => (
          <g key={idx}>
            {/* Active Point Circle */}
            <circle 
              cx={pt.x} 
              cy={pt.yActive} 
              r="5" 
              fill="#2563eb" 
              stroke="#ffffff" 
              strokeWidth="2" 
              style={{ cursor: 'pointer', transition: 'transform 0.2s' }}
              onMouseEnter={() => setHoverData({ ...pt, type: 'Active Complaints', val: pt.active, color: '#2563eb' })}
              onMouseLeave={() => setHoverData(null)}
            />
            {/* Resolved Point Circle */}
            <circle 
              cx={pt.x} 
              cy={pt.yResolved} 
              r="4" 
              fill="#10b981" 
              stroke="#ffffff" 
              strokeWidth="2" 
              style={{ cursor: 'pointer' }}
              onMouseEnter={() => setHoverData({ ...pt, type: 'Resolved Complaints', val: pt.resolved, color: '#10b981' })}
              onMouseLeave={() => setHoverData(null)}
            />
          </g>
        ))}
      </svg>

      {/* Dynamic Hover Tooltip Popup */}
      {hoverData && (
        <div style={{
          position: 'absolute',
          left: `${(hoverData.x / width) * 100}%`,
          top: '0px',
          transform: 'translate(-50%, -100%)',
          backgroundColor: '#0f172a',
          color: '#ffffff',
          padding: '0.4rem 0.75rem',
          borderRadius: '6px',
          fontSize: '0.75rem',
          fontWeight: '600',
          boxShadow: '0 4px 12px rgba(15, 23, 42, 0.25)',
          pointerEvents: 'none',
          whiteSpace: 'nowrap',
          zIndex: 10
        }}>
          <div style={{ color: hoverData.color, fontWeight: '700' }}>{hoverData.label}</div>
          <div>{hoverData.type}: <strong>{hoverData.val}</strong></div>
        </div>
      )}

      {/* Legend */}
      <div style={{ display: 'flex', justifyContent: 'center', gap: '1.5rem', marginTop: '0.5rem', fontSize: '0.78rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#0f172a', fontWeight: 600 }}>
          <span style={{ width: '12px', height: '3px', backgroundColor: '#2563eb', borderRadius: '2px' }}></span>
          Active ({complaints.filter(c => c.status !== 'Resolved').length})
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#0f172a', fontWeight: 600 }}>
          <span style={{ width: '12px', height: '3px', backgroundColor: '#10b981', borderRadius: '2px' }}></span>
          Resolved ({complaints.filter(c => c.status === 'Resolved').length})
        </div>
      </div>
    </div>
  );
};


/**
 * 2. DYNAMIC COMPLAINTS BY CATEGORY (Progress Bars for Warden Dashboard)
 */
export const DynamicCategoryBars = ({ complaints = [] }) => {
  const total = complaints.length;

  const categories = Object.keys(CATEGORY_COLORS).map(catName => {
    const count = complaints.filter(c => (c.category || '').toLowerCase() === catName.toLowerCase()).length;
    const percentage = total > 0 ? ((count / total) * 100).toFixed(1) : '0.0';
    return {
      name: catName,
      count,
      percentage,
      color: CATEGORY_COLORS[catName]
    };
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', width: '100%' }}>
      {categories.map(cat => (
        <div key={cat.name} style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', fontWeight: 600, color: '#0f172a' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: cat.color }}></span>
              {cat.name}
            </span>
            <span style={{ color: '#475569' }}>{cat.count} ({cat.percentage}%)</span>
          </div>
          <div style={{ width: '100%', height: '7px', backgroundColor: '#f1f5f9', borderRadius: '10px', overflow: 'hidden' }}>
            <div 
              style={{ 
                width: `${cat.percentage}%`, 
                height: '100%', 
                backgroundColor: cat.color, 
                borderRadius: '10px',
                transition: 'width 0.6s ease'
              }}
            ></div>
          </div>
        </div>
      ))}
    </div>
  );
};


/**
 * 3. DYNAMIC DONUT CHART (For Management Dashboard)
 */
export const DynamicDonutChart = ({ complaints = [] }) => {
  const total = complaints.length;

  const categories = Object.keys(CATEGORY_COLORS).map(catName => {
    const count = complaints.filter(c => (c.category || '').toLowerCase() === catName.toLowerCase()).length;
    const pct = total > 0 ? count / total : 0;
    return {
      name: catName,
      count,
      pct,
      color: CATEGORY_COLORS[catName]
    };
  }).filter(c => c.count > 0);

  // SVG Donut calculation
  const radius = 45;
  const circumference = 2 * Math.PI * radius;
  let accumulatedPct = 0;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem', width: '100%' }}>
      <div style={{ position: 'relative', width: '140px', height: '140px' }}>
        <svg viewBox="0 0 120 120" style={{ width: '100%', height: '100%', transform: 'rotate(-90deg)' }}>
          {/* Base Background Track Circle */}
          <circle cx="60" cy="60" r={radius} fill="none" stroke="#f1f5f9" strokeWidth="16" />
          
          {categories.length === 0 ? (
            <circle cx="60" cy="60" r={radius} fill="none" stroke="#e2e8f0" strokeWidth="16" />
          ) : (
            categories.map((cat, idx) => {
              const strokeDasharray = `${cat.pct * circumference} ${circumference}`;
              const strokeDashoffset = -accumulatedPct * circumference;
              accumulatedPct += cat.pct;

              return (
                <circle
                  key={idx}
                  cx="60"
                  cy="60"
                  r={radius}
                  fill="none"
                  stroke={cat.color}
                  strokeWidth="16"
                  strokeDasharray={strokeDasharray}
                  strokeDashoffset={strokeDashoffset}
                  style={{ transition: 'stroke-dasharray 0.8s ease' }}
                />
              );
            })
          )}
        </svg>

        {/* Center Total Count Overlay */}
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          textAlign: 'center'
        }}>
          <span style={{ fontSize: '1.45rem', fontWeight: '800', color: '#0f172a', display: 'block', lineHeight: 1 }}>{total}</span>
          <span style={{ fontSize: '0.7rem', color: '#64748b', fontWeight: '600', textTransform: 'uppercase', marginTop: '2px', display: 'block' }}>Total</span>
        </div>
      </div>

        {/* Dynamic Interactive Legend */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem 0.85rem', justifyContent: 'center', fontSize: '0.75rem' }}>
        {Object.keys(CATEGORY_COLORS).map(catName => {
          const count = complaints.filter(c => (c.category || '').toLowerCase() === catName.toLowerCase()).length;
          return (
            <div key={catName} style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: '#0f172a', fontWeight: 600 }}>
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: CATEGORY_COLORS[catName] }}></span>
              <span>{catName}: <strong>{count}</strong></span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

/**
 * 4. DYNAMIC FEEDBACK RATING BAR CHART
 */
export const FeedbackBarChart = ({ feedbackResponses = [] }) => {
  // Count frequency of ratings 1 to 5
  const counts = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  feedbackResponses.forEach(resp => {
    const r = Math.round(resp.rating);
    if (r >= 1 && r <= 5) {
      counts[r]++;
    }
  });

  const maxCount = Math.max(...Object.values(counts), 1);

  // SVG dimensions
  const width = 380;
  const height = 150;
  const paddingLeft = 30;
  const paddingRight = 10;
  const paddingTop = 20;
  const paddingBottom = 25;

  const chartW = width - paddingLeft - paddingRight;
  const chartH = height - paddingTop - paddingBottom;

  const ratingLabels = ['1 ★', '2 ★', '3 ★', '4 ★', '5 ★'];

  return (
    <div style={{ width: '100%' }}>
      <svg viewBox={`0 0 ${width} ${height}`} style={{ width: '100%', height: 'auto', overflow: 'visible' }}>
        {/* Y Grid Lines & Labels */}
        {[0, 0.5, 1].map((ratio, idx) => {
          const y = paddingTop + ratio * chartH;
          const val = Math.round(maxCount * (1 - ratio));
          return (
            <g key={idx}>
              <line x1={paddingLeft} y1={y} x2={width - paddingRight} y2={y} stroke="#f1f5f9" strokeWidth="1.2" />
              <text x={paddingLeft - 8} y={y + 3} fontSize="9" fill="#94a3b8" textAnchor="end" fontWeight="500">
                {val}
              </text>
            </g>
          );
        })}

        {/* Bars */}
        {[1, 2, 3, 4, 5].map((star, idx) => {
          const count = counts[star];
          const barHeight = (count / maxCount) * chartH;
          const barWidth = 36;
          const x = paddingLeft + (idx / 5) * chartW + (chartW / 10) - (barWidth / 2);
          const y = paddingTop + chartH - barHeight;

          // Color coding for ratings
          const barColors = {
            1: '#f87171', // Red
            2: '#fb923c', // Orange
            3: '#facc15', // Yellow
            4: '#a3e635', // Light Green
            5: '#4ade80'  // Green
          };

          return (
            <g key={star}>
              {/* Animated/Rendered Bar */}
              <rect
                x={x}
                y={y}
                width={barWidth}
                height={Math.max(barHeight, 3)}
                rx="6"
                fill={barColors[star]}
                style={{ transition: 'all 0.5s ease' }}
              />
              
              {/* Count label above bar */}
              {count > 0 && (
                <text x={x + barWidth / 2} y={y - 5} fontSize="9.5" fill="#475569" fontWeight="700" textAnchor="middle">
                  {count}
                </text>
              )}

              {/* X Axis Label */}
              <text x={x + barWidth / 2} y={height - 5} fontSize="10" fill="#64748b" fontWeight="700" textAnchor="middle">
                {ratingLabels[idx]}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
};
