import React, { useState, useEffect } from 'react';
import logo from '../assets/CC.png';
import '../styles/WorkerDashboard.css';
import { useSocket } from '../context/SocketContext';

// SVG Lucide Vector Icons (Zero Emojis)
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

const MapPinIcon = () => (
  <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" />
    <circle cx="12" cy="10" r="3" />
  </svg>
);

const PhoneIcon = () => (
  <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
    <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72 12.84 12.84 0 00.7 2.81 2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45 12.84 12.84 0 002.81.7A2 2 0 0122 16.92z" />
  </svg>
);

const CalendarIcon = () => (
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
  </svg>
);

const WrenchIcon = () => (
  <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
    <path d="M14.7 6.3a1 1 0 000 1.4l1.6 1.6a1 1 0 001.4 0l3.77-3.77a6 6 0 01-7.94 7.94l-6.91 6.91a2.12 2.12 0 01-3-3l6.91-6.91a6 6 0 017.94-7.94l-3.76 3.76z" />
  </svg>
);

const BellIcon = () => (
  <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
    <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9" />
    <path d="M13.73 21a2 2 0 01-3.46 0" />
  </svg>
);

const MessageSquareIcon = () => (
  <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
    <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
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
  const { socket } = useSocket();
  const [tasks, setTasks] = useState([]);
  const [activeTab, setActiveTab] = useState('Dashboard');

  useEffect(() => {
    if (socket) {
      const handleNewTask = (data) => {
        fetchTasks();
        alert(`You have been assigned a new ${data.task.workerCategory || 'maintenance'} task: ${data.complaint?.title || 'No Title'}`);
      };

      socket.on('new_task_assigned', handleNewTask);
      return () => {
        socket.off('new_task_assigned', handleNewTask);
      };
    }
  }, [socket]); // Dashboard, Assigned Task Orders, In Progress Repairs, Completed Reports, Rejected Tasks, My Profile & Duty
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

  // Donut chart stroke calculations
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
    let color = '#1E5BBF';
    
    if (t.status === 'Accepted') {
      actionText = `Accepted repair order #${t.taskId} for ${location}`;
      icon = <CheckCircle2Icon />;
      color = '#1D4ED8';
    } else if (t.status === 'In Progress') {
      actionText = `Started active repair on #${t.taskId} (${title})`;
      icon = <WrenchIcon />;
      color = '#F59E0B';
    } else if (t.status === 'Completed' || t.status === 'Verified' || t.status === 'Closed') {
      actionText = `Completed repair & uploaded proof for #${t.taskId}`;
      icon = <CheckCircle2Icon />;
      color = '#22C55E';
    } else if (t.status === 'Rejected') {
      actionText = `Rejected task order #${t.taskId}`;
      icon = <CircleXIcon />;
      color = '#EF4444';
    }

    return { id: t._id || idx, actionText, icon, color, dateStr, taskId: t.taskId };
  });

  return (
    <div className="worker-dashboard-layout">
      {/* 1. ENTERPRISE STICKY WHITE HEADER */}
      <header className="worker-header">
        <div className="worker-brand">
          <svg 
            width="24" 
            height="24" 
            fill="none" 
            stroke="#64748B" 
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

        {/* Header Right Actions */}
        <div className="header-actions-group">
          <div className="header-icon-btn" title="Notifications">
            <BellIcon />
            {pendingCount > 0 && <span className="header-dot-badge"></span>}
          </div>

          <div className="header-icon-btn" title="Messages">
            <MessageSquareIcon />
          </div>

          <div className="worker-user-profile" onClick={() => setShowProfileMenu(!showProfileMenu)}>
            <div className="worker-avatar">{avatarInitials}</div>
            <div className="worker-info">
              <span className="worker-name-text">{workerName}</span>
              <span className="worker-role-text">{workerCategory} Technician</span>
            </div>
            <svg width="16" height="16" fill="none" stroke="#64748B" strokeWidth="2" viewBox="0 0 24 24" style={{ transform: showProfileMenu ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
            </svg>

            {showProfileMenu && (
              <div style={{ position: 'absolute', top: '100%', right: 0, marginTop: '0.5rem', width: '220px', backgroundColor: '#ffffff', border: '1px solid #E4ECF8', borderRadius: '14px', boxShadow: '0 10px 25px rgba(0,0,0,0.1)', padding: '0.5rem 0', zIndex: 100 }}>
                <div style={{ padding: '0.75rem 1rem', borderBottom: '1px solid #F1F5F9' }}>
                  <p style={{ margin: 0, fontSize: '0.82rem', fontWeight: 700, color: '#1E293B' }}>{user?.email || 'workers@campuscare.com'}</p>
                  <p style={{ margin: '2px 0 0', fontSize: '0.72rem', color: '#22C55E', fontWeight: 800 }}>● Active On Duty</p>
                </div>
                <div style={{ padding: '0.6rem 1rem', fontSize: '0.84rem', color: '#334155', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem' }} onClick={() => { setActiveTab('My Profile & Duty'); setShowProfileMenu(false); }}>
                  <UserRoundIcon /> My Profile & Duty
                </div>
                <div style={{ padding: '0.6rem 1rem', fontSize: '0.84rem', color: '#334155', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem' }} onClick={() => { setActiveTab('Assigned Task Orders'); setShowProfileMenu(false); }}>
                  <ClipboardListIcon /> Assigned Tasks ({activeUncompletedCount})
                </div>
                <div style={{ borderTop: '1px solid #F1F5F9', padding: '0.6rem 1rem', fontSize: '0.84rem', color: '#EF4444', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem' }} onClick={onLogout}>
                  <CircleXIcon /> Log Out
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* 2. BODY LAYOUT */}
      <div className="worker-body-wrapper">
        {/* Fixed Full-Height Sidebar (280px Desktop) */}
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

          <div style={{ backgroundColor: '#F8FAFC', padding: '0.85rem', borderRadius: '12px', border: '1px solid #E4ECF8' }}>
            <span style={{ fontSize: '0.68rem', color: '#64748B', textTransform: 'uppercase', fontWeight: 700 }}>Maintenance Station</span>
            <p style={{ margin: '3px 0 0', fontSize: '0.82rem', fontWeight: 800, color: '#1E293B' }}>Central Maintenance Yard</p>
          </div>
        </aside>

        {/* Main Content Area (Max Width 1600px Centered) */}
        <main className="worker-main-content">
          
          {/* TAB 1: DASHBOARD (STATISTICS ROW + 2x2 ANALYTICS GRID - NO SCROLL) */}
          {activeTab === 'Dashboard' && (
            <>
              {/* 1. STATISTICS ROW: EXACTLY 6 EQUAL CARDS */}
              <div className="worker-kpi-grid-6">
                <div className="worker-kpi-card">
                  <span className="worker-kpi-label">
                    <span>Assigned Orders</span>
                    <span className="kpi-trend-badge">+12%</span>
                  </span>
                  <div className="worker-kpi-flex">
                    <span className="worker-kpi-number">{totalAssigned}</span>
                    <div className="worker-kpi-icon-box" style={{ backgroundColor: '#EFF6FF', color: '#1E5BBF' }}><ClipboardListIcon /></div>
                  </div>
                </div>

                <div className="worker-kpi-card">
                  <span className="worker-kpi-label">
                    <span>Pending</span>
                    <span className="kpi-trend-badge" style={{ backgroundColor: '#FEF3C7', color: '#B45309' }}>Action Req</span>
                  </span>
                  <div className="worker-kpi-flex">
                    <span className="worker-kpi-number" style={{ color: '#B45309' }}>{pendingCount}</span>
                    <div className="worker-kpi-icon-box" style={{ backgroundColor: '#FEF3C7', color: '#B45309' }}><Clock3Icon /></div>
                  </div>
                </div>

                <div className="worker-kpi-card">
                  <span className="worker-kpi-label">
                    <span>In Progress</span>
                    <span className="kpi-trend-badge" style={{ backgroundColor: '#FFF7ED', color: '#C2410C' }}>Active</span>
                  </span>
                  <div className="worker-kpi-flex">
                    <span className="worker-kpi-number" style={{ color: '#C2410C' }}>{inProgressCount}</span>
                    <div className="worker-kpi-icon-box" style={{ backgroundColor: '#FFF7ED', color: '#C2410C' }}><WrenchIcon /></div>
                  </div>
                </div>

                <div className="worker-kpi-card">
                  <span className="worker-kpi-label">
                    <span>Completed Today</span>
                    <span className="kpi-trend-badge">Shift Done</span>
                  </span>
                  <div className="worker-kpi-flex">
                    <span className="worker-kpi-number" style={{ color: '#22C55E' }}>{completedTodayCount}</span>
                    <div className="worker-kpi-icon-box" style={{ backgroundColor: '#ECFDF5', color: '#22C55E' }}><CheckCircle2Icon /></div>
                  </div>
                </div>

                <div className="worker-kpi-card">
                  <span className="worker-kpi-label">
                    <span>Total Completed</span>
                    <span className="kpi-trend-badge">+100%</span>
                  </span>
                  <div className="worker-kpi-flex">
                    <span className="worker-kpi-number" style={{ color: '#059669' }}>{completedCount}</span>
                    <div className="worker-kpi-icon-box" style={{ backgroundColor: '#D1FAE5', color: '#059669' }}><CheckCircle2Icon /></div>
                  </div>
                </div>

                <div className="worker-kpi-card">
                  <span className="worker-kpi-label">
                    <span>Avg Resolution Time</span>
                    <span className="kpi-trend-badge">Fast</span>
                  </span>
                  <div className="worker-kpi-flex">
                    <span className="worker-kpi-number" style={{ color: '#6366F1' }}>42<span style={{ fontSize: '14px', fontWeight: 600 }}>m</span></span>
                    <div className="worker-kpi-icon-box" style={{ backgroundColor: '#E0E7FF', color: '#6366F1' }}><Clock3Icon /></div>
                  </div>
                </div>
              </div>

              {/* 2. ANALYTICS SECTION: 2 ROWS x 2 COLUMNS (4 COMPACT CARDS) */}
              <div className="analytics-grid-2x2">
                {/* WIDGET 1: TASK STATUS COMPACT DONUT */}
                <div className="compact-analytics-card">
                  <div>
                    <h3 className="card-heading-blue"><LayoutDashboardIcon /> Task Status</h3>
                    <p className="card-subtitle-gray">Compact status distribution</p>
                  </div>
                  <div className="donut-widget-body">
                    <div style={{ position: 'relative', width: '120px', height: '120px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <svg width="120" height="120" viewBox="0 0 36 36">
                        <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="#F1F5F9" strokeWidth="3.8" />
                        <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="#22C55E" strokeWidth="3.8" strokeDasharray={`${strokeCompleted}, 100`} />
                        <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="#F97316" strokeWidth="3.8" strokeDasharray={`${strokeInProgress}, 100`} strokeDashoffset={`-${strokeCompleted}`} />
                        <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="#F59E0B" strokeWidth="3.8" strokeDasharray={`${strokeAssigned}, 100`} strokeDashoffset={`-${strokeCompleted + strokeInProgress}`} />
                      </svg>
                      <div style={{ position: 'absolute', textAlign: 'center' }}>
                        <span style={{ fontSize: '1.25rem', fontWeight: 800, color: '#1E293B' }}>{totalAssigned}</span>
                      </div>
                    </div>

                    <div className="donut-legend-stack">
                      <div className="legend-row"><span className="legend-dot-indicator" style={{ backgroundColor: '#F59E0B' }}></span>Pending: {pendingCount}</div>
                      <div className="legend-row"><span className="legend-dot-indicator" style={{ backgroundColor: '#1E5BBF' }}></span>Accepted: {acceptedCount}</div>
                      <div className="legend-row"><span className="legend-dot-indicator" style={{ backgroundColor: '#F97316' }}></span>In Progress: {inProgressCount}</div>
                      <div className="legend-row"><span className="legend-dot-indicator" style={{ backgroundColor: '#22C55E' }}></span>Completed: {completedCount}</div>
                      <div className="legend-row"><span className="legend-dot-indicator" style={{ backgroundColor: '#EF4444' }}></span>Rejected: {rejectedCount}</div>
                    </div>
                  </div>
                </div>

                {/* WIDGET 2: WEEKLY PERFORMANCE MINI LINE */}
                <div className="compact-analytics-card">
                  <div>
                    <h3 className="card-heading-blue"><Clock3Icon /> Weekly Performance</h3>
                    <p className="card-subtitle-gray">Tasks completed per day (Mon - Sun)</p>
                  </div>
                  <div style={{ height: '110px', width: '100%' }}>
                    <svg viewBox="0 0 300 90" style={{ width: '100%', height: '100%' }}>
                      <path d="M0,75 Q50,45 100,60 T200,30 T300,40" fill="none" stroke="#1E5BBF" strokeWidth="3.5" strokeLinecap="round" />
                      <circle cx="100" cy="60" r="4.5" fill="#1E5BBF" />
                      <circle cx="200" cy="30" r="4.5" fill="#1E5BBF" />
                      <circle cx="300" cy="40" r="4.5" fill="#1E5BBF" />
                    </svg>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: '#64748B', fontWeight: 600, marginTop: '0.2rem' }}>
                      <span>Mon</span><span>Tue</span><span>Wed</span><span>Thu</span><span>Fri</span><span>Sat</span><span>Sun</span>
                    </div>
                  </div>
                </div>

                {/* WIDGET 3: CATEGORY DISTRIBUTION HORIZONTAL BARS */}
                <div className="compact-analytics-card">
                  <div>
                    <h3 className="card-heading-blue"><WrenchIcon /> Category Distribution</h3>
                    <p className="card-subtitle-gray">Task volume by specialty</p>
                  </div>
                  <div className="category-bars-stack">
                    {[
                      { name: 'Electrical', count: categoryCounts.Electrical, color: '#F59E0B' },
                      { name: 'Plumbing', count: categoryCounts.Plumbing, color: '#1E5BBF' },
                      { name: 'Water Supply', count: categoryCounts.Water, color: '#06B6D4' },
                      { name: 'Mess & Food', count: categoryCounts.Food, color: '#EAB308' },
                      { name: 'Internet / Wi-Fi', count: categoryCounts.Internet, color: '#6366F1' },
                    ].map(cat => {
                      const percentage = Math.min(Math.round((cat.count / totalForDonut) * 100), 100);
                      return (
                        <div key={cat.name} className="category-bar-row">
                          <div className="category-bar-meta">
                            <span>{cat.name}</span>
                            <span>{cat.count} Tasks ({percentage}%)</span>
                          </div>
                          <div className="category-bar-track">
                            <div className="category-bar-fill" style={{ width: `${Math.max(percentage, 8)}%`, backgroundColor: cat.color }}></div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* WIDGET 4: RECENT ACTIVITY (SCROLLABLE INSIDE CARD) */}
                <div className="compact-analytics-card">
                  <div>
                    <h3 className="card-heading-blue"><ClipboardListIcon /> Recent Activity</h3>
                    <p className="card-subtitle-gray">Latest 5 updates (scrollable)</p>
                  </div>
                  {recentActivities.length === 0 ? (
                    <div style={{ padding: '1.5rem 0', textAlign: 'center', color: '#64748B', fontSize: '13px' }}>
                      No recent duty activities.
                    </div>
                  ) : (
                    <div className="activity-feed-scrollable">
                      {recentActivities.map((act) => (
                        <div key={act.id} className="activity-feed-item">
                          <div className="activity-icon-box" style={{ backgroundColor: `${act.color}15`, color: act.color }}>
                            {act.icon}
                          </div>
                          <div className="activity-content">
                            <h5 className="activity-title">{act.actionText}</h5>
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
              <div className="worker-search-input-wrapper">
                <svg className="worker-search-icon" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <circle cx="11" cy="11" r="8" />
                  <line x1="21" y1="21" x2="16.65" y2="16.65" />
                </svg>
                <input
                  type="text"
                  className="worker-search-input"
                  placeholder="Search by complaint title, ticket ID, room, student..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
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
          )}

          {/* TAB 2: ASSIGNED TASK ORDERS */}
          {activeTab === 'Assigned Task Orders' && (
            loading ? (
              <div style={{ textAlign: 'center', padding: '4rem 0', color: '#64748B', fontWeight: 600 }}>
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
                            <div className="worker-info-icon-wrapper"><MapPinIcon /></div>
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
                            <div className="worker-info-icon-wrapper"><CalendarIcon /></div>
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
              <div style={{ textAlign: 'center', padding: '4rem 0', color: '#64748B', fontWeight: 600 }}>
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
                            <div className="worker-info-icon-wrapper"><MapPinIcon /></div>
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
                      </div>

                      <div className="worker-actions-row">
                        <button className="worker-btn-primary" onClick={() => setSelectedTaskModal(t)}>
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
              <div style={{ textAlign: 'center', padding: '4rem 0', color: '#64748B', fontWeight: 600 }}>
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
                              <div className="worker-info-icon-wrapper"><MapPinIcon /></div>
                              <div>
                                <div className="worker-info-label">Room & Block</div>
                                <div className="worker-info-value">{c.location || `Block ${c.studentBlock || 'A'} - Room ${c.studentRoom || '101'}`}</div>
                              </div>
                            </div>
                            <div className="worker-info-box">
                              <div className="worker-info-icon-wrapper"><CalendarIcon /></div>
                              <div>
                                <div className="worker-info-label">Completion Date</div>
                                <div className="worker-info-value">{new Date(t.assignedDate).toLocaleDateString()}</div>
                              </div>
                            </div>
                          </div>

                          <div style={{ backgroundColor: '#ECFDF5', border: '1px solid #6EE7B7', borderRadius: '12px', padding: '0.85rem 1rem', marginBottom: '1rem' }}>
                            <div style={{ fontSize: '12px', fontWeight: 700, color: '#047857', textTransform: 'uppercase', marginBottom: '0.3rem' }}>Resolution Report & Uploaded Proof</div>
                            <div style={{ fontSize: '13px', color: '#065F46', fontStyle: 'italic' }}>"{t.completionNotes || 'Repair executed and verified on site.'}"</div>
                            {t.proofImage && (
                              <div>
                                <img src={t.proofImage} alt="Resolution Proof" style={{ maxHeight: '140px', borderRadius: '8px', border: '1px solid #A7F3D0', marginTop: '0.55rem', cursor: 'zoom-in' }} onClick={() => setZoomImage(t.proofImage)} />
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="worker-actions-row">
                          <button className="worker-btn-secondary" onClick={() => handleExportCSV(t)}>
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
              <div style={{ textAlign: 'center', padding: '4rem 0', color: '#64748B', fontWeight: 600 }}>
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
                            <div className="worker-info-icon-wrapper"><MapPinIcon /></div>
                            <div>
                              <div className="worker-info-label">Room & Block</div>
                              <div className="worker-info-value">{c.location || `Block ${c.studentBlock || 'A'} - Room ${c.studentRoom || '101'}`}</div>
                            </div>
                          </div>
                          <div className="worker-info-box">
                            <div className="worker-info-icon-wrapper"><CalendarIcon /></div>
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
          {activeTab === 'My Profile & Duty' && (() => {
            const profileActiveCount = tasks.filter(t => ['Assigned', 'Accepted', 'In Progress'].includes(t.status)).length;
            const profileCompletedCount = tasks.filter(t => ['Completed', 'Verified', 'Closed'].includes(t.status)).length;

            const resolutionTimes = tasks
              .filter(t => t.completedDate && t.assignedDate && ['Completed', 'Verified', 'Closed'].includes(t.status))
              .map(t => new Date(t.completedDate) - new Date(t.assignedDate));
            
            const avgResolutionTimeStr = resolutionTimes.length > 0
              ? (resolutionTimes.reduce((sum, time) => sum + time, 0) / resolutionTimes.length / 3600000).toFixed(1) + ' Hours'
              : 'N/A';

            return (
              <div style={{ backgroundColor: '#ffffff', borderRadius: '18px', padding: '1.75rem', border: '1px solid #E4ECF8', boxShadow: '0 4px 14px rgba(30, 91, 191, 0.04)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', paddingBottom: '1.5rem', borderBottom: '1px solid #E4ECF8', marginBottom: '1.5rem' }}>
                  <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: 'linear-gradient(135deg, #1E5BBF 0%, #2563EB 100%)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.6rem', fontWeight: 800, border: '3px solid #BFDBFE' }}>
                    {avatarInitials}
                  </div>
                  <div>
                    <h2 style={{ margin: 0, fontSize: '1.35rem', fontWeight: 800, color: '#1E293B' }}>{workerName}</h2>
                    <p style={{ margin: '3px 0 0', color: '#1E5BBF', fontWeight: 700, fontSize: '0.9rem' }}>{workerCategory} Technician</p>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', marginTop: '0.4rem', fontSize: '0.75rem', fontWeight: 800, color: (user?.status === 'Inactive') ? '#EF4444' : '#22C55E', backgroundColor: (user?.status === 'Inactive') ? '#FEF2F2' : '#ECFDF5', padding: '0.2rem 0.65rem', borderRadius: '12px', border: (user?.status === 'Inactive') ? '1px solid #FCA5A5' : '1px solid #A7F3D0' }}>
                      ● {user?.status === 'Inactive' ? 'INACTIVE (OFF DUTY)' : 'ACTIVE ON DUTY'}
                    </span>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.25rem' }}>
                  <div style={{ backgroundColor: '#F8FAFC', padding: '1.15rem', borderRadius: '12px', border: '1px solid #E4ECF8' }}>
                    <span style={{ fontSize: '11px', color: '#64748B', fontWeight: 700, textTransform: 'uppercase' }}>OFFICIAL WORKER EMAIL</span>
                    <div style={{ fontSize: '14px', fontWeight: 800, color: '#1E293B', marginTop: '0.2rem' }}>{user?.email || 'N/A'}</div>
                  </div>

                  <div style={{ backgroundColor: '#F8FAFC', padding: '1.15rem', borderRadius: '12px', border: '1px solid #E4ECF8' }}>
                    <span style={{ fontSize: '11px', color: '#64748B', fontWeight: 700, textTransform: 'uppercase' }}>CONTACT PHONE NUMBER</span>
                    <div style={{ fontSize: '14px', fontWeight: 800, color: '#1E293B', marginTop: '0.2rem' }}>{user?.phone || 'N/A'}</div>
                  </div>

                  <div style={{ backgroundColor: '#F8FAFC', padding: '1.15rem', borderRadius: '12px', border: '1px solid #E4ECF8' }}>
                    <span style={{ fontSize: '11px', color: '#64748B', fontWeight: 700, textTransform: 'uppercase' }}>SKILL / CATEGORY</span>
                    <div style={{ fontSize: '14px', fontWeight: 800, color: '#1E293B', marginTop: '0.2rem' }}>{user?.category || user?.skill || 'General'}</div>
                  </div>

                  <div style={{ backgroundColor: '#F8FAFC', padding: '1.15rem', borderRadius: '12px', border: '1px solid #E4ECF8' }}>
                    <span style={{ fontSize: '11px', color: '#64748B', fontWeight: 700, textTransform: 'uppercase' }}>YEARS OF EXPERIENCE</span>
                    <div style={{ fontSize: '14px', fontWeight: 800, color: '#1E293B', marginTop: '0.2rem' }}>{user?.experience || 'None listed'}</div>
                  </div>

                  <div style={{ backgroundColor: '#F8FAFC', padding: '1.15rem', borderRadius: '12px', border: '1px solid #E4ECF8' }}>
                    <span style={{ fontSize: '11px', color: '#64748B', fontWeight: 700, textTransform: 'uppercase' }}>ASSIGNED HOSTEL BLOCK</span>
                    <div style={{ fontSize: '14px', fontWeight: 800, color: '#1E293B', marginTop: '0.2rem' }}>{user?.assignedBlock ? `${user.assignedBlock} Block` : 'None (Global / All Blocks)'}</div>
                  </div>

                  <div style={{ backgroundColor: '#F8FAFC', padding: '1.15rem', borderRadius: '12px', border: '1px solid #E4ECF8' }}>
                    <span style={{ fontSize: '11px', color: '#64748B', fontWeight: 700, textTransform: 'uppercase' }}>ACTIVE TASKS</span>
                    <div style={{ fontSize: '14px', fontWeight: 800, color: '#D97706', marginTop: '0.2rem' }}>{profileActiveCount} Active Task(s)</div>
                  </div>

                  <div style={{ backgroundColor: '#F8FAFC', padding: '1.15rem', borderRadius: '12px', border: '1px solid #E4ECF8' }}>
                    <span style={{ fontSize: '11px', color: '#64748B', fontWeight: 700, textTransform: 'uppercase' }}>COMPLETED REPAIR ORDERS</span>
                    <div style={{ fontSize: '14px', fontWeight: 800, color: '#059669', marginTop: '0.2rem' }}>{profileCompletedCount} Tasks Resolved</div>
                  </div>

                  <div style={{ backgroundColor: '#F8FAFC', padding: '1.15rem', borderRadius: '12px', border: '1px solid #E4ECF8' }}>
                    <span style={{ fontSize: '11px', color: '#64748B', fontWeight: 700, textTransform: 'uppercase' }}>AVERAGE RESOLUTION TIME</span>
                    <div style={{ fontSize: '14px', fontWeight: 800, color: '#2563EB', marginTop: '0.2rem' }}>{avgResolutionTimeStr}</div>
                  </div>

                  <div style={{ backgroundColor: '#F8FAFC', padding: '1.15rem', borderRadius: '12px', border: '1px solid #E4ECF8' }}>
                    <span style={{ fontSize: '11px', color: '#64748B', fontWeight: 700, textTransform: 'uppercase' }}>DUTY STATUS</span>
                    <div style={{ fontSize: '14px', fontWeight: 800, color: (user?.status === 'Inactive') ? '#EF4444' : '#22C55E', marginTop: '0.2rem' }}>
                      {user?.status === 'Inactive' ? 'Inactive (Off Duty)' : 'Active (On Duty)'}
                    </div>
                  </div>
                </div>
              </div>
            );
          })()}

        </main>
      </div>

      {/* 3. UPLOAD PROOF MODAL OVERLAY */}
      {selectedTaskModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(15, 23, 42, 0.45)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999 }}>
          <div style={{ maxWidth: '540px', width: '92%', backgroundColor: '#ffffff', borderRadius: '18px', overflow: 'hidden', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)', border: '1px solid #E4ECF8' }}>
            <div style={{ backgroundColor: '#1E5BBF', padding: '1.15rem 1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: '#ffffff' }}>
              <div>
                <span style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.1em', color: '#BFDBFE', fontWeight: 700 }}>Task Resolution Report</span>
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
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#1E293B', marginBottom: '0.3rem' }}>
                  Resolution Summary & Action Report *
                </label>
                <textarea
                  required
                  rows={3}
                  placeholder="Explain repair actions completed (e.g. Fixed circuit breaker, replaced faucet...)"
                  value={completionNotes}
                  onChange={(e) => setCompletionNotes(e.target.value)}
                  style={{ width: '100%', padding: '0.75rem', borderRadius: '10px', border: '1px solid #CBD5E1', fontSize: '13px', outline: 'none', backgroundColor: '#FAFAFA', boxSizing: 'border-box', fontFamily: 'inherit' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#1E293B', marginBottom: '0.3rem' }}>
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
                    <img src={proofImage} alt="Uploaded Proof Preview" style={{ maxHeight: '130px', borderRadius: '10px', border: '1px solid #CBD5E1' }} />
                    <button
                      type="button"
                      onClick={() => setProofImage('')}
                      style={{ position: 'absolute', top: '-8px', right: '-8px', backgroundColor: '#EF4444', color: '#fff', border: 'none', borderRadius: '50%', width: '22px', height: '22px', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 800 }}
                    >
                      ×
                    </button>
                  </div>
                )}
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', paddingTop: '0.5rem', borderTop: '1px solid #F1F5F9' }}>
                <button
                  type="button"
                  onClick={() => setSelectedTaskModal(null)}
                  style={{ padding: '0.65rem 1.15rem', borderRadius: '10px', border: '1px solid #CBD5E1', backgroundColor: '#ffffff', color: '#475569', fontWeight: 700, fontSize: '13px', cursor: 'pointer' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="worker-btn-primary"
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
              style={{ position: 'absolute', top: '-15px', right: '-15px', backgroundColor: '#1E293B', color: '#fff', border: '2px solid #fff', borderRadius: '50%', width: '32px', height: '32px', cursor: 'pointer', fontSize: '1.2rem', fontWeight: 'bold', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
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
