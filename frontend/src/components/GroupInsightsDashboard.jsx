import React, { useState, useEffect } from 'react';
import './GroupInsightsDashboard.css';

export default function GroupInsightsDashboard({ hostelType }) {
  const [insights, setInsights] = useState([]);
  const [loading, setLoading] = useState(true);
  const [summarizingBlock, setSummarizingBlock] = useState(null); // track which block is regenerating

  useEffect(() => {
    fetchInsights();
  }, [hostelType]);

  const fetchInsights = async () => {
    setLoading(true);
    try {
      const headers = {};
      if (hostelType) {
        headers['X-Hostel-Type'] = hostelType;
      }
      const res = await fetch('/api/incident-groups/insights', { headers });
      if (res.ok) {
        const data = await res.json();
        setInsights(data);
      }
    } catch (err) {
      console.error('Failed to fetch insights', err);
    } finally {
      setLoading(false);
    }
  };

  const handleRegenerateSummary = async (blockGroup) => {
    setSummarizingBlock(blockGroup);
    try {
      const headers = { 'Content-Type': 'application/json' };
      if (hostelType) {
        headers['X-Hostel-Type'] = hostelType;
      }
      const res = await fetch('/api/incident-groups/summarize', {
        method: 'POST',
        headers,
        body: JSON.stringify({ blockGroup })
      });
      if (res.ok) {
        // Fetch insights again to update UI
        const res2 = await fetch('/api/incident-groups/insights', { headers: { 'X-Hostel-Type': hostelType } });
        if (res2.ok) {
          const data2 = await res2.json();
          setInsights(data2);
        }
      }
    } catch (err) {
      console.error('Regenerate failed', err);
    } finally {
      setSummarizingBlock(null);
    }
  };

  const getCategoryBadgeClass = (category) => {
    if (!category) return 'cat-badge-general';
    const c = category.toLowerCase();
    if (c.includes('water')) return 'cat-badge-water';
    if (c.includes('elect')) return 'cat-badge-electricity';
    if (c.includes('food') || c.includes('mess')) return 'cat-badge-food';
    if (c.includes('internet') || c.includes('wifi')) return 'cat-badge-internet';
    if (c.includes('clean')) return 'cat-badge-cleaning';
    if (c.includes('plumb')) return 'cat-badge-plumbing';
    if (c.includes('lift')) return 'cat-badge-lift';
    return 'cat-badge-general';
  };

  const getCategoryIcon = (category) => {
    if (!category) return '💡';
    const c = category.toLowerCase();
    if (c.includes('water')) return '💧';
    if (c.includes('elect')) return '⚡';
    if (c.includes('food') || c.includes('mess')) return '🍎';
    if (c.includes('internet') || c.includes('wifi')) return '📶';
    if (c.includes('clean')) return '🧹';
    if (c.includes('plumb')) return '🔧';
    if (c.includes('lift')) return '🛗';
    return '💡';
  };

  return (
    <div className="insights-dashboard-container">
      <div className="insights-header-section">
        <div>
          <h2>📊 Group Insights & AI Analytics</h2>
          <p className="subtitle">Real-time status summaries and discussion trends across hostel blocks.</p>
        </div>
        <button className="refresh-insights-btn" onClick={fetchInsights} disabled={loading}>
          {loading ? 'Refreshing...' : '🔄 Refresh Data'}
        </button>
      </div>

      {loading ? (
        <div className="insights-loading-state">
          <div className="loading-spinner"></div>
          <p>Fetching discussion metrics and insights...</p>
        </div>
      ) : (
        <div className="insights-grid-layout">
          {insights.map((item) => {
            const isRegenerating = summarizingBlock === item.blockGroup;
            return (
              <div key={item.blockGroup} className="insight-block-card">
                {/* CARD HEADER */}
                <div className="insight-card-header">
                  <div className="card-title-row">
                    <span className="block-group-icon">🏢</span>
                    <h3>{item.blockGroup} Block</h3>
                  </div>
                  <button 
                    className="regenerate-card-btn" 
                    onClick={() => handleRegenerateSummary(item.blockGroup)}
                    disabled={isRegenerating}
                  >
                    {isRegenerating ? 'Analyzing...' : '✨ Re-Summarize'}
                  </button>
                </div>

                {/* METRICS ROW */}
                <div className="insight-card-metrics-grid">
                  <div className="metric-box">
                    <span className="metric-val">{item.messageCount || 0}</span>
                    <span className="metric-lbl">Total Messages</span>
                  </div>
                  <div className="metric-box">
                    <span className="metric-val">{item.activeStudentsCount || 0}</span>
                    <span className="metric-lbl">Active Students</span>
                  </div>
                </div>

                {/* TOPICS & CATEGORY */}
                <div className="insight-card-trend-section">
                  <div className="trend-item">
                    <span className="trend-lbl">Most Discussed Topic:</span>
                    <span className="trend-val font-semibold">{item.mostDiscussedTopic || 'None'}</span>
                  </div>
                  <div className="trend-item">
                    <span className="trend-lbl">Top Concern Category:</span>
                    <span className={`cat-badge ${getCategoryBadgeClass(item.mostMentionedCategory)}`}>
                      {getCategoryIcon(item.mostMentionedCategory)} {item.mostMentionedCategory || 'General'}
                    </span>
                  </div>
                </div>

                {/* AI SUMMARY BOX */}
                <div className="insight-card-summary-box">
                  {isRegenerating ? (
                    <div className="inline-spinner-loading">
                      <div className="mini-spinner"></div>
                      <p>Generating new summary using Groq Llama-3...</p>
                    </div>
                  ) : (
                    <>
                      <h4>AI Summary</h4>
                      <div className="summary-list">
                        {item.summary ? (
                          item.summary.split('\n').map((line, idx) => (
                            <p key={idx} className="summary-line">{line}</p>
                          ))
                        ) : (
                          <p className="no-summary-txt">No summary generated yet. Click "Re-Summarize" above.</p>
                        )}
                      </div>
                    </>
                  )}
                </div>

                {/* CARD FOOTER */}
                <div className="insight-card-footer">
                  <span>Last Updated:</span>
                  <span>{item.lastUpdated ? new Date(item.lastUpdated).toLocaleString() : 'Never'}</span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
