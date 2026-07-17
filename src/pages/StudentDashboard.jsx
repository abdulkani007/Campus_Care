// src/pages/StudentDashboard.jsx
import React, { useState, useEffect, useCallback } from 'react';
import SpecularButton from '../components/SpecularButton';
import '../styles/StudentDashboard.css';
import logo from '../assets/CC.png';

const StudentDashboard = ({ user, onLogout, onUpdateProfile }) => {
  const [activeTab, setActiveTab] = useState('Dashboard');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Profile state prefilled with student details
  const [profile, setProfile] = useState({
    name: user?.name || 'Student Resident',
    email: user?.email || 'student@gmail.com',
    rollNo: user?.rollNo || '2021CS101',
    phoneNo: user?.phoneNo || '9876543210',
    roomNo: user?.roomNo || '305',
    block: user?.block || 'C'
  });

  useEffect(() => {
    if (user) {
      setProfile({
        name: user.name,
        email: user.email,
        rollNo: user.rollNo,
        phoneNo: user.phoneNo,
        roomNo: user.roomNo,
        block: user.block
      });
    }
  }, [user]);

  // Dropdowns
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showMails, setShowMails] = useState(false);

  // States fetched from API
  const [complaints, setComplaints] = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  const [seenAnnouncementsCount, setSeenAnnouncementsCount] = useState(0);
  const [chatMessages, setChatMessages] = useState([]);
  const [activeFeedbackRequest, setActiveFeedbackRequest] = useState(null);
  const [submittedFeedback, setSubmittedFeedback] = useState(false);
  const [feedbackRating, setFeedbackRating] = useState(5);
  const [feedbackComments, setFeedbackComments] = useState('');
  const [newMsgText, setNewMsgText] = useState('');
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [zoomImage, setZoomImage] = useState(null);
  const [eventBanner, setEventBanner] = useState(null);
  const [editingMessageId, setEditingMessageId] = useState(null);
  const [editingText, setEditingText] = useState('');

  // Stats computed from complaints list
  const [stats, setStats] = useState({
    total: 0,
    inProgress: 0,
    resolved: 0,
    open: 0
  });

  // Lodge complaint modal trigger
  const [showComplaintModal, setShowComplaintModal] = useState(false);
  const [complaintForm, setComplaintForm] = useState({
    title: '',
    category: 'Electrical',
    priority: 'Medium',
    description: '',
    customLocation: '',
    phone: '',
    proof: '',
    proofName: ''
  });

  useEffect(() => {
    if (profile && profile.phoneNo) {
      setComplaintForm(prev => ({ ...prev, phone: profile.phoneNo }));
    }
  }, [profile]);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      alert("File size must be under 2MB.");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setComplaintForm(prev => ({
        ...prev,
        proof: reader.result,
        proofName: file.name
      }));
    };
    reader.readAsDataURL(file);
  };

  const fetchFeedbackCampaign = useCallback(async () => {
    try {
      const feedbackReqRes = await fetch('/api/feedback-requests/active');
      if (feedbackReqRes.ok) {
        const activeRequests = await feedbackReqRes.json();
        if (activeRequests && activeRequests.length > 0) {
          const activeReq = activeRequests[0];
          setActiveFeedbackRequest(activeReq);
          const reqId = activeReq._id || activeReq.id;
          const feedbackResRes = await fetch(`/api/feedback-responses?feedbackRequestId=${reqId}&studentEmail=${encodeURIComponent(profile.email)}`);
          if (feedbackResRes.ok) {
            const responses = await feedbackResRes.json();
            if (responses && responses.length > 0) {
              setSubmittedFeedback(true);
            } else {
              setSubmittedFeedback(false);
            }
          }
        } else {
          setActiveFeedbackRequest(null);
          setSubmittedFeedback(false);
        }
      }
    } catch (err) {
      console.error('Error fetching feedback campaign:', err);
    }
  }, [profile.email]);

  // Fetch student data on load
  useEffect(() => {
    const fetchData = async () => {
      try {
        const complaintsRes = await fetch('/api/complaints');
        const announcementsRes = await fetch('/api/announcements');
        const messagesRes = await fetch(`/api/messages?studentEmail=${encodeURIComponent(profile.email)}`);
        const bannerRes = await fetch('/api/event-banner');
        
        if (complaintsRes.ok) {
          const complaintsData = await complaintsRes.json();
          setComplaints(complaintsData);
        }
        if (announcementsRes.ok) {
          const announcementsData = await announcementsRes.json();
          setAnnouncements(announcementsData);
        }
        if (messagesRes.ok) {
          const messagesData = await messagesRes.json();
          setChatMessages(messagesData);
        }
        if (bannerRes.ok) {
          const bannerData = await bannerRes.json();
          if (bannerData) {
            setEventBanner(bannerData);
          }
        }

        fetchFeedbackCampaign();
      } catch (err) {
        console.error('Error fetching student dashboard data:', err);
      }
    };
    
    fetchData();
  }, [profile.email, fetchFeedbackCampaign]);

  // Compute stats on complaints change
  useEffect(() => {
    const total = complaints.length;
    const inProgress = complaints.filter(c => c.status === 'In Progress').length;
    const resolved = complaints.filter(c => c.status === 'Resolved').length;
    const open = complaints.filter(c => c.status === 'Open' || c.status === 'High Priority').length;

    setStats({ total, inProgress, resolved, open });
  }, [complaints]);

  const markAsRead = useCallback(async () => {
    try {
      const res = await fetch('/api/messages/read', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ studentEmail: profile.email, sender: 'warden' })
      });
      if (res.ok) {
        setChatMessages(prev => prev.map(m => 
          m.sender === 'warden' ? { ...m, read: true } : m
        ));
      }
    } catch (err) {
      console.error(err);
    }
  }, [profile.email]);

  useEffect(() => {
    if (activeTab === 'Messages') {
      markAsRead();
    }
  }, [activeTab, chatMessages.length, markAsRead]);

  const handleFeedbackSubmit = async (e) => {
    e.preventDefault();
    if (!activeFeedbackRequest) return;
    const reqId = activeFeedbackRequest._id || activeFeedbackRequest.id;
    try {
      const res = await fetch('/api/feedback-responses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          feedbackRequestId: reqId,
          studentEmail: profile.email,
          studentName: profile.name,
          rating: feedbackRating,
          comments: feedbackComments
        })
      });
      if (res.ok) {
        setSubmittedFeedback(true);
        alert('Thank you for your feedback!');
      } else {
        const errorData = await res.json();
        alert(`Failed to submit feedback: ${errorData.error || 'Unknown error'}`);
      }
    } catch (err) {
      console.error(err);
      alert('Error submitting feedback. Please try again.');
    }
  };

  // Lodge a complaint
  const handleLodgeComplaint = async (e) => {
    e.preventDefault();
    if (!complaintForm.title || !complaintForm.description || !complaintForm.phone) {
      alert('Please fill out all required fields.');
      return;
    }

    const resolvedLocation = complaintForm.customLocation || `Block ${profile.block} - Room ${profile.roomNo}`;
    
    try {
      const res = await fetch('/api/complaints', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: complaintForm.title,
          category: complaintForm.category,
          priority: complaintForm.priority,
          description: complaintForm.description,
          location: resolvedLocation,
          studentName: profile.name,
          studentPhone: complaintForm.phone,
          studentRoll: profile.rollNo,
          studentRoom: profile.roomNo,
          studentBlock: profile.block,
          studentEmail: profile.email,
          proof: complaintForm.proof || null,
          proofName: complaintForm.proofName || null
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setComplaints(prev => [data.complaint, ...prev]);

        // Reset form and close
        setComplaintForm({
          title: '',
          category: 'Electrical',
          priority: 'Medium',
          description: '',
          customLocation: '',
          phone: profile.phoneNo || '',
          proof: '',
          proofName: ''
        });
        setShowComplaintModal(false);
        alert('Complaint submitted successfully!');
      } else {
        alert('Failed to register complaint.');
      }
    } catch (err) {
      console.error(err);
      alert('Error submitting complaint.');
    }
  };

  // Send message to warden
  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMsgText.trim()) return;

    try {
      const res = await fetch('/api/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: newMsgText,
          sender: 'student',
          studentEmail: profile.email,
          studentName: profile.name
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setChatMessages(prev => [...prev, data.message]);
        setNewMsgText('');
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Edit Message
  const handleEditMessage = async (msgId, newText) => {
    try {
      const res = await fetch(`/api/messages/${msgId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text: newText }),
      });
      if (res.ok) {
        const data = await res.json();
        setChatMessages(prev => prev.map(m => (m._id === msgId || m.id === msgId) ? data.message : m));
        setEditingMessageId(null);
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Delete Message
  const handleDeleteMessage = async (msgId) => {
    if (!confirm('Are you sure you want to delete this message?')) return;
    try {
      const res = await fetch(`/api/messages/${msgId}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        setChatMessages(prev => prev.filter(m => m._id !== msgId && m.id !== msgId));
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Save profile changes
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
          role: 'student',
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

  // Helper to format date
  const getRelativeTime = (timeStr) => {
    return timeStr || 'Just now';
  };

  // Helper for category icon styling
  const getCategoryIcon = (category) => {
    switch (category) {
      case 'Water Supply':
        return (
          <svg width="18" height="18" fill="none" stroke="#2563eb" strokeWidth="2.5" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.105-7.5 11.25-7.5 11.25S4.5 17.605 4.5 10.5a7.5 7.5 0 1115 0z" />
          </svg>
        );
      case 'Internet':
        return (
          <svg width="18" height="18" fill="none" stroke="#8b5cf6" strokeWidth="2.5" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M8.284 16.284A3 3 0 0012 17a3 3 0 003.716-1.716M5.456 13.456a6.5 6.5 0 0113.088 0M2.628 10.628a10.5 10.5 0 0118.744 0" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 20h.01" />
          </svg>
        );
      case 'Electrical':
      default:
        return (
          <svg width="18" height="18" fill="none" stroke="#eab308" strokeWidth="2.5" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
          </svg>
        );
    }
  };

  // Filter complaints based on Search query
  const filteredComplaints = complaints.filter(c => 
    c.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
    c.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.status.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="student-dashboard-layout">
      
      {/* SIDEBAR */}
      <aside className="student-sidebar">
        <div className="sidebar-brand">
          <img src={logo} alt="Campus Care" className="brand-logo" />
          <span className="brand-text">CampusCare</span>
        </div>

        <nav className="sidebar-nav">
          {[
            { id: 'Dashboard', label: 'Dashboard', icon: (
              <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
            )},
            { id: 'My Complaints', label: 'My Complaints', icon: (
              <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
              </svg>
            )},
            { id: 'New Complaint', label: 'New Complaint', icon: (
              <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
              </svg>
            )},
            { id: 'Announcements', label: 'Announcements', icon: (
              <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
              </svg>
            )},
            { id: 'Messages', label: 'Messages', icon: (
              <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            ), badge: chatMessages.filter(m => m.sender === 'warden').length > 0 ? chatMessages.filter(m => m.sender === 'warden').length : null },
            { id: 'Feedback', label: 'Feedback', icon: (
              <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.907c.969 0 1.371 1.24.588 1.81l-3.97 2.883a1 1 0 00-.364 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.971-2.883a1 1 0 00-1.178 0l-3.97 2.883c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.364-1.118l-3.97-2.883c-.783-.57-.38-1.81.588-1.81h4.906a1 1 0 00.95-.69l1.519-4.674z" />
              </svg>
            )},
            { id: 'Profile', label: 'Profile', icon: (
              <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
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
              className={`sidebar-nav-btn ${activeTab === item.id ? 'active' : ''}`}
              onClick={() => {
                if (item.id === 'New Complaint') {
                  setShowComplaintModal(true);
                } else {
                  setActiveTab(item.id);
                  if (item.id === 'Feedback') {
                    fetchFeedbackCampaign();
                  }
                }
              }}
            >
              <span className="sidebar-icon">{item.icon}</span>
              <span className="sidebar-label">{item.label}</span>
              {item.badge && <span className="sidebar-badge">{item.badge}</span>}
            </button>
          ))}
        </nav>

        <div className="sidebar-footer">
          <button className="logout-action-btn" onClick={onLogout}>
            <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" style={{ marginRight: '8px' }}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            Logout
          </button>
        </div>
      </aside>

      {/* MAIN CONTAINER */}
      <main className="student-main-content">
        
        {/* HEADER */}
        <header className="student-header">
          <div className="header-meta-left">
            <svg width="24" height="24" fill="none" stroke="#64748b" strokeWidth="2" viewBox="0 0 24 24" style={{ cursor: 'pointer', marginRight: '1rem' }}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
            <div>
              <h1 className="header-title">Dashboard</h1>
              <p className="header-greeting">Welcome back, {profile.name.split(' ')[0]}!</p>
            </div>
          </div>

          <div className="header-meta-right">
            {/* Search Input in Header */}
            <div className="search-wrapper">
              <svg className="search-icon-svg" width="16" height="16" fill="none" stroke="#94a3b8" strokeWidth="2.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                placeholder="Search..."
                className="header-search-bar"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            {/* Notification Bell */}
            <div className="header-action-bell" onClick={() => {
              const nextShow = !showNotifications;
              setShowNotifications(nextShow);
              if (nextShow) {
                setSeenAnnouncementsCount(announcements.length);
              }
              setShowMails(false);
              setShowProfileMenu(false);
            }}>
              <svg width="22" height="22" fill="none" stroke="#475569" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
              {announcements.length > seenAnnouncementsCount && (
                <span className="bell-badge-count">{announcements.length - seenAnnouncementsCount}</span>
              )}

              {showNotifications && (
                <div className="dropdown-notifications">
                  <div className="drop-title">Hostel Announcements</div>
                  {announcements.length === 0 ? (
                    <div className="drop-item-box" style={{ color: '#94a3b8' }}>No new announcements</div>
                  ) : (
                    announcements.slice(0, 5).map(ann => (
                      <div key={ann.id} className="drop-item-box">
                        <span style={{ fontWeight: 600, display: 'block', marginBottom: '0.15rem' }}>{ann.text}</span>
                        <span style={{ fontSize: '0.65rem', color: '#94a3b8' }}>{ann.date}</span>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>

            {/* Mail Button */}
            <div className="header-action-bell" onClick={() => { setShowMails(!showMails); setShowNotifications(false); setShowProfileMenu(false); }} style={{ position: 'relative' }}>
              <svg width="22" height="22" fill="none" stroke="#475569" strokeWidth="2.2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              {chatMessages.filter(m => m.sender === 'warden' && !m.read).length > 0 && (
                <span className="bell-badge-count" style={{ backgroundColor: '#2563eb' }}>
                  {chatMessages.filter(m => m.sender === 'warden' && !m.read).length}
                </span>
              )}

              {showMails && (
                <div className="dropdown-notifications" style={{ right: 0, width: '280px' }}>
                  <div className="drop-title" style={{ paddingBottom: '0.5rem', borderBottom: '1px solid #e2e8f0', marginBottom: '0.5rem' }}>Messages</div>
                  <div style={{ maxHeight: '240px', overflowY: 'auto' }}>
                    {chatMessages.filter(m => m.sender === 'warden' && !m.read).length === 0 ? (
                      <div className="drop-item-box" style={{ color: '#94a3b8', textAlign: 'center', padding: '1rem 0' }}>No unread warden messages.</div>
                    ) : (
                      chatMessages.filter(m => m.sender === 'warden' && !m.read).slice(-5).reverse().map((msg, index) => (
                        <div 
                          key={msg.id || msg._id || index} 
                          className="drop-item-box" 
                          onClick={() => setActiveTab('Messages')}
                          style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.5rem 0.25rem', borderBottom: '1px solid #f1f5f9', cursor: 'pointer' }}
                        >
                          <div style={{ width: '32px', height: '32px', borderRadius: '50%', backgroundColor: '#e2e8f0', color: '#0f172a', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '0.8rem' }}>
                            W
                          </div>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <p style={{ margin: 0, fontWeight: 600, fontSize: '0.85rem', color: '#0f172a' }}>
                              Warden
                            </p>
                            <p style={{ margin: '2px 0 0', fontSize: '0.75rem', color: '#64748b', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                              {msg.text}
                            </p>
                            <span style={{ fontSize: '0.65rem', color: '#94a3b8', display: 'block', marginTop: '2px' }}>{msg.time}</span>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                  <div 
                    onClick={() => setActiveTab('Messages')}
                    style={{ padding: '0.5rem 0 0', textAlign: 'center', fontSize: '0.85rem', color: '#2563eb', fontWeight: 600, borderTop: '1px solid #e2e8f0', marginTop: '0.5rem', cursor: 'pointer' }}
                  >
                    Open Message Center
                  </div>
                </div>
              )}
            </div>

            {/* Student Avatar Card */}
            <div 
              className="student-avatar-card"
              onClick={() => setShowProfileMenu(!showProfileMenu)}
            >
              <div className="avatar-circle" style={{ overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {profile.profilePhoto ? (
                  <img src={profile.profilePhoto} alt="avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  profile.name.split(' ').map(n=>n[0]).join('')
                )}
              </div>
              <div className="avatar-meta">
                <span className="name">{profile.name}</span>
                <span className="location">Room {profile.roomNo}, Block {profile.block}</span>
              </div>

              {showProfileMenu && (
                <div className="avatar-dropdown-links">
                  <div className="dropdown-link" onClick={() => setActiveTab('Profile')}>My Profile</div>
                  <div className="dropdown-link" onClick={() => setActiveTab('Settings')}>Settings</div>
                  <div className="dropdown-link logout-btn" onClick={onLogout}>Logout</div>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* BODY SWITCH */}
        <div className="student-body-content">
          
          {/* TAB 1: CORE DASHBOARD */}
          {activeTab === 'Dashboard' && (
            <div className="dashboard-grid-layout">
              
              {/* Event Banner for Students */}
              {eventBanner && eventBanner.title && eventBanner.active && (
                <div style={{ 
                  background: 'linear-gradient(135deg, #1e1b4b 0%, #311042 100%)', 
                  borderRadius: '12px', 
                  padding: '1.5rem', 
                  marginBottom: '1.5rem', 
                  color: '#fff', 
                  position: 'relative',
                  overflow: 'hidden',
                  gridColumn: '1 / -1',
                  boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.3)'
                }}>
                  {eventBanner.bannerImage && (
                    <div style={{ position: 'absolute', right: 0, top: 0, bottom: 0, width: '45%', opacity: 0.2 }}>
                      <img src={eventBanner.bannerImage} alt="Event Banner" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    </div>
                  )}
                  <div style={{ position: 'relative', zIndex: 2 }}>
                    <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.1em', backgroundColor: '#e11d48', padding: '0.25rem 0.5rem', borderRadius: '4px', fontWeight: 'bold', display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
                      <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19.114 5.636a9 9 0 010 12.728M16.463 8.288a5.25 5.25 0 010 7.424M6.75 8.25l4.72-4.72a.75.75 0 011.28.53v15.88a.75.75 0 01-1.28.53l-4.72-4.72H4.51c-.88 0-1.704-.507-1.938-1.354A9.01 9.01 0 012.25 12c0-.83.112-1.633.322-2.396C2.806 8.756 3.63 8.25 4.51 8.25H6.75z" />
                      </svg>
                      Hostel Event Announcement
                    </span>
                    <h3 style={{ fontSize: '1.75rem', margin: '0.5rem 0 0.25rem', color: '#fff', fontWeight: 800 }}>{eventBanner.title}</h3>
                    <p style={{ margin: '0.25rem 0 1rem', fontSize: '0.95rem', color: '#cbd5e1', maxWidth: '60%' }}>{eventBanner.description}</p>
                    <div style={{ fontSize: '0.9rem', color: '#fda4af', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                      <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
                      </svg>
                      Scheduled: {eventBanner.date || 'To be announced'}
                    </div>
                  </div>
                </div>
              )}

              {/* STAT CARDS BANNER ROW */}
              <div className="stat-cards-bar-card">
                
                {/* 1. Total Complaints */}
                <div className="bar-stat-column">
                  <div className="stat-icon bg-blue-tint text-blue">
                    <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                    </svg>
                  </div>
                  <div>
                    <span className="stat-number">{String(stats.total).padStart(2, '0')}</span>
                    <span className="stat-label">Total Complaints</span>
                  </div>
                </div>

                {/* 2. In Progress */}
                <div className="bar-stat-column">
                  <div className="stat-icon bg-orange-tint text-orange">
                    <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div>
                    <span className="stat-number">{String(stats.inProgress).padStart(2, '0')}</span>
                    <span className="stat-label">In Progress</span>
                  </div>
                </div>

                {/* 3. Resolved */}
                <div className="bar-stat-column">
                  <div className="stat-icon bg-green-tint text-green">
                    <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div>
                    <span className="stat-number">{String(stats.resolved).padStart(2, '0')}</span>
                    <span className="stat-label">Resolved</span>
                  </div>
                </div>

                {/* 4. Open */}
                <div className="bar-stat-column">
                  <div className="stat-icon bg-red-tint text-red">
                    <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
                    </svg>
                  </div>
                  <div>
                    <span className="stat-number">{String(stats.open).padStart(2, '0')}</span>
                    <span className="stat-label">Open</span>
                  </div>
                </div>

              </div>

              {/* GRID ROW 1: MY COMPLAINTS & LODGE AD BANNER */}
              <div className="grid-flex-row">
                
                {/* My Complaints */}
                <div className="grid-widget col-60">
                  <div className="widget-header">
                    <span className="title">My Complaints</span>
                    <button className="view-all-link" onClick={() => setActiveTab('My Complaints')}>View All</button>
                  </div>

                  <div className="complaint-list-stack">
                    {filteredComplaints.length === 0 ? (
                      <div style={{ padding: '2rem 1rem', color: '#64748b', fontSize: '0.8rem', textAlign: 'center' }}>
                        No complaints submitted yet. Use the quick link to submit one!
                      </div>
                    ) : (
                      filteredComplaints.slice(0, 3).map((comp) => (
                        <div key={comp.id} className="complaint-row-item">
                          <div className="row-left">
                            <div className="category-icon-wrapper">
                              {getCategoryIcon(comp.category)}
                            </div>
                            <div>
                              <span className="comp-title">{comp.title}</span>
                              <span className="comp-meta">{comp.location} • {getRelativeTime(comp.time)}</span>
                            </div>
                          </div>
                          <span className={`status-pill ${
                            comp.status === 'Resolved' ? 'resolved' :
                            comp.status === 'In Progress' ? 'in-progress' :
                            comp.status === 'High Priority' ? 'high-priority' : 'open'
                          }`}>
                            {comp.status}
                          </span>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                {/* Lodge Ad box */}
                <div className="grid-widget col-40 submit-ad-card">
                  <div className="ad-content-side">
                    <h3>Submit a New Complaint</h3>
                    <p>We're here to help you.</p>
                    <button 
                      className="lodge-complaint-btn"
                      onClick={() => setShowComplaintModal(true)}
                    >
                      <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24" style={{ marginRight: '6px' }}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                      </svg>
                      New Complaint
                    </button>
                  </div>
                  
                  {/* Visual Illustration */}
                  <div className="ad-illustration-side">
                    <div className="visual-clipboard">
                      <div className="clipboard-header"></div>
                      <div className="clipboard-lines">
                        <div className="line long"></div>
                        <div className="line short"></div>
                        <div className="line long"></div>
                      </div>
                      <div className="visual-pen"></div>
                    </div>
                  </div>
                </div>

              </div>

              {/* GRID ROW 2: ANNOUNCEMENTS & STATUS CHART */}
              <div className="grid-flex-row">
                
                {/* Announcements */}
                <div className="grid-widget col-40">
                  <div className="widget-header">
                    <span className="title">Announcements</span>
                    <button className="view-all-link" onClick={() => setActiveTab('Announcements')}>View All</button>
                  </div>

                  <div className="announcements-stack-list">
                    {announcements.length === 0 ? (
                      <div style={{ padding: '2rem 1rem', color: '#64748b', fontSize: '0.8rem', textAlign: 'center' }}>
                        No hostel announcements posted yet.
                      </div>
                    ) : (
                      announcements.slice(0, 3).map((ann) => (
                        <div key={ann.id} className="ann-row-item">
                          <div className="ann-icon bg-blue-tint text-blue">
                            <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
                            </svg>
                          </div>
                          <div style={{ flex: 1 }}>
                            <p className="ann-text">{ann.text}</p>
                            <span className="ann-date">{ann.date}</span>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                {/* Bar Chart Widget */}
                <div className="grid-widget col-60">
                  <div className="widget-header">
                    <span className="title">Complaint Status Overview</span>
                    <span className="chart-filter-select">This Month</span>
                  </div>

                  {/* Vertical Bar Chart Graphic */}
                  <div className="clean-bar-chart-container">
                    <div className="chart-grid-bars">
                      
                      {/* Bar 1: In Progress */}
                      <div className="chart-bar-column">
                        <span className="bar-val-label">{stats.inProgress}</span>
                        <div 
                          className="chart-bar-fill orange-bar" 
                          style={{ height: `${Math.max(stats.inProgress * 40, 20)}px` }}
                        ></div>
                        <span className="bar-axis-label">In Progress</span>
                      </div>

                      {/* Bar 2: Resolved */}
                      <div className="chart-bar-column">
                        <span className="bar-val-label">{stats.resolved}</span>
                        <div 
                          className="chart-bar-fill green-bar" 
                          style={{ height: `${Math.max(stats.resolved * 40, 20)}px` }}
                        ></div>
                        <span className="bar-axis-label">Resolved</span>
                      </div>

                      {/* Bar 3: Open */}
                      <div className="chart-bar-column">
                        <span className="bar-val-label">{stats.open}</span>
                        <div 
                          className="chart-bar-fill blue-bar" 
                          style={{ height: `${Math.max(stats.open * 40, 20)}px` }}
                        ></div>
                        <span className="bar-axis-label">Open</span>
                      </div>

                    </div>
                  </div>
                </div>

              </div>

            </div>
          )}

          {/* TAB 2: MY COMPLAINTS LIST */}
          {activeTab === 'My Complaints' && (
            <div className="tab-detailed-view">
              <div className="detailed-view-header">
                <h2>My Complaints</h2>
                <SpecularButton
                  size="md"
                  radius={8}
                  tint="#2563eb"
                  tintOpacity={1}
                  textColor="#ffffff"
                  lineColor="#ffffff"
                  baseColor="#1d4ed8"
                  className="lodge-complaint-trigger-btn"
                  onClick={() => setShowComplaintModal(true)}
                >
                  + Lodge Complaint
                </SpecularButton>
              </div>

              <div className="grid-widget" style={{ padding: '1.5rem', width: '100%' }}>
                <div style={{ marginBottom: '1.5rem', maxWidth: '350px' }}>
                  <input
                    type="text"
                    className="standard-input-field"
                    placeholder="Search your complaints..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.25rem', marginTop: '1rem' }}>
                  {filteredComplaints.length === 0 ? (
                    <p style={{ color: '#64748b', textAlign: 'center', padding: '2rem 0', gridColumn: '1 / -1' }}>No complaints filed yet.</p>
                  ) : (
                    filteredComplaints.map(c => (
                      <div key={c.id} className="comp-detail-card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', padding: '1.25rem', border: '1px solid #e2e8f0', borderRadius: '10px', backgroundColor: '#fff', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03)', transition: 'transform 0.2s, box-shadow 0.2s', cursor: 'default' }}>
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
                        </div>

                        <SpecularButton
                          onClick={() => setSelectedComplaint(c)}
                          size="md"
                          radius={8}
                          tint="#2563eb"
                          tintOpacity={1}
                          textColor="#ffffff"
                          lineColor="#ffffff"
                          baseColor="#1d4ed8"
                          className="lodge-complaint-trigger-btn"
                          style={{ marginTop: '1.25rem', width: '100%' }}
                        >
                          View Details
                        </SpecularButton>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: ANNOUNCEMENTS & EVENTS */}
          {activeTab === 'Announcements' && (
            <div className="tab-detailed-view">
              <div className="detailed-view-header" style={{ marginBottom: '1.5rem' }}>
                <h2>Hostel Announcements & Events</h2>
                <p style={{ color: '#64748b', fontSize: '0.9rem', marginTop: '0.25rem' }}>Important updates, alerts, files, and events published by the hostel warden</p>
              </div>

              {/* Event Banner at the top of Announcements Tab */}
              {eventBanner && eventBanner.title && eventBanner.active && (
                <div style={{ 
                  background: 'linear-gradient(135deg, #1e1b4b 0%, #311042 100%)', 
                  borderRadius: '12px', 
                  padding: '1.5rem', 
                  marginBottom: '1.5rem', 
                  color: '#fff', 
                  position: 'relative',
                  overflow: 'hidden',
                  boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.3)'
                }}>
                  {eventBanner.bannerImage && (
                    <div style={{ position: 'absolute', right: 0, top: 0, bottom: 0, width: '45%', opacity: 0.2 }}>
                      <img src={eventBanner.bannerImage} alt="Event Banner" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    </div>
                  )}
                  <div style={{ position: 'relative', zIndex: 2 }}>
                    <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.1em', backgroundColor: '#e11d48', padding: '0.25rem 0.5rem', borderRadius: '4px', fontWeight: 'bold', display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
                      <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19.114 5.636a9 9 0 010 12.728M16.463 8.288a5.25 5.25 0 010 7.424M6.75 8.25l4.72-4.72a.75.75 0 011.28.53v15.88a.75.75 0 01-1.28.53l-4.72-4.72H4.51c-.88 0-1.704-.507-1.938-1.354A9.01 9.01 0 012.25 12c0-.83.112-1.633.322-2.396C2.806 8.756 3.63 8.25 4.51 8.25H6.75z" />
                      </svg>
                      Featured Hostel Event
                    </span>
                    <h3 style={{ fontSize: '1.75rem', margin: '0.5rem 0 0.25rem', color: '#fff', fontWeight: 800 }}>{eventBanner.title}</h3>
                    <p style={{ margin: '0.25rem 0 1rem', fontSize: '0.95rem', color: '#cbd5e1', maxWidth: '60%' }}>{eventBanner.description}</p>
                    <div style={{ fontSize: '0.9rem', color: '#fda4af', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                      <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
                      </svg>
                      Event Date: {eventBanner.date || 'To be announced'}
                    </div>
                  </div>
                </div>
              )}

              <div className="grid-widget" style={{ padding: '1.5rem', width: '100%' }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.25rem' }}>
                  {announcements.length === 0 ? (
                    <p style={{ color: '#64748b', textAlign: 'center', padding: '2rem 0', gridColumn: '1 / -1' }}>No announcements posted yet.</p>
                  ) : (
                    announcements.map(ann => (
                      <div key={ann.id || ann._id} className={`announcement-detailed-card ${ann.important ? 'border-red-left' : ''}`} style={{ 
                        display: 'flex', 
                        flexDirection: 'column', 
                        justifyContent: 'space-between',
                        padding: '1.25rem', 
                        border: '1px solid #e2e8f0', 
                        borderRadius: '10px', 
                        backgroundColor: '#fff',
                        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)',
                        borderLeft: ann.important ? '4px solid #ef4444' : '4px solid #3b82f6'
                      }}>
                        <div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                            <span className="ann-date" style={{ fontSize: '0.8rem', color: '#94a3b8' }}>{ann.date}</span>
                            {ann.important && <span className="important-tag" style={{ margin: 0, padding: '0.15rem 0.4rem', fontSize: '0.75rem' }}>Urgent</span>}
                          </div>
                          
                          <h4 style={{ margin: '0.25rem 0 0.5rem', fontSize: '1.1rem', color: '#0f172a', fontWeight: 700 }}>
                            {ann.title || 'General Update'}
                          </h4>
                          
                          <p className="ann-body-text" style={{ fontSize: '0.9rem', color: '#334155', lineHeight: 1.5, margin: '0.5rem 0', whiteSpace: 'pre-wrap' }}>
                            {ann.text}
                          </p>

                          {ann.attachment && (
                            <div style={{ marginTop: '0.75rem', border: '1px dashed #cbd5e1', borderRadius: '6px', overflow: 'hidden', backgroundColor: '#f8fafc', padding: '0.5rem' }}>
                              {ann.attachment.startsWith('data:image/') ? (
                                <img 
                                  src={ann.attachment} 
                                  alt="Attachment" 
                                  style={{ width: '100%', maxHeight: '150px', objectFit: 'contain', cursor: 'zoom-in', borderRadius: '4px' }}
                                  onClick={() => setZoomImage(ann.attachment)}
                                />
                              ) : (
                                <a href={ann.attachment} download={ann.attachmentName || 'attachment'} className="view-all-link" style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.8rem', color: '#2563eb', fontWeight: 600 }}>
                                  <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24" style={{ display: 'inline-block', verticalAlign: 'middle' }}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.19 8.688a4.5 4.5 0 011.242 7.244l-4.5 4.5a4.5 4.5 0 01-6.364-6.364l4.5-4.5a3 3 0 114.243 4.243l-4.5 4.5a1.5 1.5 0 11-2.122-2.122l4.5-4.5" />
                                  </svg>
                                  Download Attachment ({ann.attachmentName || 'File'})
                                </a>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: MESSAGES */}
          {activeTab === 'Messages' && (
            <div className="tab-detailed-view">
              <div className="detailed-view-header">
                <h2>Message Center</h2>
                <p style={{ color: '#64748b' }}>Secure chat with Warden Console</p>
              </div>

              <div className="grid-widget messages-chat-box" style={{ width: '100%' }}>
                <div className="chat-content-body">
                  {chatMessages.map((msg, index) => {
                    const isOwn = msg.sender === 'student';
                    const msgId = msg._id || msg.id;
                    const isEditing = editingMessageId === msgId;

                    return (
                      <div key={msgId || index} className={`chat-bubble ${isOwn ? 'student-bubble' : 'warden-bubble'}`} style={{ padding: '0.65rem 0.85rem', borderRadius: '10px', maxWidth: '75%', margin: '0.5rem 0', alignSelf: isOwn ? 'flex-end' : 'flex-start' }}>
                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                          {isEditing ? (
                            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', marginTop: '0.25rem' }}>
                              <input
                                type="text"
                                value={editingText}
                                onChange={(e) => setEditingText(e.target.value)}
                                style={{ padding: '0.25rem 0.5rem', borderRadius: '4px', border: '1px solid #cbd5e1', fontSize: '0.85rem', color: '#000' }}
                              />
                              <button 
                                onClick={() => handleEditMessage(msgId, editingText)}
                                style={{ padding: '0.25rem 0.5rem', backgroundColor: '#10b981', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '0.75rem', fontWeight: 600 }}
                              >
                                Save
                              </button>
                              <button 
                                onClick={() => setEditingMessageId(null)}
                                style={{ padding: '0.25rem 0.5rem', backgroundColor: '#64748b', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '0.75rem', fontWeight: 600 }}
                              >
                                Cancel
                              </button>
                            </div>
                          ) : (
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '1rem' }}>
                              <div className="bubble-content" style={{ fontSize: '0.9rem', color: isOwn ? '#fff' : '#0f172a', whiteSpace: 'pre-wrap' }}>{msg.text}</div>
                              {isOwn && (
                                <div className="message-actions" style={{ display: 'flex', gap: '0.35rem', marginLeft: '0.5rem', alignSelf: 'flex-start', padding: '2px 4px', backgroundColor: 'rgba(255, 255, 255, 0.15)', borderRadius: '4px' }}>
                                  <button 
                                    onClick={() => {
                                      setEditingMessageId(msgId);
                                      setEditingText(msg.text);
                                    }}
                                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#bfdbfe', padding: '0.2rem', display: 'flex', alignItems: 'center' }}
                                    title="Edit Message"
                                  >
                                    <svg width="11" height="11" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L6.832 19.82a4.5 4.5 0 01-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 011.13-1.897L16.863 4.487zm0 0L19.5 7.125" />
                                    </svg>
                                  </button>
                                  <button 
                                    onClick={() => handleDeleteMessage(msgId)}
                                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#fecaca', padding: '0.2rem', display: 'flex', alignItems: 'center' }}
                                    title="Delete Message"
                                  >
                                    <svg width="11" height="11" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                    </svg>
                                  </button>
                                </div>
                              )}
                            </div>
                          )}
                          <span className="bubble-time" style={{ fontSize: '0.7rem', color: isOwn ? '#bfdbfe' : '#64748b', alignSelf: 'flex-end', marginTop: '0.2rem' }}>{msg.time}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <form onSubmit={handleSendMessage} className="chat-send-footer">
                  <input
                    type="text"
                    className="chat-input-field"
                    placeholder="Type your message..."
                    value={newMsgText}
                    onChange={(e) => setNewMsgText(e.target.value)}
                  />
                  <SpecularButton type="submit" size="md" radius={8} tint="#2563eb" tintOpacity={1} textColor="#ffffff" lineColor="#ffffff" baseColor="#1d4ed8" className="chat-submit-btn">
                    Send
                  </SpecularButton>
                </form>
              </div>
            </div>
          )}

          {/* TAB 5: FEEDBACK */}
          {activeTab === 'Feedback' && (
            <div className="tab-detailed-view">
              <div className="detailed-view-header">
                <h2>Hostel Feedback</h2>
                <p style={{ color: '#64748b' }}>Provide feedback on active inquiries set by the hostel Warden.</p>
              </div>

              <div className="grid-widget" style={{ padding: '2rem', maxWidth: '600px', backgroundColor: '#fff', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                {!activeFeedbackRequest ? (
                  <div style={{ textAlign: 'center', padding: '2rem 1rem' }}>
                    <svg width="48" height="48" fill="none" stroke="#94a3b8" strokeWidth="2" viewBox="0 0 24 24" style={{ margin: '0 auto 1rem' }}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <h3 style={{ fontSize: '1.1rem', fontWeight: 600, color: '#1e293b', marginBottom: '0.5rem' }}>No Active Requests</h3>
                    <p style={{ fontSize: '0.85rem', color: '#64748b', maxWidth: '320px', margin: '0 auto' }}>
                      The Warden has not requested feedback at this time. Check back later!
                    </p>
                  </div>
                ) : submittedFeedback ? (
                  <div style={{ textAlign: 'center', padding: '2rem 1rem' }}>
                    <svg width="48" height="48" fill="none" stroke="#10b981" strokeWidth="2.5" viewBox="0 0 24 24" style={{ margin: '0 auto 1rem' }}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <h3 style={{ fontSize: '1.15rem', fontWeight: 600, color: '#065f46', marginBottom: '0.5rem' }}>Feedback Submitted</h3>
                    <p style={{ fontSize: '0.95rem', fontWeight: 600, color: '#1e293b', marginBottom: '0.5rem' }}>
                      {activeFeedbackRequest.title}
                    </p>
                    <p style={{ fontSize: '0.85rem', color: '#64748b', maxWidth: '340px', margin: '0 auto' }}>
                      You have successfully submitted your feedback for this request. Thank you for your valuable response!
                    </p>
                  </div>
                ) : (
                  <div>
                    <div style={{ backgroundColor: '#2563eb', padding: '1.25rem 2rem', margin: '-2rem -2rem 1.5rem', borderRadius: '12px 12px 0 0', color: '#fff' }}>
                      <h3 style={{ fontSize: '1.25rem', fontWeight: 700, margin: 0 }}>
                        {activeFeedbackRequest.title}
                      </h3>
                      <p style={{ fontSize: '0.875rem', color: '#bfdbfe', margin: '4px 0 0', lineHeight: '1.4' }}>
                        {activeFeedbackRequest.description}
                      </p>
                    </div>

                    <form onSubmit={handleFeedbackSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                      <div>
                        <label style={{ fontWeight: 700, color: '#334155', display: 'block', marginBottom: '0.75rem', fontSize: '0.9rem' }}>
                          Rate your experience
                        </label>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                          {[1, 2, 3, 4, 5].map((star) => (
                            <svg
                              key={star}
                              onClick={() => setFeedbackRating(star)}
                              style={{ 
                                width: '36px', 
                                height: '36px', 
                                cursor: 'pointer', 
                                color: star <= feedbackRating ? '#eab308' : '#cbd5e1', 
                                transition: 'color 0.2s ease, transform 0.15s ease',
                              }}
                              fill={star <= feedbackRating ? 'currentColor' : 'none'}
                              stroke="currentColor"
                              strokeWidth="2"
                              viewBox="0 0 24 24"
                              onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.2)'}
                              onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                            >
                              <path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499c.15-.426.77-.426.92 0l2.091 5.922a1 1 0 00.95.69h6.262c.456 0 .647.578.279.868l-5.067 3.681a1 1 0 00-.364 1.118l2.092 5.922c.15.426-.346.786-.718.536l-5.067-3.682a1 1 0 00-1.178 0l-5.067 3.682c-.372.25-.868-.11-.718-.536l2.092-5.922a1 1 0 00-.364-1.118L2.264 10.98c-.368-.29-.177-.868.279-.868h6.262a1 1 0 00.95-.69L11.48 3.5z" />
                            </svg>
                          ))}
                          <span style={{ marginLeft: '0.75rem', fontWeight: 700, fontSize: '0.9rem', color: '#475569', backgroundColor: '#f1f5f9', padding: '0.35rem 0.75rem', borderRadius: '20px' }}>
                            {feedbackRating === 5 ? 'Excellent (5/5)' :
                             feedbackRating === 4 ? 'Good (4/5)' :
                             feedbackRating === 3 ? 'Average (3/5)' :
                             feedbackRating === 2 ? 'Poor (2/5)' : 'Very Poor (1/5)'}
                          </span>
                        </div>
                      </div>

                      <div>
                        <label style={{ fontWeight: 700, color: '#334155', display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem' }}>
                          Comments / Suggestions
                        </label>
                        <textarea 
                          rows="4" 
                          placeholder="Provide your specific suggestions or comments here..."
                          style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.9rem', outline: 'none', transition: 'border-color 0.2s ease', fontFamily: 'inherit' }}
                          value={feedbackComments}
                          onChange={(e) => setFeedbackComments(e.target.value)}
                          required
                        ></textarea>
                      </div>

                      <SpecularButton 
                        type="submit" 
                        size="md" 
                        radius={8} 
                        tint="#2563eb" 
                        tintOpacity={1} 
                        textColor="#ffffff" 
                        lineColor="#ffffff" 
                        baseColor="#1d4ed8"
                      >
                        Submit Feedback
                      </SpecularButton>
                    </form>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 6: PROFILE */}
          {activeTab === 'Profile' && (
            <div className="tab-detailed-view">
              <div className="detailed-view-header">
                <h2>Student Profile</h2>
              </div>

              <div className="grid-widget" style={{ padding: '2rem', maxWidth: '500px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
                  <div className="avatar-circle-large" style={{ overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {profile.profilePhoto ? (
                      <img src={profile.profilePhoto} alt="avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : (
                      profile.name.split(' ').map(n=>n[0]).join('')
                    )}
                  </div>
                  <h3 style={{ margin: 0 }}>{profile.name}</h3>
                  <span className="profile-role-badge">Student Resident</span>
                </div>

                <div className="profile-data-list">
                  <div className="data-row">
                    <span className="label">Roll Number:</span>
                    <span className="val">{profile.rollNo}</span>
                  </div>
                  <div className="data-row">
                    <span className="label">Official Email:</span>
                    <span className="val">{profile.email}</span>
                  </div>
                  <div className="data-row">
                    <span className="label">Phone:</span>
                    <span className="val">{profile.phoneNo}</span>
                  </div>
                  <div className="data-row">
                    <span className="label">Room / Block:</span>
                    <span className="val">Room {profile.roomNo}, Block {profile.block}</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 7: SETTINGS */}
          {activeTab === 'Settings' && (
            <div className="tab-detailed-view">
              <div className="detailed-view-header">
                <h2>Account Settings</h2>
              </div>

              <div className="grid-widget" style={{ padding: '2rem', maxWidth: '600px' }}>
                <form onSubmit={handleSaveProfile} className="settings-student-form">
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', marginBottom: '2rem', borderBottom: '1px solid #e2e8f0', paddingBottom: '1.5rem' }}>
                    <div className="avatar-circle-large" style={{ overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: 0 }}>
                      {profile.profilePhoto ? (
                        <img src={profile.profilePhoto} alt="avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      ) : (
                        profile.name.split(' ').map(n=>n[0]).join('')
                      )}
                    </div>
                    <div>
                      <label style={{ display: 'block', fontWeight: 600, fontSize: '0.9rem', marginBottom: '0.5rem' }}>Profile Picture</label>
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
                      <label>Student Name</label>
                      <input
                        type="text"
                        className="standard-input-field"
                        value={profile.name}
                        onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                      />
                    </div>
                    <div>
                      <label>Roll Number</label>
                      <input
                        type="text"
                        className="standard-input-field"
                        value={profile.rollNo}
                        onChange={(e) => setProfile({ ...profile, rollNo: e.target.value })}
                      />
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '1.5rem' }}>
                    <div>
                      <label>Official Email</label>
                      <input
                        type="email"
                        className="standard-input-field"
                        value={profile.email}
                        readOnly
                        style={{ backgroundColor: '#f1f5f9', cursor: 'not-allowed' }}
                      />
                    </div>
                    <div>
                      <label>Phone Number</label>
                      <input
                        type="text"
                        className="standard-input-field"
                        value={profile.phoneNo}
                        onChange={(e) => setProfile({ ...profile, phoneNo: e.target.value })}
                      />
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '2rem' }}>
                    <div>
                      <label>Hostel Room No</label>
                      <input
                        type="text"
                        className="standard-input-field"
                        value={profile.roomNo}
                        onChange={(e) => setProfile({ ...profile, roomNo: e.target.value })}
                      />
                    </div>
                    <div>
                      <label>Hostel Block</label>
                      <input
                        type="text"
                        className="standard-input-field"
                        value={profile.block}
                        onChange={(e) => setProfile({ ...profile, block: e.target.value })}
                      />
                    </div>
                  </div>

                  <SpecularButton
                    type="submit"
                    size="md"
                    radius={8}
                    tint="#2563eb"
                    tintOpacity={1}
                    textColor="#ffffff"
                    lineColor="#ffffff"
                    baseColor="#1d4ed8"
                    className="lodge-complaint-trigger-btn"
                  >
                    Save Settings
                  </SpecularButton>
                </form>
              </div>
            </div>
          )}

        </div>
      </main>

      {/* LODGE COMPLAINT MODAL */}
      {showComplaintModal && (
        <div className="modal-backdrop">
          <div className="modal-content-card">
            <div className="modal-header">
              <h3>File Maintenance Ticket</h3>
              <button className="close-modal-btn" onClick={() => setShowComplaintModal(false)}>×</button>
            </div>
            
            <form onSubmit={handleLodgeComplaint} className="modal-form-body">
              <div className="form-group">
                <label>Ticket Title *</label>
                <input
                  type="text"
                  placeholder="e.g. Bathroom light flickering, Taps leaking"
                  required
                  value={complaintForm.title}
                  onChange={(e) => setComplaintForm({ ...complaintForm, title: e.target.value })}
                  className="modal-input-field"
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label>Category *</label>
                  <select
                    value={complaintForm.category}
                    onChange={(e) => setComplaintForm({ ...complaintForm, category: e.target.value })}
                    className="modal-select-field"
                  >
                    <option value="Electrical">Electrical</option>
                    <option value="Plumbing">Plumbing</option>
                    <option value="Water Supply">Water Supply</option>
                    <option value="Internet">Internet</option>
                    <option value="Cleaning">Cleaning</option>
                    <option value="Food">Food</option>
                    <option value="Others">Others</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Priority Level *</label>
                  <select
                    value={complaintForm.priority}
                    onChange={(e) => setComplaintForm({ ...complaintForm, priority: e.target.value })}
                    className="modal-select-field"
                  >
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label>Specific Location (Leave blank for Room {profile.roomNo})</label>
                <input
                  type="text"
                  placeholder={`e.g. Block ${profile.block} Corridor, Mess Hall`}
                  value={complaintForm.customLocation}
                  onChange={(e) => setComplaintForm({ ...complaintForm, customLocation: e.target.value })}
                  className="modal-input-field"
                />
              </div>

              <div className="form-group">
                <label>Detailed Description *</label>
                <textarea
                  rows="4"
                  placeholder="Explain the maintenance issue in detail so workers can carry the right tools..."
                  required
                  value={complaintForm.description}
                  onChange={(e) => setComplaintForm({ ...complaintForm, description: e.target.value })}
                  className="modal-textarea-field"
                ></textarea>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label>Contact Phone Number *</label>
                  <input
                    type="tel"
                    required
                    value={complaintForm.phone}
                    onChange={(e) => setComplaintForm({ ...complaintForm, phone: e.target.value })}
                    className="modal-input-field"
                  />
                </div>

                <div className="form-group">
                  <label>Upload Proof (Optional)</label>
                  <input
                    type="file"
                    accept="image/*,application/pdf"
                    onChange={handleFileChange}
                    className="modal-input-field"
                    style={{ padding: '6px' }}
                  />
                  {complaintForm.proofName && (
                    <p style={{ fontSize: '0.8rem', color: '#10b981', marginTop: '4px' }}>
                      ✓ Selected: {complaintForm.proofName}
                    </p>
                  )}
                </div>
              </div>

              <div style={{ padding: '0.75rem', backgroundColor: '#f8fafc', borderRadius: '6px', fontSize: '0.85rem', color: '#64748b', marginBottom: '1rem', border: '1px solid #e2e8f0' }}>
                <strong>Details Attached:</strong> {profile.name} (Roll: {profile.rollNo}) | Room: {profile.block} - {profile.roomNo}
              </div>

              <div className="modal-footer-actions" style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
                <SpecularButton 
                  type="button" 
                  size="md" 
                  radius={8} 
                  tint="#e2e8f0" 
                  tintOpacity={1} 
                  textColor="#475569" 
                  lineColor="#cbd5e1" 
                  baseColor="#cbd5e1" 
                  className="cancel-btn" 
                  onClick={() => setShowComplaintModal(false)}
                >
                  Cancel
                </SpecularButton>
                <SpecularButton 
                  type="submit" 
                  size="md" 
                  radius={8} 
                  tint="#2563eb" 
                  tintOpacity={1} 
                  textColor="#ffffff" 
                  lineColor="#ffffff" 
                  baseColor="#1d4ed8" 
                  className="submit-btn"
                >
                  File Ticket
                </SpecularButton>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* COMPLAINT DETAILS VIEW MODAL (VIEW-ONLY FOR STUDENTS) */}
      {selectedComplaint && (
        <div className="modal-backdrop" style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(15, 23, 42, 0.45)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 999 }}>
          <div className="modal-content" style={{ maxWidth: '650px', width: '90%', borderRadius: '16px', backgroundColor: '#fff', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.15)', overflow: 'hidden', border: '1px solid rgba(226, 232, 240, 0.8)' }}>
            {/* Header Banner */}
            <div style={{ background: 'linear-gradient(135deg, #092147 0%, #1d4ed8 100%)', padding: '1.5rem 2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: '#fff' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.1em', color: '#93c5fd', fontWeight: 600 }}>Complaint Ticket</span>
                <h3 style={{ margin: 0, fontSize: '1.4rem', fontWeight: 800, color: '#ffffff' }}>{selectedComplaint.title}</h3>
              </div>
              <button 
                onClick={() => setSelectedComplaint(null)}
                style={{ background: 'rgba(255, 255, 255, 0.15)', border: 'none', borderRadius: '50%', width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', cursor: 'pointer', fontSize: '1.5rem', transition: 'background-color 0.2s', outline: 'none' }}
                onMouseEnter={e => e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.25)'}
                onMouseLeave={e => e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.15)'}
              >
                &times;
              </button>
            </div>

            <div style={{ padding: '2rem', maxHeight: '65vh', overflowY: 'auto', textAlign: 'left' }}>
              
              {/* Badges row */}
              <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
                <span className={`status-pill ${
                  selectedComplaint.status === 'Resolved' ? 'resolved' :
                  selectedComplaint.status === 'In Progress' ? 'in-progress' :
                  selectedComplaint.status === 'High Priority' ? 'high-priority' : 'open'
                }`} style={{ margin: 0, padding: '0.4rem 0.85rem', fontSize: '0.8rem', borderRadius: '30px', fontWeight: 700 }}>
                  ● {selectedComplaint.status}
                </span>
                <span style={{ fontSize: '0.8rem', padding: '0.4rem 0.85rem', backgroundColor: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: '30px', color: '#1e40af', fontWeight: 700 }}>
                  Category: {selectedComplaint.category}
                </span>
                <span style={{ fontSize: '0.8rem', padding: '0.4rem 0.85rem', backgroundColor: '#fef2f2', border: '1px solid #fecaca', borderRadius: '30px', color: '#991b1b', fontWeight: 700 }}>
                  Priority: {selectedComplaint.priority}
                </span>
              </div>

              {/* Description */}
              <div style={{ marginBottom: '1.75rem' }}>
                <h5 style={{ margin: '0 0 0.5rem', fontSize: '0.8rem', color: '#475569', textTransform: 'uppercase', letterSpacing: '0.07em', fontWeight: 700 }}>Detailed Description</h5>
                <div style={{ fontSize: '0.95rem', color: '#1e293b', lineHeight: 1.6, backgroundColor: '#f8fafc', padding: '1.25rem', borderRadius: '12px', border: '1px solid #e2e8f0', whiteSpace: 'pre-wrap' }}>
                  {selectedComplaint.description || 'No detailed description provided.'}
                </div>
              </div>

              {/* Meta Grid (Location & Time) */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '1.75rem' }}>
                <div style={{ padding: '1rem', backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <div style={{ backgroundColor: '#e0f2fe', width: '36px', height: '36px', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <svg width="18" height="18" fill="none" stroke="#0369a1" strokeWidth="2.5" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </div>
                  <div>
                    <h5 style={{ margin: 0, fontSize: '0.75rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 700 }}>Location</h5>
                    <span style={{ fontSize: '0.9rem', fontWeight: 700, color: '#0f172a' }}>{selectedComplaint.location}</span>
                  </div>
                </div>

                <div style={{ padding: '1rem', backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <div style={{ backgroundColor: '#f0fdf4', width: '36px', height: '36px', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <svg width="18" height="18" fill="none" stroke="#15803d" strokeWidth="2.5" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div>
                    <h5 style={{ margin: 0, fontSize: '0.75rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 700 }}>Filing Time</h5>
                    <span style={{ fontSize: '0.9rem', fontWeight: 700, color: '#0f172a' }}>{selectedComplaint.time}</span>
                  </div>
                </div>
              </div>

              {/* Attached Proof */}
              {selectedComplaint.proof && (
                <div>
                  <h5 style={{ margin: '0 0 0.5rem', fontSize: '0.8rem', color: '#475569', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.07em' }}>Attached Proof Document</h5>
                  <div style={{ border: '1px dashed #cbd5e1', borderRadius: '12px', overflow: 'hidden', backgroundColor: '#f8fafc', padding: '1rem', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                    {selectedComplaint.proof.startsWith('data:image/') ? (
                      <div style={{ position: 'relative', width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                        <img 
                          src={selectedComplaint.proof} 
                          alt="Proof" 
                          style={{ width: '100%', maxHeight: '260px', objectFit: 'contain', borderRadius: '8px', cursor: 'zoom-in', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}
                          onClick={() => setZoomImage(selectedComplaint.proof)}
                        />
                        <span style={{ marginTop: '0.5rem', fontSize: '0.75rem', color: '#64748b' }}>🔍 Click to preview full size</span>
                      </div>
                    ) : (
                      <a 
                        href={selectedComplaint.proof} 
                        download={selectedComplaint.proofName || 'proof'} 
                        className="view-all-link" 
                        style={{ padding: '0.75rem 1.5rem', display: 'inline-flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', fontWeight: 700, backgroundColor: '#2563eb', color: '#fff', borderRadius: '8px', textDecoration: 'none' }}
                      >
                        <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                        </svg>
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

      {/* ZOOMED IMAGE OVERLAY */}
      {zoomImage && (
        <div className="modal-backdrop" onClick={() => setZoomImage(null)} style={{ cursor: 'zoom-out', position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 999 }}>
          <div style={{ position: 'relative', maxWidth: '90%', maxHeight: '90%' }} onClick={e => e.stopPropagation()}>
            <img src={zoomImage} alt="Zoomed Proof" style={{ maxWidth: '100%', maxHeight: '80vh', borderRadius: '8px', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)' }} />
            <button 
              onClick={() => setZoomImage(null)} 
              style={{ position: 'absolute', top: '-15px', right: '-15px', backgroundColor: '#0f172a', color: '#fff', border: 'none', borderRadius: '50%', width: '30px', height: '30px', cursor: 'pointer', fontSize: '1.2rem', fontWeight: 'bold' }}
            >
              &times;
            </button>
          </div>
        </div>
      )}

    </div>
  );
};

export default StudentDashboard;
