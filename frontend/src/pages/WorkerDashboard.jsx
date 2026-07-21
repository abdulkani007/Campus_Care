import React, { useState, useEffect } from 'react';
import logo from '../assets/CC.png';
import '../styles/WorkerDashboard.css';

const WorkerDashboard = ({ user, onLogout }) => {
  const [tasks, setTasks] = useState([]);
  const [activeTab, setActiveTab] = useState('Overview'); // Overview, Assigned Tasks, In Progress, Completed Tasks, My Profile
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

  // Filter tasks based on search, priority, category, and tab status
  const filteredTasks = tasks.filter(t => {
    const c = t.complaint || {};
    const query = searchQuery.toLowerCase();
    const matchesSearch = 
      (c.title || '').toLowerCase().includes(query) ||
      (c.location || '').toLowerCase().includes(query) ||
      (c.studentName || '').toLowerCase().includes(query) ||
      (t.taskId || '').toLowerCase().includes(query);

    if (!matchesSearch) return false;

    // Category Filter
    if (categoryFilter !== 'All' && (c.category || t.workerCategory) !== categoryFilter) {
      return false;
    }

    // Priority Filter
    if (priorityFilter !== 'All' && (c.priority || 'Medium') !== priorityFilter) {
      return false;
    }

    if (activeTab === 'In Progress') return t.status === 'Accepted' || t.status === 'In Progress';
    if (activeTab === 'Completed Tasks') return t.status === 'Completed' || t.status === 'Verified' || t.status === 'Closed';

    if (statusFilter === 'Assigned') return t.status === 'Assigned';
    if (statusFilter === 'Accepted') return t.status === 'Accepted';
    if (statusFilter === 'In Progress') return t.status === 'In Progress';
    if (statusFilter === 'Completed') return t.status === 'Completed' || t.status === 'Verified' || t.status === 'Closed';
    if (statusFilter === 'Rejected') return t.status === 'Rejected';

    return true;
  }).sort((a, b) => {
    const dateA = new Date(a.assignedDate || 0);
    const dateB = new Date(b.assignedDate || 0);
    if (sortOrder === 'Oldest') return dateA - dateB;
    return dateB - dateA;
  });

  const totalAssigned = tasks.length;
  const pendingCount = tasks.filter(t => t.status === 'Assigned').length;
  const acceptedCount = tasks.filter(t => t.status === 'Accepted').length;
  const inProgressCount = tasks.filter(t => t.status === 'Accepted' || t.status === 'In Progress').length;
  const completedCount = tasks.filter(t => t.status === 'Completed' || t.status === 'Verified' || t.status === 'Closed').length;
  const completedTodayCount = tasks.filter(t => {
    const isDone = t.status === 'Completed' || t.status === 'Verified' || t.status === 'Closed';
    const isToday = new Date(t.assignedDate).toDateString() === new Date().toDateString();
    return isDone && isToday;
  }).length;

  const workerName = user?.name || 'Ramesh Kumar';
  const workerCategory = user?.category || user?.role || 'Electrician';
  const avatarInitials = workerName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);

  return (
    <div className="worker-dashboard-layout">
      {/* 1. ENTERPRISE HEADER NAVBAR */}
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
          <span className="worker-brand-badge">Worker Ops</span>
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
              <div style={{ padding: '0.6rem 1rem', fontSize: '0.84rem', color: '#334155', fontWeight: 600, cursor: 'pointer' }} onClick={() => { setActiveTab('My Profile'); setShowProfileMenu(false); }}>
                👤 My Profile & Skills
              </div>
              <div style={{ padding: '0.6rem 1rem', fontSize: '0.84rem', color: '#334155', fontWeight: 600, cursor: 'pointer' }} onClick={() => { setActiveTab('Assigned Tasks'); setShowProfileMenu(false); }}>
                📋 Assigned Orders ({totalAssigned})
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
              <button className={`worker-sidebar-btn ${activeTab === 'Overview' ? 'active' : ''}`} onClick={() => setActiveTab('Overview')}>
                <div className="worker-menu-item-left">
                  <span>📊</span>
                  <span>Dashboard Overview</span>
                </div>
              </button>
            </li>
            <li>
              <button className={`worker-sidebar-btn ${activeTab === 'Assigned Tasks' ? 'active' : ''}`} onClick={() => setActiveTab('Assigned Tasks')}>
                <div className="worker-menu-item-left">
                  <span>📋</span>
                  <span>Assigned Task Orders</span>
                </div>
                {pendingCount > 0 && <span className="worker-badge-pill yellow">{pendingCount}</span>}
              </button>
            </li>
            <li>
              <button className={`worker-sidebar-btn ${activeTab === 'In Progress' ? 'active' : ''}`} onClick={() => setActiveTab('In Progress')}>
                <div className="worker-menu-item-left">
                  <span>⚡</span>
                  <span>In Progress Repairs</span>
                </div>
                {inProgressCount > 0 && <span className="worker-badge-pill blue">{inProgressCount}</span>}
              </button>
            </li>
            <li>
              <button className={`worker-sidebar-btn ${activeTab === 'Completed Tasks' ? 'active' : ''}`} onClick={() => setActiveTab('Completed Tasks')}>
                <div className="worker-menu-item-left">
                  <span>✅</span>
                  <span>Completed Reports</span>
                </div>
              </button>
            </li>
            <li>
              <button className={`worker-sidebar-btn ${activeTab === 'My Profile' ? 'active' : ''}`} onClick={() => setActiveTab('My Profile')}>
                <div className="worker-menu-item-left">
                  <span>👤</span>
                  <span>My Profile & Duty</span>
                </div>
              </button>
            </li>
          </ul>

          <div style={{ backgroundColor: 'rgba(255, 255, 255, 0.05)', padding: '1rem', borderRadius: '12px', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
            <span style={{ fontSize: '0.72rem', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 700 }}>Maintenance Station</span>
            <p style={{ margin: '4px 0 0', fontSize: '0.85rem', fontWeight: 800, color: '#ffffff' }}>Central Yard Hub</p>
          </div>
        </aside>

        {/* Main Content Area */}
        <main className="worker-main-content">
          
          {/* WELCOME HERO BANNER */}
          <div className="worker-hero-banner">
            <div>
              <h2 className="worker-hero-title">Welcome back, {workerName}! 👋</h2>
              <p className="worker-hero-sub">Enterprise Maintenance & Repair Orders Console • Category: <strong>{workerCategory}</strong></p>
            </div>
            <div className="worker-status-badge-live">
              <span className="status-dot-pulse"></span>
              <span>LIVE ON DUTY</span>
            </div>
          </div>

          {/* KPI STATS CARDS */}
          <div className="worker-kpi-grid">
            <div className="worker-kpi-card">
              <span className="worker-kpi-label">Assigned Orders</span>
              <div className="worker-kpi-flex">
                <span className="worker-kpi-number" style={{ color: '#0f172a' }}>{totalAssigned}</span>
                <div className="worker-kpi-icon-box" style={{ backgroundColor: '#eff6ff', color: '#2563eb' }}>📋</div>
              </div>
            </div>

            <div className="worker-kpi-card">
              <span className="worker-kpi-label">Assigned / Pending</span>
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
              <span className="worker-kpi-label">Total Resolved</span>
              <div className="worker-kpi-flex">
                <span className="worker-kpi-number" style={{ color: '#059669' }}>{completedCount}</span>
                <div className="worker-kpi-icon-box" style={{ backgroundColor: '#d1fae5', color: '#059669' }}>🏆</div>
              </div>
            </div>

            <div className="worker-kpi-card">
              <span className="worker-kpi-label">Avg Resolution Time</span>
              <div className="worker-kpi-flex">
                <span className="worker-kpi-number" style={{ color: '#6366f1' }}>45 <span style={{ fontSize: '1rem', fontWeight: 600 }}>Mins</span></span>
                <div className="worker-kpi-icon-box" style={{ backgroundColor: '#e0e7ff', color: '#6366f1' }}>⏱️</div>
              </div>
            </div>
          </div>

          {/* CONTROL FILTER & SEARCH BAR */}
          {activeTab !== 'My Profile' && (
            <div className="worker-filter-bar">
              <div className="worker-search-row">
                <div className="worker-search-input-wrapper">
                  <svg className="worker-search-icon" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  <input
                    type="text"
                    className="worker-search-input"
                    placeholder="Search by complaint title, ticket ID, room, student name..."
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

              {/* Status Filter Pills */}
              <div className="worker-status-pills">
                {['All', 'Assigned', 'Accepted', 'In Progress', 'Completed', 'Rejected'].map(status => (
                  <button
                    key={status}
                    className={`worker-pill-btn ${statusFilter === status ? 'active' : ''}`}
                    onClick={() => setStatusFilter(status)}
                  >
                    <span>{status}</span>
                    <span style={{ opacity: 0.85, fontSize: '0.72rem' }}>
                      ({
                        status === 'All' ? tasks.length :
                        status === 'Assigned' ? pendingCount :
                        status === 'Accepted' ? acceptedCount :
                        status === 'In Progress' ? inProgressCount :
                        status === 'Completed' ? completedCount :
                        tasks.filter(t => t.status === status).length
                      })
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* MAIN TASKS CARDS GRID */}
          {activeTab !== 'My Profile' && (
            loading ? (
              <div style={{ textAlign: 'center', padding: '4rem 0', color: '#64748b', fontWeight: 600 }}>
                Loading maintenance tasks...
              </div>
            ) : filteredTasks.length === 0 ? (
              /* EMPTY STATE */
              <div className="worker-empty-state">
                <svg className="worker-empty-icon" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                </svg>
                <h3 className="worker-empty-title">No maintenance tasks assigned</h3>
                <p className="worker-empty-text">There are currently no task orders matching your search or filters.</p>
              </div>
            ) : (
              <div className="worker-tasks-grid">
                {filteredTasks.map(t => {
                  const c = t.complaint || {};
                  const priority = c.priority || 'Medium';
                  const priorityClass = 
                    priority === 'High' || priority === 'Emergency' ? 'priority-high' :
                    priority === 'Low' ? 'priority-low' : 'priority-medium';

                  const statusClass = 
                    t.status === 'Assigned' ? 'assigned' :
                    t.status === 'Accepted' ? 'accepted' :
                    t.status === 'In Progress' ? 'in-progress' :
                    t.status === 'Rejected' ? 'rejected' : 'completed';

                  return (
                    <div key={t._id || t.taskId} className={`worker-task-card ${priorityClass}`}>
                      
                      {/* CARD HEADER */}
                      <div>
                        <div className="worker-card-header">
                          <div>
                            <h3 className="worker-card-title">{c.title || 'Hostel Maintenance Repair'}</h3>
                            <div className="worker-chips-row">
                              <span className="worker-chip ticket-id">#ID: {t.taskId}</span>
                              <span className="worker-chip category">🔧 {c.category || t.workerCategory || 'General'}</span>
                              <span className={`worker-chip ${priorityClass}`}>
                                {priority === 'High' ? '🔴 High Priority' : priority === 'Low' ? '🟢 Low Priority' : '🟠 Medium Priority'}
                              </span>
                            </div>
                          </div>

                          {/* STATUS PILL BADGE */}
                          <span className={`worker-status-badge ${statusClass}`}>
                            ● {t.status}
                          </span>
                        </div>

                        {/* INFORMATION GRID (2x2) */}
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

                        {/* DEDICATED DESCRIPTION CARD */}
                        <div className="worker-desc-card">
                          <div className="worker-desc-title">📝 Issue Description</div>
                          <p className="worker-desc-text">{c.description || 'No detailed description provided.'}</p>
                        </div>

                        {/* TASK PROGRESS TIMELINE */}
                        <div className="worker-timeline">
                          <div className="worker-timeline-step">
                            <div className="timeline-dot active">✓</div>
                            <span className="timeline-label active">Assigned</span>
                          </div>
                          <div className="worker-timeline-step">
                            <div className={`timeline-dot ${t.status === 'Accepted' || t.status === 'In Progress' || t.status === 'Completed' || t.status === 'Closed' ? 'active' : ''}`}>
                              {t.status === 'Accepted' || t.status === 'In Progress' || t.status === 'Completed' || t.status === 'Closed' ? '✓' : '2'}
                            </div>
                            <span className={`timeline-label ${t.status === 'Accepted' || t.status === 'In Progress' || t.status === 'Completed' || t.status === 'Closed' ? 'active' : ''}`}>Accepted</span>
                          </div>
                          <div className="worker-timeline-step">
                            <div className={`timeline-dot ${t.status === 'In Progress' || t.status === 'Completed' || t.status === 'Closed' ? 'active' : ''}`}>
                              {t.status === 'In Progress' || t.status === 'Completed' || t.status === 'Closed' ? '✓' : '3'}
                            </div>
                            <span className={`timeline-label ${t.status === 'In Progress' || t.status === 'Completed' || t.status === 'Closed' ? 'active' : ''}`}>In Progress</span>
                          </div>
                          <div className="worker-timeline-step">
                            <div className={`timeline-dot ${t.status === 'Completed' || t.status === 'Closed' || t.status === 'Verified' ? 'active' : ''}`}>
                              {t.status === 'Completed' || t.status === 'Closed' || t.status === 'Verified' ? '✓' : '4'}
                            </div>
                            <span className={`timeline-label ${t.status === 'Completed' || t.status === 'Closed' || t.status === 'Verified' ? 'active' : ''}`}>Report Submitted</span>
                          </div>
                        </div>

                        {/* WORKER COMPLETION REPORT IF PREVIOUSLY SUBMITTED */}
                        {t.completionNotes && (
                          <div className="worker-resolution-card">
                            <div className="worker-resolution-title">✅ Worker Resolution Report & Proof</div>
                            <div className="worker-resolution-notes">"{t.completionNotes}"</div>
                            {t.proofImage && (
                              <div>
                                <img
                                  src={t.proofImage}
                                  alt="Resolution Proof"
                                  className="worker-proof-img"
                                  onClick={() => setZoomImage(t.proofImage)}
                                />
                              </div>
                            )}
                          </div>
                        )}
                      </div>

                      {/* ACTION SECTION BUTTONS */}
                      <div className="worker-actions-row">
                        {t.status === 'Assigned' && (
                          <>
                            <button
                              className="worker-btn-primary"
                              onClick={() => handleUpdateStatus(t.taskId, 'Accepted')}
                            >
                              <span>✓</span>
                              <span>Accept Task Order</span>
                            </button>
                            <button
                              className="worker-btn-danger"
                              onClick={() => handleUpdateStatus(t.taskId, 'Rejected')}
                            >
                              <span>✕</span>
                              <span>Reject Order</span>
                            </button>
                          </>
                        )}

                        {t.status === 'Accepted' && (
                          <button
                            className="worker-btn-primary"
                            onClick={() => handleUpdateStatus(t.taskId, 'In Progress')}
                          >
                            <span>⚡</span>
                            <span>Start Repair (In Progress)</span>
                          </button>
                        )}

                        {t.status === 'In Progress' && (
                          <button
                            className="worker-btn-success"
                            onClick={() => setSelectedTaskModal(t)}
                          >
                            <span>📷</span>
                            <span>Upload Proof & Mark Completed</span>
                          </button>
                        )}

                        {(t.status === 'Completed' || t.status === 'Verified' || t.status === 'Closed') && (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#15803d', fontWeight: 800, fontSize: '0.88rem' }}>
                            <span>✅</span>
                            <span>Task Completed & Report Submitted</span>
                          </div>
                        )}
                      </div>

                    </div>
                  );
                })}
              </div>
            )
          )}

          {/* MY PROFILE TAB */}
          {activeTab === 'My Profile' && (
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
