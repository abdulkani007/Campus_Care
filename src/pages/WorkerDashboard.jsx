import React, { useState, useEffect } from 'react';
import logo from '../assets/CC.png';
import '../styles/WardenDashboard.css';

const WorkerDashboard = ({ user, onLogout }) => {
  const [tasks, setTasks] = useState([]);
  const [activeTab, setActiveTab] = useState('Overview'); // Overview, Assigned Tasks, In Progress, Completed Tasks, My Profile
  const [statusFilter, setStatusFilter] = useState('All');
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
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProofImage(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  // Filter tasks based on search and tab status
  const filteredTasks = tasks.filter(t => {
    const c = t.complaint || {};
    const query = searchQuery.toLowerCase();
    const matchesSearch = 
      (c.title || '').toLowerCase().includes(query) ||
      (c.location || '').toLowerCase().includes(query) ||
      (c.studentName || '').toLowerCase().includes(query) ||
      (t.taskId || '').toLowerCase().includes(query);

    if (!matchesSearch) return false;

    if (activeTab === 'In Progress') return t.status === 'Accepted' || t.status === 'In Progress';
    if (activeTab === 'Completed Tasks') return t.status === 'Completed' || t.status === 'Verified' || t.status === 'Closed';

    if (statusFilter === 'Pending') return t.status === 'Assigned';
    if (statusFilter === 'In Progress') return t.status === 'Accepted' || t.status === 'In Progress';
    if (statusFilter === 'Completed') return t.status === 'Completed' || t.status === 'Verified' || t.status === 'Closed';

    return true;
  });

  const totalAssigned = tasks.length;
  const pendingCount = tasks.filter(t => t.status === 'Assigned').length;
  const inProgressCount = tasks.filter(t => t.status === 'Accepted' || t.status === 'In Progress').length;
  const completedCount = tasks.filter(t => t.status === 'Completed' || t.status === 'Verified' || t.status === 'Closed').length;

  const workerName = user?.name || 'Ramesh Kumar';
  const workerCategory = user?.category || user?.role || 'Electrician';
  const avatarInitials = workerName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);

  return (
    <div className="dashboard-container">
      {/* 1. TOP HEADER BANNER */}
      <header className="dashboard-header">
        <div className="header-left">
          <svg 
            width="24" 
            height="24" 
            fill="none" 
            stroke="#64748b" 
            strokeWidth="2" 
            viewBox="0 0 24 24" 
            style={{ cursor: 'pointer', marginRight: '0.85rem' }}
            onClick={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}
            className="hamburger-icon-svg"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
          </svg>
          <div className="brand-logo-container">
            <img src={logo} alt="CampusCare Logo" className="brand-logo-img" />
            <span className="brand-name">CampusCare</span>
          </div>
        </div>

        {/* Search bar */}
        <div className="header-search">
          <svg className="search-icon" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            placeholder="Search assigned tasks, rooms, student names..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {/* Header Right Actions */}
        <div className="header-right">
          {/* Refresh Tasks Button */}
          <div className="icon-badge-btn" onClick={fetchTasks} title="Refresh Task Orders">
            <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            {pendingCount > 0 && <span className="badge-count bg-red">{pendingCount}</span>}
          </div>

          {/* User Profile Menu Trigger */}
          <div
            className="user-profile-menu-trigger"
            onClick={() => setShowProfileMenu(!showProfileMenu)}
          >
            <div className="user-avatar-circle" style={{ backgroundColor: '#2563eb', color: '#ffffff', fontWeight: 800 }}>
              {avatarInitials}
            </div>
            <div className="user-details-text">
              <span className="user-name">{workerName}</span>
              <span className="user-role">Worker / {workerCategory}</span>
            </div>
            <svg className={`chevron-icon ${showProfileMenu ? 'rotated' : ''}`} width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
            </svg>

            {showProfileMenu && (
              <div className="profile-dropdown-menu">
                <div className="dropdown-profile-header">
                  <p className="profile-email">{user?.email || 'workers@campuscare.com'}</p>
                  <p className="profile-roll">Duty: Active On Duty</p>
                </div>
                <div className="dropdown-link" onClick={() => { setActiveTab('My Profile'); setShowProfileMenu(false); }}>
                  My Profile & Skills
                </div>
                <div className="dropdown-link" onClick={() => { setActiveTab('Assigned Tasks'); setShowProfileMenu(false); }}>
                  Assigned Orders ({totalAssigned})
                </div>
                <hr style={{ border: '0', borderBottom: '1px solid #f1f5f9', margin: '5px 0' }} />
                <div className="dropdown-link logout-btn" onClick={onLogout}>
                  <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24" style={{ marginRight: '8px' }}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                  Log Out
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* MOBILE BACKDROP OVERLAY */}
      {isMobileSidebarOpen && (
        <div 
          className="mobile-sidebar-backdrop" 
          onClick={() => setIsMobileSidebarOpen(false)}
        />
      )}

      {/* 2. DASHBOARD BODY WITH SIDEBAR */}
      <div className="dashboard-body">
        {/* Sidebar Aside Navigation */}
        <aside className={`sidebar-aside ${isMobileSidebarOpen ? 'open-mobile' : ''}`}>
          <ul className="sidebar-menu">
            <li>
              <button
                className={`menu-btn ${activeTab === 'Overview' ? 'active' : ''}`}
                onClick={() => { setActiveTab('Overview'); setIsMobileSidebarOpen(false); }}
              >
                <span className="menu-icon">
                  <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                  </svg>
                </span>
                Overview
              </button>
            </li>

            <li>
              <button
                className={`menu-btn ${activeTab === 'Assigned Tasks' ? 'active' : ''}`}
                onClick={() => { setActiveTab('Assigned Tasks'); setIsMobileSidebarOpen(false); }}
              >
                <span className="menu-icon">
                  <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                </span>
                Assigned Tasks
                {totalAssigned > 0 && <span className="menu-badge">{totalAssigned}</span>}
              </button>
            </li>

            <li>
              <button
                className={`menu-btn ${activeTab === 'In Progress' ? 'active' : ''}`}
                onClick={() => { setActiveTab('In Progress'); setIsMobileSidebarOpen(false); }}
              >
                <span className="menu-icon">
                  <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M14.7 6.3a1 1 0 000 1.4l1.6 1.6a1 1 0 001.4 0l3.77-3.77a6 6 0 01-7.94 7.94l-6.91 6.91a2.12 2.12 0 01-3-3l6.91-6.91a6 6 0 017.94-7.94l-3.76 3.76z" />
                  </svg>
                </span>
                In Progress
                {inProgressCount > 0 && <span className="menu-badge bg-blue">{inProgressCount}</span>}
              </button>
            </li>

            <li>
              <button
                className={`menu-btn ${activeTab === 'Completed Tasks' ? 'active' : ''}`}
                onClick={() => { setActiveTab('Completed Tasks'); setIsMobileSidebarOpen(false); }}
              >
                <span className="menu-icon">
                  <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </span>
                Completed Tasks
              </button>
            </li>

            <li>
              <button
                className={`menu-btn ${activeTab === 'My Profile' ? 'active' : ''}`}
                onClick={() => { setActiveTab('My Profile'); setIsMobileSidebarOpen(false); }}
              >
                <span className="menu-icon">
                  <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </span>
                My Profile
              </button>
            </li>
          </ul>
        </aside>

        {/* Main Workspace Content Area */}
        <main className="main-content">
          {/* TAB 1: OVERVIEW */}
          {activeTab === 'Overview' && (
            <>
              {/* WELCOME BANNER CARD */}
              <div className="welcome-banner" style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)', borderRadius: '16px', padding: '1.75rem 2rem', color: '#fff', marginBottom: '1.5rem' }}>
                <div className="worker-welcome-banner-flex">
                  <div>
                    <h2 style={{ margin: '0 0 0.5rem 0', fontSize: '1.6rem', fontWeight: 800 }}>
                      Welcome back, {workerName}!
                    </h2>
                    <p style={{ margin: 0, color: '#94a3b8', fontSize: '0.9rem' }}>
                      CampusCare Maintenance Order Console • Active Skill: <strong>{workerCategory}</strong>
                    </p>
                  </div>
                  <div style={{ backgroundColor: 'rgba(255, 255, 255, 0.1)', padding: '0.65rem 1.25rem', borderRadius: '12px', border: '1px solid rgba(255, 255, 255, 0.15)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#10b981', boxShadow: '0 0 8px #10b981' }}></span>
                    <span style={{ fontSize: '0.8rem', fontWeight: 800, color: '#10b981' }}>LIVE ON DUTY</span>
                  </div>
                </div>
              </div>

              {/* KPI STATS GRID */}
              <div className="dashboard-kpi-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.25rem', marginBottom: '1.75rem' }}>
                <div className="kpi-card" style={{ backgroundColor: '#fff', padding: '1.25rem', borderRadius: '14px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.03)' }}>
                  <span className="kpi-title" style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 700, textTransform: 'uppercase' }}>Total Assigned Orders</span>
                  <div className="kpi-val-row" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.5rem' }}>
                    <span style={{ fontSize: '2rem', fontWeight: 800, color: '#0f172a' }}>{totalAssigned}</span>
                    <div style={{ width: '40px', height: '40px', borderRadius: '10px', backgroundColor: '#eff6ff', color: '#2563eb', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                      </svg>
                    </div>
                  </div>
                </div>

                <div className="kpi-card" style={{ backgroundColor: '#fff', padding: '1.25rem', borderRadius: '14px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.03)' }}>
                  <span className="kpi-title" style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 700, textTransform: 'uppercase' }}>New Pending Orders</span>
                  <div className="kpi-val-row" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.5rem' }}>
                    <span style={{ fontSize: '2rem', fontWeight: 800, color: '#d97706' }}>{pendingCount}</span>
                    <div style={{ width: '40px', height: '40px', borderRadius: '10px', backgroundColor: '#fef3c7', color: '#d97706', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                  </div>
                </div>

                <div className="kpi-card" style={{ backgroundColor: '#fff', padding: '1.25rem', borderRadius: '14px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.03)' }}>
                  <span className="kpi-title" style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 700, textTransform: 'uppercase' }}>Repairs In Progress</span>
                  <div className="kpi-val-row" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.5rem' }}>
                    <span style={{ fontSize: '2rem', fontWeight: 800, color: '#2563eb' }}>{inProgressCount}</span>
                    <div style={{ width: '40px', height: '40px', borderRadius: '10px', backgroundColor: '#dbeafe', color: '#2563eb', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M14.7 6.3a1 1 0 000 1.4l1.6 1.6a1 1 0 001.4 0l3.77-3.77a6 6 0 01-7.94 7.94l-6.91 6.91a2.12 2.12 0 01-3-3l6.91-6.91a6 6 0 017.94-7.94l-3.76 3.76z" />
                      </svg>
                    </div>
                  </div>
                </div>

                <div className="kpi-card" style={{ backgroundColor: '#fff', padding: '1.25rem', borderRadius: '14px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.03)' }}>
                  <span className="kpi-title" style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 700, textTransform: 'uppercase' }}>Completed Orders</span>
                  <div className="kpi-val-row" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.5rem' }}>
                    <span style={{ fontSize: '2rem', fontWeight: 800, color: '#059669' }}>{completedCount}</span>
                    <div style={{ width: '40px', height: '40px', borderRadius: '10px', backgroundColor: '#d1fae5', color: '#059669', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}

          {/* STATUS FILTER ROW (FOR ASSIGNED TASKS TAB) */}
          {activeTab === 'Assigned Tasks' && (
            <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.25rem', flexWrap: 'wrap' }}>
              {['All', 'Pending', 'In Progress', 'Completed'].map(f => (
                <button
                  key={f}
                  onClick={() => setStatusFilter(f)}
                  style={{
                    padding: '0.45rem 1rem',
                    borderRadius: '20px',
                    fontSize: '0.82rem',
                    fontWeight: 700,
                    border: statusFilter === f ? 'none' : '1px solid #cbd5e1',
                    backgroundColor: statusFilter === f ? '#2563eb' : '#ffffff',
                    color: statusFilter === f ? '#ffffff' : '#475569',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease'
                  }}
                >
                  {f}
                </button>
              ))}
            </div>
          )}

          {/* TASK LIST CARDS */}
          {activeTab !== 'My Profile' && (
            loading ? (
              <div style={{ textAlign: 'center', padding: '4rem 0', color: '#64748b' }}>
                Loading maintenance tasks...
              </div>
            ) : filteredTasks.length === 0 ? (
              <div className="grid-card" style={{ padding: '4rem 2rem', textAlign: 'center', color: '#64748b' }}>
                <svg style={{ width: '48px', height: '48px', color: '#cbd5e1', marginBottom: '1rem' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
                <h3 style={{ margin: '0 0 0.5rem 0', color: '#0f172a', fontSize: '1.1rem' }}>No maintenance tasks found.</h3>
                <p style={{ margin: 0, fontSize: '0.85rem' }}>Tasks assigned by Block Wardens will appear here in real-time.</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                {filteredTasks.map(t => {
                  const c = t.complaint || {};
                  return (
                    <div key={t._id || t.taskId} className="grid-card" style={{ padding: '1.5rem', borderRadius: '16px', border: '1px solid #e2e8f0', backgroundColor: '#fff', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.03)' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '1rem', marginBottom: '1rem' }}>
                        <div>
                          <h3 style={{ margin: '0 0 0.4rem 0', fontSize: '1.2rem', fontWeight: 800, color: '#0f172a' }}>
                            {c.title || 'Hostel Maintenance Repair'}
                          </h3>
                          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                            <span style={{ padding: '0.2rem 0.6rem', borderRadius: '10px', fontSize: '0.75rem', fontWeight: 700, backgroundColor: '#eff6ff', color: '#2563eb' }}>
                              ID: {t.taskId}
                            </span>
                            <span style={{ padding: '0.2rem 0.6rem', borderRadius: '10px', fontSize: '0.75rem', fontWeight: 700, backgroundColor: '#f1f5f9', color: '#475569' }}>
                              Category: {c.category || t.workerCategory}
                            </span>
                            <span style={{ padding: '0.2rem 0.6rem', borderRadius: '10px', fontSize: '0.75rem', fontWeight: 700, backgroundColor: '#fef3c7', color: '#d97706' }}>
                              Priority: {c.priority || 'Normal'}
                            </span>
                            <span style={{ padding: '0.2rem 0.6rem', borderRadius: '10px', fontSize: '0.75rem', fontWeight: 700, backgroundColor: '#f8fafc', color: '#0f172a', border: '1px solid #e2e8f0' }}>
                              Assigned By: {t.assignedBy}
                            </span>
                          </div>
                        </div>

                        {/* STATUS BADGE */}
                        <span className={`status-pill ${
                          t.status === 'Completed' || t.status === 'Closed' || t.status === 'Verified' ? 'resolved' :
                          t.status === 'In Progress' || t.status === 'Accepted' ? 'in-progress' :
                          t.status === 'Rejected' ? 'high-priority' : 'open'
                        }`} style={{ margin: 0, padding: '0.4rem 0.9rem', fontSize: '0.8rem', fontWeight: 800, borderRadius: '20px' }}>
                          ● {t.status}
                        </span>
                      </div>

                      {/* LOCATION & STUDENT METAS GRID */}
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', padding: '1rem', backgroundColor: '#f8fafc', borderRadius: '12px', border: '1px solid #f1f5f9', marginBottom: '1rem' }}>
                        <div>
                          <span style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 700, textTransform: 'uppercase' }}>LOCATION / ROOM</span>
                          <div style={{ fontSize: '0.92rem', fontWeight: 800, color: '#0f172a', marginTop: '0.2rem' }}>{c.location || `Block ${c.studentBlock} - Room ${c.studentRoom}`}</div>
                        </div>
                        <div>
                          <span style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 700, textTransform: 'uppercase' }}>STUDENT NAME</span>
                          <div style={{ fontSize: '0.92rem', fontWeight: 800, color: '#0f172a', marginTop: '0.2rem' }}>{c.studentName || 'Resident Student'}</div>
                        </div>
                        <div>
                          <span style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 700, textTransform: 'uppercase' }}>STUDENT CONTACT</span>
                          <div style={{ fontSize: '0.92rem', fontWeight: 800, color: '#2563eb', marginTop: '0.2rem' }}>{c.studentPhone || 'N/A'}</div>
                        </div>
                        <div>
                          <span style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 700, textTransform: 'uppercase' }}>ASSIGNED DATE</span>
                          <div style={{ fontSize: '0.92rem', fontWeight: 800, color: '#0f172a', marginTop: '0.2rem' }}>{new Date(t.assignedDate).toLocaleDateString()}</div>
                        </div>
                      </div>

                      {/* DESCRIPTION */}
                      <div style={{ fontSize: '0.92rem', color: '#334155', marginBottom: '1.25rem', lineHeight: 1.6 }}>
                        <strong>Issue Description:</strong> {c.description || 'No detailed description provided.'}
                      </div>

                      {/* WORKER COMPLETION PROOF IF SUBMITTED */}
                      {t.completionNotes && (
                        <div style={{ backgroundColor: '#ecfdf5', border: '1px solid #a7f3d0', padding: '1rem 1.25rem', borderRadius: '12px', marginBottom: '1.25rem' }}>
                          <div style={{ fontSize: '0.78rem', fontWeight: 800, color: '#047857', marginBottom: '0.25rem', textTransform: 'uppercase' }}>WORKER RESOLUTION REPORT & PROOF:</div>
                          <div style={{ fontSize: '0.9rem', color: '#065f46', fontStyle: 'italic' }}>"{t.completionNotes}"</div>
                          {t.proofImage && (
                            <div style={{ marginTop: '0.75rem' }}>
                              <img 
                                src={t.proofImage} 
                                alt="Completion Proof" 
                                style={{ maxHeight: '150px', borderRadius: '8px', border: '1px solid #6ee7b7', cursor: 'zoom-in' }}
                                onClick={() => setZoomImage(t.proofImage)} 
                              />
                            </div>
                          )}
                        </div>
                      )}

                      {/* ACTION BUTTONS WITH HIGH CONTRAST SOLID STYLES & SVG SYMBOLS */}
                      <div style={{ display: 'flex', gap: '0.85rem', flexWrap: 'wrap' }}>
                        {t.status === 'Assigned' && (
                          <>
                            <button
                              onClick={() => handleUpdateStatus(t.taskId, 'Accepted')}
                              style={{
                                padding: '0.75rem 1.5rem',
                                borderRadius: '10px',
                                border: 'none',
                                background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
                                color: '#ffffff',
                                fontSize: '0.9rem',
                                fontWeight: 800,
                                cursor: 'pointer',
                                boxShadow: '0 4px 14px rgba(37, 99, 235, 0.35)',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '0.5rem'
                              }}
                            >
                              <svg width="18" height="18" fill="none" stroke="#ffffff" strokeWidth="2.5" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                              </svg>
                              Accept Task Order
                            </button>
                            <button
                              onClick={() => handleUpdateStatus(t.taskId, 'Rejected')}
                              style={{
                                padding: '0.75rem 1.5rem',
                                borderRadius: '10px',
                                border: '1.5px solid #fca5a5',
                                backgroundColor: '#fff1f2',
                                color: '#e11d48',
                                fontSize: '0.9rem',
                                fontWeight: 800,
                                cursor: 'pointer',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '0.5rem'
                              }}
                            >
                              <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                              </svg>
                              Reject Order
                            </button>
                          </>
                        )}

                        {t.status === 'Accepted' && (
                          <button
                            onClick={() => handleUpdateStatus(t.taskId, 'In Progress')}
                            style={{
                              padding: '0.75rem 1.5rem',
                              borderRadius: '10px',
                              border: 'none',
                              background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
                              color: '#ffffff',
                              fontSize: '0.9rem',
                              fontWeight: 800,
                              cursor: 'pointer',
                              boxShadow: '0 4px 14px rgba(37, 99, 235, 0.35)',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '0.5rem'
                            }}
                          >
                            <svg width="18" height="18" fill="none" stroke="#ffffff" strokeWidth="2.5" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M14.7 6.3a1 1 0 000 1.4l1.6 1.6a1 1 0 001.4 0l3.77-3.77a6 6 0 01-7.94 7.94l-6.91 6.91a2.12 2.12 0 01-3-3l6.91-6.91a6 6 0 017.94-7.94l-3.76 3.76z" />
                            </svg>
                            Start Repair (In Progress)
                          </button>
                        )}

                        {t.status === 'In Progress' && (
                          <button
                            onClick={() => setSelectedTaskModal(t)}
                            style={{
                              padding: '0.75rem 1.5rem',
                              borderRadius: '10px',
                              border: 'none',
                              background: 'linear-gradient(135deg, #059669 0%, #047857 100%)',
                              color: '#ffffff',
                              fontSize: '0.9rem',
                              fontWeight: 800,
                              cursor: 'pointer',
                              boxShadow: '0 4px 14px rgba(5, 150, 105, 0.35)',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '0.5rem'
                            }}
                          >
                            <svg width="18" height="18" fill="none" stroke="#ffffff" strokeWidth="2.5" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            Mark Task Completed & Upload Proof
                          </button>
                        )}

                        {(t.status === 'Completed' || t.status === 'Verified' || t.status === 'Closed') && (
                          <span style={{ fontSize: '0.9rem', color: '#059669', fontWeight: 800, display: 'inline-flex', alignItems: 'center', gap: '0.4rem', backgroundColor: '#f0fdf4', border: '1px solid #bbf7d0', padding: '0.6rem 1rem', borderRadius: '10px' }}>
                            <svg width="18" height="18" fill="none" stroke="#059669" strokeWidth="2.5" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            Repair order completed & submitted for warden verification.
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )
          )}

          {/* TAB 5: MY PROFILE */}
          {activeTab === 'My Profile' && (
            <div className="grid-card" style={{ padding: '2rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', paddingBottom: '1.75rem', borderBottom: '1px solid #e2e8f0', marginBottom: '1.75rem' }}>
                <div style={{ width: '72px', height: '72px', borderRadius: '50%', backgroundColor: '#2563eb', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.8rem', fontWeight: 800, border: '3px solid #bfdbfe' }}>
                  {avatarInitials}
                </div>
                <div>
                  <h2 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 800, color: '#0f172a' }}>{workerName}</h2>
                  <p style={{ margin: '4px 0 0', color: '#2563eb', fontWeight: 700, fontSize: '0.95rem' }}>{workerCategory} Technician</p>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', marginTop: '0.5rem', fontSize: '0.78rem', fontWeight: 800, color: '#059669', backgroundColor: '#d1fae5', padding: '0.25rem 0.75rem', borderRadius: '12px' }}>
                    ● ACTIVE ON DUTY
                  </span>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.5rem' }}>
                <div style={{ backgroundColor: '#f8fafc', padding: '1.25rem', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                  <span style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 700, textTransform: 'uppercase' }}>OFFICIAL WORKER EMAIL</span>
                  <div style={{ fontSize: '1rem', fontWeight: 800, color: '#0f172a', marginTop: '0.25rem' }}>{user?.email || 'workers@campuscare.com'}</div>
                </div>

                <div style={{ backgroundColor: '#f8fafc', padding: '1.25rem', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                  <span style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 700, textTransform: 'uppercase' }}>CONTACT PHONE NUMBER</span>
                  <div style={{ fontSize: '1rem', fontWeight: 800, color: '#0f172a', marginTop: '0.25rem' }}>{user?.phone || '9876543210'}</div>
                </div>

                <div style={{ backgroundColor: '#f8fafc', padding: '1.25rem', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                  <span style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 700, textTransform: 'uppercase' }}>ASSIGNED MAINTENANCE STATION</span>
                  <div style={{ fontSize: '1rem', fontWeight: 800, color: '#0f172a', marginTop: '0.25rem' }}>Campus Central Maintenance Yard</div>
                </div>

                <div style={{ backgroundColor: '#f8fafc', padding: '1.25rem', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                  <span style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 700, textTransform: 'uppercase' }}>COMPLETED REPAIR ORDERS</span>
                  <div style={{ fontSize: '1rem', fontWeight: 800, color: '#059669', marginTop: '0.25rem' }}>{completedCount} Tasks Resolved</div>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* MARK COMPLETED MODAL OVERLAY */}
      {selectedTaskModal && (
        <div className="modal-backdrop">
          <div className="modal-content-card" style={{ maxWidth: '540px' }}>
            <div className="modal-header">
              <h3>Complete Repair Task Order</h3>
              <button className="close-modal-btn" onClick={() => setSelectedTaskModal(null)}>×</button>
            </div>

            <form onSubmit={(e) => {
              e.preventDefault();
              handleUpdateStatus(selectedTaskModal.taskId, 'Completed', { completionNotes, proofImage });
            }} className="modal-form-body">
              <div className="form-group">
                <label>Resolution Notes & Actions Taken *</label>
                <textarea
                  required
                  rows={3}
                  placeholder="Explain repair actions completed..."
                  value={completionNotes}
                  onChange={(e) => setCompletionNotes(e.target.value)}
                  className="modal-textarea-field"
                />
              </div>

              <div className="form-group">
                <label>Upload Resolution Photo Proof</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  style={{ fontSize: '0.85rem' }}
                />
                {proofImage && (
                  <div style={{ marginTop: '0.75rem' }}>
                    <img src={proofImage} alt="Uploaded Proof" style={{ maxHeight: '140px', borderRadius: '10px', border: '1px solid #cbd5e1' }} />
                  </div>
                )}
              </div>

              <div className="modal-footer-actions">
                <button type="button" className="cancel-btn" onClick={() => setSelectedTaskModal(null)}>Cancel</button>
                <button type="submit" className="submit-btn" disabled={actionLoading}>
                  {actionLoading ? 'Submitting...' : 'Submit Work Resolution'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ZOOM IMAGE PREVIEW MODAL */}
      {zoomImage && (
        <div className="modal-backdrop" onClick={() => setZoomImage(null)} style={{ cursor: 'zoom-out' }}>
          <div style={{ position: 'relative', maxWidth: '90%', maxHeight: '90%' }} onClick={e => e.stopPropagation()}>
            <img src={zoomImage} alt="Zoomed Proof" style={{ maxWidth: '100%', maxHeight: '80vh', borderRadius: '8px', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)' }} />
            <button 
              onClick={() => setZoomImage(null)} 
              style={{ position: 'absolute', top: '-15px', right: '-15px', backgroundColor: '#0f172a', color: '#fff', border: 'none', borderRadius: '50%', width: '30px', height: '30px', cursor: 'pointer', fontSize: '1.2rem', fontWeight: 'bold' }}
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
