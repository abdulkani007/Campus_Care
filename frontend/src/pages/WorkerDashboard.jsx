import React, { useState, useEffect } from 'react';
import logo from '../assets/CC.png';
import '../styles/WorkerDashboard.css';

// SVG Lucide-style Icons (Zero Emoji - 100% Vector Icons)
const LayoutDashboardIcon = () => (
  <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
    <rect x="3" y="3" width="7" height="7" rx="1.5" />
    <rect x="14" y="3" width="7" height="7" rx="1.5" />
    <rect x="14" y="14" width="7" height="7" rx="1.5" />
    <rect x="3" y="14" width="7" height="7" rx="1.5" />
  </svg>
);

const ClipboardListIcon = () => (
  <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
    <rect x="8" y="2" width="8" height="4" rx="1" />
    <path d="M16 4h2a2 2 0 012 2v14a2 2 0 01-2 2H6a2 2 0 01-2-2V6a2 2 0 012-2h2" />
    <path d="M12 11h4M12 16h4M8 11h.01M8 16h.01" />
  </svg>
);

const Clock3Icon = () => (
  <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
    <circle cx="12" cy="12" r="10" />
    <polyline points="12 6 12 12 16.5 12" />
  </svg>
);

const CheckCircle2Icon = () => (
  <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
    <path d="M22 11.08V12a10 10 0 11-5.93-9.14" />
    <polyline points="22 4 12 14.01 9 11.01" />
  </svg>
);

const CircleXIcon = () => (
  <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
    <circle cx="12" cy="12" r="10" />
    <line x1="15" y1="9" x2="9" y2="15" />
    <line x1="9" y1="9" x2="15" y2="15" />
  </svg>
);

const UserRoundIcon = () => (
  <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
    <circle cx="12" cy="8" r="5" />
    <path d="M20 21a8 8 0 00-16 0" />
  </svg>
);

const MapPinnedIcon = () => (
  <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
    <path d="M18 8c0 4.5-6 9-6 9s-6-4.5-6-9a6 6 0 0112 0z" />
    <circle cx="12" cy="8" r="2" />
  </svg>
);

const PhoneIcon = () => (
  <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
    <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72 12.84 12.84 0 00.7 2.81 2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45 12.84 12.84 0 002.81.7A2 2 0 0122 16.92z" />
  </svg>
);

const CalendarDaysIcon = () => (
  <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
    <line x1="16" y1="2" x2="16" y2="6" />
    <line x1="8" y1="2" x2="8" y2="6" />
    <line x1="3" y1="10" x2="21" y2="10" />
  </svg>
);

const FileTextIcon = () => (
  <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
    <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
    <polyline points="14 2 14 8 20 8" />
    <line x1="16" y1="13" x2="8" y2="13" />
    <line x1="16" y1="17" x2="8" y2="17" />
    <polyline points="10 9 9 9 8 9" />
  </svg>
);

const WrenchIcon = () => (
  <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
    <path d="M14.7 6.3a1 1 0 000 1.4l1.6 1.6a1 1 0 001.4 0l3.77-3.77a6 6 0 01-7.94 7.94l-6.91 6.91a2.12 2.12 0 01-3-3l6.91-6.91a6 6 0 017.94-7.94l-3.76 3.76z" />
  </svg>
);

const DownloadIcon = () => (
  <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
    <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
    <polyline points="7 10 12 15 17 10" />
    <line x1="12" y1="15" x2="12" y2="3" />
  </svg>
);

