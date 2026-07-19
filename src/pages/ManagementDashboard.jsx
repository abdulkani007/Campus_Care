// src/pages/ManagementDashboard.jsx
import React, { useState, useEffect } from 'react';
import EventBannerCard from '../components/EventBannerCard';
import { DynamicTrendsChart, DynamicDonutChart } from '../components/DynamicComplaintCharts';
import '../styles/ManagementDashboard.css';
import logo from '../assets/CC.png';

const ManagementDashboard = ({ user, onLogout, onUpdateProfile }) => {
  const [activeTab, setActiveTab] = useState('Dashboard');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Profile state prefilled with Manager details
  const [profile, setProfile] = useState({
    name: user?.name || 'Management Executive',
    email: user?.email || 'management@campuscare.com',
    rollNo: user?.rollNo || 'MGT-001',
    phoneNo: user?.phoneNo || '9876543220',
    roomNo: user?.roomNo || 'Admin-01',
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
  const [eventBanner, setEventBanner] = useState(null);

  // States for Wardens, Block Management, Feedback & Announcements
  const [wardensList, setWardensList] = useState([]);
  const [feedbackRequests, setFeedbackRequests] = useState([]);
  const [feedbackResponses, setFeedbackResponses] = useState([]);

  // Modal / Conversation States
  const [selectedWardenChat, setSelectedWardenChat] = useState(null);
  const [wardenMessages, setWardenMessages] = useState([]);
  const [wardenMsgText, setWardenMsgText] = useState('');

  const [selectedBlockDetail, setSelectedBlockDetail] = useState(null);

  const [showAnnouncementModal, setShowAnnouncementModal] = useState(false);
  const [newAnn, setNewAnn] = useState({ title: '', content: '', category: 'General', priority: 'Normal' });

  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [newFb, setNewFb] = useState({ title: '', description: '' });

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
        const complaintsRes = await fetch(`/api/complaints?userEmail=${encodeURIComponent(user?.email || 'management@campuscare.com')}&userRole=management`);
        const announcementsRes = await fetch('/api/announcements');
        const workersRes = await fetch('/api/workers');
        const residentsRes = await fetch('/api/students');
        const bannerRes = await fetch('/api/event-banner');
        const wardensRes = await fetch('/api/wardens');
        const feedbackReqRes = await fetch('/api/feedback-requests');
        const feedbackRespRes = await fetch('/api/feedback-responses');
        
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
        if (bannerRes.ok) {
          const bannerData = await bannerRes.json();
          if (bannerData) {
            setEventBanner(bannerData);
          }
        }
        if (wardensRes.ok) {
          const wardensData = await wardensRes.json();
          setWardensList(wardensData);
        }
        if (feedbackReqRes.ok) {
          const feedbackReqData = await feedbackReqRes.json();
          setFeedbackRequests(feedbackReqData);
        }
        if (feedbackRespRes.ok) {
          const feedbackRespData = await feedbackRespRes.json();
          setFeedbackResponses(feedbackRespData);
        }
      } catch (err) {
        console.error('Error fetching management dashboard data:', err);
      }
    };
    
    fetchData();
  }, [activeTab, user?.email]);

  // Fetch direct messages when a warden chat modal opens
  useEffect(() => {
    if (selectedWardenChat) {
      const fetchWardenChat = async () => {
        try {
          const res = await fetch(`/api/messages?studentEmail=${encodeURIComponent(selectedWardenChat.email)}`);
          if (res.ok) {
            const msgs = await res.json();
            setWardenMessages(msgs);
          }
        } catch (err) {
          console.error('Error fetching warden messages:', err);
        }
      };
      fetchWardenChat();
    }
  }, [selectedWardenChat]);

  // Send Direct Message to Warden
  const handleSendWardenMessage = async (e) => {
    e.preventDefault();
    if (!wardenMsgText.trim() || !selectedWardenChat) return;

    try {
      const res = await fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: wardenMsgText,
          sender: 'management',
          studentEmail: selectedWardenChat.email,
          studentName: selectedWardenChat.name,
          studentBlock: Array.isArray(selectedWardenChat.blocks) ? selectedWardenChat.blocks.join(', ') : (selectedWardenChat.block || 'Main')
        })
      });

      if (res.ok) {
        const data = await res.json();
        setWardenMessages(prev => [...prev, data.message || data]);
        setWardenMsgText('');
      }
    } catch (err) {
      console.error('Error sending message to warden:', err);
    }
  };

  // Create Management Announcement
  const handlePostManagementAnnouncement = async (e) => {
    e.preventDefault();
    if (!newAnn.title.trim() || !newAnn.content.trim()) return;

    try {
      const res = await fetch('/api/announcements', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: newAnn.title,
          text: newAnn.content,
          category: newAnn.category || 'General',
          important: newAnn.priority === 'Urgent',
          postedBy: 'Management',
          authorName: profile.name || 'Management Executive'
        })
      });

      if (res.ok) {
        const data = await res.json();
        setAnnouncements(prev => [data.announcement || data, ...prev]);
        setShowAnnouncementModal(false);
        setNewAnn({ title: '', content: '', category: 'General', priority: 'Normal' });
      }
    } catch (err) {
      console.error('Error posting management announcement:', err);
    }
  };

  // Create Management Feedback Survey
  const handleCreateManagementFeedback = async (e) => {
    e.preventDefault();
    if (!newFb.title.trim() || !newFb.description.trim()) return;

    try {
      const res = await fetch('/api/feedback-requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: newFb.title,
          description: newFb.description,
          postedBy: 'Management',
          authorName: profile.name || 'Management Executive'
        })
      });

      if (res.ok) {
        const data = await res.json();
        setFeedbackRequests(prev => [data, ...prev.map(f => ({ ...f, active: false }))]);
        setShowFeedbackModal(false);
        setNewFb({ title: '', description: '' });
      }
    } catch (err) {
      console.error('Error creating feedback survey:', err);
    }
  };

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

  // Filter wardens based on Search query
  const filteredWardens = wardensList.filter(w => {
    const query = searchQuery.toLowerCase();
    const blocksStr = Array.isArray(w.blocks) ? w.blocks.join(' ') : (w.block || '');
    return (
      (w.name || '').toLowerCase().includes(query) ||
      (w.email || '').toLowerCase().includes(query) ||
      (w.phoneNo || '').toLowerCase().includes(query) ||
      blocksStr.toLowerCase().includes(query)
    );
  });

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

  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  return (
    <div className="management-dashboard-layout">
      
      {/* MOBILE BACKDROP OVERLAY */}
      {isMobileSidebarOpen && (
        <div 
          className="mobile-sidebar-backdrop" 
          onClick={() => setIsMobileSidebarOpen(false)}
        />
      )}

      {/* 1. DARK BLUE SIDEBAR */}
      <aside className={`management-sidebar ${isMobileSidebarOpen ? 'open-mobile' : ''}`}>
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
              onClick={() => {
                setActiveTab(item.id);
                setIsMobileSidebarOpen(false);
              }}
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
            <svg 
              className="menu-toggle-icon" 
              width="22" 
              height="22" 
              fill="none" 
              stroke="#475569" 
              strokeWidth="2.2" 
              viewBox="0 0 24 24"
              onClick={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}
            >
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

        {/* DASHBOARD TAB */}
        {activeTab === 'Dashboard' && (
          <div className="mgt-dashboard-view">

            {/* UNIVERSAL EVENT BANNER CARD */}
            {eventBanner && (
              <div style={{ marginBottom: '1.5rem' }}>
                <EventBannerCard banner={eventBanner} />
              </div>
            )}
            
            {/* ROW 1: LIVE MARQUEE TICKER STRIP */}
            {announcements.length > 0 && (
              <div className="announcements-ticker-strip">
                <div className="ticker-badge">
                  <span className="dot pulse"></span>
                  LATEST ANNOUNCEMENT
                </div>
                <div className="ticker-content">
                  <span className="ticker-title">{announcements[tickerIndex]?.title}:</span>
                  <span className="ticker-body">{announcements[tickerIndex]?.text || announcements[tickerIndex]?.content}</span>
                </div>
              </div>
            )}

            {/* ROW 2: 6 TOP SUMMARY METRICS CARDS */}
            <div className="six-stats-grid">
              
              {/* 1. Total Complaints */}
              <div className="mgt-stat-card">
                <div className="icon-side bg-blue-tint text-blue">
                  <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                  </svg>
                </div>
                <div className="label-side">
                  <span className="num">{stats.total}</span>
                  <span className="label">Total Complaints</span>
                  <span className="trend positive">↑ 12% vs last month</span>
                </div>
              </div>

              {/* 2. In Progress */}
              <div className="mgt-stat-card">
                <div className="icon-side bg-amber-tint text-amber">
                  <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="label-side">
                  <span className="num">{stats.inProgress}</span>
                  <span className="label">In Progress</span>
                  <span className="trend neutral">— Active processing</span>
                </div>
              </div>

              {/* 3. Resolved */}
              <div className="mgt-stat-card">
                <div className="icon-side bg-emerald-tint text-emerald">
                  <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="label-side">
                  <span className="num">{stats.resolved}</span>
                  <span className="label">Resolved Tickets</span>
                  <span className="trend positive">↑ 95% resolution rate</span>
                </div>
              </div>

              {/* 4. High Priority */}
              <div className="mgt-stat-card">
                <div className="icon-side bg-rose-tint text-rose">
                  <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L12 9z" />
                  </svg>
                </div>
                <div className="label-side">
                  <span className="num">{stats.highPriority}</span>
                  <span className="label">High Priority</span>
                  <span className="trend negative">↓ Urgent attention</span>
                </div>
              </div>

              {/* 5. Residents */}
              <div className="mgt-stat-card">
                <div className="icon-side bg-violet-tint text-violet">
                  <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0" />
                  </svg>
                </div>
                <div className="label-side">
                  <span className="num">{stats.residents}</span>
                  <span className="label">Total Residents</span>
                  <span className="trend positive">↑ Steady count</span>
                </div>
              </div>

              {/* 6. Active Workers */}
              <div className="mgt-stat-card">
                <div className="icon-side bg-cyan-tint text-cyan">
                  <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 6h9.75M10.5 6a1.5 1.5 0 11-3 0m3 0a1.5 1.5 0 10-3 0M3.75 6H7.5m3 12h9.75m-9.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-3.75 0H7.5m9-6h3.75m-3.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-9.75 0h9.75" />
                  </svg>
                </div>
                <div className="label-side">
                  <span className="num">{stats.activeWorkers}</span>
                  <span className="label">Active Staff</span>
                  <span className="trend neutral">— Full capacity</span>
                </div>
              </div>

            </div>

            {/* ROW 3: GRAPHS & BLOCK STATUS */}
            <div className="charts-overview-row">
              
              {/* Curve Graph */}
              <div className="overview-chart-card col-40" style={{ padding: '1.25rem' }}>
                <div className="chart-card-header" style={{ marginBottom: '0.75rem' }}>
                  <div>
                    <span className="title" style={{ fontSize: '1.05rem', fontWeight: 800, color: '#0f172a' }}>Complaint Trends</span>
                    <span className="subtitle" style={{ fontSize: '0.8rem', color: '#64748b' }}>Real-time active and resolved ticket logs</span>
                  </div>
                  <span className="chart-filter" style={{ backgroundColor: '#eff6ff', color: '#2563eb', padding: '0.25rem 0.65rem', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 700 }}>Live Data</span>
                </div>

                <div className="mgt-chart-area" style={{ padding: '0.5rem 0' }}>
                  <DynamicTrendsChart complaints={complaints} />
                </div>
              </div>

              {/* Donut Chart */}
              <div className="overview-chart-card col-30" style={{ padding: '1.25rem' }}>
                <div className="chart-card-header" style={{ marginBottom: '0.75rem' }}>
                  <span className="title" style={{ fontSize: '1.05rem', fontWeight: 800, color: '#0f172a' }}>Complaints by Category</span>
                </div>

                <div className="donut-chart-wrapper" style={{ padding: '0.5rem 0' }}>
                  <DynamicDonutChart complaints={complaints} />
                </div>
              </div>

              {/* Hostel Block status card grid */}
              <div className="overview-chart-card col-30">
                <div className="chart-card-header">
                  <span className="title">Hostel Blocks Status</span>
                  <button className="view-all-link" onClick={() => setActiveTab('Block Management')}>View All</button>
                </div>

                <div className="block-cards-grid">
                  {['A', 'B', 'C', 'D', 'E', 'F'].map(b => {
                    const cnt = residentsList.filter(r => (r.block || '').toUpperCase().includes(b)).length;
                    return (
                      <div key={b} className="block-progress-card">
                        <div className="block-card-head">
                          <span className="name">Block {b}</span>
                          <span className="cap">{cnt} Students</span>
                        </div>
                        <div className="progress-bg">
                          <div className="progress-fill" style={{ width: `${Math.min(100, (cnt / 10) * 100)}%` }}></div>
                        </div>
                        <span className="pct">{cnt} Registered</span>
                      </div>
                    );
                  })}
                </div>
              </div>

            </div>

            {/* ROW 4: RECENT COMPLAINTS TABLE & QUICK ACTIONS */}
            <div className="dashboard-grid-row-4">
              
              {/* Complaints Table */}
              <div className="mgt-widget-card col-60">
                <div className="widget-header">
                  <span className="title">Recent Complaints</span>
                  <button className="view-all-link" onClick={() => setActiveTab('Complaints Overview')}>View All</button>
                </div>

                <div className="complaints-table-container">
                  <table className="mgt-data-table">
                    <thead>
                      <tr>
                        <th>Title</th>
                        <th>Category</th>
                        <th>Location</th>
                        <th>Student</th>
                        <th>Status</th>
                        <th>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {complaints.slice(0, 5).map(c => (
                        <tr key={c.id || c._id}>
                          <td className="font-semibold">{c.title}</td>
                          <td>{c.category}</td>
                          <td>{c.location}</td>
                          <td>{c.studentName || 'Student'}</td>
                          <td>
                            <span className={`status-pill ${
                              c.status === 'Resolved' ? 'resolved' :
                              c.status === 'In Progress' ? 'in-progress' :
                              c.status === 'High Priority' ? 'high-priority' : 'open'
                            }`}>
                              {c.status}
                            </span>
                          </td>
                          <td>
                            <button className="table-action-btn" onClick={() => setSelectedComplaint(c)}>Details</button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Quick Actions Grid */}
              <div className="mgt-widget-card col-40">
                <div className="widget-header">
                  <span className="title">Management Quick Actions</span>
                </div>

                <div className="quick-actions-tile-grid">
                  {[
                    { label: 'View All Complaints', action: () => setActiveTab('Complaints Overview') },
                    { label: 'Manage Wardens', action: () => setActiveTab('Wardens') },
                    { label: 'Hostel Blocks', action: () => setActiveTab('Block Management') },
                    { label: 'Create Announcement', action: () => setActiveTab('Announcements') },
                    { label: 'Publish Feedback', action: () => setActiveTab('Feedback') },
                    { label: 'Account Settings', action: () => setActiveTab('Settings') }
                  ].map((act, idx) => (
                    <button key={idx} className="action-tile-btn" onClick={act.action}>
                      <span className="tile-label">{act.label}</span>
                    </button>
                  ))}
                </div>
              </div>

            </div>

          </div>
        )}

        {/* WARDENS MANAGEMENT TAB */}
        {activeTab === 'Wardens' && (
          <div className="fallback-tab-panel">
            <div className="section-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <div>
                <h2>Wardens Management</h2>
                <p style={{ color: '#64748b' }}>Complete list of block wardens, phone numbers & direct messaging</p>
              </div>
              <div style={{ maxWidth: '300px' }}>
                <input 
                  type="text" 
                  className="standard-input-field" 
                  placeholder="Search wardens..." 
                  value={searchQuery} 
                  onChange={(e) => setSearchQuery(e.target.value)} 
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.25rem' }}>
              {filteredWardens.length === 0 ? (
                <p style={{ color: '#64748b', textAlign: 'center', padding: '2rem 0', gridColumn: '1 / -1' }}>No wardens registered.</p>
              ) : (
                filteredWardens.map(w => (
                  <div 
                    key={w._id || w.email} 
                    className="mgt-widget-card" 
                    style={{ 
                      padding: '1.5rem', 
                      backgroundColor: 'rgba(255, 255, 255, 0.95)', 
                      backdropFilter: 'blur(12px)',
                      borderRadius: '16px', 
                      border: '1px solid rgba(226, 232, 240, 0.9)', 
                      borderTop: w.role === 'headwarden' ? '3px solid #f59e0b' : '3px solid #2563eb',
                      display: 'flex', 
                      flexDirection: 'column', 
                      justifyContent: 'space-between', 
                      boxShadow: '0 10px 25px -5px rgba(15, 23, 42, 0.06), 0 4px 6px -2px rgba(15, 23, 42, 0.02)'
                    }}
                  >
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
                        {w.profilePhoto ? (
                          <img src={w.profilePhoto} alt="warden" style={{ width: '54px', height: '54px', borderRadius: '50%', objectFit: 'cover', border: w.role === 'headwarden' ? '2.5px solid #f59e0b' : '2.5px solid #2563eb' }} />
                        ) : (
                          <div style={{ width: '54px', height: '54px', borderRadius: '50%', backgroundColor: '#0f172a', color: w.role === 'headwarden' ? '#fbbf24' : '#38bdf8', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '1.1rem', border: w.role === 'headwarden' ? '2px solid #f59e0b' : '2px solid #2563eb', boxShadow: '0 4px 10px rgba(15, 23, 42, 0.2)' }}>
                            {w.name?.split(' ').map(n=>n[0]).join('') || 'W'}
                          </div>
                        )}
                        <div>
                          <h3 style={{ margin: 0, fontSize: '1.1rem', color: '#0f172a', fontWeight: 800 }}>{w.name}</h3>
                          <span style={{ 
                            fontSize: '0.75rem', 
                            padding: '0.25rem 0.65rem', 
                            backgroundColor: w.role === 'headwarden' ? '#fffbeb' : '#eff6ff', 
                            border: w.role === 'headwarden' ? '1px solid #fde68a' : '1px solid #bfdbfe', 
                            borderRadius: '6px', 
                            color: w.role === 'headwarden' ? '#b45309' : '#1d4ed8', 
                            fontWeight: 700, 
                            display: 'inline-block', 
                            marginTop: '4px' 
                          }}>
                            {w.role === 'headwarden' ? '⭐ Head Warden (Overall)' : '🛡️ Block Warden'}
                          </span>
                        </div>
                      </div>

                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', fontSize: '0.88rem', color: '#0f172a', backgroundColor: 'rgba(248, 250, 252, 0.95)', padding: '1rem', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
                        <div>
                          <strong style={{ color: '#475569' }}>Assigned Blocks:</strong>{' '}
                          <span style={{ color: '#2563eb', fontWeight: 700 }}>
                            {Array.isArray(w.blocks) ? w.blocks.join(', ') : (w.block || 'A, B, C, D, E, F')}
                          </span>
                        </div>
                        <div>
                          <strong style={{ color: '#475569' }}>Phone Number:</strong>{' '}
                          <span style={{ color: '#0f172a', fontWeight: 700 }}>{w.phoneNo || 'N/A'}</span>
                        </div>
                        <div>
                          <strong style={{ color: '#475569' }}>Email:</strong>{' '}
                          <span style={{ color: '#0f172a', fontWeight: 600 }}>{w.email}</span>
                        </div>
                        <div>
                          <strong style={{ color: '#475569' }}>Office / Room:</strong>{' '}
                          <span style={{ color: '#0f172a', fontWeight: 600 }}>{w.roomNo || 'N/A'}</span>
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => setSelectedWardenChat(w)}
                      style={{
                        marginTop: '1.25rem',
                        width: '100%',
                        padding: '0.75rem',
                        backgroundColor: '#0f172a',
                        color: '#ffffff',
                        border: '1px solid rgba(245, 158, 11, 0.3)',
                        borderRadius: '10px',
                        fontWeight: 700,
                        fontSize: '0.9rem',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '0.5rem',
                        boxShadow: '0 4px 14px rgba(15, 23, 42, 0.18)'
                      }}
                    >
                      <svg width="17" height="17" fill="none" stroke="#fbbf24" strokeWidth="2.2" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                      </svg>
                      Message Warden
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* BLOCK MANAGEMENT TAB */}
        {activeTab === 'Block Management' && (
          <div className="fallback-tab-panel">
            <div className="section-header" style={{ marginBottom: '1.5rem' }}>
              <h2>Hostel Block Management</h2>
              <p style={{ color: '#64748b' }}>Live resident occupancy, assigned in-charge wardens & student rosters</p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.25rem' }}>
              {['A', 'B', 'C', 'D', 'E', 'F'].map(blockName => {
                const matchingStudents = residentsList.filter(s => {
                  const b = (s.block || '').trim().toUpperCase();
                  return b === blockName || b === `${blockName} BLOCK` || b.startsWith(blockName);
                });

                const matchingComplaints = complaints.filter(c => {
                  const b = (c.studentBlock || c.location || '').trim().toUpperCase();
                  return b === blockName || b === `${blockName} BLOCK` || b.includes(blockName);
                });

                const inChargeWarden = wardensList.find(w => {
                  if (Array.isArray(w.blocks)) {
                    return w.blocks.includes(blockName);
                  }
                  return (w.block || '').includes(blockName);
                });

                return (
                  <div key={blockName} className="mgt-widget-card" style={{ padding: '1.5rem', backgroundColor: '#fff', borderRadius: '12px', border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                          <div style={{ width: '44px', height: '44px', borderRadius: '10px', backgroundColor: '#eff6ff', color: '#2563eb', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '1.1rem' }}>
                            {blockName}
                          </div>
                          <div>
                            <h3 style={{ margin: 0, fontSize: '1.1rem', color: '#0f172a', fontWeight: 700 }}>{blockName} Block</h3>
                            <span style={{ fontSize: '0.78rem', color: '#64748b' }}>Main Hostel Campus</span>
                          </div>
                        </div>
                        <span style={{ fontSize: '0.85rem', fontWeight: 700, padding: '0.35rem 0.75rem', backgroundColor: '#f0fdf4', color: '#166534', borderRadius: '9999px', border: '1px solid #bbf7d0' }}>
                          {matchingStudents.length} Students Registered
                        </span>
                      </div>

                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', fontSize: '0.88rem', backgroundColor: '#f8fafc', padding: '0.85rem', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                        <div>
                          <strong style={{ color: '#64748b' }}>In-Charge Warden:</strong>{' '}
                          <span style={{ color: '#0f172a', fontWeight: 700 }}>
                            {inChargeWarden ? inChargeWarden.name : 'Head Warden'}
                          </span>
                        </div>
                        <div>
                          <strong style={{ color: '#64748b' }}>Contact Phone:</strong>{' '}
                          <span style={{ color: '#0f172a' }}>
                            {inChargeWarden ? (inChargeWarden.phoneNo || 'N/A') : '9876543215'}
                          </span>
                        </div>
                        <div>
                          <strong style={{ color: '#64748b' }}>Total Students in Block:</strong>{' '}
                          <span style={{ color: '#2563eb', fontWeight: 700 }}>{matchingStudents.length} Students</span>
                        </div>
                        <div>
                          <strong style={{ color: '#64748b' }}>Active Complaints:</strong>{' '}
                          <span style={{ color: matchingComplaints.length > 0 ? '#ef4444' : '#10b981', fontWeight: 700 }}>{matchingComplaints.length} Tickets</span>
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => setSelectedBlockDetail({ blockName, students: matchingStudents, warden: inChargeWarden })}
                      style={{
                        marginTop: '1.25rem',
                        width: '100%',
                        padding: '0.65rem',
                        backgroundColor: '#0f172a',
                        color: '#fff',
                        border: 'none',
                        borderRadius: '8px',
                        fontWeight: 650,
                        fontSize: '0.88rem',
                        cursor: 'pointer',
                        textAlign: 'center'
                      }}
                    >
                      View Student Roster ({matchingStudents.length})
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ANNOUNCEMENTS TAB */}
        {activeTab === 'Announcements' && (
          <div className="fallback-tab-panel">
            <div className="section-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <div>
                <h2>Announcements Management</h2>
                <p style={{ color: '#64748b' }}>Broadcast announcements across all hostel blocks, wardens, and staff</p>
              </div>
              <button 
                onClick={() => setShowAnnouncementModal(true)}
                style={{
                  backgroundColor: '#2563eb',
                  color: '#fff',
                  border: 'none',
                  padding: '0.65rem 1.25rem',
                  borderRadius: '8px',
                  fontWeight: 650,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.4rem'
                }}
              >
                + Post Announcement
              </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.25rem' }}>
              {announcements.length === 0 ? (
                <p style={{ color: '#64748b', textAlign: 'center', padding: '2rem 0', gridColumn: '1 / -1' }}>No announcements posted yet.</p>
              ) : (
                announcements.map(ann => (
                  <div key={ann.id || ann._id} className="mgt-widget-card" style={{ padding: '1.5rem', backgroundColor: '#fff', borderRadius: '12px', border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '0.5rem', marginBottom: '0.75rem' }}>
                        <h3 style={{ margin: 0, fontSize: '1.05rem', color: '#0f172a', fontWeight: 700 }}>{ann.title}</h3>
                        {ann.postedBy === 'Management' ? (
                          <span style={{ fontSize: '0.7rem', padding: '0.2rem 0.5rem', backgroundColor: '#2563eb', color: '#fff', borderRadius: '4px', fontWeight: 700, whiteSpace: 'nowrap' }}>
                            Management Announcement
                          </span>
                        ) : (
                          <span style={{ fontSize: '0.7rem', padding: '0.2rem 0.5rem', backgroundColor: '#f1f5f9', color: '#475569', borderRadius: '4px', fontWeight: 600, whiteSpace: 'nowrap' }}>
                            Warden Notice
                          </span>
                        )}
                      </div>

                      <p style={{ margin: '0 0 1rem', fontSize: '0.9rem', color: '#334155', lineHeight: 1.5, backgroundColor: '#f8fafc', padding: '0.85rem', borderRadius: '8px', border: '1px solid #f1f5f9', whiteSpace: 'pre-wrap' }}>
                        {ann.content || ann.text}
                      </p>
                    </div>

                    <div style={{ fontSize: '0.78rem', color: '#64748b', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #f1f5f9', paddingTop: '0.75rem' }}>
                      <span>Author: <strong>{ann.authorName || ann.postedBy || 'Hostel Admin'}</strong></span>
                      <span>{ann.date}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* FEEDBACK MANAGEMENT TAB */}
        {activeTab === 'Feedback' && (
          <div className="fallback-tab-panel">
            <div className="section-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <div>
                <h2>Campus Feedback Management</h2>
                <p style={{ color: '#64748b' }}>Publish student surveys & analyze rating feedback across hostel blocks</p>
              </div>
              <button 
                onClick={() => setShowFeedbackModal(true)}
                style={{
                  backgroundColor: '#0f172a',
                  color: '#fff',
                  border: 'none',
                  padding: '0.65rem 1.25rem',
                  borderRadius: '8px',
                  fontWeight: 650,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.4rem'
                }}
              >
                + Publish Survey Campaign
              </button>
            </div>

            {/* Metric Summary */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.25rem', marginBottom: '1.5rem' }}>
              <div className="mgt-stat-card" style={{ padding: '1.25rem', backgroundColor: '#fff', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                <span style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: 600 }}>Total Responses</span>
                <h3 style={{ fontSize: '1.75rem', margin: '0.35rem 0 0', color: '#0f172a', fontWeight: 800 }}>{feedbackResponses.length}</h3>
              </div>

              <div className="mgt-stat-card" style={{ padding: '1.25rem', backgroundColor: '#fff', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                <span style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: 600 }}>Campus Avg Rating</span>
                <h3 style={{ fontSize: '1.75rem', margin: '0.35rem 0 0', color: '#eab308', fontWeight: 800 }}>
                  {feedbackResponses.length > 0
                    ? (feedbackResponses.reduce((acc, r) => acc + (r.rating || 0), 0) / feedbackResponses.length).toFixed(1) + ' / 5.0 ⭐'
                    : 'N/A'}
                </h3>
              </div>

              <div className="mgt-stat-card" style={{ padding: '1.25rem', backgroundColor: '#fff', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                <span style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: 600 }}>Active Campaign</span>
                <h3 style={{ fontSize: '1rem', margin: '0.35rem 0 0', color: '#2563eb', fontWeight: 700, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {feedbackRequests.find(f => f.active)?.title || 'No active survey'}
                </h3>
              </div>
            </div>

            {/* Submissions List */}
            <div className="mgt-widget-card" style={{ padding: '1.5rem', backgroundColor: '#fff', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
              <h3 style={{ margin: '0 0 1rem', fontSize: '1.1rem', color: '#0f172a' }}>Student Submissions</h3>

              {feedbackResponses.length === 0 ? (
                <p style={{ color: '#64748b', textAlign: 'center', padding: '2rem 0' }}>No feedback submissions recorded yet.</p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  {feedbackResponses.map((fb, idx) => (
                    <div key={fb._id || idx} style={{ padding: '1rem', backgroundColor: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                          <strong style={{ color: '#0f172a', fontSize: '0.95rem' }}>{fb.studentName}</strong>
                          <span style={{ fontSize: '0.8rem', color: '#64748b' }}>({fb.studentEmail})</span>
                        </div>
                        <p style={{ margin: 0, fontSize: '0.9rem', color: '#334155' }}>{fb.comments || 'No comments provided.'}</p>
                      </div>

                      <div style={{ textAlign: 'right' }}>
                        <span style={{ color: '#eab308', fontWeight: 800, fontSize: '1.1rem' }}>
                          {'★'.repeat(fb.rating || 5)}{'☆'.repeat(5 - (fb.rating || 5))}
                        </span>
                        <span style={{ display: 'block', fontSize: '0.75rem', color: '#94a3b8', marginTop: '2px' }}>
                          {fb.createdAt ? new Date(fb.createdAt).toLocaleDateString() : ''}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* RESIDENTS TAB */}
        {activeTab === 'Residents' && (
          <div className="fallback-tab-panel">
            <div className="section-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <div>
                <h2>Registered Residents Directory</h2>
                <p style={{ color: '#64748b' }}>Complete directory of all registered hostel students</p>
              </div>
              <div style={{ maxWidth: '300px' }}>
                <input 
                  type="text" 
                  className="standard-input-field" 
                  placeholder="Filter residents..." 
                  value={searchQuery} 
                  onChange={(e) => setSearchQuery(e.target.value)} 
                />
              </div>
            </div>

            <div className="mgt-widget-card" style={{ padding: '1.5rem', backgroundColor: '#fff', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
              <div className="complaints-table-container">
                <table className="mgt-data-table">
                  <thead>
                    <tr>
                      <th>Resident Student</th>
                      <th>Roll No</th>
                      <th>Block</th>
                      <th>Room</th>
                      <th>Phone</th>
                      <th>Email</th>
                    </tr>
                  </thead>
                  <tbody>
                    {residentsList
                      .filter(r => r.name?.toLowerCase().includes(searchQuery.toLowerCase()) || r.email?.toLowerCase().includes(searchQuery.toLowerCase()) || r.block?.toLowerCase().includes(searchQuery.toLowerCase()))
                      .map(r => (
                        <tr key={r._id || r.email}>
                          <td className="font-semibold" style={{ display: 'flex', alignItems: 'center', gap: '0.55rem' }}>
                            {r.profilePhoto ? (
                              <img src={r.profilePhoto} alt="student" style={{ width: '28px', height: '28px', borderRadius: '50%', objectFit: 'cover' }} />
                            ) : (
                              <div style={{ width: '28px', height: '28px', borderRadius: '50%', backgroundColor: '#cbd5e1', color: '#334155', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '0.75rem' }}>
                                {r.name?.split(' ').map(n=>n[0]).join('') || 'S'}
                              </div>
                            )}
                            {r.name}
                          </td>
                          <td>{r.rollNo || '2021CS101'}</td>
                          <td><span style={{ fontWeight: 700, color: '#2563eb' }}>{r.block || 'D'} Block</span></td>
                          <td>{r.roomNo || '101'}</td>
                          <td>{r.phoneNo || '9876543210'}</td>
                          <td>{r.email}</td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* WORKERS TAB */}
        {activeTab === 'Maintenance Workers' && (
          <div className="fallback-tab-panel">
            <div className="section-header" style={{ marginBottom: '1.5rem' }}>
              <h2>Global Maintenance Staff Roster</h2>
              <p style={{ color: '#64748b' }}>Campus-wide maintenance workers, category distribution, and task loads</p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.25rem' }}>
              {workers.map(w => {
                const avatarLetters = w.avatar || (w.name ? w.name.split(' ').map(n=>n[0]).join('').toUpperCase().slice(0,2) : 'WK');
                return (
                  <div key={w._id || w.id || w.name} className="mgt-widget-card" style={{ padding: '1.25rem', backgroundColor: '#fff', borderRadius: '16px', border: '1px solid #e2e8f0', boxShadow: '0 4px 12px rgba(0,0,0,0.03)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <div style={{ width: '48px', height: '48px', borderRadius: '12px', backgroundColor: '#eff6ff', color: '#2563eb', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '1.1rem' }}>
                          {avatarLetters}
                        </div>
                        <div>
                          <h4 style={{ margin: 0, fontSize: '1.05rem', color: '#0f172a', fontWeight: 800 }}>{w.name}</h4>
                          <span style={{ fontSize: '0.8rem', color: '#2563eb', fontWeight: 700 }}>{w.category || w.role || 'Technician'}</span>
                        </div>
                      </div>
                      <span style={{
                        padding: '0.2rem 0.6rem',
                        borderRadius: '12px',
                        fontSize: '0.72rem',
                        fontWeight: 800,
                        backgroundColor: (w.status === 'Inactive') ? '#fef2f2' : '#d1fae5',
                        color: (w.status === 'Inactive') ? '#ef4444' : '#059669'
                      }}>
                        ● {w.status || 'Active'}
                      </span>
                    </div>

                    <div style={{ fontSize: '0.85rem', color: '#475569', display: 'flex', flexDirection: 'column', gap: '0.3rem', borderTop: '1px solid #f1f5f9', paddingTop: '0.75rem' }}>
                      <div><strong>Phone:</strong> {w.phone || 'N/A'}</div>
                      <div><strong>Email:</strong> {w.email || 'workers@campuscare.com'}</div>
                      {w.experience && <div><strong>Experience:</strong> {w.experience}</div>}
                      <div><strong>Active Task Orders:</strong> <span style={{ color: '#2563eb', fontWeight: 800 }}>{w.tasks || 0} active</span></div>
                    </div>
                  </div>
                );
              })}
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
                  <div key={c.id || c._id} className="mgt-widget-card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', padding: '1.25rem', border: '1px solid #e2e8f0', borderRadius: '10px', backgroundColor: '#fff', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03)', transition: 'transform 0.2s, box-shadow 0.2s', cursor: 'default' }}>
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

      </main>

      {/* DIRECT CHAT MODAL OVERLAY WITH WARDEN */}
      {selectedWardenChat && (
        <div className="modal-backdrop" style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 999 }}>
          <div className="modal-content" style={{ maxWidth: '560px', width: '90%', borderRadius: '12px', padding: '1.5rem', backgroundColor: '#fff', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #e2e8f0', paddingBottom: '0.85rem', marginBottom: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <div style={{ width: '42px', height: '42px', borderRadius: '50%', backgroundColor: '#0f172a', color: '#38bdf8', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>
                  <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: '1.1rem', color: '#0f172a', fontWeight: 700 }}>{selectedWardenChat.name}</h3>
                  <p style={{ margin: 0, fontSize: '0.8rem', color: '#64748b' }}>{selectedWardenChat.email} • Ph: {selectedWardenChat.phoneNo || 'N/A'}</p>
                </div>
              </div>
              <button 
                onClick={() => setSelectedWardenChat(null)}
                style={{ background: 'none', border: 'none', fontSize: '1.8rem', color: '#94a3b8', cursor: 'pointer', lineHeight: '0.5' }}
              >
                &times;
              </button>
            </div>

            {/* Chat Messages Log */}
            <div style={{ height: '340px', overflowY: 'auto', padding: '1rem', backgroundColor: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1rem' }}>
              {wardenMessages.length === 0 ? (
                <p style={{ color: '#94a3b8', textAlign: 'center', margin: 'auto', fontSize: '0.88rem' }}>No direct messages yet. Send a message to start the conversation!</p>
              ) : (
                wardenMessages.map((m, idx) => {
                  const isMgt = m.sender === 'management';
                  return (
                    <div key={m._id || idx} style={{ alignSelf: isMgt ? 'flex-end' : 'flex-start', maxWidth: '80%' }}>
                      <div style={{
                        padding: '0.75rem 1rem',
                        borderRadius: isMgt ? '12px 12px 2px 12px' : '12px 12px 12px 2px',
                        backgroundColor: isMgt ? '#0f172a' : '#ffffff',
                        color: isMgt ? '#ffffff' : '#0f172a',
                        boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
                        border: isMgt ? 'none' : '1px solid #e2e8f0',
                        fontSize: '0.9rem'
                      }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.25rem', gap: '0.75rem' }}>
                          <span style={{ fontSize: '0.75rem', fontWeight: 700, color: isMgt ? '#38bdf8' : '#2563eb' }}>
                            {isMgt ? 'Management Executive' : selectedWardenChat.name}
                          </span>
                          <span style={{ fontSize: '0.65rem', opacity: 0.8 }}>
                            {m.time || 'Just now'}
                          </span>
                        </div>
                        <p style={{ margin: 0, lineHeight: 1.45, whiteSpace: 'pre-wrap' }}>{m.text}</p>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Message Input Form */}
            <form onSubmit={handleSendWardenMessage} style={{ display: 'flex', gap: '0.5rem' }}>
              <input
                type="text"
                className="standard-input-field"
                placeholder={`Type message to ${selectedWardenChat.name}...`}
                value={wardenMsgText}
                onChange={(e) => setWardenMsgText(e.target.value)}
                style={{ flex: 1, padding: '0.75rem 1rem', border: '1px solid #cbd5e1', borderRadius: '8px', fontSize: '0.9rem', outline: 'none' }}
              />
              <button 
                type="submit"
                style={{ 
                  backgroundColor: '#0f172a', 
                  color: '#fff', 
                  border: 'none', 
                  padding: '0.75rem 1.4rem', 
                  borderRadius: '8px', 
                  fontWeight: 650, 
                  cursor: 'pointer',
                  fontSize: '0.88rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.4rem'
                }}
              >
                <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3 21l18-9L3 3l3 9zm0 0h7" />
                </svg>
                Send
              </button>
            </form>
          </div>
        </div>
      )}

      {/* STUDENT ROSTER MODAL FOR A HOSTEL BLOCK */}
      {selectedBlockDetail && (
        <div className="modal-backdrop" style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 999 }}>
          <div className="modal-content" style={{ maxWidth: '650px', width: '90%', borderRadius: '12px', padding: '1.5rem', backgroundColor: '#fff', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #e2e8f0', paddingBottom: '0.85rem', marginBottom: '1rem' }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '1.2rem', color: '#0f172a' }}>{selectedBlockDetail.blockName} Block Student Roster</h3>
                <p style={{ margin: 0, fontSize: '0.82rem', color: '#64748b' }}>
                  Total Registered: <strong>{selectedBlockDetail.students.length} Students</strong> • In-Charge: <strong>{selectedBlockDetail.warden?.name || 'Head Warden'}</strong>
                </p>
              </div>
              <button 
                onClick={() => setSelectedBlockDetail(null)}
                style={{ background: 'none', border: 'none', fontSize: '1.8rem', color: '#94a3b8', cursor: 'pointer', lineHeight: '0.5' }}
              >
                &times;
              </button>
            </div>

            <div style={{ maxHeight: '60vh', overflowY: 'auto' }}>
              {selectedBlockDetail.students.length === 0 ? (
                <p style={{ color: '#64748b', textAlign: 'center', padding: '2rem 0' }}>No students registered in {selectedBlockDetail.blockName} Block yet.</p>
              ) : (
                <table className="mgt-data-table">
                  <thead>
                    <tr>
                      <th>Student</th>
                      <th>Roll No</th>
                      <th>Room</th>
                      <th>Phone</th>
                      <th>Email</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedBlockDetail.students.map(s => (
                      <tr key={s._id || s.email}>
                        <td className="font-semibold" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          {s.profilePhoto ? (
                            <img src={s.profilePhoto} alt="s" style={{ width: '26px', height: '26px', borderRadius: '50%', objectFit: 'cover' }} />
                          ) : (
                            <div style={{ width: '26px', height: '26px', borderRadius: '50%', backgroundColor: '#e2e8f0', color: '#475569', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', fontWeight: 'bold' }}>
                              {s.name?.split(' ').map(n=>n[0]).join('') || 'S'}
                            </div>
                          )}
                          {s.name}
                        </td>
                        <td>{s.rollNo || '2021CS101'}</td>
                        <td>{s.roomNo || '101'}</td>
                        <td>{s.phoneNo || '9876543210'}</td>
                        <td>{s.email}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>
      )}

      {/* POST MANAGEMENT ANNOUNCEMENT MODAL */}
      {showAnnouncementModal && (
        <div className="modal-backdrop" style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 999 }}>
          <div className="modal-content" style={{ maxWidth: '520px', width: '90%', borderRadius: '12px', padding: '1.5rem', backgroundColor: '#fff', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #e2e8f0', paddingBottom: '0.85rem', marginBottom: '1rem' }}>
              <h3 style={{ margin: 0, fontSize: '1.2rem', color: '#0f172a' }}>Post Campus Announcement</h3>
              <button 
                onClick={() => setShowAnnouncementModal(false)}
                style={{ background: 'none', border: 'none', fontSize: '1.8rem', color: '#94a3b8', cursor: 'pointer', lineHeight: '0.5' }}
              >
                &times;
              </button>
            </div>

            <form onSubmit={handlePostManagementAnnouncement}>
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#334155', marginBottom: '0.35rem' }}>Title</label>
                <input 
                  type="text" 
                  className="standard-input-field" 
                  placeholder="e.g. Water Maintenance Notice" 
                  value={newAnn.title} 
                  onChange={(e) => setNewAnn({ ...newAnn, title: e.target.value })} 
                  required 
                  style={{ width: '100%', padding: '0.6rem', border: '1px solid #cbd5e1', borderRadius: '6px' }} 
                />
              </div>

              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#334155', marginBottom: '0.35rem' }}>Announcement Content</label>
                <textarea 
                  rows="4" 
                  className="standard-input-field" 
                  placeholder="Type the announcement description..." 
                  value={newAnn.content} 
                  onChange={(e) => setNewAnn({ ...newAnn, content: e.target.value })} 
                  required 
                  style={{ width: '100%', padding: '0.6rem', border: '1px solid #cbd5e1', borderRadius: '6px' }}
                ></textarea>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#334155', marginBottom: '0.35rem' }}>Priority</label>
                  <select 
                    value={newAnn.priority} 
                    onChange={(e) => setNewAnn({ ...newAnn, priority: e.target.value })}
                    style={{ width: '100%', padding: '0.6rem', border: '1px solid #cbd5e1', borderRadius: '6px', backgroundColor: '#fff' }}
                  >
                    <option value="Normal">Normal</option>
                    <option value="Urgent">Urgent</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#334155', marginBottom: '0.35rem' }}>Category</label>
                  <select 
                    value={newAnn.category} 
                    onChange={(e) => setNewAnn({ ...newAnn, category: e.target.value })}
                    style={{ width: '100%', padding: '0.6rem', border: '1px solid #cbd5e1', borderRadius: '6px', backgroundColor: '#fff' }}
                  >
                    <option value="General">General</option>
                    <option value="Maintenance">Maintenance</option>
                    <option value="Event">Event</option>
                    <option value="Hostel Rule">Hostel Rule</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
                <button type="button" onClick={() => setShowAnnouncementModal(false)} style={{ padding: '0.65rem 1.25rem', border: '1px solid #cbd5e1', borderRadius: '6px', backgroundColor: '#fff', cursor: 'pointer' }}>Cancel</button>
                <button type="submit" style={{ padding: '0.65rem 1.5rem', border: 'none', borderRadius: '6px', backgroundColor: '#2563eb', color: '#fff', fontWeight: 650, cursor: 'pointer' }}>Publish Announcement</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CREATE MANAGEMENT FEEDBACK SURVEY MODAL */}
      {showFeedbackModal && (
        <div className="modal-backdrop" style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 999 }}>
          <div className="modal-content" style={{ maxWidth: '520px', width: '90%', borderRadius: '12px', padding: '1.5rem', backgroundColor: '#fff', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #e2e8f0', paddingBottom: '0.85rem', marginBottom: '1rem' }}>
              <h3 style={{ margin: 0, fontSize: '1.2rem', color: '#0f172a' }}>Publish Feedback Survey</h3>
              <button 
                onClick={() => setShowFeedbackModal(false)}
                style={{ background: 'none', border: 'none', fontSize: '1.8rem', color: '#94a3b8', cursor: 'pointer', lineHeight: '0.5' }}
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleCreateManagementFeedback}>
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#334155', marginBottom: '0.35rem' }}>Survey Title</label>
                <input 
                  type="text" 
                  className="standard-input-field" 
                  placeholder="e.g. Monthly Hostel Mess & Cleaning Feedback" 
                  value={newFb.title} 
                  onChange={(e) => setNewFb({ ...newFb, title: e.target.value })} 
                  required 
                  style={{ width: '100%', padding: '0.6rem', border: '1px solid #cbd5e1', borderRadius: '6px' }} 
                />
              </div>

              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#334155', marginBottom: '0.35rem' }}>Survey Description / Instructions</label>
                <textarea 
                  rows="4" 
                  className="standard-input-field" 
                  placeholder="Please rate your experience with food quality and cleanliness..." 
                  value={newFb.description} 
                  onChange={(e) => setNewFb({ ...newFb, description: e.target.value })} 
                  required 
                  style={{ width: '100%', padding: '0.6rem', border: '1px solid #cbd5e1', borderRadius: '6px' }}
                ></textarea>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
                <button type="button" onClick={() => setShowFeedbackModal(false)} style={{ padding: '0.65rem 1.25rem', border: '1px solid #cbd5e1', borderRadius: '6px', backgroundColor: '#fff', cursor: 'pointer' }}>Cancel</button>
                <button type="submit" style={{ padding: '0.65rem 1.5rem', border: 'none', borderRadius: '6px', backgroundColor: '#0f172a', color: '#fff', fontWeight: 650, cursor: 'pointer' }}>Publish Survey</button>
              </div>
            </form>
          </div>
        </div>
      )}

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

              <div style={{ marginBottom: '1.5rem' }}>
                <h5 style={{ margin: '0 0 0.5rem', fontSize: '0.85rem', color: '#475569', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600 }}>Detailed Description</h5>
                <p style={{ margin: 0, fontSize: '0.95rem', color: '#0f172a', lineHeight: 1.5, backgroundColor: '#f8fafc', padding: '0.85rem', borderRadius: '8px', border: '1px solid #e2e8f0', whiteSpace: 'pre-wrap' }}>
                  {selectedComplaint.description || 'No detailed description provided.'}
                </p>
              </div>

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
