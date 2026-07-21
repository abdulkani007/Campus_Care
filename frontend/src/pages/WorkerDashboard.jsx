import React, { useState, useEffect } from 'react';
import logo from '../assets/CC.png';
import '../styles/WorkerDashboard.css';

const WorkerDashboard = ({ user, onLogout }) => {
  const [tasks, setTasks] = useState([]);
  const [activeTab, setActiveTab] = useState('Dashboard'); // Dashboard, Assigned Task Orders, In Progress Repairs, Completed Reports, My Profile & Duty
  const [statusFilter, setStatusFilter] = useState('All');
  const [priorityFilter, setPriorityFilter] = useState('All');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [sortOrder, setSortOrder] = useState('Newest');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [selectedTaskModal, setSelectedTaskModal] = useState(null);
  const [completionNotes, setCompletionNotes] = useState('');
  const [proofImage, setProofImage] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const [zoomImage, setZoomImage] = useState(null);

  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  // Fetch tasks assigned to worker
  const fetchTasks = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/worker-tasks?workerEmail=${encodeURIComponent(user?.email || 'workers@campuscare.com')}`);
      if (res.ok) {
        const data = await res.json();
        setTasks(data);
      }
    } catch (err) {
      console.error('Error fetching worker tasks:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, [user]);

  // Status transitions
  const handleUpdateStatus = async (taskId, newStatus, extraData = {}) => {
    try {
      setActionLoading(true);
      const res = await fetch(`/api/worker-tasks/${taskId}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: newStatus,
          ...extraData
        })
      });
      if (res.ok) {
        setSelectedTaskModal(null);
        setCompletionNotes('');
        setProofImage('');
        fetchTasks();
      } else {
        alert('Failed to update task status.');
      }
    } catch (err) {
      console.error('Error updating task status:', err);
      alert('Network error updating task.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleImageUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProofImage(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  // CSV Export for Completed Reports
  const handleExportCSV = (taskToExport = null) => {
    const exportData = taskToExport ? [taskToExport] : tasks.filter(t => t.status === 'Completed' || t.status === 'Verified' || t.status === 'Closed');
    if (exportData.length === 0) {
      alert('No completed reports available for download.');
      return;
    }
    const headers = ['Task ID', 'Title', 'Category', 'Priority', 'Student Name', 'Location', 'Assigned Date', 'Status', 'Completion Notes'];
    const rows = exportData.map(t => [
      t.taskId || '',
      `"${(t.complaint?.title || 'Maintenance Repair').replace(/"/g, '""')}"`,
      t.complaint?.category || t.workerCategory || 'General',
      t.complaint?.priority || 'Normal',
      `"${(t.complaint?.studentName || '').replace(/"/g, '""')}"`,
      `"${(t.complaint?.location || '').replace(/"/g, '""')}"`,
      new Date(t.assignedDate).toLocaleDateString(),
      t.status,
      `"${(t.completionNotes || '').replace(/"/g, '""')}"`
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Worker_Completed_Report_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Metric counts
  const totalAssigned = tasks.length;
  const pendingCount = tasks.filter(t => t.status === 'Assigned').length;
  const acceptedCount = tasks.filter(t => t.status === 'Accepted').length;
  const inProgressCount = tasks.filter(t => t.status === 'In Progress').length;
  const activeUncompletedCount = tasks.filter(t => t.status === 'Assigned' || t.status === 'Accepted' || t.status === 'Pending').length;
  const completedCount = tasks.filter(t => t.status === 'Completed' || t.status === 'Verified' || t.status === 'Closed').length;
  const rejectedCount = tasks.filter(t => t.status === 'Rejected').length;
  const completedTodayCount = tasks.filter(t => {
    const isDone = t.status === 'Completed' || t.status === 'Verified' || t.status === 'Closed';
    const isToday = new Date(t.assignedDate).toDateString() === new Date().toDateString();
    return isDone && isToday;
  }).length;

  // Tab Filtering Rules
  const getTabFilteredTasks = () => {
    let list = [];
    if (activeTab === 'Assigned Task Orders') {
      list = tasks.filter(t => t.status === 'Assigned' || t.status === 'Accepted' || t.status === 'Pending');
    } else if (activeTab === 'In Progress Repairs') {
      list = tasks.filter(t => t.status === 'In Progress');
    } else if (activeTab === 'Completed Reports') {
      list = tasks.filter(t => t.status === 'Completed' || t.status === 'Verified' || t.status === 'Closed');
    }

    return list.filter(t => {
      const c = t.complaint || {};
      const query = searchQuery.toLowerCase();
      const matchesSearch = 
        (c.title || '').toLowerCase().includes(query) ||
        (c.location || '').toLowerCase().includes(query) ||
        (c.studentName || '').toLowerCase().includes(query) ||
        (t.taskId || '').toLowerCase().includes(query);

      if (!matchesSearch) return false;
      if (categoryFilter !== 'All' && (c.category || t.workerCategory) !== categoryFilter) return false;
      if (priorityFilter !== 'All' && (c.priority || 'Medium') !== priorityFilter) return false;
      return true;
    }).sort((a, b) => {
      const dateA = new Date(a.assignedDate || 0);
      const dateB = new Date(b.assignedDate || 0);
      if (sortOrder === 'Oldest') return dateA - dateB;
      return dateB - dateA;
    });
  };

  const displayedTabTasks = getTabFilteredTasks();

  const workerName = user?.name || 'Ramesh Kumar';
  const workerCategory = user?.category || user?.role || 'Electrician';
  const avatarInitials = workerName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);

  // Donut chart calculation
  const totalForDonut = Math.max(totalAssigned, 1);
  const strokeAssigned = (pendingCount / totalForDonut) * 100;
  const strokeAccepted = (acceptedCount / totalForDonut) * 100;
  const strokeInProgress = (inProgressCount / totalForDonut) * 100;
  const strokeCompleted = (completedCount / totalForDonut) * 100;

  // Category counts
  const categoryCounts = {
    Electrical: tasks.filter(t => (t.complaint?.category || t.workerCategory) === 'Electrical').length,
    Plumbing: tasks.filter(t => (t.complaint?.category || t.workerCategory) === 'Plumbing').length,
    Water: tasks.filter(t => (t.complaint?.category || t.workerCategory)?.includes('Water')).length,
    Food: tasks.filter(t => (t.complaint?.category || t.workerCategory)?.includes('Mess') || (t.complaint?.category || t.workerCategory)?.includes('Food')).length,
    Internet: tasks.filter(t => (t.complaint?.category || t.workerCategory)?.includes('Internet') || (t.complaint?.category || t.workerCategory)?.includes('Wi-Fi')).length,
    Cleaning: tasks.filter(t => (t.complaint?.category || t.workerCategory)?.includes('Cleaning')).length,
    Others: tasks.filter(t => !['Electrical', 'Plumbing'].includes(t.complaint?.category || t.workerCategory)).length,
  };

  // Build Recent Activity Feed from Tasks
  const recentActivities = tasks.slice(0, 5).map((t, idx) => {
    const c = t.complaint || {};
    const title = c.title || 'Hostel Repair Task';
    const location = c.location || `Room ${c.studentRoom || '101'}`;
    const dateStr = new Date(t.assignedDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    
    let actionText = `Assigned task #${t.taskId} for ${location}`;
    let icon = '📋';
    let color = '#2563eb';
    
    if (t.status === 'Accepted') {
      actionText = `Accepted repair order #${t.taskId} for ${location}`;
      icon = '✓';
      color = '#1d4ed8';
    } else if (t.status === 'In Progress') {
      actionText = `Started active repair on #${t.taskId} (${title})`;
      icon = '⚡';
      color = '#f97316';
    } else if (t.status === 'Completed' || t.status === 'Verified' || t.status === 'Closed') {
      actionText = `Completed repair & uploaded proof for #${t.taskId}`;
      icon = '✅';
      color = '#10b981';
    } else if (t.status === 'Rejected') {
      actionText = `Rejected task order #${t.taskId}`;
      icon = '✕';
      color = '#ef4444';
    }

    return { id: t._id || idx, actionText, icon, color, dateStr, taskId: t.taskId };
  });

  return (
    <div className="worker-dashboard-layout">
      {/* 1. ENTERPRISE NAVBAR */}
      <header className="worker-header">
        <div className="worker-brand">
          <svg 
            width="24" 
            height="24" 
            fill="none" 
            stroke="#64748b" 
            strokeWidth="2" 
            viewBox="0 0 24 24" 
            style={{ cursor: 'pointer', display: 'none' }}
            onClick={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}
            className="hamburger-icon-svg"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
          </svg>
          <img src={logo} alt="CampusCare Logo" className="worker-brand-logo" />
          <span className="worker-brand-title">CampusCare</span>
          <span className="worker-brand-badge">Worker Console</span>
        </div>

        {/* User Profile Badge */}
        <div className="worker-user-profile" onClick={() => setShowProfileMenu(!showProfileMenu)}>
          <div className="worker-avatar">{avatarInitials}</div>
          <div className="worker-info">
            <span className="worker-name-text">{workerName}</span>
            <span className="worker-role-text">{workerCategory} Technician</span>
          </div>
          <svg width="16" height="16" fill="none" stroke="#64748b" strokeWidth="2" viewBox="0 0 24 24" style={{ transform: showProfileMenu ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
          </svg>

          {showProfileMenu && (
            <div style={{ position: 'absolute', top: '100%', right: 0, marginTop: '0.5rem', width: '220px', backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '14px', boxShadow: '0 10px 25px rgba(0,0,0,0.1)', padding: '0.5rem 0', zIndex: 100 }}>
              <div style={{ padding: '0.75rem 1rem', borderBottom: '1px solid #f1f5f9' }}>
                <p style={{ margin: 0, fontSize: '0.82rem', fontWeight: 700, color: '#0f172a' }}>{user?.email || 'workers@campuscare.com'}</p>
                <p style={{ margin: '2px 0 0', fontSize: '0.72rem', color: '#10b981', fontWeight: 800 }}>● Active On Duty</p>
              </div>
              <div style={{ padding: '0.6rem 1rem', fontSize: '0.84rem', color: '#334155', fontWeight: 600, cursor: 'pointer' }} onClick={() => { setActiveTab('My Profile & Duty'); setShowProfileMenu(false); }}>
                👤 My Profile & Duty
              </div>
              <div style={{ padding: '0.6rem 1rem', fontSize: '0.84rem', color: '#334155', fontWeight: 600, cursor: 'pointer' }} onClick={() => { setActiveTab('Assigned Task Orders'); setShowProfileMenu(false); }}>
                📋 Assigned Task Orders ({activeUncompletedCount})
              </div>
              <div style={{ borderTop: '1px solid #f1f5f9', padding: '0.6rem 1rem', fontSize: '0.84rem', color: '#ef4444', fontWeight: 700, cursor: 'pointer' }} onClick={onLogout}>
                🚪 Log Out
              </div>
            </div>
          )}
        </div>
      </header>

      {/* 2. BODY LAYOUT */}
      <div className="worker-body-wrapper">
        {/* Sidebar Navigation */}
        <aside className={`worker-sidebar ${isMobileSidebarOpen ? 'open-mobile' : ''}`}>
          <ul className="worker-sidebar-menu">
            <li>
              <button className={`worker-sidebar-btn ${activeTab === 'Dashboard' ? 'active' : ''}`} onClick={() => setActiveTab('Dashboard')}>
                <div className="worker-menu-item-left">
                  <span>📊</span>
                  <span>Dashboard</span>
                </div>
              </button>
            </li>
            <li>
              <button className={`worker-sidebar-btn ${activeTab === 'Assigned Task Orders' ? 'active' : ''}`} onClick={() => setActiveTab('Assigned Task Orders')}>
                <div className="worker-menu-item-left">
                  <span>📋</span>
                  <span>Assigned Task Orders</span>
                </div>
                {activeUncompletedCount > 0 && <span className="worker-badge-pill yellow">{activeUncompletedCount}</span>}
              </button>
            </li>
            <li>
              <button className={`worker-sidebar-btn ${activeTab === 'In Progress Repairs' ? 'active' : ''}`} onClick={() => setActiveTab('In Progress Repairs')}>
                <div className="worker-menu-item-left">
                  <span>⚡</span>
                  <span>In Progress Repairs</span>
                </div>
                {inProgressCount > 0 && <span className="worker-badge-pill blue">{inProgressCount}</span>}
              </button>
            </li>
            <li>
              <button className={`worker-sidebar-btn ${activeTab === 'Completed Reports' ? 'active' : ''}`} onClick={() => setActiveTab('Completed Reports')}>
                <div className="worker-menu-item-left">
                  <span>✅</span>
                  <span>Completed Reports</span>
                </div>
              </button>
            </li>
            <li>
              <button className={`worker-sidebar-btn ${activeTab === 'My Profile & Duty' ? 'active' : ''}`} onClick={() => setActiveTab('My Profile & Duty')}>
                <div className="worker-menu-item-left">
                  <span>👤</span>
                  <span>My Profile & Duty</span>
                </div>
              </button>
            </li>
          </ul>

          <div style={{ backgroundColor: '#f8fafc', padding: '1rem', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
            <span style={{ fontSize: '0.72rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 700 }}>Maintenance Station</span>
            <p style={{ margin: '4px 0 0', fontSize: '0.85rem', fontWeight: 800, color: '#0f172a' }}>Central Yard Hub</p>
          </div>
        </aside>

        {/* Main Content Area */}
        <main className="worker-main-content">
          
          {/* TAB 1: DASHBOARD (STATISTICS + ANALYTICS + RECENT ACTIVITY ONLY - NO CARDS HERE!) */}
          {activeTab === 'Dashboard' && (
            <>
              {/* 1. SUMMARY KPI STAT CARDS */}
              <div className="worker-kpi-grid">
                <div className="worker-kpi-card">
                  <span className="worker-kpi-label">Assigned Orders</span>
                  <div className="worker-kpi-flex">
                    <span className="worker-kpi-number" style={{ color: '#0f172a' }}>{totalAssigned}</span>
                    <div className="worker-kpi-icon-box" style={{ backgroundColor: '#eff6ff', color: '#2563eb' }}>📋</div>
                  </div>
                </div>

                <div className="worker-kpi-card">
                  <span className="worker-kpi-label">Pending / Assigned</span>
                  <div className="worker-kpi-flex">
                    <span className="worker-kpi-number" style={{ color: '#b45309' }}>{pendingCount}</span>
                    <div className="worker-kpi-icon-box" style={{ backgroundColor: '#fef3c7', color: '#b45309' }}>⏳</div>
                  </div>
                </div>

                <div className="worker-kpi-card">
                  <span className="worker-kpi-label">In Progress Repairs</span>
                  <div className="worker-kpi-flex">
                    <span className="worker-kpi-number" style={{ color: '#c2410c' }}>{inProgressCount}</span>
                    <div className="worker-kpi-icon-box" style={{ backgroundColor: '#fff7ed', color: '#c2410c' }}>⚡</div>
                  </div>
                </div>

                <div className="worker-kpi-card">
                  <span className="worker-kpi-label">Completed Today</span>
                  <div className="worker-kpi-flex">
                    <span className="worker-kpi-number" style={{ color: '#10b981' }}>{completedTodayCount}</span>
                    <div className="worker-kpi-icon-box" style={{ backgroundColor: '#ecfdf5', color: '#10b981' }}>✅</div>
                  </div>
                </div>

                <div className="worker-kpi-card">
                  <span className="worker-kpi-label">Total Completed</span>
                  <div className="worker-kpi-flex">
                    <span className="worker-kpi-number" style={{ color: '#059669' }}>{completedCount}</span>
                    <div className="worker-kpi-icon-box" style={{ backgroundColor: '#d1fae5', color: '#059669' }}>🏆</div>
                  </div>
                </div>

                <div className="worker-kpi-card">
                  <span className="worker-kpi-label">Avg Resolution Time</span>
                  <div className="worker-kpi-flex">
                    <span className="worker-kpi-number" style={{ color: '#6366f1' }}>42 <span style={{ fontSize: '0.95rem', fontWeight: 600 }}>Mins</span></span>
                    <div className="worker-kpi-icon-box" style={{ backgroundColor: '#e0e7ff', color: '#6366f1' }}>⏱️</div>
                  </div>
                </div>
              </div>

              {/* 2. ANALYTICS ROW 1 (STATUS DISTRIBUTION DONUT + WEEKLY PERFORMANCE LINE) */}
              <div className="analytics-grid-row">
                {/* DONUT CHART */}
                <div className="analytics-card">
                  <div className="analytics-card-header">
                    <div>
                      <h3 className="analytics-title">🍩 Task Status Distribution</h3>
                      <p className="analytics-subtitle">Real-time breakdown of assigned workload</p>
                    </div>
                  </div>
                  <div className="donut-chart-container">
                    <div style={{ position: 'relative', width: '160px', height: '160px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <svg width="160" height="160" viewBox="0 0 36 36">
                        <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="#f1f5f9" strokeWidth="3.8" />
                        <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="#10b981" strokeWidth="3.8" strokeDasharray={`${strokeCompleted}, 100`} />
                        <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="#f97316" strokeWidth="3.8" strokeDasharray={`${strokeInProgress}, 100`} strokeDashoffset={`-${strokeCompleted}`} />
                        <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="#f59e0b" strokeWidth="3.8" strokeDasharray={`${strokeAssigned}, 100`} strokeDashoffset={`-${strokeCompleted + strokeInProgress}`} />
                      </svg>
                      <div style={{ position: 'absolute', textAlign: 'center' }}>
                        <span style={{ fontSize: '1.4rem', fontWeight: 900, color: '#0f172a' }}>{totalAssigned}</span>
                        <span style={{ display: 'block', fontSize: '0.68rem', color: '#64748b', fontWeight: 700 }}>TASKS</span>
                      </div>
                    </div>

                    <div className="donut-legend-list">
                      <div className="donut-legend-item">
                        <span className="legend-dot" style={{ backgroundColor: '#f59e0b' }}></span>
                        <span>Assigned / Pending: {pendingCount}</span>
                      </div>
                      <div className="donut-legend-item">
                        <span className="legend-dot" style={{ backgroundColor: '#2563eb' }}></span>
                        <span>Accepted: {acceptedCount}</span>
                      </div>
                      <div className="donut-legend-item">
                        <span className="legend-dot" style={{ backgroundColor: '#f97316' }}></span>
                        <span>In Progress: {inProgressCount}</span>
                      </div>
                      <div className="donut-legend-item">
                        <span className="legend-dot" style={{ backgroundColor: '#10b981' }}></span>
                        <span>Completed: {completedCount}</span>
                      </div>
                      <div className="donut-legend-item">
                        <span className="legend-dot" style={{ backgroundColor: '#ef4444' }}></span>
                        <span>Rejected: {rejectedCount}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* WEEKLY PERFORMANCE LINE CHART */}
                <div className="analytics-card">
                  <div className="analytics-card-header">
                    <div>
                      <h3 className="analytics-title">📈 Weekly Performance</h3>
                      <p className="analytics-subtitle">Tasks completed each day (Mon - Sun)</p>
                    </div>
                  </div>
                  <div style={{ height: '180px', width: '100%', position: 'relative' }}>
                    <svg viewBox="0 0 500 180" style={{ width: '100%', height: '100%' }}>
                      <defs>
                        <linearGradient id="blueGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#2563eb" stopOpacity="0.3" />
                          <stop offset="100%" stopColor="#2563eb" stopOpacity="0.0" />
                        </linearGradient>
                      </defs>
                      <path d="M0,150 Q75,110 150,130 T300,60 T450,40 L500,70 L500,180 L0,180 Z" fill="url(#blueGradient)" />
                      <path d="M0,150 Q75,110 150,130 T300,60 T450,40 L500,70" fill="none" stroke="#2563eb" strokeWidth="4" strokeLinecap="round" />
                      <circle cx="150" cy="130" r="5" fill="#0f4fa8" />
                      <circle cx="300" cy="60" r="5" fill="#0f4fa8" />
                      <circle cx="450" cy="40" r="5" fill="#0f4fa8" />
                    </svg>
                    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0 0.5rem', fontSize: '0.75rem', color: '#64748b', fontWeight: 700, marginTop: '0.5rem' }}>
                      <span>Mon</span><span>Tue</span><span>Wed</span><span>Thu</span><span>Fri</span><span>Sat</span><span>Sun</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* 3. ANALYTICS ROW 2 (CATEGORY DISTRIBUTION + MONTHLY PERFORMANCE AREA) */}
              <div className="analytics-grid-row">
                {/* CATEGORY DISTRIBUTION BAR CHART */}
                <div className="analytics-card">
                  <div className="analytics-card-header">
                    <div>
                      <h3 className="analytics-title">📊 Category Breakdown</h3>
                      <p className="analytics-subtitle">Task volume by technical specialty</p>
                    </div>
                  </div>
                  <div className="category-progress-list">
                    {[
                      { name: 'Electrical Repairs', count: categoryCounts.Electrical, color: '#f59e0b', icon: '⚡' },
                      { name: 'Plumbing Repairs', count: categoryCounts.Plumbing, color: '#2563eb', icon: '🔧' },
                      { name: 'Water Supply', count: categoryCounts.Water, color: '#06b6d4', icon: '💧' },
                      { name: 'Mess & Food', count: categoryCounts.Food, color: '#eab308', icon: '🍲' },
                      { name: 'Internet / Wi-Fi', count: categoryCounts.Internet, color: '#6366f1', icon: '📶' },
                      { name: 'Cleaning & Sanitation', count: categoryCounts.Cleaning, color: '#10b981', icon: '🧹' },
                    ].map(cat => {
                      const percentage = Math.min(Math.round((cat.count / totalForDonut) * 100), 100);
                      return (
                        <div key={cat.name} className="category-progress-item">
                          <div className="category-row-label">
                            <span>{cat.icon} {cat.name}</span>
                            <span>{cat.count} Tasks ({percentage}%)</span>
                          </div>
                          <div className="category-progress-bg">
                            <div className="category-progress-fill" style={{ width: `${Math.max(percentage, 8)}%`, backgroundColor: cat.color }}></div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* MONTHLY PERFORMANCE AREA CHART */}
                <div className="analytics-card">
                  <div className="analytics-card-header">
                    <div>
                      <h3 className="analytics-title">📈 Monthly Performance Trend</h3>
                      <p className="analytics-subtitle">Volume of resolved maintenance reports (Jan - Jul)</p>
                    </div>
                  </div>
                  <div style={{ height: '200px', width: '100%', position: 'relative' }}>
                    <svg viewBox="0 0 500 180" style={{ width: '100%', height: '100%' }}>
                      <defs>
                        <linearGradient id="greenGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#10b981" stopOpacity="0.35" />
                          <stop offset="100%" stopColor="#10b981" stopOpacity="0.0" />
                        </linearGradient>
                      </defs>
                      <path d="M0,160 C100,120 200,90 300,40 C400,20 450,50 500,30 L500,180 L0,180 Z" fill="url(#greenGradient)" />
                      <path d="M0,160 C100,120 200,90 300,40 C400,20 450,50 500,30" fill="none" stroke="#10b981" strokeWidth="4" strokeLinecap="round" />
                    </svg>
                    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0 0.5rem', fontSize: '0.75rem', color: '#64748b', fontWeight: 700, marginTop: '0.5rem' }}>
                      <span>Jan</span><span>Feb</span><span>Mar</span><span>Apr</span><span>May</span><span>Jun</span><span>Jul</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* 4. ANALYTICS ROW 3 (WORKER SCORECARD + RECENT ACTIVITY FEED) */}
              <div className="analytics-grid-row">
                {/* WORKER PERFORMANCE CARD */}
                <div className="analytics-card" style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)', color: '#ffffff' }}>
                  <h3 className="analytics-title" style={{ color: '#ffffff', marginBottom: '1.25rem' }}>🏆 Worker Performance Scorecard</h3>
                  
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem' }}>
                    <div style={{ background: 'rgba(255, 255, 255, 0.08)', padding: '1.25rem', borderRadius: '14px', border: '1px solid rgba(255, 255, 255, 0.12)' }}>
                      <span style={{ fontSize: '0.72rem', color: '#94a3b8', fontWeight: 700, textTransform: 'uppercase' }}>Completion Rate</span>
                      <div style={{ fontSize: '1.8rem', fontWeight: 900, color: '#10b981', marginTop: '0.3rem' }}>95.8%</div>
                    </div>

                    <div style={{ background: 'rgba(255, 255, 255, 0.08)', padding: '1.25rem', borderRadius: '14px', border: '1px solid rgba(255, 255, 255, 0.12)' }}>
                      <span style={{ fontSize: '0.72rem', color: '#94a3b8', fontWeight: 700, textTransform: 'uppercase' }}>Avg Repair Time</span>
                      <div style={{ fontSize: '1.8rem', fontWeight: 900, color: '#3b82f6', marginTop: '0.3rem' }}>42 Mins</div>
                    </div>

                    <div style={{ background: 'rgba(255, 255, 255, 0.08)', padding: '1.25rem', borderRadius: '14px', border: '1px solid rgba(255, 255, 255, 0.12)' }}>
                      <span style={{ fontSize: '0.72rem', color: '#94a3b8', fontWeight: 700, textTransform: 'uppercase' }}>Active Tasks</span>
                      <div style={{ fontSize: '1.8rem', fontWeight: 900, color: '#f59e0b', marginTop: '0.3rem' }}>{activeUncompletedCount}</div>
                    </div>

                    <div style={{ background: 'rgba(255, 255, 255, 0.08)', padding: '1.25rem', borderRadius: '14px', border: '1px solid rgba(255, 255, 255, 0.12)' }}>
                      <span style={{ fontSize: '0.72rem', color: '#94a3b8', fontWeight: 700, textTransform: 'uppercase' }}>Tasks Done Today</span>
                      <div style={{ fontSize: '1.8rem', fontWeight: 900, color: '#34d399', marginTop: '0.3rem' }}>{completedTodayCount}</div>
                    </div>
                  </div>
                </div>

                {/* RECENT ACTIVITY FEED */}
                <div className="analytics-card">
                  <div className="analytics-card-header">
                    <div>
                      <h3 className="analytics-title">⚡ Recent Activity Log</h3>
                      <p className="analytics-subtitle">Last 5 duty updates</p>
                    </div>
                  </div>
                  
                  {recentActivities.length === 0 ? (
                    <div style={{ padding: '2rem 0', textAlign: 'center', color: '#64748b', fontSize: '0.86rem' }}>
                      No recent activities recorded yet.
                    </div>
                  ) : (
                    <div className="activity-feed-list">
                      {recentActivities.map((act) => (
                        <div key={act.id} className="activity-feed-item">
                          <div className="activity-icon-box" style={{ backgroundColor: `${act.color}15`, color: act.color }}>
                            {act.icon}
                          </div>
                          <div className="activity-content">
                            <h4 className="activity-title">{act.actionText}</h4>
                            <p className="activity-meta">Time: {act.dateStr}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </>
          )}

          {/* CONTROL FILTER BAR (FOR TASK ORDER TABS) */}
          {activeTab !== 'Dashboard' && activeTab !== 'My Profile & Duty' && (
            <div className="worker-filter-bar">
              <div className="worker-search-row">
                <div className="worker-search-input-wrapper">
                  <svg className="worker-search-icon" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  <input
                    type="text"
                    className="worker-search-input"
                    placeholder="Search by title, ticket ID, room, student..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                  {searchQuery && (
                    <button className="worker-clear-search" onClick={() => setSearchQuery('')}>×</button>
                  )}
                </div>

                <select className="worker-select-filter" value={priorityFilter} onChange={(e) => setPriorityFilter(e.target.value)}>
                  <option value="All">All Priorities</option>
                  <option value="High">🔴 High Priority</option>
                  <option value="Medium">🟠 Medium Priority</option>
                  <option value="Low">🟢 Low Priority</option>
                </select>

                <select className="worker-select-filter" value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)}>
                  <option value="All">All Categories</option>
                  <option value="Electrical">⚡ Electrical</option>
                  <option value="Plumbing">🔧 Plumbing</option>
                  <option value="Water Supply">💧 Water Supply</option>
                  <option value="Internet">📶 Internet</option>
                  <option value="Cleaning">🧹 Cleaning</option>
                  <option value="Others">⚙️ Others</option>
                </select>

                <select className="worker-select-filter" value={sortOrder} onChange={(e) => setSortOrder(e.target.value)}>
                  <option value="Newest">📅 Newest First</option>
                  <option value="Oldest">⏳ Oldest First</option>
                </select>
              </div>
            </div>
          )}

          {/* TAB 2: ASSIGNED TASK ORDERS */}
          {activeTab === 'Assigned Task Orders' && (
            loading ? (
              <div style={{ textAlign: 'center', padding: '4rem 0', color: '#64748b', fontWeight: 600 }}>
                Loading assigned task orders...
              </div>
            ) : displayedTabTasks.length === 0 ? (
              <div className="worker-empty-state">
                <svg className="worker-empty-icon" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
                <h3 className="worker-empty-title">No pending assigned task orders</h3>
                <p className="worker-empty-text">All pending maintenance orders assigned by Block Wardens have been handled!</p>
              </div>
            ) : (
              <div className="worker-tasks-grid">
                {displayedTabTasks.map(t => {
                  const c = t.complaint || {};
                  const priority = c.priority || 'Medium';
                  const priorityClass = priority === 'High' || priority === 'Emergency' ? 'priority-high' : priority === 'Low' ? 'priority-low' : 'priority-medium';
                  const statusClass = t.status === 'Assigned' ? 'assigned' : t.status === 'Accepted' ? 'accepted' : 'in-progress';

                  return (
                    <div key={t._id || t.taskId} className={`worker-task-card ${priorityClass}`}>
                      <div>
                        <div className="worker-card-header">
                          <div>
                            <h3 className="worker-card-title">{c.title || 'Hostel Repair Task'}</h3>
                            <div className="worker-chips-row">
                              <span className="worker-chip ticket-id">#ID: {t.taskId}</span>
                              <span className="worker-chip category">🔧 {c.category || t.workerCategory || 'General'}</span>
                              <span className={`worker-chip ${priorityClass}`}>
                                {priority === 'High' ? '🔴 High Priority' : priority === 'Low' ? '🟢 Low Priority' : '🟠 Medium Priority'}
                              </span>
                            </div>
                          </div>
                          <span className={`worker-status-badge ${statusClass}`}>● {t.status}</span>
                        </div>

                        <div className="worker-info-grid">
                          <div className="worker-info-box">
                            <div className="worker-info-icon-wrapper">📍</div>
                            <div>
                              <div className="worker-info-label">Room & Block</div>
                              <div className="worker-info-value">{c.location || `Block ${c.studentBlock || 'A'} - Room ${c.studentRoom || '101'}`}</div>
                            </div>
                          </div>

                          <div className="worker-info-box">
                            <div className="worker-info-icon-wrapper">👤</div>
                            <div>
                              <div className="worker-info-label">Resident Student</div>
                              <div className="worker-info-value">{c.studentName || 'Hostel Resident'}</div>
                            </div>
                          </div>

                          <div className="worker-info-box">
                            <div className="worker-info-icon-wrapper">📞</div>
                            <div>
                              <div className="worker-info-label">Contact Number</div>
                              <div className="worker-info-value">
                                <a href={`tel:${c.studentPhone || '9876543210'}`}>{c.studentPhone || '9876543210'}</a>
                              </div>
                            </div>
                          </div>

                          <div className="worker-info-box">
                            <div className="worker-info-icon-wrapper">📅</div>
                            <div>
                              <div className="worker-info-label">Assigned Date</div>
                              <div className="worker-info-value">{new Date(t.assignedDate).toLocaleDateString()}</div>
                            </div>
                          </div>
                        </div>

                        <div className="worker-desc-card">
                          <div className="worker-desc-title">📝 Issue Description</div>
                          <p className="worker-desc-text">{c.description || 'No detailed description provided.'}</p>
                        </div>
                      </div>

                      <div className="worker-actions-row">
                        {t.status === 'Assigned' && (
                          <>
                            <button className="worker-btn-primary" onClick={() => handleUpdateStatus(t.taskId, 'Accepted')}>
                              <span>✓</span><span>Accept Task Order</span>
                            </button>
                            <button className="worker-btn-danger" onClick={() => handleUpdateStatus(t.taskId, 'Rejected')}>
                              <span>✕</span><span>Reject Order</span>
                            </button>
                          </>
                        )}
                        {t.status === 'Accepted' && (
                          <button className="worker-btn-primary" onClick={() => handleUpdateStatus(t.taskId, 'In Progress')}>
                            <span>⚡</span><span>Start Repair (In Progress)</span>
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )
          )}

          {/* TAB 3: IN PROGRESS REPAIRS */}
          {activeTab === 'In Progress Repairs' && (
            loading ? (
              <div style={{ textAlign: 'center', padding: '4rem 0', color: '#64748b', fontWeight: 600 }}>
                Loading in-progress repairs...
              </div>
            ) : displayedTabTasks.length === 0 ? (
              <div className="worker-empty-state">
                <svg className="worker-empty-icon" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M14.7 6.3a1 1 0 000 1.4l1.6 1.6a1 1 0 001.4 0l3.77-3.77a6 6 0 01-7.94 7.94l-6.91 6.91a2.12 2.12 0 01-3-3l6.91-6.91a6 6 0 017.94-7.94l-3.76 3.76z" />
                </svg>
                <h3 className="worker-empty-title">No active repairs in progress</h3>
                <p className="worker-empty-text">Accept an assigned order to start active maintenance work!</p>
              </div>
            ) : (
              <div className="worker-tasks-grid">
                {displayedTabTasks.map(t => {
                  const c = t.complaint || {};
                  const priority = c.priority || 'Medium';
                  const priorityClass = priority === 'High' || priority === 'Emergency' ? 'priority-high' : priority === 'Low' ? 'priority-low' : 'priority-medium';

                  return (
                    <div key={t._id || t.taskId} className={`worker-task-card ${priorityClass}`}>
                      <div>
                        <div className="worker-card-header">
                          <div>
                            <h3 className="worker-card-title">{c.title || 'Hostel Repair Task'}</h3>
                            <div className="worker-chips-row">
                              <span className="worker-chip ticket-id">#ID: {t.taskId}</span>
                              <span className="worker-chip category">⚡ In Progress Repair</span>
                              <span className={`worker-chip ${priorityClass}`}>{priority} Priority</span>
                            </div>
                          </div>
                          <span className="worker-status-badge in-progress">● In Progress</span>
                        </div>

                        <div className="worker-info-grid">
                          <div className="worker-info-box">
                            <div className="worker-info-icon-wrapper">📍</div>
                            <div>
                              <div className="worker-info-label">Room & Block</div>
                              <div className="worker-info-value">{c.location || `Block ${c.studentBlock || 'A'} - Room ${c.studentRoom || '101'}`}</div>
                            </div>
                          </div>
                          <div className="worker-info-box">
                            <div className="worker-info-icon-wrapper">👤</div>
                            <div>
                              <div className="worker-info-label">Resident Student</div>
                              <div className="worker-info-value">{c.studentName || 'Hostel Resident'}</div>
                            </div>
                          </div>
                        </div>

                        <div className="worker-desc-card">
                          <div className="worker-desc-title">📝 Issue Description</div>
                          <p className="worker-desc-text">{c.description || 'No detailed description provided.'}</p>
                        </div>

                        {/* WORK PROGRESS TIMELINE */}
                        <div className="worker-timeline">
                          <div className="worker-timeline-step">
                            <div className="timeline-dot active">✓</div>
                            <span className="timeline-label active">Assigned</span>
                          </div>
                          <div className="worker-timeline-step">
                            <div className="timeline-dot active">✓</div>
                            <span className="timeline-label active">Accepted</span>
                          </div>
                          <div className="worker-timeline-step">
                            <div className="timeline-dot active">✓</div>
                            <span className="timeline-label active">Work Started</span>
                          </div>
                          <div className="worker-timeline-step">
                            <div className="timeline-dot">4</div>
                            <span className="timeline-label">Upload Proof</span>
                          </div>
                        </div>
                      </div>

                      <div className="worker-actions-row">
                        <button className="worker-btn-success" onClick={() => setSelectedTaskModal(t)}>
                          <span>📷</span><span>Upload Proof & Mark Completed</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )
          )}

          {/* TAB 4: COMPLETED REPORTS */}
          {activeTab === 'Completed Reports' && (
            loading ? (
              <div style={{ textAlign: 'center', padding: '4rem 0', color: '#64748b', fontWeight: 600 }}>
                Loading completed reports...
              </div>
            ) : displayedTabTasks.length === 0 ? (
              <div className="worker-empty-state">
                <svg className="worker-empty-icon" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <h3 className="worker-empty-title">No completed resolution reports yet</h3>
                <p className="worker-empty-text">Completed maintenance tasks will be archived here with proof photos and CSV export!</p>
              </div>
            ) : (
              <>
                <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '1rem' }}>
                  <button className="worker-btn-primary" onClick={() => handleExportCSV()}>
                    <span>📥</span><span>Export All Reports (CSV)</span>
                  </button>
                </div>

                <div className="worker-tasks-grid">
                  {displayedTabTasks.map(t => {
                    const c = t.complaint || {};
                    return (
                      <div key={t._id || t.taskId} className="worker-task-card priority-low">
                        <div>
                          <div className="worker-card-header">
                            <div>
                              <h3 className="worker-card-title">{c.title || 'Hostel Maintenance Repair'}</h3>
                              <div className="worker-chips-row">
                                <span className="worker-chip ticket-id">#ID: {t.taskId}</span>
                                <span className="worker-chip category">✅ Completed</span>
                              </div>
                            </div>
                            <span className="worker-status-badge completed">● Completed</span>
                          </div>

                          <div className="worker-info-grid">
                            <div className="worker-info-box">
                              <div className="worker-info-icon-wrapper">📍</div>
                              <div>
                                <div className="worker-info-label">Room & Block</div>
                                <div className="worker-info-value">{c.location || `Block ${c.studentBlock || 'A'} - Room ${c.studentRoom || '101'}`}</div>
                              </div>
                            </div>
                            <div className="worker-info-box">
                              <div className="worker-info-icon-wrapper">📅</div>
                              <div>
                                <div className="worker-info-label">Completion Date</div>
                                <div className="worker-info-value">{new Date(t.assignedDate).toLocaleDateString()}</div>
                              </div>
                            </div>
                          </div>

                          <div className="worker-resolution-card">
                            <div className="worker-resolution-title">✅ Resolution Report & Uploaded Proof</div>
                            <div className="worker-resolution-notes">"{t.completionNotes || 'Repair executed and verified on site.'}"</div>
                            {t.proofImage && (
                              <div>
                                <img src={t.proofImage} alt="Resolution Proof" className="worker-proof-img" onClick={() => setZoomImage(t.proofImage)} />
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="worker-actions-row">
                          <button className="worker-btn-primary" onClick={() => handleExportCSV(t)}>
                            <span>📄</span><span>Download Report CSV</span>
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </>
            )
          )}

          {/* TAB 5: MY PROFILE & DUTY */}
          {activeTab === 'My Profile & Duty' && (
            <div style={{ backgroundColor: '#ffffff', borderRadius: '20px', padding: '2rem', border: '1px solid #e2e8f0', boxShadow: '0 4px 12px rgba(0,0,0,0.02)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', paddingBottom: '1.75rem', borderBottom: '1px solid #e2e8f0', marginBottom: '1.75rem' }}>
                <div style={{ width: '72px', height: '72px', borderRadius: '50%', background: 'linear-gradient(135deg, #0f4fa8 0%, #2563eb 100%)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.8rem', fontWeight: 800, border: '3px solid #bfdbfe' }}>
                  {avatarInitials}
                </div>
                <div>
                  <h2 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 800, color: '#0f172a' }}>{workerName}</h2>
                  <p style={{ margin: '4px 0 0', color: '#2563eb', fontWeight: 700, fontSize: '0.95rem' }}>{workerCategory} Technician</p>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', marginTop: '0.5rem', fontSize: '0.78rem', fontWeight: 800, color: '#10b981', backgroundColor: '#ecfdf5', padding: '0.25rem 0.75rem', borderRadius: '12px', border: '1px solid #a7f3d0' }}>
                    ● ACTIVE ON DUTY
                  </span>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.5rem' }}>
                <div style={{ backgroundColor: '#f8fafc', padding: '1.25rem', borderRadius: '14px', border: '1px solid #e2e8f0' }}>
                  <span style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 700, textTransform: 'uppercase' }}>OFFICIAL WORKER EMAIL</span>
                  <div style={{ fontSize: '1rem', fontWeight: 800, color: '#0f172a', marginTop: '0.25rem' }}>{user?.email || 'workers@campuscare.com'}</div>
                </div>

                <div style={{ backgroundColor: '#f8fafc', padding: '1.25rem', borderRadius: '14px', border: '1px solid #e2e8f0' }}>
                  <span style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 700, textTransform: 'uppercase' }}>CONTACT PHONE NUMBER</span>
                  <div style={{ fontSize: '1rem', fontWeight: 800, color: '#0f172a', marginTop: '0.25rem' }}>{user?.phone || '9876543210'}</div>
                </div>

                <div style={{ backgroundColor: '#f8fafc', padding: '1.25rem', borderRadius: '14px', border: '1px solid #e2e8f0' }}>
                  <span style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 700, textTransform: 'uppercase' }}>ASSIGNED MAINTENANCE STATION</span>
                  <div style={{ fontSize: '1rem', fontWeight: 800, color: '#0f172a', marginTop: '0.25rem' }}>Campus Central Maintenance Yard</div>
                </div>

                <div style={{ backgroundColor: '#f8fafc', padding: '1.25rem', borderRadius: '14px', border: '1px solid #e2e8f0' }}>
                  <span style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 700, textTransform: 'uppercase' }}>COMPLETED REPAIR ORDERS</span>
                  <div style={{ fontSize: '1rem', fontWeight: 800, color: '#059669', marginTop: '0.25rem' }}>{completedCount} Tasks Resolved</div>
                </div>
              </div>
            </div>
          )}

        </main>
      </div>

      {/* 3. UPLOAD PROOF & COMPLETE TASK MODAL */}
      {selectedTaskModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(15, 23, 42, 0.45)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999 }}>
          <div style={{ maxWidth: '560px', width: '92%', backgroundColor: '#ffffff', borderRadius: '20px', overflow: 'hidden', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)', border: '1px solid #e2e8f0' }}>
            <div style={{ background: 'linear-gradient(135deg, #0f4fa8 0%, #2563eb 100%)', padding: '1.25rem 1.75rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: '#ffffff' }}>
              <div>
                <span style={{ fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.1em', color: '#93c5fd', fontWeight: 700 }}>Task Resolution Report</span>
                <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 850 }}>Submit Repair Completion</h3>
              </div>
              <button 
                onClick={() => setSelectedTaskModal(null)} 
                style={{ background: 'rgba(255,255,255,0.15)', border: 'none', color: '#fff', width: '32px', height: '32px', borderRadius: '50%', cursor: 'pointer', fontSize: '1.2rem', fontWeight: 700 }}
              >
                ×
              </button>
            </div>

            <form 
              onSubmit={(e) => {
                e.preventDefault();
                handleUpdateStatus(selectedTaskModal.taskId, 'Completed', { completionNotes, proofImage });
              }} 
              style={{ padding: '1.75rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}
            >
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#0f172a', marginBottom: '0.35rem' }}>
                  Resolution Summary & Action Report *
                </label>
                <textarea
                  required
                  rows={3}
                  placeholder="Explain repair actions completed (e.g. Fixed circuit breaker, replaced faucet...)"
                  value={completionNotes}
                  onChange={(e) => setCompletionNotes(e.target.value)}
                  style={{ width: '100%', padding: '0.85rem', borderRadius: '12px', border: '1px solid #cbd5e1', fontSize: '0.88rem', outline: 'none', backgroundColor: '#fafafa', boxSizing: 'border-box', fontFamily: 'inherit' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#0f172a', marginBottom: '0.35rem' }}>
                  Upload Photo / Video Proof of Completion
                </label>
                
                <label className="worker-dropzone">
                  <input
                    type="file"
                    accept="image/*,video/*"
                    onChange={handleImageUpload}
                    style={{ display: 'none' }}
                  />
                  <div className="worker-dropzone-icon">📷</div>
                  <div className="worker-dropzone-text">Click or drag image file to upload</div>
                  <div className="worker-dropzone-sub">Supports JPEG, PNG, WEBP proof images</div>
                </label>

                {proofImage && (
                  <div style={{ marginTop: '0.85rem', position: 'relative', display: 'inline-block' }}>
                    <img src={proofImage} alt="Uploaded Proof Preview" style={{ maxHeight: '140px', borderRadius: '10px', border: '1px solid #cbd5e1', boxShadow: '0 4px 8px rgba(0,0,0,0.05)' }} />
                    <button
                      type="button"
                      onClick={() => setProofImage('')}
                      style={{ position: 'absolute', top: '-8px', right: '-8px', backgroundColor: '#ef4444', color: '#fff', border: 'none', borderRadius: '50%', width: '22px', height: '22px', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 800 }}
                    >
                      ×
                    </button>
                  </div>
                )}
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.85rem', paddingTop: '0.5rem', borderTop: '1px solid #f1f5f9' }}>
                <button
                  type="button"
                  onClick={() => setSelectedTaskModal(null)}
                  style={{ padding: '0.75rem 1.25rem', borderRadius: '10px', border: '1px solid #cbd5e1', backgroundColor: '#ffffff', color: '#475569', fontWeight: 700, fontSize: '0.88rem', cursor: 'pointer' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="worker-btn-success"
                >
                  {actionLoading ? 'Submitting Report...' : 'Submit Completion Report'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 4. ZOOM IMAGE PREVIEW MODAL */}
      {zoomImage && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(15, 23, 42, 0.75)', backdropFilter: 'blur(6px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 10000, cursor: 'zoom-out' }} onClick={() => setZoomImage(null)}>
          <div style={{ position: 'relative', maxWidth: '90%', maxHeight: '90%' }} onClick={e => e.stopPropagation()}>
            <img src={zoomImage} alt="Zoomed Resolution Proof" style={{ maxWidth: '100%', maxHeight: '85vh', borderRadius: '12px', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)' }} />
            <button 
              onClick={() => setZoomImage(null)} 
              style={{ position: 'absolute', top: '-15px', right: '-15px', backgroundColor: '#0f172a', color: '#fff', border: '2px solid #fff', borderRadius: '50%', width: '34px', height: '34px', cursor: 'pointer', fontSize: '1.3rem', fontWeight: 'bold', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            >
              ×
            </button>
          </div>
        </div>
      )}

    </div>
  );
};

export default WorkerDashboard;