const WorkerDashboard = ({ user, onLogout }) => {
  const [tasks, setTasks] = useState([]);
  const [activeTab, setActiveTab] = useState('Dashboard'); // Dashboard, Assigned Task Orders, In Progress Repairs, Completed Reports, Rejected Tasks, My Profile & Duty
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

  // CSV Export for Reports
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
    link.setAttribute('download', `Worker_Report_${Date.now()}.csv`);
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
    } else if (activeTab === 'Rejected Tasks') {
      list = tasks.filter(t => t.status === 'Rejected');
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

  // Donut chart stroke calculation
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

  // Build Recent Activity Log from Tasks
  const recentActivities = tasks.slice(0, 5).map((t, idx) => {
    const c = t.complaint || {};
    const title = c.title || 'Hostel Repair Task';
    const location = c.location || `Room ${c.studentRoom || '101'}`;
    const dateStr = new Date(t.assignedDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    
    let actionText = `Assigned task #${t.taskId} for ${location}`;
    let icon = <ClipboardListIcon />;
    let color = '#2563eb';
    
    if (t.status === 'Accepted') {
      actionText = `Accepted repair order #${t.taskId} for ${location}`;
      icon = <CheckCircle2Icon />;
      color = '#1d4ed8';
    } else if (t.status === 'In Progress') {
      actionText = `Started active repair on #${t.taskId} (${title})`;
      icon = <WrenchIcon />;
      color = '#f97316';
    } else if (t.status === 'Completed' || t.status === 'Verified' || t.status === 'Closed') {
      actionText = `Completed repair & uploaded proof for #${t.taskId}`;
      icon = <CheckCircle2Icon />;
      color = '#10b981';
    } else if (t.status === 'Rejected') {
      actionText = `Rejected task order #${t.taskId}`;
      icon = <CircleXIcon />;
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
              <div style={{ padding: '0.6rem 1rem', fontSize: '0.84rem', color: '#334155', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem' }} onClick={() => { setActiveTab('My Profile & Duty'); setShowProfileMenu(false); }}>
                <UserRoundIcon /> My Profile & Duty
              </div>
              <div style={{ padding: '0.6rem 1rem', fontSize: '0.84rem', color: '#334155', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem' }} onClick={() => { setActiveTab('Assigned Task Orders'); setShowProfileMenu(false); }}>
                <ClipboardListIcon /> Assigned Tasks ({activeUncompletedCount})
              </div>
              <div style={{ borderTop: '1px solid #f1f5f9', padding: '0.6rem 1rem', fontSize: '0.84rem', color: '#ef4444', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem' }} onClick={onLogout}>
                <CircleXIcon /> Log Out
              </div>
            </div>
          )}
        </div>
      </header>

      {/* 2. BODY LAYOUT */}
      <div className="worker-body-wrapper">
        {/* Full-Height Sticky Sidebar (280px Desktop / 250px Tablet) */}
        <aside className={`worker-sidebar ${isMobileSidebarOpen ? 'open-mobile' : ''}`}>
          <ul className="worker-sidebar-menu">
            <li>
              <button className={`worker-sidebar-btn ${activeTab === 'Dashboard' ? 'active' : ''}`} onClick={() => { setActiveTab('Dashboard'); setIsMobileSidebarOpen(false); }}>
                <div className="worker-menu-item-left">
                  <LayoutDashboardIcon />
                  <span>Dashboard</span>
                </div>
              </button>
            </li>
            <li>
              <button className={`worker-sidebar-btn ${activeTab === 'Assigned Task Orders' ? 'active' : ''}`} onClick={() => { setActiveTab('Assigned Task Orders'); setIsMobileSidebarOpen(false); }}>
                <div className="worker-menu-item-left">
                  <ClipboardListIcon />
                  <span>Assigned Task Orders</span>
                </div>
                {activeUncompletedCount > 0 && <span className="worker-badge-pill yellow">{activeUncompletedCount}</span>}
              </button>
            </li>
            <li>
              <button className={`worker-sidebar-btn ${activeTab === 'In Progress Repairs' ? 'active' : ''}`} onClick={() => { setActiveTab('In Progress Repairs'); setIsMobileSidebarOpen(false); }}>
                <div className="worker-menu-item-left">
                  <Clock3Icon />
                  <span>In Progress Repairs</span>
                </div>
                {inProgressCount > 0 && <span className="worker-badge-pill blue">{inProgressCount}</span>}
              </button>
            </li>
            <li>
              <button className={`worker-sidebar-btn ${activeTab === 'Completed Reports' ? 'active' : ''}`} onClick={() => { setActiveTab('Completed Reports'); setIsMobileSidebarOpen(false); }}>
                <div className="worker-menu-item-left">
                  <CheckCircle2Icon />
                  <span>Completed Reports</span>
                </div>
              </button>
            </li>
            <li>
              <button className={`worker-sidebar-btn ${activeTab === 'Rejected Tasks' ? 'active' : ''}`} onClick={() => { setActiveTab('Rejected Tasks'); setIsMobileSidebarOpen(false); }}>
                <div className="worker-menu-item-left">
                  <CircleXIcon />
                  <span>Rejected Tasks</span>
                </div>
                {rejectedCount > 0 && <span className="worker-badge-pill red">{rejectedCount}</span>}
              </button>
            </li>
            <li>
              <button className={`worker-sidebar-btn ${activeTab === 'My Profile & Duty' ? 'active' : ''}`} onClick={() => { setActiveTab('My Profile & Duty'); setIsMobileSidebarOpen(false); }}>
                <div className="worker-menu-item-left">
                  <UserRoundIcon />
                  <span>My Profile & Duty</span>
                </div>
              </button>
            </li>
          </ul>

          <div style={{ backgroundColor: '#f8fafc', padding: '0.85rem', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
            <span style={{ fontSize: '0.68rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 700 }}>Maintenance Station</span>
            <p style={{ margin: '3px 0 0', fontSize: '0.82rem', fontWeight: 800, color: '#0f172a' }}>Central Maintenance Yard</p>
          </div>
        </aside>

        {/* Main Content Area */}
        <main className="worker-main-content">
          
          {/* TAB 1: DASHBOARD (SINGLE-SCREEN COMPACT ANALYTICS - ZERO EMOJIS, ZERO SCROLLING) */}
          {activeTab === 'Dashboard' && (
            <>
              {/* TOP COMPACT KPI STAT CARDS ROW */}
              <div className="worker-kpi-grid">
                <div className="worker-kpi-card">
                  <span className="worker-kpi-label">Assigned Orders</span>
                  <div className="worker-kpi-flex">
                    <span className="worker-kpi-number" style={{ color: '#0f172a' }}>{totalAssigned}</span>
                    <div className="worker-kpi-icon-box" style={{ backgroundColor: '#eff6ff', color: '#2563eb' }}><ClipboardListIcon /></div>
                  </div>
                </div>

                <div className="worker-kpi-card">
                  <span className="worker-kpi-label">Pending / Assigned</span>
                  <div className="worker-kpi-flex">
                    <span className="worker-kpi-number" style={{ color: '#b45309' }}>{pendingCount}</span>
                    <div className="worker-kpi-icon-box" style={{ backgroundColor: '#fef3c7', color: '#b45309' }}><Clock3Icon /></div>
                  </div>
                </div>

                <div className="worker-kpi-card">
                  <span className="worker-kpi-label">In Progress</span>
                  <div className="worker-kpi-flex">
                    <span className="worker-kpi-number" style={{ color: '#c2410c' }}>{inProgressCount}</span>
                    <div className="worker-kpi-icon-box" style={{ backgroundColor: '#fff7ed', color: '#c2410c' }}><WrenchIcon /></div>
                  </div>
                </div>

                <div className="worker-kpi-card">
                  <span className="worker-kpi-label">Completed Today</span>
                  <div className="worker-kpi-flex">
                    <span className="worker-kpi-number" style={{ color: '#10b981' }}>{completedTodayCount}</span>
                    <div className="worker-kpi-icon-box" style={{ backgroundColor: '#ecfdf5', color: '#10b981' }}><CheckCircle2Icon /></div>
                  </div>
                </div>

                <div className="worker-kpi-card">
                  <span className="worker-kpi-label">Total Completed</span>
                  <div className="worker-kpi-flex">
                    <span className="worker-kpi-number" style={{ color: '#059669' }}>{completedCount}</span>
                    <div className="worker-kpi-icon-box" style={{ backgroundColor: '#d1fae5', color: '#059669' }}><CheckCircle2Icon /></div>
                  </div>
                </div>

                <div className="worker-kpi-card">
                  <span className="worker-kpi-label">Avg Resolution Time</span>
                  <div className="worker-kpi-flex">
                    <span className="worker-kpi-number" style={{ color: '#6366f1' }}>42 <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>Mins</span></span>
                    <div className="worker-kpi-icon-box" style={{ backgroundColor: '#e0e7ff', color: '#6366f1' }}><Clock3Icon /></div>
                  </div>
                </div>
              </div>

              {/* COMPACT WIDGETS ROW 1 (STATUS DONUT, TODAY'S PERFORMANCE BAR, WEEKLY LINE, MONTHLY AREA) */}
              <div className="analytics-widget-row-4">
                {/* 1. TASK STATUS DONUT */}
                <div className="compact-widget-card">
                  <div className="widget-card-header">
                    <div>
                      <h4 className="widget-title">Task Status</h4>
                      <p className="widget-subtitle">Current status breakdown</p>
                    </div>
                  </div>
                  <div className="compact-donut-container">
                    <div style={{ position: 'relative', width: '100px', height: '100px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <svg width="100" height="100" viewBox="0 0 36 36">
                        <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="#f1f5f9" strokeWidth="4" />
                        <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="#10b981" strokeWidth="4" strokeDasharray={`${strokeCompleted}, 100`} />
                        <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="#f97316" strokeWidth="4" strokeDasharray={`${strokeInProgress}, 100`} strokeDashoffset={`-${strokeCompleted}`} />
                        <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="#f59e0b" strokeWidth="4" strokeDasharray={`${strokeAssigned}, 100`} strokeDashoffset={`-${strokeCompleted + strokeInProgress}`} />
                      </svg>
                      <div style={{ position: 'absolute', textAlign: 'center' }}>
                        <span style={{ fontSize: '1.1rem', fontWeight: 900, color: '#0f172a' }}>{totalAssigned}</span>
                      </div>
                    </div>

                    <div className="compact-legend-list">
                      <div className="compact-legend-item"><span className="legend-dot" style={{ backgroundColor: '#f59e0b' }}></span>Pending: {pendingCount}</div>
                      <div className="compact-legend-item"><span className="legend-dot" style={{ backgroundColor: '#2563eb' }}></span>Accepted: {acceptedCount}</div>
                      <div className="compact-legend-item"><span className="legend-dot" style={{ backgroundColor: '#f97316' }}></span>Progress: {inProgressCount}</div>
                      <div className="compact-legend-item"><span className="legend-dot" style={{ backgroundColor: '#10b981' }}></span>Done: {completedCount}</div>
                      <div className="compact-legend-item"><span className="legend-dot" style={{ backgroundColor: '#ef4444' }}></span>Rejected: {rejectedCount}</div>
                    </div>
                  </div>
                </div>

                {/* 2. TODAY'S PERFORMANCE BAR */}
                <div className="compact-widget-card">
                  <div className="widget-card-header">
                    <div>
                      <h4 className="widget-title">Today's Performance</h4>
                      <p className="widget-subtitle">Shift resolution stats</p>
                    </div>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', fontWeight: 700 }}>
                      <span>Done Today</span><span style={{ color: '#10b981' }}>{completedTodayCount} Tasks</span>
                    </div>
                    <div className="category-progress-bg"><div className="category-progress-fill" style={{ width: `${Math.min(completedTodayCount * 25, 100)}%`, backgroundColor: '#10b981' }}></div></div>
                    
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', fontWeight: 700, marginTop: '0.2rem' }}>
                      <span>Pending Orders</span><span style={{ color: '#f59e0b' }}>{pendingCount} Tasks</span>
                    </div>
                    <div className="category-progress-bg"><div className="category-progress-fill" style={{ width: `${Math.min(pendingCount * 25, 100)}%`, backgroundColor: '#f59e0b' }}></div></div>
                  </div>
                </div>

                {/* 3. WEEKLY TASKS MINI LINE */}
                <div className="compact-widget-card">
                  <div className="widget-card-header">
                    <div>
                      <h4 className="widget-title">Weekly Workload</h4>
                      <p className="widget-subtitle">Daily completion trend</p>
                    </div>
                  </div>
                  <div style={{ height: '90px', width: '100%' }}>
                    <svg viewBox="0 0 300 90" style={{ width: '100%', height: '100%' }}>
                      <path d="M0,70 Q50,40 100,55 T200,25 T300,35" fill="none" stroke="#2563eb" strokeWidth="3.5" strokeLinecap="round" />
                      <circle cx="100" cy="55" r="4" fill="#0f4fa8" />
                      <circle cx="200" cy="25" r="4" fill="#0f4fa8" />
                      <circle cx="300" cy="35" r="4" fill="#0f4fa8" />
                    </svg>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.68rem', color: '#64748b', fontWeight: 700, marginTop: '0.2rem' }}>
                      <span>M</span><span>T</span><span>W</span><span>T</span><span>F</span><span>S</span><span>S</span>
                    </div>
                  </div>
                </div>

                {/* 4. MONTHLY TREND MINI AREA */}
                <div className="compact-widget-card">
                  <div className="widget-card-header">
                    <div>
                      <h4 className="widget-title">Monthly Volume</h4>
                      <p className="widget-subtitle">Resolution rate trend</p>
                    </div>
                  </div>
                  <div style={{ height: '90px', width: '100%' }}>
                    <svg viewBox="0 0 300 90" style={{ width: '100%', height: '100%' }}>
                      <defs>
                        <linearGradient id="miniGreenGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#10b981" stopOpacity="0.4" />
                          <stop offset="100%" stopColor="#10b981" stopOpacity="0.0" />
                        </linearGradient>
                      </defs>
                      <path d="M0,80 C60,60 120,40 180,20 C240,10 270,30 300,15 L300,90 L0,90 Z" fill="url(#miniGreenGrad)" />
                      <path d="M0,80 C60,60 120,40 180,20 C240,10 270,30 300,15" fill="none" stroke="#10b981" strokeWidth="3" />
                    </svg>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.68rem', color: '#64748b', fontWeight: 700, marginTop: '0.2rem' }}>
                      <span>Jan</span><span>Mar</span><span>May</span><span>Jul</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* COMPACT WIDGETS ROW 2 (CATEGORY BARS, PERFORMANCE SCORECARD, RECENT ACTIVITY LOG) */}
              <div className="analytics-widget-row-3">
                {/* 5. CATEGORY DISTRIBUTION */}
                <div className="compact-widget-card">
                  <div className="widget-card-header">
                    <div>
                      <h4 className="widget-title">Category Distribution</h4>
                      <p className="widget-subtitle">Tasks by specialty</p>
                    </div>
                  </div>
                  <div className="compact-category-list">
                    {[
                      { name: 'Electrical', count: categoryCounts.Electrical, color: '#f59e0b' },
                      { name: 'Plumbing', count: categoryCounts.Plumbing, color: '#2563eb' },
                      { name: 'Water Supply', count: categoryCounts.Water, color: '#06b6d4' },
                      { name: 'Mess & Food', count: categoryCounts.Food, color: '#eab308' },
                      { name: 'Internet / Wi-Fi', count: categoryCounts.Internet, color: '#6366f1' },
                    ].map(cat => {
                      const percentage = Math.min(Math.round((cat.count / totalForDonut) * 100), 100);
                      return (
                        <div key={cat.name}>
                          <div className="category-row-label">
                            <span>{cat.name}</span>
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

                {/* 6. PERFORMANCE SCORECARD */}
                <div className="compact-widget-card" style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)', color: '#ffffff' }}>
                  <div className="widget-card-header">
                    <div>
                      <h4 className="widget-title" style={{ color: '#ffffff' }}>Performance Score</h4>
                      <p className="widget-subtitle" style={{ color: '#94a3b8' }}>Technician KPI rating</p>
                    </div>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.65rem' }}>
                    <div style={{ background: 'rgba(255, 255, 255, 0.08)', padding: '0.85rem', borderRadius: '10px', border: '1px solid rgba(255, 255, 255, 0.12)' }}>
                      <span style={{ fontSize: '0.65rem', color: '#94a3b8', fontWeight: 700 }}>Completion Rate</span>
                      <div style={{ fontSize: '1.4rem', fontWeight: 900, color: '#10b981', marginTop: '0.2rem' }}>95.8%</div>
                    </div>
                    <div style={{ background: 'rgba(255, 255, 255, 0.08)', padding: '0.85rem', borderRadius: '10px', border: '1px solid rgba(255, 255, 255, 0.12)' }}>
                      <span style={{ fontSize: '0.65rem', color: '#94a3b8', fontWeight: 700 }}>Avg Rating</span>
                      <div style={{ fontSize: '1.4rem', fontWeight: 900, color: '#f59e0b', marginTop: '0.2rem' }}>4.9 / 5.0</div>
                    </div>
                    <div style={{ background: 'rgba(255, 255, 255, 0.08)', padding: '0.85rem', borderRadius: '10px', border: '1px solid rgba(255, 255, 255, 0.12)' }}>
                      <span style={{ fontSize: '0.65rem', color: '#94a3b8', fontWeight: 700 }}>Active Tasks</span>
                      <div style={{ fontSize: '1.4rem', fontWeight: 900, color: '#3b82f6', marginTop: '0.2rem' }}>{activeUncompletedCount}</div>
                    </div>
                    <div style={{ background: 'rgba(255, 255, 255, 0.08)', padding: '0.85rem', borderRadius: '10px', border: '1px solid rgba(255, 255, 255, 0.12)' }}>
                      <span style={{ fontSize: '0.65rem', color: '#94a3b8', fontWeight: 700 }}>Done Today</span>
                      <div style={{ fontSize: '1.4rem', fontWeight: 900, color: '#34d399', marginTop: '0.2rem' }}>{completedTodayCount}</div>
                    </div>
                  </div>
                </div>

                {/* 7. RECENT ACTIVITY LOG */}
                <div className="compact-widget-card">
                  <div className="widget-card-header">
                    <div>
                      <h4 className="widget-title">Recent Activity</h4>
                      <p className="widget-subtitle">Latest 5 updates</p>
                    </div>
                  </div>
                  {recentActivities.length === 0 ? (
                    <div style={{ padding: '1rem 0', textAlign: 'center', color: '#64748b', fontSize: '0.8rem' }}>
                      No recent activities.
                    </div>
                  ) : (
                    <div className="activity-feed-list">
                      {recentActivities.map((act) => (
                        <div key={act.id} className="activity-feed-item">
                          <div className="activity-icon-box" style={{ backgroundColor: `${act.color}15`, color: act.color }}>
                            {act.icon}
                          </div>
                          <div className="activity-content">
                            <h5 className="activity-title">{act.actionText}</h5>
                            <p className="activity-meta">{act.dateStr}</p>
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
                  <svg className="worker-search-icon" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <circle cx="11" cy="11" r="8" />
                    <line x1="21" y1="21" x2="16.65" y2="16.65" />
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
                  <option value="High">High Priority</option>
                  <option value="Medium">Medium Priority</option>
                  <option value="Low">Low Priority</option>
                </select>

                <select className="worker-select-filter" value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)}>
                  <option value="All">All Categories</option>
                  <option value="Electrical">Electrical</option>
                  <option value="Plumbing">Plumbing</option>
                  <option value="Water Supply">Water Supply</option>
                  <option value="Internet">Internet</option>
                  <option value="Cleaning">Cleaning</option>
                  <option value="Others">Others</option>
                </select>

                <select className="worker-select-filter" value={sortOrder} onChange={(e) => setSortOrder(e.target.value)}>
                  <option value="Newest">Newest First</option>
                  <option value="Oldest">Oldest First</option>
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
                <ClipboardListIcon />
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
                              <span className="worker-chip category">{c.category || t.workerCategory || 'General'}</span>
                              <span className={`worker-chip ${priorityClass}`}>
                                {priority === 'High' ? 'High Priority' : priority === 'Low' ? 'Low Priority' : 'Medium Priority'}
                              </span>
                            </div>
                          </div>
                          <span className={`worker-status-badge ${statusClass}`}>● {t.status}</span>
                        </div>

                        <div className="worker-info-grid">
                          <div className="worker-info-box">
                            <div className="worker-info-icon-wrapper"><MapPinnedIcon /></div>
                            <div>
                              <div className="worker-info-label">Room & Block</div>
                              <div className="worker-info-value">{c.location || `Block ${c.studentBlock || 'A'} - Room ${c.studentRoom || '101'}`}</div>
                            </div>
                          </div>

                          <div className="worker-info-box">
                            <div className="worker-info-icon-wrapper"><UserRoundIcon /></div>
                            <div>
                              <div className="worker-info-label">Resident Student</div>
                              <div className="worker-info-value">{c.studentName || 'Hostel Resident'}</div>
                            </div>
                          </div>

                          <div className="worker-info-box">
                            <div className="worker-info-icon-wrapper"><PhoneIcon /></div>
                            <div>
                              <div className="worker-info-label">Contact Number</div>
                              <div className="worker-info-value">
                                <a href={`tel:${c.studentPhone || '9876543210'}`}>{c.studentPhone || '9876543210'}</a>
                              </div>
                            </div>
                          </div>

                          <div className="worker-info-box">
                            <div className="worker-info-icon-wrapper"><CalendarDaysIcon /></div>
                            <div>
                              <div className="worker-info-label">Assigned Date</div>
                              <div className="worker-info-value">{new Date(t.assignedDate).toLocaleDateString()}</div>
                            </div>
                          </div>
                        </div>

                        <div className="worker-desc-card">
                          <div className="worker-desc-title"><FileTextIcon /> Issue Description</div>
                          <p className="worker-desc-text">{c.description || 'No detailed description provided.'}</p>
                        </div>
                      </div>

                      <div className="worker-actions-row">
                        {t.status === 'Assigned' && (
                          <>
                            <button className="worker-btn-primary" onClick={() => handleUpdateStatus(t.taskId, 'Accepted')}>
                              <CheckCircle2Icon /><span>Accept Task Order</span>
                            </button>
                            <button className="worker-btn-danger" onClick={() => handleUpdateStatus(t.taskId, 'Rejected')}>
                              <CircleXIcon /><span>Reject Order</span>
                            </button>
                          </>
                        )}
                        {t.status === 'Accepted' && (
                          <button className="worker-btn-primary" onClick={() => handleUpdateStatus(t.taskId, 'In Progress')}>
                            <WrenchIcon /><span>Start Repair (In Progress)</span>
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
                <Clock3Icon />
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
                              <span className="worker-chip category">In Progress Repair</span>
                              <span className={`worker-chip ${priorityClass}`}>{priority} Priority</span>
                            </div>
                          </div>
                          <span className="worker-status-badge in-progress">● In Progress</span>
                        </div>

                        <div className="worker-info-grid">
                          <div className="worker-info-box">
                            <div className="worker-info-icon-wrapper"><MapPinnedIcon /></div>
                            <div>
                              <div className="worker-info-label">Room & Block</div>
                              <div className="worker-info-value">{c.location || `Block ${c.studentBlock || 'A'} - Room ${c.studentRoom || '101'}`}</div>
                            </div>
                          </div>
                          <div className="worker-info-box">
                            <div className="worker-info-icon-wrapper"><UserRoundIcon /></div>
                            <div>
                              <div className="worker-info-label">Resident Student</div>
                              <div className="worker-info-value">{c.studentName || 'Hostel Resident'}</div>
                            </div>
                          </div>
                        </div>

                        <div className="worker-desc-card">
                          <div className="worker-desc-title"><FileTextIcon /> Issue Description</div>
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
                          <CheckCircle2Icon /><span>Upload Proof & Mark Completed</span>
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
                <CheckCircle2Icon />
                <h3 className="worker-empty-title">No completed resolution reports yet</h3>
                <p className="worker-empty-text">Completed maintenance tasks will be archived here with proof photos and CSV export!</p>
              </div>
            ) : (
              <>
                <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '1rem' }}>
                  <button className="worker-btn-primary" onClick={() => handleExportCSV()}>
                    <DownloadIcon /><span>Export All Reports (CSV)</span>
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
                                <span className="worker-chip category">Completed</span>
                              </div>
                            </div>
                            <span className="worker-status-badge completed">● Completed</span>
                          </div>

                          <div className="worker-info-grid">
                            <div className="worker-info-box">
                              <div className="worker-info-icon-wrapper"><MapPinnedIcon /></div>
                              <div>
                                <div className="worker-info-label">Room & Block</div>
                                <div className="worker-info-value">{c.location || `Block ${c.studentBlock || 'A'} - Room ${c.studentRoom || '101'}`}</div>
                              </div>
                            </div>
                            <div className="worker-info-box">
                              <div className="worker-info-icon-wrapper"><CalendarDaysIcon /></div>
                              <div>
                                <div className="worker-info-label">Completion Date</div>
                                <div className="worker-info-value">{new Date(t.assignedDate).toLocaleDateString()}</div>
                              </div>
                            </div>
                          </div>

                          <div className="worker-resolution-card">
                            <div className="worker-resolution-title">Resolution Report & Uploaded Proof</div>
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
                            <DownloadIcon /><span>Download Report CSV</span>
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </>
            )
          )}

          {/* TAB 5: REJECTED TASKS */}
          {activeTab === 'Rejected Tasks' && (
            loading ? (
              <div style={{ textAlign: 'center', padding: '4rem 0', color: '#64748b', fontWeight: 600 }}>
                Loading rejected tasks...
              </div>
            ) : displayedTabTasks.length === 0 ? (
              <div className="worker-empty-state">
                <CircleXIcon />
                <h3 className="worker-empty-title">No rejected maintenance tasks</h3>
                <p className="worker-empty-text">Rejected task orders will appear here for audit history.</p>
              </div>
            ) : (
              <div className="worker-tasks-grid">
                {displayedTabTasks.map(t => {
                  const c = t.complaint || {};
                  return (
                    <div key={t._id || t.taskId} className="worker-task-card priority-high">
                      <div>
                        <div className="worker-card-header">
                          <div>
                            <h3 className="worker-card-title">{c.title || 'Hostel Maintenance Repair'}</h3>
                            <div className="worker-chips-row">
                              <span className="worker-chip ticket-id">#ID: {t.taskId}</span>
                              <span className="worker-chip priority-high">Rejected Order</span>
                            </div>
                          </div>
                          <span className="worker-status-badge rejected">● Rejected</span>
                        </div>

                        <div className="worker-info-grid">
                          <div className="worker-info-box">
                            <div className="worker-info-icon-wrapper"><MapPinnedIcon /></div>
                            <div>
                              <div className="worker-info-label">Room & Block</div>
                              <div className="worker-info-value">{c.location || `Block ${c.studentBlock || 'A'} - Room ${c.studentRoom || '101'}`}</div>
                            </div>
                          </div>
                          <div className="worker-info-box">
                            <div className="worker-info-icon-wrapper"><CalendarDaysIcon /></div>
                            <div>
                              <div className="worker-info-label">Assigned Date</div>
                              <div className="worker-info-value">{new Date(t.assignedDate).toLocaleDateString()}</div>
                            </div>
                          </div>
                        </div>

                        <div className="worker-desc-card">
                          <div className="worker-desc-title"><FileTextIcon /> Issue Description</div>
                          <p className="worker-desc-text">{c.description || 'No detailed description provided.'}</p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )
          )}

          {/* TAB 6: MY PROFILE & DUTY */}
          {activeTab === 'My Profile & Duty' && (
            <div style={{ backgroundColor: '#ffffff', borderRadius: '16px', padding: '1.75rem', border: '1px solid #e2e8f0', boxShadow: '0 2px 6px rgba(0,0,0,0.02)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', paddingBottom: '1.5rem', borderBottom: '1px solid #e2e8f0', marginBottom: '1.5rem' }}>
                <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: 'linear-gradient(135deg, #0f4fa8 0%, #2563eb 100%)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.6rem', fontWeight: 800, border: '3px solid #bfdbfe' }}>
                  {avatarInitials}
                </div>
                <div>
                  <h2 style={{ margin: 0, fontSize: '1.35rem', fontWeight: 800, color: '#0f172a' }}>{workerName}</h2>
                  <p style={{ margin: '3px 0 0', color: '#2563eb', fontWeight: 700, fontSize: '0.9rem' }}>{workerCategory} Technician</p>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', marginTop: '0.4rem', fontSize: '0.75rem', fontWeight: 800, color: '#10b981', backgroundColor: '#ecfdf5', padding: '0.2rem 0.65rem', borderRadius: '12px', border: '1px solid #a7f3d0' }}>
                    ● ACTIVE ON DUTY
                  </span>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.25rem' }}>
                <div style={{ backgroundColor: '#f8fafc', padding: '1.15rem', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                  <span style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 700, textTransform: 'uppercase' }}>OFFICIAL WORKER EMAIL</span>
                  <div style={{ fontSize: '0.95rem', fontWeight: 800, color: '#0f172a', marginTop: '0.2rem' }}>{user?.email || 'workers@campuscare.com'}</div>
                </div>

                <div style={{ backgroundColor: '#f8fafc', padding: '1.15rem', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                  <span style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 700, textTransform: 'uppercase' }}>CONTACT PHONE NUMBER</span>
                  <div style={{ fontSize: '0.95rem', fontWeight: 800, color: '#0f172a', marginTop: '0.2rem' }}>{user?.phone || '9876543210'}</div>
                </div>

                <div style={{ backgroundColor: '#f8fafc', padding: '1.15rem', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                  <span style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 700, textTransform: 'uppercase' }}>ASSIGNED MAINTENANCE STATION</span>
                  <div style={{ fontSize: '0.95rem', fontWeight: 800, color: '#0f172a', marginTop: '0.2rem' }}>Campus Central Maintenance Yard</div>
                </div>

                <div style={{ backgroundColor: '#f8fafc', padding: '1.15rem', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                  <span style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 700, textTransform: 'uppercase' }}>COMPLETED REPAIR ORDERS</span>
                  <div style={{ fontSize: '0.95rem', fontWeight: 800, color: '#059669', marginTop: '0.2rem' }}>{completedCount} Tasks Resolved</div>
                </div>
              </div>
            </div>
          )}

        </main>
      </div>

      {/* 3. UPLOAD PROOF & COMPLETE TASK MODAL */}
      {selectedTaskModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(15, 23, 42, 0.45)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999 }}>
          <div style={{ maxWidth: '540px', width: '92%', backgroundColor: '#ffffff', borderRadius: '18px', overflow: 'hidden', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)', border: '1px solid #e2e8f0' }}>
            <div style={{ background: 'linear-gradient(135deg, #0f4fa8 0%, #2563eb 100%)', padding: '1.15rem 1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: '#ffffff' }}>
              <div>
                <span style={{ fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.1em', color: '#93c5fd', fontWeight: 700 }}>Task Resolution Report</span>
                <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 850 }}>Submit Repair Completion</h3>
              </div>
              <button 
                onClick={() => setSelectedTaskModal(null)} 
                style={{ background: 'rgba(255,255,255,0.15)', border: 'none', color: '#fff', width: '30px', height: '30px', borderRadius: '50%', cursor: 'pointer', fontSize: '1.1rem', fontWeight: 700 }}
              >
                ×
              </button>
            </div>

            <form 
              onSubmit={(e) => {
                e.preventDefault();
                handleUpdateStatus(selectedTaskModal.taskId, 'Completed', { completionNotes, proofImage });
              }} 
              style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.15rem' }}
            >
              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#0f172a', marginBottom: '0.3rem' }}>
                  Resolution Summary & Action Report *
                </label>
                <textarea
                  required
                  rows={3}
                  placeholder="Explain repair actions completed (e.g. Fixed circuit breaker, replaced faucet...)"
                  value={completionNotes}
                  onChange={(e) => setCompletionNotes(e.target.value)}
                  style={{ width: '100%', padding: '0.75rem', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '0.85rem', outline: 'none', backgroundColor: '#fafafa', boxSizing: 'border-box', fontFamily: 'inherit' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#0f172a', marginBottom: '0.3rem' }}>
                  Upload Photo / Video Proof of Completion
                </label>
                
                <label className="worker-dropzone">
                  <input
                    type="file"
                    accept="image/*,video/*"
                    onChange={handleImageUpload}
                    style={{ display: 'none' }}
                  />
                  <div className="worker-dropzone-text">Click or drag image file to upload</div>
                  <div className="worker-dropzone-sub">Supports JPEG, PNG, WEBP proof images</div>
                </label>

                {proofImage && (
                  <div style={{ marginTop: '0.75rem', position: 'relative', display: 'inline-block' }}>
                    <img src={proofImage} alt="Uploaded Proof Preview" style={{ maxHeight: '130px', borderRadius: '10px', border: '1px solid #cbd5e1' }} />
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

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', paddingTop: '0.5rem', borderTop: '1px solid #f1f5f9' }}>
                <button
                  type="button"
                  onClick={() => setSelectedTaskModal(null)}
                  style={{ padding: '0.65rem 1.15rem', borderRadius: '8px', border: '1px solid #cbd5e1', backgroundColor: '#ffffff', color: '#475569', fontWeight: 700, fontSize: '0.84rem', cursor: 'pointer' }}
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
              style={{ position: 'absolute', top: '-15px', right: '-15px', backgroundColor: '#0f172a', color: '#fff', border: '2px solid #fff', borderRadius: '50%', width: '32px', height: '32px', cursor: 'pointer', fontSize: '1.2rem', fontWeight: 'bold', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
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
