import React, { useState, useMemo } from 'react';

export default function FeedbackAnalyticsSection({ responses = [], studentsList = [] }) {
  const [timeframe, setTimeframe] = useState('weekly'); // 'daily' | 'weekly' | 'monthly'
  const [hoveredData, setHoveredData] = useState(null);

  // Helper: Get student block
  const getStudentBlock = (email) => {
    const stud = (studentsList || []).find(s => s.email?.toLowerCase() === email?.toLowerCase());
    return stud?.block || 'D Block';
  };

  // Helper: Get feedback category
  const getFeedbackCategory = (comments) => {
    const text = (comments || '').toLowerCase();
    if (text.includes('food') || text.includes('mess') || text.includes('chapati') || text.includes('dinner') || text.includes('lunch') || text.includes('breakfast')) return 'Food';
    if (text.includes('water') || text.includes('tap') || text.includes('drinking') || text.includes('washroom') || text.includes('filter')) return 'Water';
    if (text.includes('electricity') || text.includes('power') || text.includes('light') || text.includes('fan') || text.includes('ac') || text.includes('wifi router')) return 'Electricity';
    if (text.includes('cleaning') || text.includes('dust') || text.includes('sweeping') || text.includes('waste') || text.includes('garbage') || text.includes('clean') || text.includes('broom')) return 'Cleaning';
    if (text.includes('internet') || text.includes('wifi') || text.includes('network') || text.includes('connection')) return 'Internet';
    return 'Room Maintenance';
  };

  // Enrich responses with block and category
  const enrichedResponses = useMemo(() => {
    return responses.map(r => ({
      ...r,
      block: getStudentBlock(r.studentEmail),
      category: getFeedbackCategory(r.comments),
      isPositive: r.rating >= 4,
      isNegative: r.rating <= 3,
      dateObj: new Date(r.createdAt || Date.now())
    }));
  }, [responses, studentsList]);

  // Date parsing logic
  const filteredData = useMemo(() => {
    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    if (timeframe === 'daily') {
      return enrichedResponses.filter(r => r.dateObj >= startOfToday);
    } else if (timeframe === 'weekly') {
      const sevenDaysAgo = new Date(startOfToday.getTime() - 7 * 24 * 60 * 60 * 1000);
      return enrichedResponses.filter(r => r.dateObj >= sevenDaysAgo);
    } else {
      const thirtyDaysAgo = new Date(startOfToday.getTime() - 30 * 24 * 60 * 60 * 1000);
      return enrichedResponses.filter(r => r.dateObj >= thirtyDaysAgo);
    }
  }, [enrichedResponses, timeframe]);

  // Calculate statistics
  const stats = useMemo(() => {
    const total = filteredData.length;
    const positive = filteredData.filter(r => r.isPositive).length;
    const negative = filteredData.filter(r => r.isNegative).length;
    const positivePercent = total > 0 ? Math.round((positive / total) * 100) : 0;
    const negativePercent = total > 0 ? Math.round((negative / total) * 100) : 0;

    return { total, positive, negative, positivePercent, negativePercent };
  }, [filteredData]);

  // Calculate timeline graph data (grouped by date)
  const timelineData = useMemo(() => {
    const groups = {};
    
    // Initialize date keys to ensure sequential points in line chart
    const daysToGenerate = timeframe === 'daily' ? 1 : timeframe === 'weekly' ? 7 : 30;
    const now = new Date();
    
    for (let i = daysToGenerate - 1; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth(), now.getDate() - i);
      const dateString = date.toLocaleDateString('en-US', { day: 'numeric', month: 'short' });
      groups[dateString] = { dateString, positive: 0, negative: 0, total: 0 };
    }

    filteredData.forEach(r => {
      const dateString = r.dateObj.toLocaleDateString('en-US', { day: 'numeric', month: 'short' });
      // If the date exists in our range, increment
      if (groups[dateString]) {
        if (r.isPositive) groups[dateString].positive += 1;
        if (r.isNegative) groups[dateString].negative += 1;
        groups[dateString].total += 1;
      }
    });

    return Object.values(groups);
  }, [filteredData, timeframe]);

  // Calculate category stats
  const categoryStats = useMemo(() => {
    const categories = ['Food', 'Water', 'Electricity', 'Cleaning', 'Internet', 'Room Maintenance'];
    return categories.map(cat => {
      const catFeedbacks = filteredData.filter(r => r.category === cat);
      const positive = catFeedbacks.filter(r => r.isPositive).length;
      const negative = catFeedbacks.filter(r => r.isNegative).length;
      const total = catFeedbacks.length;
      return { category: cat, positive, negative, total };
    });
  }, [filteredData]);

  // Generate dynamic insights
  const insights = useMemo(() => {
    if (enrichedResponses.length === 0) {
      return [
        "No feedback data recorded yet.",
        "Waiting for responses to compile satisfaction metrics."
      ];
    }

    const list = [];
    
    // peak positive date
    const dateCounts = {};
    enrichedResponses.forEach(r => {
      const dateStr = r.dateObj.toLocaleDateString('en-US', { day: 'numeric', month: 'long' });
      if (!dateCounts[dateStr]) dateCounts[dateStr] = { positive: 0, negative: 0 };
      if (r.isPositive) dateCounts[dateStr].positive++;
      if (r.isNegative) dateCounts[dateStr].negative++;
    });

    let maxPosDate = null;
    let maxPosCount = -1;
    let maxNegDate = null;
    let maxNegCount = -1;

    Object.entries(dateCounts).forEach(([date, c]) => {
      if (c.positive > maxPosCount) {
        maxPosCount = c.positive;
        maxPosDate = date;
      }
      if (c.negative > maxNegCount) {
        maxNegCount = c.negative;
        maxNegDate = date;
      }
    });

    if (maxPosDate && maxPosCount > 0) {
      list.push(`Most positive feedback was received on ${maxPosDate}.`);
    } else {
      list.push("Overall satisfaction remains stable across all dates.");
    }

    if (maxNegDate && maxNegCount > 0) {
      list.push(`Negative feedback increased on ${maxNegDate}.`);
    }

    // Category with highest satisfaction
    const categories = ['Food', 'Water', 'Electricity', 'Cleaning', 'Internet', 'Room Maintenance'];
    let bestCat = null;
    let bestPercent = -1;

    categories.forEach(cat => {
      const catFeedbacks = enrichedResponses.filter(r => r.category === cat);
      if (catFeedbacks.length > 0) {
        const pos = catFeedbacks.filter(r => r.isPositive).length;
        const pct = (pos / catFeedbacks.length) * 100;
        if (pct > bestPercent) {
          bestPercent = pct;
          bestCat = cat;
        }
      }
    });

    if (bestCat) {
      list.push(`${bestCat} complaints received the highest satisfaction.`);
    }

    // Overall satisfaction this month (last 30 days)
    const thirtyDaysAgo = new Date(new Date().getTime() - 30 * 24 * 60 * 60 * 1000);
    const monthFeedbacks = enrichedResponses.filter(r => r.dateObj >= thirtyDaysAgo);
    if (monthFeedbacks.length > 0) {
      const pos = monthFeedbacks.filter(r => r.isPositive).length;
      const satisfaction = Math.round((pos / monthFeedbacks.length) * 100);
      list.push(`Overall satisfaction this month is ${satisfaction}%.`);
    } else {
      list.push("Overall satisfaction this month is 100%.");
    }

    return list;
  }, [enrichedResponses]);

  // Line chart SVG layout values
  const chartHeight = 220;
  const chartWidth = 500;
  const paddingLeft = 40;
  const paddingRight = 20;
  const paddingTop = 20;
  const paddingBottom = 40;

  const points = useMemo(() => {
    if (timelineData.length === 0) return { posPoints: '', negPoints: '', coords: [] };

    // Find max value for Y scaling
    const maxVal = Math.max(...timelineData.map(d => Math.max(d.positive, d.negative)), 5);

    const stepX = (chartWidth - paddingLeft - paddingRight) / Math.max(timelineData.length - 1, 1);
    
    const posPoints = [];
    const negPoints = [];
    const coords = [];

    timelineData.forEach((d, idx) => {
      const x = paddingLeft + idx * stepX;
      
      // Calculate Y coords (inverted since SVG 0 is top)
      const posY = chartHeight - paddingBottom - ((d.positive / maxVal) * (chartHeight - paddingTop - paddingBottom));
      const negY = chartHeight - paddingBottom - ((d.negative / maxVal) * (chartHeight - paddingTop - paddingBottom));

      posPoints.push(`${x},${posY}`);
      negPoints.push(`${x},${negY}`);
      coords.push({ date: d.dateString, positive: d.positive, negative: d.negative, x, posY, negY });
    });

    return {
      posPoints: posPoints.join(' '),
      negPoints: negPoints.join(' '),
      coords,
      maxVal
    };
  }, [timelineData]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', marginTop: '1rem', width: '100%' }}>
      
      {/* Header and Switcher */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 style={{ fontSize: '1.35rem', color: '#0f172a', fontWeight: 800, margin: 0 }}>📊 Feedback Graphical Analytics</h2>
          <p style={{ color: '#64748b', fontSize: '0.85rem', margin: '0.2rem 0 0' }}>Real-time sentiment insights based on feedback submission date</p>
        </div>
        <div style={{ display: 'flex', gap: '0.35rem', backgroundColor: '#f1f5f9', padding: '0.25rem', borderRadius: '8px' }}>
          <button
            onClick={() => setTimeframe('daily')}
            style={{
              padding: '0.4rem 0.85rem',
              borderRadius: '6px',
              border: 'none',
              backgroundColor: timeframe === 'daily' ? '#2563eb' : 'transparent',
              color: timeframe === 'daily' ? '#fff' : '#475569',
              fontSize: '0.8rem',
              fontWeight: 700,
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
          >
            Daily
          </button>
          <button
            onClick={() => setTimeframe('weekly')}
            style={{
              padding: '0.4rem 0.85rem',
              borderRadius: '6px',
              border: 'none',
              backgroundColor: timeframe === 'weekly' ? '#2563eb' : 'transparent',
              color: timeframe === 'weekly' ? '#fff' : '#475569',
              fontSize: '0.8rem',
              fontWeight: 700,
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
          >
            Weekly
          </button>
          <button
            onClick={() => setTimeframe('monthly')}
            style={{
              padding: '0.4rem 0.85rem',
              borderRadius: '6px',
              border: 'none',
              backgroundColor: timeframe === 'monthly' ? '#2563eb' : 'transparent',
              color: timeframe === 'monthly' ? '#fff' : '#475569',
              fontSize: '0.8rem',
              fontWeight: 700,
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
          >
            Monthly
          </button>
        </div>
      </div>

      {/* Stats Cards Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem' }}>
        
        <div className="stat-card" style={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', padding: '1.25rem', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)', display: 'flex', flexDirection: 'column' }}>
          <span style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: 700, textTransform: 'uppercase', tracking: '0.05em' }}>Total Feedbacks</span>
          <span style={{ fontSize: '1.85rem', fontWeight: 800, color: '#0f172a', marginTop: '0.35rem' }}>{stats.total}</span>
          <span style={{ fontSize: '0.72rem', color: '#94a3b8', marginTop: 'auto', paddingTop: '0.25rem' }}>Based on chosen timeframe</span>
        </div>

        <div className="stat-card" style={{ backgroundColor: '#f0fdf4', border: '1px solid #bbf7d0', padding: '1.25rem', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)', display: 'flex', flexDirection: 'column' }}>
          <span style={{ fontSize: '0.78rem', color: '#166534', fontWeight: 700, textTransform: 'uppercase', tracking: '0.05em' }}>Positive Feedback</span>
          <span style={{ fontSize: '1.85rem', fontWeight: 800, color: '#15803d', marginTop: '0.35rem' }}>{stats.positive}</span>
          <span style={{ fontSize: '0.78rem', color: '#166534', fontWeight: 650, marginTop: 'auto', paddingTop: '0.25rem' }}>{stats.positivePercent}% Positive</span>
        </div>

        <div className="stat-card" style={{ backgroundColor: '#fef2f2', border: '1px solid #fecaca', padding: '1.25rem', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)', display: 'flex', flexDirection: 'column' }}>
          <span style={{ fontSize: '0.78rem', color: '#991b1b', fontWeight: 700, textTransform: 'uppercase', tracking: '0.05em' }}>Negative Feedback</span>
          <span style={{ fontSize: '1.85rem', fontWeight: 800, color: '#b91c1c', marginTop: '0.35rem' }}>{stats.negative}</span>
          <span style={{ fontSize: '0.78rem', color: '#991b1b', fontWeight: 650, marginTop: 'auto', paddingTop: '0.25rem' }}>{stats.negativePercent}% Negative</span>
        </div>

      </div>

      {/* Grid of charts */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem' }}>
        
        {/* Timeline Graph Card */}
        <div style={{ backgroundColor: '#fff', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '1.5rem', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h3 style={{ margin: 0, fontSize: '0.98rem', fontWeight: 800, color: '#0f172a' }}>📈 Sentiment Trend Timeline</h3>
            <div style={{ display: 'flex', gap: '0.75rem', fontSize: '0.75rem', fontWeight: 700 }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', color: '#16a34a' }}>
                <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#16a34a', display: 'inline-block' }}></span> Positive
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', color: '#dc2626' }}>
                <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#dc2626', display: 'inline-block' }}></span> Negative
              </span>
            </div>
          </div>

          <div style={{ position: 'relative', width: '100%' }}>
            {timelineData.length === 0 ? (
              <div style={{ height: `${chartHeight}px`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748b', fontSize: '0.85rem' }}>
                No trend data for this timeframe.
              </div>
            ) : (
              <svg viewBox={`0 0 ${chartWidth} ${chartHeight}`} style={{ width: '100%', height: 'auto', display: 'block' }}>
                {/* Horizontal Gridlines */}
                {[0, 0.25, 0.5, 0.75, 1].map((ratio, idx) => {
                  const y = paddingTop + ratio * (chartHeight - paddingTop - paddingBottom);
                  const labelVal = Math.round(points.maxVal * (1 - ratio));
                  return (
                    <g key={idx}>
                      <line x1={paddingLeft} y1={y} x2={chartWidth - paddingRight} y2={y} stroke="#f1f5f9" strokeWidth="1" />
                      <text x={paddingLeft - 8} y={y + 4} textAnchor="end" fontSize="10" fill="#94a3b8" fontWeight="600">{labelVal}</text>
                    </g>
                  );
                })}

                {/* Draw Positive line path */}
                {points.posPoints && (
                  <polyline
                    fill="none"
                    stroke="#16a34a"
                    strokeWidth="3.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    points={points.posPoints}
                  />
                )}

                {/* Draw Negative line path */}
                {points.negPoints && (
                  <polyline
                    fill="none"
                    stroke="#dc2626"
                    strokeWidth="3.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    points={points.negPoints}
                  />
                )}

                {/* Points Circle triggers for interactive tooltip */}
                {points.coords.map((pt, idx) => (
                  <g key={idx}>
                    {/* Positive circle */}
                    <circle
                      cx={pt.x}
                      cy={pt.posY}
                      r="4.5"
                      fill="#ffffff"
                      stroke="#16a34a"
                      strokeWidth="2.5"
                      onMouseEnter={() => setHoveredData({ ...pt, type: 'Positive', count: pt.positive, yVal: pt.posY })}
                      onMouseLeave={() => setHoveredData(null)}
                      style={{ cursor: 'pointer', transition: 'all 0.15s' }}
                    />
                    {/* Negative circle */}
                    <circle
                      cx={pt.x}
                      cy={pt.negY}
                      r="4.5"
                      fill="#ffffff"
                      stroke="#dc2626"
                      strokeWidth="2.5"
                      onMouseEnter={() => setHoveredData({ ...pt, type: 'Negative', count: pt.negative, yVal: pt.negY })}
                      onMouseLeave={() => setHoveredData(null)}
                      style={{ cursor: 'pointer', transition: 'all 0.15s' }}
                    />
                    
                    {/* Date label on X-axis (only show subset for 30-day mode to prevent overlapping) */}
                    {(timeframe !== 'monthly' || idx % 4 === 0 || idx === timelineData.length - 1) && (
                      <text x={pt.x} y={chartHeight - paddingBottom + 18} textAnchor="middle" fontSize="9.5" fill="#64748b" fontWeight="700">
                        {pt.date}
                      </text>
                    )}
                  </g>
                ))}
              </svg>
            )}

            {/* Custom interactive tooltip overlays */}
            {hoveredData && (
              <div style={{
                position: 'absolute',
                left: `${(hoveredData.x / chartWidth) * 100}%`,
                top: `${(hoveredData.yVal / chartHeight) * 90}%`,
                transform: 'translate(-50%, -110%)',
                backgroundColor: '#0f172a',
                color: '#fff',
                padding: '0.45rem 0.75rem',
                borderRadius: '6px',
                fontSize: '0.75rem',
                fontWeight: 700,
                boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)',
                zIndex: 10,
                whiteSpace: 'nowrap',
                pointerEvents: 'none'
              }}>
                <div style={{ borderBottom: '1px solid #334155', paddingBottom: '2px', marginBottom: '2px', color: '#94a3b8' }}>{hoveredData.date}</div>
                <div style={{ color: hoveredData.type === 'Positive' ? '#4ade80' : '#f87171' }}>
                  {hoveredData.type}: {hoveredData.count} feedback
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Category Analytics Horizontal Bar Chart */}
        <div style={{ backgroundColor: '#fff', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '1.5rem', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)', display: 'flex', flexDirection: 'column' }}>
          <h3 style={{ margin: '0 0 1rem 0', fontSize: '0.98rem', fontWeight: 800, color: '#0f172a' }}>📂 Category Performance Metrics</h3>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem', flex: 1, justifyContent: 'center' }}>
            {categoryStats.map((item, idx) => {
              const maxTotal = Math.max(...categoryStats.map(c => c.total), 1);
              const positivePct = item.total > 0 ? (item.positive / item.total) * 100 : 0;
              const negativePct = item.total > 0 ? (item.negative / item.total) * 100 : 0;

              return (
                <div key={idx} style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.8rem', fontWeight: 700, color: '#334155' }}>
                    <span>{item.category}</span>
                    <span style={{ fontSize: '0.72rem', color: '#64748b' }}>
                      <span style={{ color: '#16a34a' }}>{item.positive} 👍</span> / <span style={{ color: '#dc2626' }}>{item.negative} 👎</span>
                    </span>
                  </div>

                  {/* Dual Segment Stacked Progress Bar */}
                  <div style={{ height: '14px', width: '100%', backgroundColor: '#f1f5f9', borderRadius: '6px', overflow: 'hidden', display: 'flex', opacity: item.total > 0 ? 1 : 0.4 }}>
                    {item.total > 0 ? (
                      <>
                        <div style={{ width: `${positivePct}%`, backgroundColor: '#16a34a', height: '100%', transition: 'width 0.4s ease' }} title={`Positive: ${item.positive}`} />
                        <div style={{ width: `${negativePct}%`, backgroundColor: '#dc2626', height: '100%', transition: 'width 0.4s ease' }} title={`Negative: ${item.negative}`} />
                      </>
                    ) : (
                      <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', paddingLeft: '8px', fontSize: '0.68rem', color: '#94a3b8', fontStyle: 'italic', fontWeight: 600 }}>
                        No Submissions
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

      </div>

      {/* Dashboard Insights Card */}
      <div style={{ backgroundColor: '#fff8e6', border: '1px solid #ffe0b2', borderRadius: '16px', padding: '1.25rem', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.02)', display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
        <span style={{ fontSize: '1.35rem', marginTop: '-2px' }}>💡</span>
        <div>
          <h4 style={{ margin: '0 0 0.4rem 0', fontSize: '0.9rem', fontWeight: 800, color: '#b25e00' }}>Dashboard Insights</h4>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '0.5rem' }}>
            {insights.map((insight, idx) => (
              <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.8rem', color: '#7c4c00', fontWeight: 650 }}>
                <span style={{ color: '#f59e0b', fontSize: '0.85rem' }}>◆</span>
                <span>{insight}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Feedback Table */}
      <div style={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '1.25rem', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)', overflow: 'hidden' }}>
        <h3 style={{ margin: '0 0 1rem 0', fontSize: '0.98rem', fontWeight: 800, color: '#0f172a' }}>📋 Recent Feedback Table (Newest First)</h3>
        
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '700px' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid #e2e8f0', color: '#475569', fontSize: '0.78rem', fontWeight: 800, textTransform: 'uppercase' }}>
                <th style={{ padding: '0.75rem 0.5rem' }}>Student Name</th>
                <th style={{ padding: '0.75rem 0.5rem' }}>Hostel Block</th>
                <th style={{ padding: '0.75rem 0.5rem' }}>Category</th>
                <th style={{ padding: '0.75rem 0.5rem' }}>Feedback Comment</th>
                <th style={{ padding: '0.75rem 0.5rem' }}>Sentiment</th>
                <th style={{ padding: '0.75rem 0.5rem' }}>Submitted Date</th>
                <th style={{ padding: '0.75rem 0.5rem' }}>Time</th>
              </tr>
            </thead>
            <tbody>
              {filteredData.length === 0 ? (
                <tr>
                  <td colSpan="7" style={{ textAlign: 'center', padding: '2rem 0', color: '#64748b', fontSize: '0.85rem', fontStyle: 'italic' }}>
                    No recent feedback logs match the chosen timeframe.
                  </td>
                </tr>
              ) : (
                filteredData.slice(0, 10).map((item, idx) => (
                  <tr key={item._id || idx} style={{ borderBottom: '1px solid #f1f5f9', fontSize: '0.82rem', color: '#334155' }}>
                    <td style={{ padding: '0.75rem 0.5rem', fontWeight: 700 }}>{item.studentName}</td>
                    <td style={{ padding: '0.75rem 0.5rem' }}>
                      <span style={{ backgroundColor: '#f1f5f9', padding: '0.2rem 0.5rem', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 700, color: '#475569' }}>
                        {item.block}
                      </span>
                    </td>
                    <td style={{ padding: '0.75rem 0.5rem', fontWeight: 650, color: '#2563eb' }}>{item.category}</td>
                    <td style={{ padding: '0.75rem 0.5rem', maxWidth: '280px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontStyle: 'italic' }} title={item.comments}>
                      "{item.comments || 'No comment left.'}"
                    </td>
                    <td style={{ padding: '0.75rem 0.5rem' }}>
                      {item.isPositive ? (
                        <span style={{ backgroundColor: '#dcfce7', color: '#15803d', padding: '0.15rem 0.45rem', borderRadius: '4px', fontSize: '0.72rem', fontWeight: 800 }}>
                          Positive ({item.rating}★)
                        </span>
                      ) : (
                        <span style={{ backgroundColor: '#fee2e2', color: '#b91c1c', padding: '0.15rem 0.45rem', borderRadius: '4px', fontSize: '0.72rem', fontWeight: 800 }}>
                          Negative ({item.rating}★)
                        </span>
                      )}
                    </td>
                    <td style={{ padding: '0.75rem 0.5rem' }}>
                      {item.dateObj.toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </td>
                    <td style={{ padding: '0.75rem 0.5rem', color: '#64748b' }}>
                      {item.dateObj.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
