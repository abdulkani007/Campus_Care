// src/pages/ManagementDashboard.jsx
import React, { useState, useEffect } from 'react';
import '../styles/ManagementDashboard.css';
import logo from '../assets/CC.png';

const ManagementDashboard = ({ user, onLogout, onUpdateProfile }) => {
  const [activeTab, setActiveTab] = useState('Dashboard');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Profile state prefilled with Manager details
  const [profile, setProfile] = useState({
    name: user?.name || 'Dr. R. Krishnan',
    email: user?.email || 'management@gmail.com',
    rollNo: user?.rollNo || 'MGT-101',
    phoneNo: user?.phoneNo || '9876543222',
    roomNo: user?.roomNo || 'Admin-101',
    block: user?.block || 'Main',
    profilePhoto: user?.profilePhoto || null
  });

  useEffect(() => {
    if (user) {
      setProfile({
        name: user.name,
        email: user.email,
        rollNo: user.rollNo,
        phoneNo: user.phoneNo,
        roomNo: user.roomNo,
        block: user.block,
        profilePhoto: user.profilePhoto || null
      });
    }
  }, [user]);

  // Dropdown states
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  // States fetched from API
  const [complaints, setComplaints] = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  const [workers, setWorkers] = useState([]);
  const [residentsList, setResidentsList] = useState([]);

  // Stats State
  const [stats, setStats] = useState({
    total: 0,
    inProgress: 0,
    resolved: 0,
    highPriority: 0,
    residents: 0,
    activeWorkers: 0
  });

  // Ticker Index for Announcements
  const [tickerIndex, setTickerIndex] = useState(0);
  const [zoomImage, setZoomImage] = useState(null);
  const [selectedComplaint, setSelectedComplaint] = useState(null);

  // Fetch all data from API on mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        const complaintsRes = await fetch('/api/complaints');
        const announcementsRes = await fetch('/api/announcements');
        const workersRes = await fetch('/api/workers');
        const residentsRes = await fetch('/api/students');
        
        if (complaintsRes.ok) {
          const complaintsData = await complaintsRes.json();
          setComplaints(complaintsData);
        }
        if (announcementsRes.ok) {
          const announcementsData = await announcementsRes.json();
          setAnnouncements(announcementsData);
        }
        if (workersRes.ok) {
          const workersData = await workersRes.json();
          setWorkers(workersData);
        }
        if (residentsRes.ok) {
          const residentsData = await residentsRes.json();
          setResidentsList(residentsData);
        }
      } catch (err) {
        console.error('Error fetching management dashboard data:', err);
      }
    };
    
    fetchData();
  }, [activeTab]);

  // Compute stats dynamically when complaints change
  useEffect(() => {
    const total = complaints.length;
    const inProgress = complaints.filter(c => c.status === 'In Progress').length;
    const resolved = complaints.filter(c => c.status === 'Resolved').length;
    const highPriority = complaints.filter(c => c.status === 'High Priority' || c.priority === 'High').length;
    const activeWorkers = workers.length;

    setStats(prev => ({
      ...prev,
      total,
      inProgress,
      resolved,
      highPriority,
      activeWorkers,
      residents: residentsList.length
    }));
  }, [complaints, workers, residentsList]);

  // Filter complaints based on Search query
  const filteredComplaints = complaints.filter(c => {
    const query = searchQuery.toLowerCase();
    return (
      (c.title || '').toLowerCase().includes(query) || 
      (c.location || '').toLowerCase().includes(query) ||
      (c.status || '').toLowerCase().includes(query) ||
      (c.studentName || '').toLowerCase().includes(query) ||
      (c.time || '').toLowerCase().includes(query)
    );
  });

  const displayComplaintsList = filteredComplaints;

  const displayAnnouncements = announcements.length > 0 ? announcements.map(a => `${a.title || 'Announcement'}: ${a.text}`) : [
    'No active hostel announcements posted yet.'
  ];

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email: profile.email,
          role: 'management',
          name: profile.name,
          rollNo: profile.rollNo,
          phoneNo: profile.phoneNo,
          roomNo: profile.roomNo,
          block: profile.block,
          profilePhoto: profile.profilePhoto || null
        })
      });

      if (res.ok) {
        const data = await res.json();
        setProfile(data.user);
        if (onUpdateProfile) {
          onUpdateProfile(data.user);
        }
        alert('Profile settings updated successfully!');
      } else {
        const errData = await res.json().catch(() => ({}));
        if (res.status === 404) {
          alert('Profile not found in database. This can happen if your account was registered on a previous database instance. Please Log Out and Sign Up again to create your profile in the current database!');
        } else {
          alert(errData.error || 'Failed to update profile settings.');
        }
      }
    } catch (err) {
      console.error('Error updating profile:', err);
      alert('Network error saving profile settings.');
    }
  };

  const handleProfilePhotoChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      alert("Profile photo must be under 2MB.");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setProfile(prev => ({
        ...prev,
        profilePhoto: reader.result
      }));
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="management-dashboard-layout">
      
      {/* 1. DARK BLUE SIDEBAR */}
      <aside className="management-sidebar">
        <div className="sidebar-brand-header">
          <img src={logo} alt="Campus Care" className="brand-logo-icon" />
          <div>
            <span className="brand-title-text">CampusCare</span>
            <span className="brand-subtitle-text">Smart Hostel Management</span>
          </div>
        </div>

        <nav className="sidebar-menu-nav">
          {[
            { id: 'Dashboard', label: 'Dashboard', icon: (
              <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
            )},
            { id: 'Complaints Overview', label: 'Complaints Overview', icon: (
              <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            )},
            { id: 'Incident Groups', label: 'Incident Groups', icon: (
              <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            )},
            { id: 'Residents', label: 'Residents', icon: (
              <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            )},
            { id: 'Wardens', label: 'Wardens', icon: (
              <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            )},
            { id: 'Maintenance Workers', label: 'Maintenance Workers', icon: (
              <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M14.7 6.3a1 1 0 000 1.4l1.6 1.6a1 1 0 001.4 0l3.77-3.77a6 6 0 01-7.94 7.94l-6.91 6.91a2.12 2.12 0 01-3-3l6.91-6.91a6 6 0 017.94-7.94l-3.76 3.76z" />
              </svg>
            )},
            { id: 'Announcements', label: 'Announcements', icon: (
              <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
              </svg>
            )},
            { id: 'Reports & Analytics', label: 'Reports & Analytics', icon: (
              <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14" />
              </svg>
            )},
            { id: 'Block Management', label: 'Block Management', icon: (
              <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1" />
              </svg>
            )},
            { id: 'Feedback', label: 'Feedback', icon: (
              <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
            )},
            { id: 'Settings', label: 'Settings', icon: (
              <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              </svg>
            )}
          ].map(item => (
            <button
              key={item.id}
              className={`sidebar-nav-item ${activeTab === item.id ? 'active' : ''}`}
              onClick={() => setActiveTab(item.id)}
            >
              <span className="nav-icon">{item.icon}</span>
              <span className="nav-label">{item.label}</span>
            </button>
          ))}
        </nav>

        {/* Hostel building footer illustration */}
        <div className="sidebar-footer-card">
          <div className="building-icon-wrapper">
            <svg width="24" height="24" fill="none" stroke="#2563eb" strokeWidth="2.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
          </div>
          <div>
            <span className="panel-title">CampusCare</span>
            <span className="panel-subtitle">Management Panel</span>
          </div>
        </div>
      </aside>

      {/* MAIN CONTAINER */}
      <main className="management-main-panel">
        
        {/* TOP HEADER */}
        <header className="management-header">
          <div className="header-left-heading">
            <svg className="menu-toggle-icon" width="22" height="22" fill="none" stroke="#475569" strokeWidth="2.2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
            <div>
              <h2>Management Dashboard</h2>
              <p>Complete overview of all hostel operations</p>
            </div>
          </div>

          <div className="header-search-container">
            <svg className="search-icon-svg" width="16" height="16" fill="none" stroke="#94a3b8" strokeWidth="2.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              placeholder="Search complaints, residents, blocks..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="header-actions-right">
            {/* Notifications Bell */}
            <div className="bell-action-wrapper" onClick={() => setShowNotifications(!showNotifications)}>
              <svg width="22" height="22" fill="none" stroke="#475569" strokeWidth="2.2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
              <span className="bell-badge">12</span>

              {showNotifications && (
                <div className="header-notifications-dropdown">
                  <div className="drop-header">System Notifications</div>
                  <div className="drop-row">High priority plumbing complaint logged in Block A.</div>
                  <div className="drop-row">Daily inspection reports uploaded.</div>
                </div>
              )}
            </div>

            {/* Profile Avatar dropdown */}
            <div 
              className="user-profile-widget"
              onClick={() => setShowProfileMenu(!showProfileMenu)}
            >
              <div className="avatar-circle" style={{ overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {profile.profilePhoto ? (
                  <img src={profile.profilePhoto} alt="avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  profile.name.split(' ').map(n=>n[0]).join('')
                )}
              </div>
              <div className="avatar-details">
                <span className="name">{profile.name}</span>
                <span className="role">Hostel Management</span>
              </div>
              <svg className={`chevron-down ${showProfileMenu ? 'rotated' : ''}`} width="14" height="14" fill="none" stroke="#64748b" strokeWidth="2.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
              </svg>

              {showProfileMenu && (
                <div className="profile-dropdown-links">
                  <div className="dropdown-link" onClick={() => setActiveTab('Settings')}>My Profile</div>
                  <div className="dropdown-link" onClick={onLogout}>Logout</div>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* TAB CORE */}
        {activeTab === 'Dashboard' && (
          <div className="dashboard-grid-widgets">
            
            {/* ROW 1: ANNOUNCEMENTS TICKER BAR */}
            <div className="announcements-ticker-bar">
              <span className="announcements-tag">ANNOUNCEMENTS</span>
              <div className="ticker-viewport">
                <p className="ticker-text">{displayAnnouncements[tickerIndex]}</p>
              </div>
              <div className="ticker-nav-arrows">
                <button 
                  className="arrow-btn" 
                  onClick={() => setTickerIndex((prev) => (prev - 1 + displayAnnouncements.length) % displayAnnouncements.length)}
                >
                  &lt;
                </button>
                <button 
                  className="arrow-btn" 
                  onClick={() => setTickerIndex((prev) => (prev + 1) % displayAnnouncements.length)}
                >
                  &gt;
                </button>
              </div>
            </div>

            {/* ROW 2: SIX STAT CARDS ROW */}
            <div className="six-stats-grid">
              
              {/* 1. Total Complaints */}
              <div className="mgt-stat-card">
                <div className="icon-side bg-blue-tint text-blue">
                  <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25" />
                  </svg>
                </div>
                <div className="label-side">
                  <span className="num">{stats.total}</span>
                  <span className="label">Total Complaints</span>
                  <span className="trend positive">↑ 12% vs last week</span>
                </div>
              </div>

              {/* 2. In Progress */}
              <div className="mgt-stat-card">
                <div className="icon-side bg-orange-tint text-orange">
                  <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="label-side">
                  <span className="num">{stats.inProgress}</span>
                  <span className="label">In Progress</span>
                  <span className="trend positive">↑ 5% vs last week</span>
                </div>
              </div>

              {/* 3. Resolved */}
              <div className="mgt-stat-card">
                <div className="icon-side bg-green-tint text-green">
                  <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="label-side">
                  <span className="num">{stats.resolved}</span>
                  <span className="label">Resolved</span>
                  <span className="trend positive">↑ 20% vs last week</span>
                </div>
              </div>

              {/* 4. High Priority */}
              <div className="mgt-stat-card">
                <div className="icon-side bg-red-tint text-red">
                  <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374" />
                  </svg>
                </div>
                <div className="label-side">
                  <span className="num">{stats.highPriority}</span>
                  <span className="label">High Priority</span>
                  <span className="trend negative">↓ 8% vs last week</span>
                </div>
              </div>

              {/* 5. Residents */}
              <div className="mgt-stat-card">
                <div className="icon-side bg-purple-tint text-purple">
                  <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 003.741-.479" />
                  </svg>
                </div>
                <div className="label-side">
                  <span className="num">{stats.residents}</span>
                  <span className="label">Total Residents</span>
                  <span className="trend positive">↑ 2% vs last week</span>
                </div>
              </div>

              {/* 6. Active Workers */}
              <div className="mgt-stat-card">
                <div className="icon-side bg-cyan-tint text-cyan">
                  <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745" />
                  </svg>
                </div>
                <div className="label-side">
                  <span className="num">{stats.activeWorkers}</span>
                  <span className="label">Active Workers</span>
                  <span className="trend neutral">— No change</span>
                </div>
              </div>

            </div>

            {/* ROW 3: GRAPHS & BLOCK STATUS PROGRESS BARS */}
            <div className="charts-overview-row">
              
              {/* Curve Graph */}
              <div className="overview-chart-card col-40">
                <div className="chart-card-header">
                  <div>
                    <span className="title">Complaint Trends</span>
                    <span className="subtitle">Active and resolved ticket logs</span>
                  </div>
                  <span className="chart-filter">This Month</span>
                </div>

                <div className="mgt-chart-area">
                  <svg viewBox="0 0 320 180" style={{ width: '100%' }}>
                    {/* Grid lines */}
                    <line x1="30" y1="20" x2="300" y2="20" stroke="#f1f5f9" strokeWidth="1" />
                    <line x1="30" y1="60" x2="300" y2="60" stroke="#f1f5f9" strokeWidth="1" />
                    <line x1="30" y1="100" x2="300" y2="100" stroke="#f1f5f9" strokeWidth="1" />
                    <line x1="30" y1="140" x2="300" y2="140" stroke="#e2e8f0" strokeWidth="1.5" />

                    {/* Blue line: Total */}
                    <path d="M 30 110 C 60 90, 80 50, 110 70 C 140 90, 170 40, 200 65 C 230 90, 270 40, 300 50" fill="none" stroke="#2563eb" strokeWidth="2.5" strokeLinecap="round" />
                    {/* Green line: Resolved */}
                    <path d="M 30 130 C 60 120, 80 80, 110 95 C 140 110, 170 70, 200 85 C 230 100, 270 70, 300 80" fill="none" stroke="#10b981" strokeWidth="2" strokeLinecap="round" />
                    {/* Red line: High Priority */}
                    <path d="M 30 138 C 60 135, 80 125, 110 130 C 140 133, 170 115, 200 120 C 230 125, 270 110, 300 115" fill="none" stroke="#ef4444" strokeWidth="1.5" strokeLinecap="round" />

                    {/* Labels */}
                    <text x="30" y="155" fontSize="8" fill="#94a3b8">1 May</text>
                    <text x="110" y="155" fontSize="8" fill="#94a3b8">10 May</text>
                    <text x="200" y="155" fontSize="8" fill="#94a3b8">20 May</text>
                    <text x="300" y="155" fontSize="8" fill="#94a3b8" textAnchor="end">31 May</text>
                  </svg>
                  <div className="chart-legend">
                    <span className="leg-item"><span className="dot blue-dot"></span>Total</span>
                    <span className="leg-item"><span className="dot green-dot"></span>Resolved</span>
                    <span className="leg-item"><span className="dot red-dot"></span>High</span>
                  </div>
                </div>
              </div>

              {/* Donut Chart */}
              <div className="overview-chart-card col-30">
                <div className="chart-card-header">
                  <span className="title">Complaints by Category</span>
                </div>

                <div className="donut-chart-wrapper">
                  {/* CSS Donut Chart */}
                  <div className="css-donut-chart">
                    <div className="donut-center-hole">
                      <span className="cnt-val">{stats.total}</span>
                      <span className="cnt-lbl">Total</span>
                    </div>
                  </div>

                  <div className="category-legend-list">
                    {[
                      { name: 'Electrical', pct: '22.5%', color: '#2563eb' },
                      { name: 'Plumbing', pct: '19.7%', color: '#3b82f6' },
                      { name: 'Water Supply', pct: '16.9%', color: '#f59e0b' },
                      { name: 'Internet', pct: '12.7%', color: '#a855f7' },
                      { name: 'Cleaning', pct: '11.3%', color: '#06b6d4' }
                    ].map(cat => (
                      <div key={cat.name} className="cat-leg-row">
                        <span className="dot" style={{ backgroundColor: cat.color }}></span>
                        <span className="name">{cat.name}</span>
                        <span className="val">{cat.pct}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Hostel Block status card grid */}
              <div className="overview-chart-card col-30">
                <div className="chart-card-header">
                  <span className="title">Hostel Blocks Status</span>
                  <button className="view-all-link" onClick={() => setActiveTab('Block Management')}>View All</button>
                </div>

                <div className="block-cards-grid">
                  {[
                    { name: 'Block A', occupied: '92/100', progress: '92%' },
                    { name: 'Block B', occupied: '88/100', progress: '88%' },
                    { name: 'Block C', occupied: '90/100', progress: '90%' },
                    { name: 'Block D', occupied: '86/100', progress: '86%' }
                  ].map(block => (
                    <div key={block.name} className="block-progress-card">
                      <div className="block-card-head">
                        <span className="name">{block.name}</span>
                        <span className="cap">{block.occupied}</span>
                      </div>
                      <div className="progress-bg">
                        <div className="progress-fill" style={{ width: block.progress }}></div>
                      </div>
                      <span className="pct">{block.progress} Occupied</span>
                    </div>
                  ))}
                </div>
              </div>

            </div>

            {/* ROW 4: RECENT COMPLAINTS TABLE, QUICK ACTIONS GRID, KEY INSIGHTS LIST */}
            <div className="dashboard-grid-row-4">
              
              {/* Complaints Table */}
              <div className="mgt-widget-card col-60">
                <div className="widget-header">
                  <span className="title">Recent Complaints</span>
                  <button className="view-all-link" onClick={() => setActiveTab('Complaints Overview')}>View All</button>
                </div>

                <div className="complaints-log-table-wrapper">
                  <table className="complaints-log-table">
                    <thead>
                      <tr>
                        <th>#</th>
                        <th>Complaint</th>
                        <th>Block/Room</th>
                        <th>Category</th>
                        <th>Priority</th>
                        <th>Status</th>
                        <th>Time</th>
                      </tr>
                    </thead>
                    <tbody>
                      {displayComplaintsList.length === 0 ? (
                        <tr>
                          <td colSpan="7" style={{ textAlign: 'center', padding: '2rem', color: '#64748b' }}>
                            No complaints registered yet.
                          </td>
                        </tr>
                      ) : (
                        displayComplaintsList.slice(0, 5).map((row, idx) => (
                          <tr key={idx}>
                            <td style={{ color: '#94a3b8' }}>{row.id || `#C-240${5-idx}`}</td>
                            <td style={{ fontWeight: 600, color: '#0f172a' }}>{row.title}</td>
                            <td style={{ color: '#475569' }}>{row.location}</td>
                            <td style={{ color: '#64748b' }}>{row.category}</td>
                            <td>
                              <span className={`priority-tag ${row.priority?.toLowerCase()}`}>
                                {row.priority}
                              </span>
                            </td>
                            <td>
                              <span className={`status-pill ${
                                row.status === 'Resolved' ? 'resolved' :
                                row.status === 'In Progress' ? 'in-progress' :
                                row.status === 'High Priority' ? 'high-priority' : 'open'
                              }`}>
                                {row.status}
                              </span>
                            </td>
                            <td style={{ color: '#94a3b8' }}>{row.time || 'Just now'}</td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Quick Actions Grid */}
              <div className="mgt-widget-card col-20">
                <div className="widget-header">
                  <span className="title">Quick Actions</span>
                </div>

                <div className="quick-actions-tile-grid">
                  {[
                    { label: 'View All Complaints', action: () => setActiveTab('Complaints Overview'), icon: (
                      <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2" />
                      </svg>
                    )},
                    { label: 'Manage Wardens', action: () => setActiveTab('Wardens'), icon: (
                      <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0z" />
                      </svg>
                    )},
                    { label: 'Manage Workers', action: () => setActiveTab('Maintenance Workers'), icon: (
                      <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62" />
                      </svg>
                    )},
                    { label: 'Create Announcement', action: () => setActiveTab('Announcements'), icon: (
                      <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15" />
                      </svg>
                    )},
                    { label: 'View Reports', action: () => setActiveTab('Reports & Analytics'), icon: (
                      <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5" />
                      </svg>
                    )},
                    { label: 'Inspect Blocks', action: () => setActiveTab('Block Management'), icon: (
                      <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7" />
                      </svg>
                    )}
                  ].map((act, idx) => (
                    <button key={idx} className="action-tile-btn" onClick={act.action}>
                      <span className="tile-icon">{act.icon}</span>
                      <span className="tile-label">{act.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Key Insights List */}
              <div className="mgt-widget-card col-20">
                <div className="widget-header">
                  <span className="title">Key Insights</span>
                  <span className="insights-filter">This Month</span>
                </div>

                <div className="insights-stack-card-list">
                  {[
                    { title: 'Water Supply', desc: 'Most reported issue (16.9%)', color: '#f59e0b', icon: '💧' },
                    { title: '20% faster', desc: 'Complaint resolution time', color: '#10b981', icon: '⚡' },
                    { title: '89%', desc: 'Student satisfaction rate', color: '#3b82f6', icon: '⭐' },
                    { title: '3 Blocks', desc: 'Completed inspection this month', color: '#8b5cf6', icon: '🏢' }
                  ].map((ins, idx) => (
                    <div key={idx} className="insight-row-card">
                      <div className="ins-icon" style={{ backgroundColor: `${ins.color}15` }}>
                        {ins.icon}
                      </div>
                      <div>
                        <span className="title">{ins.title}</span>
                        <span className="desc">{ins.desc}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </div>

          </div>
        )}

        {/* COMPLAINTS OVERVIEW TAB (READ-ONLY) */}
        {activeTab === 'Complaints Overview' && (
          <div className="fallback-tab-panel">
            <div className="section-header" style={{ marginBottom: '1.5rem' }}>
              <h2>Complaints Overview Audit</h2>
              <p style={{ color: '#64748b' }}>Audit all student complaints across blocks (Read-Only Mode)</p>
            </div>

            <div style={{ marginBottom: '1.5rem', maxWidth: '350px' }}>
              <input
                type="text"
                className="standard-input-field"
                placeholder="Filter complaints..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.25rem', marginTop: '1rem' }}>
              {filteredComplaints.length === 0 ? (
                <p style={{ color: '#64748b', textAlign: 'center', padding: '2rem 0', gridColumn: '1 / -1' }}>No complaints match your query.</p>
              ) : (
                filteredComplaints.map(c => (
                  <div key={c.id} className="mgt-widget-card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', padding: '1.25rem', border: '1px solid #e2e8f0', borderRadius: '10px', backgroundColor: '#fff', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03)', transition: 'transform 0.2s, box-shadow 0.2s', cursor: 'default' }}>
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '0.5rem', marginBottom: '0.75rem' }}>
                        <h4 style={{ margin: 0, fontSize: '1rem', color: '#0f172a', fontWeight: 600, lineHeight: '1.4' }}>{c.title}</h4>
                        <span className={`status-pill ${
                          c.status === 'Resolved' ? 'resolved' :
                          c.status === 'In Progress' ? 'in-progress' :
                          c.status === 'High Priority' ? 'high-priority' : 'open'
                        }`} style={{ margin: 0, whiteSpace: 'nowrap' }}>
                          {c.status}
                        </span>
                      </div>
                      
                      <p className="complaint-meta-desc" style={{ margin: '0.35rem 0', fontSize: '0.85rem' }}>
                        Category: <strong>{c.category}</strong> • Priority: <strong style={{ color: c.priority === 'High' ? '#ef4444' : '#475569' }}>{c.priority}</strong>
                      </p>
                      <p className="complaint-meta-desc" style={{ margin: '0.35rem 0', fontSize: '0.85rem', color: '#64748b' }}>
                        Location: <strong>{c.location}</strong>
                      </p>
                      <p className="complaint-meta-desc" style={{ margin: '0.35rem 0', fontSize: '0.8rem', color: '#94a3b8' }}>
                        Submitted: {c.time}
                      </p>

                      <div style={{ marginTop: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.35rem 0.5rem', backgroundColor: '#f8fafc', borderRadius: '6px', border: '1px solid #f1f5f9' }}>
                        {c.studentPhoto ? (
                          <img 
                            src={c.studentPhoto} 
                            alt="student" 
                            style={{ width: '28px', height: '28px', borderRadius: '50%', objectFit: 'cover' }} 
                          />
                        ) : (
                          <div style={{ width: '28px', height: '28px', borderRadius: '50%', backgroundColor: '#e2e8f0', color: '#475569', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', fontWeight: 'bold' }}>
                            {c.studentName?.split(' ').map(n=>n[0]).join('') || 'S'}
                          </div>
                        )}
                        <span style={{ fontSize: '0.8rem', color: '#475569', fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {c.studentName} (Rm: {c.studentRoom})
                        </span>
                      </div>
                    </div>

                    <button 
                      className="lodge-complaint-trigger-btn" 
                      style={{ marginTop: '1.25rem', width: '100%', padding: '0.5rem', borderRadius: '6px', border: 'none', backgroundColor: '#3b82f6', color: '#fff', fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer', textAlign: 'center', transition: 'background-color 0.2s' }}
                      onClick={() => setSelectedComplaint(c)}
                    >
                      View Details
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* ACCOUNT SETTINGS TAB */}
        {activeTab === 'Settings' && (
          <div className="fallback-tab-panel">
            <div className="section-header" style={{ marginBottom: '1.5rem' }}>
              <h2>Account Settings</h2>
              <p style={{ color: '#64748b' }}>Modify Management profile details</p>
            </div>

            <div className="mgt-widget-card" style={{ padding: '2rem', maxWidth: '600px', backgroundColor: '#fff', border: '1px solid #e2e8f0', borderRadius: '8px' }}>
              <form onSubmit={handleSaveProfile} className="settings-form">
                <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', marginBottom: '2rem', borderBottom: '1px solid #e2e8f0', paddingBottom: '1.5rem' }}>
                  <div className="avatar-circle-large" style={{ overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: 0, width: '80px', height: '80px', borderRadius: '50%', backgroundColor: '#f1f5f9', color: '#64748b', fontSize: '1.5rem', fontWeight: 'bold' }}>
                    {profile.profilePhoto ? (
                      <img src={profile.profilePhoto} alt="avatar" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }} />
                    ) : (
                      profile.name.split(' ').map(n=>n[0]).join('')
                    )}
                  </div>
                  <div>
                    <label style={{ display: 'block', fontWeight: 600, fontSize: '0.9rem', marginBottom: '0.5rem', color: '#334155' }}>Profile Picture</label>
                    <input 
                      type="file" 
                      accept="image/*" 
                      onChange={handleProfilePhotoChange} 
                      style={{ fontSize: '0.85rem' }} 
                    />
                    <p style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '4px' }}>Optional. JPG or PNG under 2MB.</p>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '1.5rem' }}>
                  <div>
                    <label className="settings-label" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500, color: '#334155' }}>Management Name</label>
                    <input
                      type="text"
                      className="standard-input-field"
                      value={profile.name}
                      onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                      style={{ width: '100%', padding: '0.6rem', border: '1px solid #cbd5e1', borderRadius: '6px' }}
                    />
                  </div>
                  <div>
                    <label className="settings-label" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500, color: '#334155' }}>Member ID</label>
                    <input
                      type="text"
                      className="standard-input-field"
                      value={profile.rollNo}
                      onChange={(e) => setProfile({ ...profile, rollNo: e.target.value })}
                      style={{ width: '100%', padding: '0.6rem', border: '1px solid #cbd5e1', borderRadius: '6px' }}
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '2rem' }}>
                  <div>
                    <label className="settings-label" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500, color: '#334155' }}>Official Mail ID</label>
                    <input
                      type="email"
                      className="standard-input-field"
                      value={profile.email}
                      readOnly
                      style={{ width: '100%', padding: '0.6rem', border: '1px solid #cbd5e1', borderRadius: '6px', backgroundColor: '#f1f5f9', cursor: 'not-allowed' }}
                    />
                  </div>
                  <div>
                    <label className="settings-label" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500, color: '#334155' }}>Phone Number</label>
                    <input
                      type="text"
                      className="standard-input-field"
                      value={profile.phoneNo}
                      onChange={(e) => setProfile({ ...profile, phoneNo: e.target.value })}
                      style={{ width: '100%', padding: '0.6rem', border: '1px solid #cbd5e1', borderRadius: '6px' }}
                    />
                  </div>
                </div>

                <button type="submit" className="submit-btn" style={{ backgroundColor: '#0f172a', color: '#fff', padding: '0.75rem 2rem', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 600 }}>
                  Save Settings
                </button>
              </form>
            </div>
          </div>
        )}

        {/* TAB FALLBACKS */}
        {activeTab !== 'Dashboard' && activeTab !== 'Complaints Overview' && activeTab !== 'Settings' && (
          <div className="fallback-tab-panel">
            <h2>{activeTab} Management</h2>
            <div className="mgt-widget-card" style={{ padding: '2rem', marginTop: '1rem', color: '#64748b' }}>
              Management interface for {activeTab} is ready and listening to persistent API database triggers.
            </div>
          </div>
        )}

      </main>

      {/* COMPLAINT DETAILS VIEW MODAL (VIEW-ONLY FOR MANAGEMENT) */}
      {selectedComplaint && (
        <div className="modal-backdrop" style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 999 }}>
          <div className="modal-content" style={{ maxWidth: '600px', width: '90%', borderRadius: '12px', padding: '2rem', backgroundColor: '#fff', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #e2e8f0', paddingBottom: '1rem', marginBottom: '1rem' }}>
              <h3 style={{ margin: 0, fontSize: '1.5rem', color: '#0f172a' }}>{selectedComplaint.title}</h3>
              <button 
                onClick={() => setSelectedComplaint(null)}
                style={{ background: 'none', border: 'none', fontSize: '2rem', color: '#94a3b8', cursor: 'pointer', lineHeight: '0.5' }}
              >
                &times;
              </button>
            </div>

            <div style={{ maxHeight: '70vh', overflowY: 'auto', paddingRight: '0.5rem', textAlign: 'left' }}>
              
              {/* Category & Status */}
              <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.25rem', flexWrap: 'wrap', alignItems: 'center' }}>
                <span className={`status-pill ${
                  selectedComplaint.status === 'Resolved' ? 'resolved' :
                  selectedComplaint.status === 'In Progress' ? 'in-progress' :
                  selectedComplaint.status === 'High Priority' ? 'high-priority' : 'open'
                }`} style={{ margin: 0 }}>
                  {selectedComplaint.status}
                </span>
                <span style={{ fontSize: '0.8rem', padding: '0.35rem 0.6rem', backgroundColor: '#f1f5f9', borderRadius: '6px', color: '#475569', fontWeight: 600 }}>
                  Category: {selectedComplaint.category}
                </span>
                <span style={{ fontSize: '0.8rem', padding: '0.35rem 0.6rem', backgroundColor: '#f1f5f9', borderRadius: '6px', color: '#475569', fontWeight: 600 }}>
                  Priority: {selectedComplaint.priority}
                </span>
              </div>

              {/* Description */}
              <div style={{ marginBottom: '1.5rem' }}>
                <h5 style={{ margin: '0 0 0.5rem', fontSize: '0.85rem', color: '#475569', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600 }}>Detailed Description</h5>
                <p style={{ margin: 0, fontSize: '0.95rem', color: '#0f172a', lineHeight: 1.5, backgroundColor: '#f8fafc', padding: '0.85rem', borderRadius: '8px', border: '1px solid #e2e8f0', whiteSpace: 'pre-wrap' }}>
                  {selectedComplaint.description || 'No detailed description provided.'}
                </p>
              </div>

              {/* Location & Time */}
              <div style={{ marginBottom: '1.5rem', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <h5 style={{ margin: '0 0 0.25rem', fontSize: '0.8rem', color: '#64748b', fontWeight: 600, textTransform: 'uppercase' }}>Location</h5>
                  <span style={{ fontSize: '0.9rem', fontWeight: 500, color: '#1e293b' }}>{selectedComplaint.location}</span>
                </div>
                <div>
                  <h5 style={{ margin: '0 0 0.25rem', fontSize: '0.8rem', color: '#64748b', fontWeight: 600, textTransform: 'uppercase' }}>Filing Time</h5>
                  <span style={{ fontSize: '0.9rem', fontWeight: 500, color: '#1e293b' }}>{selectedComplaint.time}</span>
                </div>
              </div>

              {/* Student Details Card */}
              <div style={{ marginBottom: '1.5rem', padding: '1rem', backgroundColor: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                <h5 style={{ margin: '0 0 0.75rem', fontSize: '0.8rem', color: '#475569', textTransform: 'uppercase', fontWeight: 600 }}>Filer Student Details</h5>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  {selectedComplaint.studentPhoto ? (
                    <img 
                      src={selectedComplaint.studentPhoto} 
                      alt="Student" 
                      style={{ width: '48px', height: '48px', borderRadius: '50%', objectFit: 'cover', border: '1px solid #cbd5e1' }} 
                    />
                  ) : (
                    <div style={{ width: '48px', height: '48px', borderRadius: '50%', backgroundColor: '#cbd5e1', color: '#475569', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '1rem' }}>
                      {selectedComplaint.studentName?.split(' ').map(n=>n[0]).join('') || 'S'}
                    </div>
                  )}
                  <div>
                    <p style={{ margin: 0, fontWeight: 600, color: '#0f172a', fontSize: '0.95rem' }}>
                      {selectedComplaint.studentName}
                    </p>
                    <p style={{ margin: '4px 0 0', color: '#475569', fontSize: '0.85rem' }}>
                      Roll No: <strong>{selectedComplaint.studentRoll}</strong> • Room: <strong>{selectedComplaint.studentBlock} - {selectedComplaint.studentRoom}</strong>
                    </p>
                    <p style={{ margin: '4px 0 0', color: '#475569', fontSize: '0.85rem' }}>
                      Phone No: <strong>{selectedComplaint.studentPhone}</strong>
                    </p>
                  </div>
                </div>
              </div>

              {/* Attached Proof */}
              {selectedComplaint.proof && (
                <div style={{ marginBottom: '1.5rem' }}>
                  <h5 style={{ margin: '0 0 0.5rem', fontSize: '0.8rem', color: '#475569', textTransform: 'uppercase', fontWeight: 600 }}>Attached Proof</h5>
                  <div style={{ border: '1px solid #e2e8f0', borderRadius: '6px', overflow: 'hidden', backgroundColor: '#fff', padding: '0.5rem' }}>
                    {selectedComplaint.proof.startsWith('data:image/') ? (
                      <img 
                        src={selectedComplaint.proof} 
                        alt="Proof" 
                        style={{ width: '100%', maxHeight: '300px', objectFit: 'contain', display: 'block', margin: '0 auto', cursor: 'zoom-in' }}
                        onClick={() => setZoomImage(selectedComplaint.proof)}
                      />
                    ) : (
                      <a href={selectedComplaint.proof} download={selectedComplaint.proofName || 'proof'} className="view-all-link" style={{ padding: '0.5rem', display: 'block', fontSize: '0.85rem', textAlign: 'center' }}>
                        Download Document ({selectedComplaint.proofName || 'Proof'})
                      </a>
                    )}
                  </div>
                </div>
              )}

            </div>
          </div>
        </div>
      )}

      {zoomImage && (
        <div className="modal-backdrop" onClick={() => setZoomImage(null)} style={{ cursor: 'zoom-out', position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 999 }}>
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

export default ManagementDashboard;
