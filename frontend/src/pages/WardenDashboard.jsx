// src/pages/WardenDashboard.jsx
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import SpecularButton from '../components/SpecularButton';
import EventBannerCard from '../components/EventBannerCard';
import { DynamicCategoryBars } from '../components/DynamicComplaintCharts';
import '../styles/WardenDashboard.css';
import logo from '../assets/CC.png';
import IncidentGroupsChat from '../components/IncidentGroupsChat';
import GroupInsightsDashboard from '../components/GroupInsightsDashboard';
import { useSocket } from '../context/SocketContext';


const WardenDashboard = ({ user, onLogout, onUpdateProfile }) => {
  const [activeTab, setActiveTab] = useState('Dashboard');
  const [searchQuery, setSearchQuery] = useState('');
  const [mobileChatView, setMobileChatView] = useState('list');
  const [chatBlockFilter, setChatBlockFilter] = useState('All');
  const [dashboardFeedbackResponses, setDashboardFeedbackResponses] = useState([]);
  const [aiAnalysis, setAiAnalysis] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisTab, setAnalysisTab] = useState('raw'); // 'raw' | 'ai'
  
  // Profile state prefilled with Warden details
  const [profile, setProfile] = useState({
    name: user?.name || 'Head Warden',
    email: user?.email || 'headwarden@campuscare.com',
    rollNo: user?.rollNo || 'EMP-HEAD',
    phoneNo: user?.phoneNo || '9876543215',
    roomNo: user?.roomNo || 'Head-Office',
    block: user?.block || 'A, B, C, D, E, F',
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

  useEffect(() => {
    if (profile && profile.block && profile.block !== 'All' && user?.role !== 'headwarden' && profile.block.length < 5) {
      setChatBlockFilter(profile.block);
    }
  }, [profile, user]);

  // Dropdown states
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showMails, setShowMails] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  // Stats State
  const [stats, setStats] = useState({
    total: 0,
    inProgress: 0,
    resolved: 0,
    highPriority: 0,
    residents: 0
  });

  // Recent Complaints List state
  const [complaints, setComplaints] = useState([]);

  // Announcements State
  const [announcements, setAnnouncements] = useState([]);
  const [seenAnnouncementsCount, setSeenAnnouncementsCount] = useState(0);

  // Active Residents list state
  const [residents, setResidents] = useState([]);

  // Residents Filter and Search states
  const [residentSearchQuery, setResidentSearchQuery] = useState('');
  const [residentBlockFilter, setResidentBlockFilter] = useState('All');
  const [residentSortBy, setResidentSortBy] = useState('name');

  const isHeadWarden = user?.role === 'headwarden' || profile.block === 'All';

  // Extract all assigned blocks for the current warden
  const parsedWardenBlocks = useMemo(() => {
    if (isHeadWarden) return ['ALL', 'A', 'B', 'C', 'D', 'E', 'F'];
    const raw = (profile.blocks && profile.blocks.length > 0)
      ? profile.blocks
      : (profile.block ? profile.block.split(',') : ['D']);

    const set = new Set();
    raw.forEach(b => {
      const clean = b.replace(/block/i, '').trim().toUpperCase();
      if (clean) set.add(clean);
    });

    // Handle compound block names like 'ABC' or 'A, B, C'
    if (set.has('ABC') || set.has('A, B, C') || (set.has('A') && set.has('B'))) {
      set.add('A');
      set.add('B');
      set.add('C');
      set.add('ABC');
    }
    return Array.from(set);
  }, [isHeadWarden, profile.blocks, profile.block]);

  // Filtered residents list with proper block matching
  const filteredResidents = useMemo(() => {
    return residents.filter(res => {
      // 1. Strict Warden Block Enforce
      if (!isHeadWarden) {
        const resBlockClean = (res.block || '').replace(/block/i, '').trim().toUpperCase();
        const isAssigned = parsedWardenBlocks.some(b => {
          return b === resBlockClean || resBlockClean.startsWith(b) || b.startsWith(resBlockClean);
        });
        if (!isAssigned) return false;
      }

      // 2. Search Query Filter
      const query = residentSearchQuery.toLowerCase().trim();
      const matchesSearch = !query || (
        (res.name && res.name.toLowerCase().includes(query)) ||
        (res.email && res.email.toLowerCase().includes(query)) ||
        (res.roomNo && String(res.roomNo).toLowerCase().includes(query)) ||
        (res.rollNo && String(res.rollNo).toLowerCase().includes(query)) ||
        (res.block && res.block.toLowerCase().includes(query))
      );

      // 3. Block Dropdown/Pill Filter
      const filterClean = residentBlockFilter.trim().toUpperCase();
      const resBlockClean = (res.block || '').trim().toUpperCase();
      
      const matchesBlock = 
        residentBlockFilter === 'All' || 
        filterClean.includes('ASSIGNED') ||
        filterClean.includes('A, B, C') ||
        filterClean.includes('ABC') ||
        resBlockClean.includes(filterClean) ||
        filterClean.includes(resBlockClean);

      return matchesSearch && matchesBlock;
    }).sort((a, b) => {
      if (residentSortBy === 'room') {
        return String(a.roomNo || '').localeCompare(String(b.roomNo || ''), undefined, { numeric: true });
      }
      if (residentSortBy === 'roll') {
        return String(a.rollNo || '').localeCompare(String(b.rollNo || ''), undefined, { numeric: true });
      }
      return String(a.name || '').localeCompare(String(b.name || ''));
    });
  }, [residents, isHeadWarden, parsedWardenBlocks, residentSearchQuery, residentBlockFilter, residentSortBy]);

  // Workers on Duty
  const [workers, setWorkers] = useState([]);

  // Messages list state (for messages tab)
  const [chatMessages, setChatMessages] = useState([]);
  const [newMsgText, setNewMsgText] = useState('');
  const [selectedResidentEmail, setSelectedResidentEmail] = useState('');
  const [editingMessageId, setEditingMessageId] = useState(null);
  const [editingText, setEditingText] = useState('');

  // Modals state
  const [showComplaintModal, setShowComplaintModal] = useState(false);
  const [showAnnouncementModal, setShowAnnouncementModal] = useState(false);
  const [showAddWorkerModal, setShowAddWorkerModal] = useState(false);
  const [workerForm, setWorkerForm] = useState({
    id: null,
    name: '',
    email: 'workers@campuscare.com',
    phone: '',
    category: 'Electrician',
    experience: '',
    address: '',
    status: 'Active'
  });
  const [showAssignWorkerModal, setShowAssignWorkerModal] = useState(false);
  const [targetAssignComplaint, setTargetAssignComplaint] = useState(null);
  const [selectedWorkerId, setSelectedWorkerId] = useState('');
  const [workerCategoryFilter, setWorkerCategoryFilter] = useState('All');
  const [zoomImage, setZoomImage] = useState(null);
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  
  // Feedback states
  const [feedbackRequests, setFeedbackRequests] = useState([]);
  const [newFeedbackTitle, setNewFeedbackTitle] = useState('');
  const [newFeedbackDesc, setNewFeedbackDesc] = useState('');
  const [newFeedbackTargetBlock, setNewFeedbackTargetBlock] = useState('');
  const [selectedFeedbackRequest, setSelectedFeedbackRequest] = useState(null);
  const [selectedFeedbackResponses, setSelectedFeedbackResponses] = useState([]);
  const [showResponsesModal, setShowResponsesModal] = useState(false);

  // Management Messages states
  const [managementMessages, setManagementMessages] = useState([]);
  const [mgtMsgText, setMgtMsgText] = useState('');

  // Wardens Management states (for Head Warden)
  const [wardensList, setWardensList] = useState([]);
  const [selectedWardenChat, setSelectedWardenChat] = useState(null);
  const [wardenMessages, setWardenMessages] = useState([]);
  const [wardenMsgText, setWardenMsgText] = useState('');
  const [searchWardenQuery, setSearchWardenQuery] = useState('');

  const socketCtx = useSocket();
  const socket = socketCtx?.socket;
  const sendRealtimeMessage = socketCtx?.sendRealtimeMessage;

  // Real-time socket message notification listener
  useEffect(() => {
    if (!socket) return;

    const handleDirectMsg = (msg) => {
      if (!msg) return;
      
      const currentEmail = (user?.email || profile.email || '').toLowerCase();

      // 1. Management <-> Warden Messages
      if ((msg.sender === 'management' || msg.sender === 'warden') && msg.studentEmail && msg.studentEmail.toLowerCase() === currentEmail) {
        setManagementMessages(prev => {
          const exists = prev.some(m => (m.id && m.id === msg.id) || (m._id && m._id === msg._id));
          if (exists) return prev;
          return [...prev, msg];
        });
      }

      // 2. Student <-> Warden Messages
      if (msg.sender === 'student' || (msg.sender === 'warden' && msg.studentEmail && msg.studentEmail.toLowerCase() !== currentEmail)) {
        setChatMessages(prev => {
          const exists = prev.some(m => (m.id && m.id === msg.id) || (m._id && m._id === msg._id));
          if (exists) return prev;
          return [...prev, msg];
        });
      }

      // 3. Head Warden <-> Warden Chat Modal
      if (selectedWardenChat && msg.studentEmail && msg.studentEmail.toLowerCase() === selectedWardenChat.email.toLowerCase()) {
        setWardenMessages(prev => {
          const exists = prev.some(m => (m.id && m.id === msg.id) || (m._id && m._id === msg._id));
          if (exists) return prev;
          return [...prev, msg];
        });
      }
    };

    socket.on('receive_direct_message', handleDirectMsg);
    socket.on('global_activity_notification', handleDirectMsg);

    return () => {
      socket.off('receive_direct_message', handleDirectMsg);
      socket.off('global_activity_notification', handleDirectMsg);
    };
  }, [socket, user?.email, profile.email, selectedWardenChat]);

  // Fetch all data from API in parallel on mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        const email = encodeURIComponent(user?.email || profile.email);
        const role = encodeURIComponent(user?.role || 'warden');

        const [
          complaintsRes,
          announcementsRes,
          workersRes,
          messagesRes,
          residentsRes,
          bannerRes,
          mgtMessagesRes,
          wardensRes,
          feedbackReqRes,
          feedbackRespRes
        ] = await Promise.all([
          fetch(`/api/complaints?userEmail=${email}&userRole=${role}`),
          fetch('/api/announcements'),
          fetch('/api/workers'),
          fetch(`/api/messages?userEmail=${email}&userRole=${role}`),
          fetch(`/api/students?userEmail=${email}&userRole=${role}`),
          fetch('/api/event-banner'),
          fetch(`/api/messages?studentEmail=${email}`),
          fetch('/api/wardens'),
          fetch(`/api/feedback-requests?targetBlock=${encodeURIComponent(profile.block || '')}`),
          fetch(`/api/feedback-responses?targetBlock=${encodeURIComponent(profile.block || '')}`)
        ]);

        if (complaintsRes.ok) setComplaints(await complaintsRes.json());
        if (wardensRes.ok) setWardensList(await wardensRes.json());
        if (announcementsRes.ok) setAnnouncements(await announcementsRes.json());
        if (workersRes.ok) setWorkers(await workersRes.json());
        if (messagesRes.ok) setChatMessages(await messagesRes.json());
        if (residentsRes.ok) setResidents(await residentsRes.json());
        if (bannerRes.ok) {
          const bannerData = await bannerRes.json();
          if (bannerData) setEventBanner(bannerData);
        }
        if (mgtMessagesRes.ok) setManagementMessages(await mgtMessagesRes.json());
        if (feedbackReqRes.ok) setFeedbackRequests(await feedbackReqRes.json());
        if (feedbackRespRes.ok) setDashboardFeedbackResponses(await feedbackRespRes.json());
      } catch (err) {
        console.error('Error fetching Warden dashboard data:', err);
      }
    };
    
    fetchData();
  }, [user?.email, user?.role, profile.email]);

  const handleAnalyzeFeedback = async (requestId) => {
    setIsAnalyzing(true);
    setAiAnalysis(null);
    try {
      const res = await fetch(`/api/feedback-requests/${requestId}/analyze`, {
        method: 'POST'
      });
      if (res.ok) {
        const data = await res.json();
        setAiAnalysis(data);
        setAnalysisTab('ai');
      } else {
        console.error('Failed to analyze feedback');
      }
    } catch (err) {
      console.error('Analysis request failed:', err);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleSendManagementReply = async (e) => {
    e.preventDefault();
    if (!mgtMsgText.trim()) return;

    try {
      const email = user?.email || profile.email || 'dwarden@campuscare.com';
      const name = user?.name || profile.name || 'Block Warden';
      const block = user?.block || profile.block || 'Main';

      const res = await fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: mgtMsgText,
          sender: 'warden',
          studentEmail: email,
          studentName: name,
          studentBlock: block
        })
      });

      if (res.ok) {
        const data = await res.json();
        const createdMsg = data.message || data;
        if (sendRealtimeMessage) sendRealtimeMessage(createdMsg);
        setManagementMessages(prev => {
          const exists = prev.some(m => (m.id && m.id === createdMsg.id) || (m._id && m._id === createdMsg._id));
          if (exists) return prev;
          return [...prev, createdMsg];
        });
        setMgtMsgText('');
      }
    } catch (err) {
      console.error('Error replying to management:', err);
    }
  };

  // Fetch direct messages when Head Warden selects a warden chat
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

  // Head Warden sends message to Block Warden
  const handleSendWardenDirectMessage = async (e) => {
    e.preventDefault();
    if (!wardenMsgText.trim() || !selectedWardenChat) return;

    try {
      const res = await fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: wardenMsgText,
          sender: 'headwarden',
          studentEmail: selectedWardenChat.email,
          studentName: selectedWardenChat.name,
          studentBlock: Array.isArray(selectedWardenChat.blocks) ? selectedWardenChat.blocks.join(', ') : (selectedWardenChat.block || 'Main')
        })
      });

      if (res.ok) {
        const data = await res.json();
        const createdMsg = data.message || data;
        if (sendRealtimeMessage) sendRealtimeMessage(createdMsg);
        setWardenMessages(prev => {
          const exists = prev.some(m => (m.id && m.id === createdMsg.id) || (m._id && m._id === createdMsg._id));
          if (exists) return prev;
          return [...prev, createdMsg];
        });
        setWardenMsgText('');
      }
    } catch (err) {
      console.error('Error sending message to warden:', err);
    }
  };

  useEffect(() => {
    if (residents.length > 0 && !selectedResidentEmail) {
      setSelectedResidentEmail(residents[0].email);
    }
  }, [residents, selectedResidentEmail]);

  // Compute stats dynamically when complaints or residents change
  useEffect(() => {
    const total = complaints.length;
    const inProgress = complaints.filter(c => c.status === 'In Progress').length;
    const resolved = complaints.filter(c => c.status === 'Resolved').length;
    const highPriority = complaints.filter(c => c.status === 'High Priority' || c.priority === 'High').length;

    setStats(prev => ({
      ...prev,
      total,
      inProgress,
      resolved,
      highPriority,
      residents: filteredResidents.length
    }));
  }, [complaints, filteredResidents]);

  // File Complaint form state
  const [complaintForm, setComplaintForm] = useState({
    title: '',
    category: 'Electrical',
    priority: 'Medium',
    description: '',
    customLocation: ''
  });

  // Announcement Form State
  const [announcementForm, setAnnouncementForm] = useState({
    title: '',
    text: '',
    attachment: '',
    attachmentName: '',
    isImportant: false
  });

  // Event Banner State
  const [eventBanner, setEventBanner] = useState({
    title: '',
    description: '',
    date: '',
    bannerImage: '',
    active: true
  });
  const [showEventBannerModal, setShowEventBannerModal] = useState(false);

  // Chart tooltip state
  const [chartTooltip, setChartTooltip] = useState(null);

  const handleLodgeComplaint = async (e) => {
    e.preventDefault();
    if (!complaintForm.title || !complaintForm.description) {
      alert('Please fill out all required fields.');
      return;
    }

    const resolvedLocation = complaintForm.customLocation || `Block ${profile.block} - Office Room ${profile.roomNo}`;
    
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
          location: resolvedLocation
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setComplaints(prev => [data.complaint, ...prev]);

        // Reset Form & Close Modal
        setComplaintForm({
          title: '',
          category: 'Electrical',
          priority: 'Medium',
          description: '',
          customLocation: ''
        });
        setShowComplaintModal(false);
        alert('Complaint registered successfully! The ticket has been logged.');
      } else {
        alert('Failed to register complaint.');
      }
    } catch (err) {
      console.error(err);
      alert('Network error lodging complaint.');
    }
  };

  const handleAddAnnouncement = async (e) => {
    e.preventDefault();
    if (!announcementForm.text) return;

    try {
      const res = await fetch('/api/announcements', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: announcementForm.title,
          text: announcementForm.text,
          attachment: announcementForm.attachment,
          attachmentName: announcementForm.attachmentName,
          important: announcementForm.isImportant
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setAnnouncements(prev => [data.announcement, ...prev]);
        setAnnouncementForm({ title: '', text: '', attachment: '', attachmentName: '', isImportant: false });
        setShowAnnouncementModal(false);
        alert('Announcement posted successfully!');
      } else {
        alert('Failed to add announcement.');
      }
    } catch (err) {
      console.error(err);
      alert('Network error adding announcement.');
    }
  };

  const handleDeleteAnnouncement = async (id) => {
    if (!confirm('Are you sure you want to permanently delete this announcement?')) return;
    try {
      const res = await fetch(`/api/announcements/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setAnnouncements(prev => prev.filter(ann => ann.id !== id && ann._id !== id));
        alert('Announcement deleted successfully!');
      } else {
        alert('Failed to delete announcement.');
      }
    } catch (err) {
      console.error(err);
      alert('Network error deleting announcement.');
    }
  };

  const handleUpdateEventBanner = async (e) => {
    e.preventDefault();
    if (!eventBanner.title) {
      alert('Please enter banner title.');
      return;
    }
    try {
      const res = await fetch('/api/event-banner', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(eventBanner),
      });
      if (res.ok) {
        const data = await res.json();
        setEventBanner(data.banner);
        setShowEventBannerModal(false);
        alert('Hostel Event Banner updated successfully!');
      } else {
        alert('Failed to update Event Banner.');
      }
    } catch (err) {
      console.error(err);
      alert('Network error updating Event Banner.');
    }
  };

  const handleDeleteEventBanner = async () => {
    if (!confirm('Are you sure you want to permanently delete the Event Banner? This will clear it completely.')) return;
    try {
      const res = await fetch('/api/event-banner', { method: 'DELETE' });
      if (res.ok) {
        setEventBanner({
          title: '',
          description: '',
          date: '',
          bannerImage: '',
          active: true
        });
        alert('Event Banner deleted successfully!');
      } else {
        alert('Failed to delete Event Banner.');
      }
    } catch (err) {
      console.error(err);
      alert('Network error deleting Event Banner.');
    }
  };

  const handleSaveWorker = async (e) => {
    e.preventDefault();
    if (!workerForm.name || !workerForm.phone || !workerForm.category) {
      alert('Please fill in Full Name, Phone Number, and Worker Category.');
      return;
    }

    try {
      const method = workerForm.id ? 'PUT' : 'POST';
      const url = workerForm.id ? `/api/workers/${workerForm.id}` : '/api/workers';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: workerForm.name,
          email: workerForm.email || 'workers@campuscare.com',
          phone: workerForm.phone,
          category: workerForm.category,
          experience: workerForm.experience,
          address: workerForm.address,
          status: workerForm.status || 'Active',
          createdBy: user?.name || profile.name
        }),
      });

      if (res.ok) {
        const workersRes = await fetch('/api/workers');
        if (workersRes.ok) {
          const updatedWorkers = await workersRes.json();
          setWorkers(updatedWorkers);
        }
        setWorkerForm({ id: null, name: '', email: 'workers@campuscare.com', phone: '', category: 'Electrician', experience: '', address: '', status: 'Active' });
        setShowAddWorkerModal(false);
        alert(workerForm.id ? 'Worker updated successfully!' : 'Worker added to global database successfully!');
      } else {
        const errData = await res.json();
        alert(errData.error || 'Failed to save worker.');
      }
    } catch (err) {
      console.error(err);
      alert('Network error saving worker.');
    }
  };

  const handleEditWorker = (w) => {
    setWorkerForm({
      id: w._id || w.id,
      name: w.name,
      email: w.email || 'workers@campuscare.com',
      phone: w.phone || '',
      category: w.category || w.role || 'Electrician',
      experience: w.experience || '',
      address: w.address || '',
      status: w.status || 'Active'
    });
    setShowAddWorkerModal(true);
  };

  const handleDeleteWorker = async (workerId) => {
    if (!window.confirm('Are you sure you want to remove this worker from the global database?')) return;
    try {
      const res = await fetch(`/api/workers/${workerId}`, { method: 'DELETE' });
      const data = await res.json();
      if (res.ok) {
        setWorkers(prev => prev.filter(w => (w._id !== workerId && w.id !== workerId)));
        alert('Worker removed successfully.');
      } else {
        alert(data.error || 'Failed to remove worker.');
      }
    } catch (err) {
      console.error(err);
      alert('Network error removing worker.');
    }
  };

  const handleAssignWorkerSubmit = async (e) => {
    e.preventDefault();
    if (!selectedWorkerId || !targetAssignComplaint) {
      alert('Please select a worker to assign.');
      return;
    }
    const worker = workers.find(w => w._id === selectedWorkerId || w.id === selectedWorkerId);
    if (!worker) {
      alert('Selected worker not found.');
      return;
    }

    try {
      const complaintId = targetAssignComplaint._id || targetAssignComplaint.id;
      const res = await fetch(`/api/complaints/${complaintId}/assign-worker`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          workerId: worker._id || worker.id,
          workerName: worker.name,
          workerCategory: worker.category || worker.role,
          workerPhone: worker.phone,
          assignedBy: user?.name || profile.name
        })
      });

      if (res.ok) {
        const complaintsRes = await fetch(`/api/complaints?userEmail=${encodeURIComponent(user?.email || profile.email)}&userRole=${encodeURIComponent(user?.role || 'warden')}`);
        if (complaintsRes.ok) {
          setComplaints(await complaintsRes.json());
        }
        setShowAssignWorkerModal(false);
        setTargetAssignComplaint(null);
        setSelectedWorkerId('');
        alert(`Worker ${worker.name} assigned successfully! Task order dispatched.`);
      } else {
        alert('Failed to assign worker to complaint.');
      }
    } catch (err) {
      console.error('Error assigning worker:', err);
      alert('Network error assigning worker.');
    }
  };

  const handleStatusUpdate = async (id, newStatus) => {
    try {
      const res = await fetch(`/api/complaints/${id}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status: newStatus })
      });

      if (res.ok) {
        const data = await res.json();
        setComplaints(prev => prev.map(c => c.id === id ? data.complaint : c));
        alert('Complaint status updated successfully!');
      } else {
        alert('Failed to update status.');
      }
    } catch (err) {
      console.error('Error updating status:', err);
      alert('Network error updating status.');
    }
  };

  const handleDeleteComplaint = async (id) => {
    if (!window.confirm('Are you sure you want to permanently delete this complaint from the database?')) {
      return;
    }

    try {
      const res = await fetch(`/api/complaints/${id}`, {
        method: 'DELETE'
      });

      if (res.ok) {
        setComplaints(prev => prev.filter(c => c.id !== id));
        alert('Complaint deleted successfully!');
      } else {
        const data = await res.json().catch(() => ({}));
        alert(data.error || 'Failed to delete complaint.');
      }
    } catch (err) {
      console.error('Error deleting complaint:', err);
      alert('Network error deleting complaint.');
    }
  };

  const handleClearHistory = async () => {
    if (!window.confirm('Are you sure you want to permanently clear all resolved complaints from the history? This cannot be undone.')) {
      return;
    }

    try {
      const res = await fetch('/api/complaints/history/clear', {
        method: 'DELETE'
      });

      if (res.ok) {
        setComplaints(prev => prev.filter(c => c.status !== 'Resolved'));
        alert('History cleared successfully!');
      } else {
        const data = await res.json().catch(() => ({}));
        alert(data.error || 'Failed to clear history.');
      }
    } catch (err) {
      console.error('Error clearing history:', err);
      alert('Network error clearing history.');
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMsgText.trim() || !selectedResidentEmail) return;

    const activeResident = residents.find(r => r.email === selectedResidentEmail);

    try {
      const res = await fetch('/api/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: newMsgText,
          sender: 'warden', // Warden is sending the message
          studentEmail: selectedResidentEmail,
          studentName: activeResident?.name || 'Student'
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

  const markAsRead = useCallback(async (studentEmail) => {
    if (!studentEmail) return;
    try {
      const res = await fetch('/api/messages/read', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ studentEmail, sender: 'student' })
      });
      if (res.ok) {
        setChatMessages(prev => prev.map(m => 
          (m.studentEmail?.toLowerCase() === studentEmail.toLowerCase() && m.sender === 'student')
            ? { ...m, read: true }
            : m
        ));
      }
    } catch (err) {
      console.error(err);
    }
  }, []);

  useEffect(() => {
    if (activeTab === 'Messages' && selectedResidentEmail) {
      markAsRead(selectedResidentEmail);
    }
  }, [activeTab, selectedResidentEmail, chatMessages.length, markAsRead]);

  const handleCreateFeedbackRequest = async (e) => {
    e.preventDefault();
    if (!newFeedbackTitle || !newFeedbackDesc) {
      alert('Please fill in both title and description.');
      return;
    }
    const targetBlockToUse = newFeedbackTargetBlock || profile.block || 'All';
    try {
      const res = await fetch('/api/feedback-requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          title: newFeedbackTitle, 
          description: newFeedbackDesc,
          targetBlock: targetBlockToUse,
          postedBy: user?.role || 'Warden',
          authorName: profile.name || 'Block Warden',
          authorEmail: profile.email || ''
        })
      });
      if (res.ok) {
        const data = await res.json();
        setFeedbackRequests(prev => [data, ...prev.map(r => ({ ...r, active: false }))]);
        setNewFeedbackTitle('');
        setNewFeedbackDesc('');
        alert(`Feedback form published to ${targetBlockToUse} Block students successfully!`);
      } else {
        alert('Failed to publish feedback form.');
      }
    } catch (err) {
      console.error(err);
      alert('Error creating feedback request.');
    }
  };



  const handleDeleteFeedbackRequest = async (id) => {
    if (!confirm('Are you sure you want to delete this feedback request and all its responses?')) return;
    try {
      const res = await fetch(`/api/feedback-requests/${id}`, {
        method: 'DELETE'
      });
      if (res.ok) {
        setFeedbackRequests(prev => prev.filter(r => (r._id || r.id) !== id));
        alert('Feedback request deleted.');
        const currentSelectedId = selectedFeedbackRequest?._id || selectedFeedbackRequest?.id;
        if (currentSelectedId === id) {
          setShowResponsesModal(false);
          setSelectedFeedbackRequest(null);
          setSelectedFeedbackResponses([]);
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleViewResponses = async (request) => {
    try {
      const reqId = request._id || request.id;
      const res = await fetch(`/api/feedback-responses?feedbackRequestId=${reqId}`);
      if (res.ok) {
        const responses = await res.json();
        setSelectedFeedbackRequest(request);
        setSelectedFeedbackResponses(responses);
        setShowResponsesModal(true);
      } else {
        alert('Failed to load feedback responses.');
      }
    } catch (err) {
      console.error(err);
      alert('Error fetching responses.');
    }
  };

  // CSV Report Exporters
  const downloadCSV = (filename, headers, rows) => {
    const csvContent = "data:text/csv;charset=utf-8," 
      + [headers.join(","), ...rows.map(row => row.map(val => `"${String(val || '').replace(/"/g, '""')}"`).join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const exportDailyComplaintsCSV = () => {
    const today = new Date();
    const oneDayAgo = new Date(today.getTime() - (24 * 60 * 60 * 1000));
    const daily = complaints.filter(c => new Date(c.createdAt || c.date) >= oneDayAgo);
    const headers = ["Title", "Location", "Category", "Priority", "Status", "Student Email", "Date Created", "Description"];
    const rows = daily.map(c => [
      c.title,
      c.location,
      c.category,
      c.priority,
      c.status,
      c.studentEmail,
      c.createdAt || c.date || '',
      c.description
    ]);
    downloadCSV(`Daily_Complaints_Report_${new Date().toISOString().split('T')[0]}.csv`, headers, rows);
  };

  const exportWeeklyComplaintsCSV = () => {
    const today = new Date();
    const sevenDaysAgo = new Date(today.getTime() - (7 * 24 * 60 * 60 * 1000));
    const weekly = complaints.filter(c => new Date(c.createdAt || c.date) >= sevenDaysAgo);
    const headers = ["Title", "Location", "Category", "Priority", "Status", "Student Email", "Date Created", "Description"];
    const rows = weekly.map(c => [
      c.title,
      c.location,
      c.category,
      c.priority,
      c.status,
      c.studentEmail,
      c.createdAt || c.date || '',
      c.description
    ]);
    downloadCSV(`Weekly_Complaints_Report_${new Date().toISOString().split('T')[0]}.csv`, headers, rows);
  };

  const exportFeedbackSummaryCSV = () => {
    if (feedbackRequests.length === 0) {
      alert("No feedback campaigns to export.");
      return;
    }
    const headers = ["Campaign Title", "Description", "Status", "Created Date"];
    const rows = feedbackRequests.map(r => [
      r.title,
      r.description,
      r.active ? "Active" : "Closed",
      r.createdAt || ''
    ]);
    downloadCSV(`Feedback_Campaigns_Summary_${new Date().toISOString().split('T')[0]}.csv`, headers, rows);
  };

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
          role: 'warden',
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

  const handleWorkerRequest = async (workerName) => {
    try {
      const res = await fetch('/api/workers/request', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ workerName }),
      });

      if (res.ok) {
        alert(`Success! You have assigned tasks to ${workerName}. they will visit Block ${profile.block} shortly.`);
        
        // Refresh workers to show the updated task count
        const workersRes = await fetch('/api/workers');
        if (workersRes.ok) {
          const workersData = await workersRes.json();
          setWorkers(workersData);
        }
      } else {
        alert('Failed to request worker.');
      }
    } catch (err) {
      console.error(err);
      alert('Network error requesting worker.');
    }
  };

  // Filter active complaints (exclude Resolved) based on Search query
  const activeComplaints = complaints.filter(c => c.status !== 'Resolved');
  const filteredComplaints = activeComplaints.filter(c => {
    const query = searchQuery.toLowerCase();
    return (
      (c.title || '').toLowerCase().includes(query) || 
      (c.location || '').toLowerCase().includes(query) ||
      (c.status || '').toLowerCase().includes(query) ||
      (c.studentName || '').toLowerCase().includes(query) ||
      (c.time || '').toLowerCase().includes(query)
    );
  });

  // Filter resolved complaints (History) based on Search query
  const resolvedComplaints = complaints.filter(c => c.status === 'Resolved');
  const filteredHistory = resolvedComplaints.filter(c => {
    const query = searchQuery.toLowerCase();
    return (
      (c.title || '').toLowerCase().includes(query) || 
      (c.location || '').toLowerCase().includes(query) ||
      (c.status || '').toLowerCase().includes(query) ||
      (c.studentName || '').toLowerCase().includes(query) ||
      (c.time || '').toLowerCase().includes(query)
    );
  });

  // Calculate Recent Feedback Activity (grouped by submission date, latest 7 days)
  const recentFeedbackActivity = (() => {
    const groups = {};
    dashboardFeedbackResponses.forEach(r => {
      if (!r.createdAt) return;
      const date = new Date(r.createdAt);
      const dateString = date.toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' });
      
      if (!groups[dateString]) {
        groups[dateString] = {
          dateString,
          timestamp: date.getTime(),
          total: 0,
          positive: 0,
          negative: 0
        };
      }
      
      groups[dateString].total += 1;
      if (r.rating >= 3) {
        groups[dateString].positive += 1;
      } else {
        groups[dateString].negative += 1;
      }
    });

    return Object.values(groups)
      .sort((a, b) => b.timestamp - a.timestamp)
      .slice(0, 7);
  })();

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
          {/* Logo */}
          <div className="brand-logo-container">
            <img src={logo} alt="Campus Care" className="brand-logo-img" />
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
            placeholder="Search complaints, residents, rooms..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {/* Header Right Actions */}
        <div className="header-right">
          {/* Notifications Button */}
          <div className="icon-badge-btn" onClick={() => {
            const nextShow = !showNotifications;
            setShowNotifications(nextShow);
            if (nextShow) {
              setSeenAnnouncementsCount(announcements.length);
            }
            setShowMails(false);
            setShowProfileMenu(false);
          }}>
            <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
            {announcements.length > seenAnnouncementsCount && (
              <span className="badge-count bg-red">{announcements.length - seenAnnouncementsCount}</span>
            )}
            
            {showNotifications && (
              <div className="header-dropdown-menu">
                <div className="dropdown-header">Announcements</div>
                {announcements.length === 0 ? (
                  <div className="dropdown-item" style={{ color: '#94a3b8' }}>No announcements posted yet.</div>
                ) : (
                  announcements.slice(0, 3).map(ann => (
                    <div key={ann.id} className="dropdown-item">
                      <span className="drop-dot alert-blue"></span>
                      <div>
                        <p className="drop-text">{ann.text}</p>
                        <span className="drop-time">{ann.date}</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>

          {/* Mail Button */}
          <div className="icon-badge-btn" onClick={() => { setShowMails(!showMails); setShowNotifications(false); setShowProfileMenu(false); }}>
            <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
            {chatMessages.filter(m => m.sender === 'student' && !m.read).length > 0 && (
              <span className="badge-count bg-blue">{chatMessages.filter(m => m.sender === 'student' && !m.read).length}</span>
            )}

            {showMails && (
              <div className="header-dropdown-menu">
                <div className="dropdown-header">Messages</div>
                {chatMessages.filter(m => m.sender === 'student' && !m.read).length === 0 ? (
                  <div className="dropdown-item" style={{ color: '#94a3b8' }}>No unread student messages.</div>
                ) : (
                  chatMessages.filter(m => m.sender === 'student' && !m.read).slice(-5).reverse().map(msg => (
                    <div key={msg.id || msg._id} className="dropdown-item" onClick={() => { setActiveTab('Messages'); setSelectedResidentEmail(msg.studentEmail); }}>
                      <div className="avatar-placeholder">
                        {msg.studentName?.split(' ').map(n=>n[0]).join('') || 'S'}
                      </div>
                      <div style={{ marginLeft: '10px' }}>
                        <p className="drop-text" style={{ fontWeight: 600 }}>{msg.studentName || 'Student'}</p>
                        <p className="drop-subtext">{msg.text}</p>
                        <span className="drop-time">{msg.time}</span>
                      </div>
                    </div>
                  ))
                )}
                <div className="dropdown-footer" onClick={() => setActiveTab('Messages')}>Open Message Center</div>
              </div>
            )}
          </div>

          {/* User Profile Info */}
          <div 
            className="user-profile-menu-trigger"
            onClick={() => { setShowProfileMenu(!showProfileMenu); setShowNotifications(false); setShowMails(false); }}
          >
            <div className="user-avatar-circle" style={{ overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {profile.profilePhoto ? (
                <img src={profile.profilePhoto} alt="avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : (
                <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              )}
            </div>
            <div className="user-details-text">
              <span className="user-name">{profile.name}</span>
              <span className="user-role">Warden / Main Hostel</span>
            </div>
            <svg className={`chevron-icon ${showProfileMenu ? 'rotated' : ''}`} width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
            </svg>

            {showProfileMenu && (
              <div className="profile-dropdown-menu">
                <div className="dropdown-profile-header">
                  <p className="profile-email">{profile.email}</p>
                  <p className="profile-roll">Emp ID: {profile.rollNo}</p>
                </div>
                <div className="dropdown-link" onClick={() => setActiveTab('Settings')}>
                  Settings / Profile
                </div>
                <div className="dropdown-link" onClick={() => setActiveTab('Complaints')}>
                  Manage Complaints
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

      {/* 2. DOCK BODY LAYOUT */}
      <div className="dashboard-body">
        
        {/* SIDEBAR NAVIGATION */}
        <aside className={`sidebar-aside ${isMobileSidebarOpen ? 'open-mobile' : ''}`}>
          <ul className="sidebar-menu">
            {[
              { name: 'Dashboard', icon: (
                <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
              )},
              { name: 'Complaints', icon: (
                <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                </svg>
              )},
              { name: 'History', icon: (
                <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              )},
              { name: 'Residents', icon: (
                <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              )},
              { name: 'Workers', icon: (
                <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              )},
              { name: 'Maintenance Tasks', icon: (
                <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              )},
              { name: 'Announcements', icon: (
                <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
                </svg>
              )},
              ...( (user?.role === 'headwarden' || profile?.role === 'headwarden') ? [
                { name: 'Wardens', icon: (
                  <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                )}
              ] : [
                { name: 'Messages', icon: (
                  <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                ), badge: chatMessages.filter(m => m.sender === 'student' && !m.read).length > 0 ? chatMessages.filter(m => m.sender === 'student' && !m.read).length : null }
              ]),
              { name: 'Management Messages', icon: (
                <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1" />
                </svg>
              ), badge: managementMessages.filter(m => m.sender === 'management').length > 0 ? managementMessages.filter(m => m.sender === 'management').length : null },
              { name: 'Incident Groups', icon: (
                <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              )},
              ...( (user?.role === 'headwarden' || profile?.role === 'headwarden' || profile?.block === 'All') ? [
                { name: 'Group Insights', icon: (
                  <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14" />
                  </svg>
                )}
              ] : [] ),
              { name: 'Feedback', icon: (
                <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                </svg>
              )},
              { name: 'Reports', icon: (
                <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              )},
              { name: 'Settings', icon: (
                <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                </svg>
              )}
            ].map((tab) => (
              <li key={tab.name}>
                <button
                  className={`menu-btn ${activeTab === tab.name ? 'active' : ''}`}
                  onClick={() => {
                    setActiveTab(tab.name);
                    setIsMobileSidebarOpen(false);
                  }}
                >
                  <span className="menu-icon">{tab.icon}</span>
                  <span className="menu-text">{tab.name}</span>
                  {tab.badge && <span className="menu-badge">{tab.badge}</span>}
                </button>
              </li>
            ))}
          </ul>
        </aside>

        {/* MAIN DASHBOARD CONTENT AREA */}
        <main className="main-content">
          
          {/* TAB 1: CORE DASHBOARD */}
          {activeTab === 'Dashboard' && (
            <div className="tab-dashboard-view">
              
              {/* STAT CARDS ROW */}
              <div className="stat-cards-grid">
                
                {/* 1. Total Complaints */}
                <div className="stat-card">
                  <div className="stat-card-left text-blue">
                    <span className="stat-icon-wrapper bg-blue-tint">
                      <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                      </svg>
                    </span>
                  </div>
                  <div className="stat-card-right">
                    <span className="stat-num">{stats.total}</span>
                    <span className="stat-label">Total Complaints</span>
                    <span className="stat-trend trend-up">
                      <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 19.5l15-15m0 0H8.25m11.25 0v11.25" />
                      </svg>
                      18%
                    </span>
                  </div>
                </div>

                {/* 2. In Progress */}
                <div className="stat-card">
                  <div className="stat-card-left text-orange">
                    <span className="stat-icon-wrapper bg-orange-tint">
                      <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </span>
                  </div>
                  <div className="stat-card-right">
                    <span className="stat-num">{stats.inProgress}</span>
                    <span className="stat-label">In Progress</span>
                    <span className="stat-trend trend-up">
                      <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 19.5l15-15m0 0H8.25m11.25 0v11.25" />
                      </svg>
                      5%
                    </span>
                  </div>
                </div>

                {/* 3. Resolved */}
                <div className="stat-card">
                  <div className="stat-card-left text-green">
                    <span className="stat-icon-wrapper bg-green-tint">
                      <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </span>
                  </div>
                  <div className="stat-card-right">
                    <span className="stat-num">{stats.resolved}</span>
                    <span className="stat-label">Resolved</span>
                    <span className="stat-trend trend-up">
                      <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 19.5l15-15m0 0H8.25m11.25 0v11.25" />
                      </svg>
                      30%
                    </span>
                  </div>
                </div>

                {/* 4. High Priority */}
                <div className="stat-card">
                  <div className="stat-card-left text-red">
                    <span className="stat-icon-wrapper bg-red-tint">
                      <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
                      </svg>
                    </span>
                  </div>
                  <div className="stat-card-right">
                    <span className="stat-num">{stats.highPriority}</span>
                    <span className="stat-label">High Priority</span>
                    <span className="stat-trend trend-down">
                      <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 4.5l-15 15m0 0h11.25m-11.25 0V8.25" />
                      </svg>
                      8%
                    </span>
                  </div>
                </div>

                {/* 5. Residents */}
                <div className="stat-card">
                  <div className="stat-card-left text-navy">
                    <span className="stat-icon-wrapper bg-navy-tint">
                      <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197" />
                      </svg>
                    </span>
                  </div>
                  <div className="stat-card-right">
                    <span className="stat-num">{stats.residents}</span>
                    <span className="stat-label">Residents</span>
                    <span className="stat-trend trend-flat">—</span>
                  </div>
                </div>

              </div>

              {/* ROW 2: GRAPH, CATEGORY PROGRESS, ANNOUNCEMENTS */}
              <div className="dashboard-grid-row-2">
                
                {/* 1. Recent Feedback Activity Timeline */}
                <div className="grid-card col-45 relative" style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column' }}>
                  <div className="card-header" style={{ padding: '0 0 1rem 0', marginBottom: '0.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                      <span className="card-title" style={{ fontSize: '1.05rem', fontWeight: 800, color: '#0f172a' }}>Recent Feedback Activity</span>
                      <span className="card-subtitle" style={{ fontSize: '0.8rem', color: '#64748b' }}>
                        Feedback activity grouped by date (latest 7 days)
                      </span>
                    </div>
                    <button 
                      className="view-all-link" 
                      onClick={() => setActiveTab('Feedback')} 
                      style={{ 
                        background: 'none', 
                        border: 'none', 
                        color: '#2563eb', 
                        fontWeight: 700, 
                        fontSize: '0.8rem', 
                        cursor: 'pointer',
                        padding: 0
                      }}
                    >
                      View All
                    </button>
                  </div>
                  
                  <div className="chart-wrapper" style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '0.65rem', padding: '0.25rem 0' }}>
                    {recentFeedbackActivity.length === 0 ? (
                      <p style={{ color: '#64748b', fontSize: '0.82rem', fontStyle: 'italic', textAlign: 'center', margin: 'auto' }}>
                        No recent feedback submissions.
                      </p>
                    ) : (
                      recentFeedbackActivity.map((day, idx) => {
                        const isMostlyPositive = day.positive >= day.negative;
                        return (
                          <div key={idx} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.65rem 0.85rem', border: '1px solid #f1f5f9', borderRadius: '10px', backgroundColor: '#f8fafc', gap: '0.5rem' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                              <span 
                                style={{ 
                                  width: '9px', 
                                  height: '9px', 
                                  borderRadius: '50%', 
                                  backgroundColor: isMostlyPositive ? '#10b981' : '#ef4444', 
                                  display: 'inline-block',
                                  boxShadow: isMostlyPositive ? '0 0 8px rgba(16, 185, 129, 0.4)' : '0 0 8px rgba(239, 68, 68, 0.4)'
                                }} 
                              />
                              <div style={{ display: 'flex', flexDirection: 'column' }}>
                                <strong style={{ fontSize: '0.82rem', color: '#1e293b' }}>{day.dateString}</strong>
                                <span style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 650 }}>{day.total} Feedback Response{day.total > 1 ? 's' : ''}</span>
                              </div>
                            </div>
                            <div style={{ display: 'flex', gap: '0.5rem', fontSize: '0.72rem', fontWeight: 700 }}>
                              <span style={{ backgroundColor: '#dcfce7', color: '#15803d', padding: '0.15rem 0.4rem', borderRadius: '4px' }}>
                                {day.positive} Positive
                              </span>
                              <span style={{ backgroundColor: '#fee2e2', color: '#b91c1c', padding: '0.15rem 0.4rem', borderRadius: '4px' }}>
                                {day.negative} Negative
                              </span>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>

                {/* 2. Complaints by Category */}
                <div className="grid-card col-28" style={{ padding: '1.25rem' }}>
                  <div className="card-header" style={{ padding: '0 0 1rem 0', marginBottom: '0.5rem' }}>
                    <span className="card-title" style={{ fontSize: '1.05rem', fontWeight: 800, color: '#0f172a' }}>Complaints by Category</span>
                  </div>

                  <div className="category-list-wrapper" style={{ padding: '0.25rem 0' }}>
                    <DynamicCategoryBars complaints={complaints} />
                  </div>
                </div>

                {/* 3. Recent Announcements */}
                <div className="grid-card col-27">
                  <div className="card-header" style={{ borderBottom: 'none', paddingBottom: '0.25rem' }}>
                    <span className="card-title">Recent Announcements</span>
                    <button className="view-all-link" onClick={() => setActiveTab('Announcements')}>View All</button>
                  </div>

                  <div className="announcements-stack">
                    {announcements.slice(0, 3).map((ann) => (
                      <div key={ann.id} className={`announcement-box ${ann.important ? 'border-blue' : ''}`}>
                        <div className="ann-icon-col">
                          <span className="ann-icon bg-blue-light text-blue">
                            <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
                            </svg>
                          </span>
                        </div>
                        <div className="ann-content-col">
                          <p className="ann-text">{ann.text}</p>
                          <span className="ann-date">{ann.date}</span>
                        </div>
                      </div>
                    ))}
                  </div>

                  <button 
                    className="new-announcement-btn"
                    onClick={() => setShowAnnouncementModal(true)}
                  >
                    <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                    </svg>
                    New Announcement
                  </button>
                </div>

              </div>

              {/* ROW 3: RECENT COMPLAINTS TABLE, ACTIVE INCIDENT GROUPS, WORKERS ON DUTY */}
              <div className="dashboard-grid-row-3">
                
                {/* 1. Recent Complaints Table */}
                <div className="grid-card col-45">
                  <div className="card-header" style={{ borderBottom: 'none' }}>
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                      <span className="card-title">Recent Complaints</span>
                      <span className="card-subtitle">Track registered issues</span>
                    </div>
                    <div style={{ display: 'flex', gap: '0.75rem' }}>
                      <button className="view-all-link" onClick={() => setActiveTab('Complaints')}>View All</button>
                      <button 
                        className="lodge-complaint-trigger-btn"
                        onClick={() => setShowComplaintModal(true)}
                      >
                        + Log Complaint
                      </button>
                    </div>
                  </div>

                  <div className="complaints-table-wrapper">
                    <table className="complaints-table">
                      <thead>
                        <tr>
                          <th>Complaint</th>
                          <th>Location</th>
                          <th>Status</th>
                          <th>Time</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredComplaints.slice(0, 4).map((c) => (
                          <tr key={c.id}>
                            <td data-label="Title" style={{ fontWeight: 500, color: '#0f172a' }}>{c.title}</td>
                            <td data-label="Location" style={{ color: '#64748b' }}>{c.location}</td>
                            <td data-label="Status">
                              <span className={`status-pill ${
                                c.status === 'Resolved' ? 'resolved' :
                                c.status === 'In Progress' ? 'in-progress' :
                                c.status === 'High Priority' ? 'high-priority' : 'open'
                              }`}>
                                {c.status}
                              </span>
                            </td>
                            <td data-label="Time" style={{ color: '#94a3b8' }}>{c.time}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* 3. Workers On Duty */}
                <div className="grid-card col-27">
                  <div className="card-header" style={{ borderBottom: 'none' }}>
                    <span className="card-title">Workers On Duty</span>
                    <button className="view-all-link" onClick={() => setActiveTab('Workers')}>View All</button>
                  </div>

                  <div className="workers-stack">
                    {workers.map((w) => (
                      <div key={w.id} className="worker-row">
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                          <div className="worker-avatar" style={{ backgroundColor: `${w.color}15`, color: w.color }}>
                            {w.avatar}
                          </div>
                          <div style={{ display: 'flex', flexDirection: 'column' }}>
                            <span className="worker-name-item">{w.name}</span>
                            <span className="worker-role-item">{w.role}</span>
                          </div>
                        </div>
                        <button 
                          className="worker-task-count-btn"
                          onClick={() => handleWorkerRequest(w.name)}
                          title="Click to assign task to worker"
                        >
                          {w.tasks} Tasks
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

              </div>

            </div>
          )}

          {/* TAB 2: COMPLAINTS */}
          {activeTab === 'Complaints' && (
            <div className="tab-focused-view">
              <div className="section-header">
                <h2>Complaint Management</h2>
                <button className="lodge-complaint-trigger-btn" onClick={() => setShowComplaintModal(true)}>
                  + Log New Ticket
                </button>
              </div>

              <div className="grid-card" style={{ padding: '1.5rem' }}>
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
                      <div key={c.id} className="complaint-card-item" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', padding: '1.25rem', border: '1px solid #e2e8f0', borderRadius: '10px', backgroundColor: '#fff', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03)', transition: 'transform 0.2s, box-shadow 0.2s', cursor: 'default' }}>
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

          {/* TAB: HISTORY */}
          {activeTab === 'History' && (
            <div className="tab-focused-view">
              <div className="section-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <h2>Resolved History</h2>
                  <p style={{ color: '#64748b' }}>Archived list of all completed and resolved complaints</p>
                </div>
                {resolvedComplaints.length > 0 && (
                  <button 
                    onClick={handleClearHistory}
                    className="lodge-complaint-trigger-btn"
                    style={{ backgroundColor: '#ef4444', border: 'none', display: 'flex', alignItems: 'center', gap: '0.35rem', cursor: 'pointer' }}
                  >
                    <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                    Clear History
                  </button>
                )}
              </div>

              <div className="grid-card" style={{ padding: '1.5rem' }}>
                <div style={{ marginBottom: '1.5rem', maxWidth: '350px' }}>
                  <input
                    type="text"
                    className="standard-input-field"
                    placeholder="Search history..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.25rem', marginTop: '1rem' }}>
                  {filteredHistory.length === 0 ? (
                    <div style={{ padding: '3rem 1rem', textAlign: 'center', color: '#64748b', gridColumn: '1 / -1' }}>
                      <svg width="48" height="48" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24" style={{ margin: '0 auto 1rem', color: '#cbd5e1' }}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                      </svg>
                      <p style={{ fontWeight: 500 }}>No resolved complaints in history.</p>
                      <p style={{ fontSize: '0.85rem', marginTop: '0.25rem' }}>Complaints will show here once their status is updated to Resolved.</p>
                    </div>
                  ) : (
                    filteredHistory.map(c => (
                      <div key={c.id} className="complaint-card-item" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', padding: '1.25rem', border: '1px solid #e2e8f0', borderRadius: '10px', backgroundColor: '#fff', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03)', borderLeft: '4px solid #10b981', transition: 'transform 0.2s, box-shadow 0.2s', cursor: 'default' }}>
                        <div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '0.5rem', marginBottom: '0.75rem' }}>
                            <h4 style={{ margin: 0, fontSize: '1rem', color: '#0f172a', fontWeight: 600, lineHeight: '1.4' }}>{c.title}</h4>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                              <span className="status-pill resolved" style={{ margin: 0, whiteSpace: 'nowrap' }}>
                                {c.status}
                              </span>
                              <button 
                                onClick={() => handleDeleteComplaint(c.id)}
                                style={{ 
                                  background: '#fee2e2', 
                                  border: 'none', 
                                  padding: '0.25rem', 
                                  borderRadius: '4px', 
                                  color: '#ef4444', 
                                  cursor: 'pointer',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center'
                                }}
                                title="Delete permanently from database"
                              >
                                <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                              </button>
                            </div>
                          </div>
                          
                          <p className="complaint-meta-desc" style={{ margin: '0.35rem 0', fontSize: '0.85rem' }}>
                            Category: <strong>{c.category}</strong> • Priority: <strong>{c.priority}</strong>
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

          {/* TAB 3: RESIDENTS */}
          {activeTab === 'Residents' && (
            <div className="tab-focused-view">
              <div className="section-header" style={{ marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
                <div>
                  <h2 style={{ fontSize: '1.6rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>Hostel Residents Roster</h2>
                  <p style={{ color: '#64748b', marginTop: '0.25rem', margin: 0 }}>
                    {profile.block === 'All' || user?.role === 'headwarden' 
                      ? 'Managing registered student residents across all hostel blocks'
                      : `Students registered in Block ${profile.block}`}
                  </p>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span style={{ 
                    padding: '0.4rem 0.85rem', 
                    borderRadius: '20px', 
                    backgroundColor: '#eff6ff', 
                    color: '#2563eb', 
                    fontSize: '0.85rem', 
                    fontWeight: 700,
                    border: '1px solid #bfdbfe'
                  }}>
                    {filteredResidents.length} {filteredResidents.length === 1 ? 'Student' : 'Students'} Found
                  </span>
                </div>
              </div>

              {/* SEARCH & FILTER CONTROLS BAR */}
              <div className="grid-card" style={{ padding: '1.25rem', marginBottom: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between' }}>
                  
                  {/* Search Input Bar */}
                  <div style={{ flex: '1 1 300px', position: 'relative' }}>
                    <svg style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', width: '18px', height: '18px', color: '#64748b' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                    <input 
                      type="text" 
                      placeholder="Search by student name, room no, roll no, or email..."
                      value={residentSearchQuery}
                      onChange={(e) => setResidentSearchQuery(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '0.75rem 1rem 0.75rem 2.6rem',
                        borderRadius: '12px',
                        border: '1px solid #cbd5e1',
                        fontSize: '0.9rem',
                        outline: 'none',
                        color: '#0f172a',
                        backgroundColor: '#ffffff',
                        boxShadow: '0 2px 6px rgba(0,0,0,0.03)'
                      }}
                    />
                    {residentSearchQuery && (
                      <button 
                        onClick={() => setResidentSearchQuery('')}
                        style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', fontSize: '1.1rem' }}
                      >
                        ×
                      </button>
                    )}
                  </div>

                  {/* Block Filter Select */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#475569' }}>Block:</span>
                    <select
                      value={residentBlockFilter}
                      onChange={(e) => setResidentBlockFilter(e.target.value)}
                      style={{
                        padding: '0.7rem 1rem',
                        borderRadius: '12px',
                        border: '1px solid #cbd5e1',
                        backgroundColor: '#ffffff',
                        fontSize: '0.9rem',
                        fontWeight: 600,
                        color: '#0f172a',
                        cursor: 'pointer',
                        outline: 'none'
                      }}
                    >
                      {isHeadWarden ? (
                        <>
                          <option value="All">All Blocks</option>
                          <option value="A">A Block</option>
                          <option value="B">B Block</option>
                          <option value="C">C Block</option>
                          <option value="D">D Block</option>
                          <option value="E">E Block</option>
                          <option value="F">F Block</option>
                        </>
                      ) : (
                        parsedWardenBlocks.map(blk => (
                          <option key={blk} value={blk}>{blk} Block (Assigned)</option>
                        ))
                      )}
                    </select>
                  </div>

                  {/* Sort By Dropdown */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#475569' }}>Sort By:</span>
                    <select
                      value={residentSortBy}
                      onChange={(e) => setResidentSortBy(e.target.value)}
                      style={{
                        padding: '0.7rem 1rem',
                        borderRadius: '12px',
                        border: '1px solid #cbd5e1',
                        backgroundColor: '#ffffff',
                        fontSize: '0.9rem',
                        fontWeight: 600,
                        color: '#0f172a',
                        cursor: 'pointer',
                        outline: 'none'
                      }}
                    >
                      <option value="name">Name (A-Z)</option>
                      <option value="room">Room Number</option>
                      <option value="roll">Roll Number</option>
                    </select>
                  </div>

                </div>

                {/* Quick Block Filter Pills */}
                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', paddingTop: '0.5rem', borderTop: '1px solid #f1f5f9' }}>
                  {(isHeadWarden ? ['All', 'A', 'B', 'C', 'D', 'E', 'F'] : parsedWardenBlocks).map((blk) => (
                    <button
                      key={blk}
                      onClick={() => setResidentBlockFilter(blk)}
                      style={{
                        padding: '0.4rem 0.9rem',
                        borderRadius: '20px',
                        border: residentBlockFilter === blk ? '1px solid #2563eb' : '1px solid #e2e8f0',
                        backgroundColor: residentBlockFilter === blk ? '#2563eb' : '#f8fafc',
                        color: residentBlockFilter === blk ? '#ffffff' : '#64748b',
                        fontSize: '0.82rem',
                        fontWeight: residentBlockFilter === blk ? 700 : 600,
                        cursor: 'pointer',
                        transition: 'all 0.15s ease'
                      }}
                    >
                      {blk === 'All' ? 'All Blocks' : `${blk} Block`}
                    </button>
                  ))}
                </div>
              </div>

              {/* RESIDENTS GRID CARDS */}
              <div className="grid-card" style={{ padding: '1.5rem' }}>
                <div className="residents-grid">
                  {filteredResidents.length === 0 ? (
                    <div style={{ color: '#64748b', textAlign: 'center', width: '100%', padding: '3rem 0', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
                      <svg style={{ width: '48px', height: '48px', color: '#cbd5e1' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                      </svg>
                      <span style={{ fontWeight: 600, fontSize: '1rem', color: '#475569' }}>No student residents match your search filter.</span>
                      <p style={{ fontSize: '0.85rem', color: '#94a3b8', margin: 0 }}>Try adjusting your search terms or clearing the block filter.</p>
                    </div>
                  ) : (
                    filteredResidents.map((res, index) => (
                      <div key={index} className="resident-card" style={{
                        borderRadius: '16px',
                        border: '1px solid #e2e8f0',
                        padding: '1.25rem',
                        backgroundColor: '#ffffff',
                        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.03)',
                        transition: 'transform 0.15s ease, box-shadow 0.15s ease',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        textAlign: 'center'
                      }}>
                        <div className="res-avatar" style={{
                          width: '56px',
                          height: '56px',
                          borderRadius: '50%',
                          backgroundColor: '#eff6ff',
                          color: '#2563eb',
                          fontWeight: 800,
                          fontSize: '1.2rem',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          marginBottom: '0.75rem',
                          border: '2px solid #bfdbfe'
                        }}>
                          {res.name ? res.name.split(' ').map(n=>n[0]).join('').slice(0, 2).toUpperCase() : 'ST'}
                        </div>
                        <h4 style={{ margin: '0 0 0.35rem 0', fontSize: '1.05rem', fontWeight: 700, color: '#0f172a' }}>{res.name}</h4>
                        <div style={{ display: 'flex', gap: '0.4rem', marginBottom: '0.5rem' }}>
                          <span style={{ fontSize: '0.75rem', fontWeight: 700, padding: '0.2rem 0.6rem', borderRadius: '12px', backgroundColor: '#f1f5f9', color: '#475569' }}>
                            {res.block ? `${res.block} Block` : `Block ${profile.block}`}
                          </span>
                          <span style={{ fontSize: '0.75rem', fontWeight: 700, padding: '0.2rem 0.6rem', borderRadius: '12px', backgroundColor: '#eff6ff', color: '#2563eb' }}>
                            Room {res.roomNo || '101'}
                          </span>
                        </div>
                        <p style={{ fontSize: '0.8rem', color: '#64748b', margin: '0 0 0.5rem 0' }}>Roll: {res.rollNo || 'N/A'}</p>
                        <span className="res-email-badge" style={{ 
                          fontSize: '0.78rem', 
                          color: '#475569', 
                          backgroundColor: '#f8fafc', 
                          padding: '0.3rem 0.75rem', 
                          borderRadius: '20px', 
                          border: '1px solid #e2e8f0',
                          wordBreak: 'break-all',
                          marginBottom: '0.75rem'
                        }}>
                          {res.email}
                        </span>

                        <button
                          onClick={() => {
                            setSelectedResidentEmail(res.email);
                            setActiveTab('Messages');
                          }}
                          style={{
                            width: '100%',
                            padding: '0.55rem',
                            borderRadius: '10px',
                            border: '1px solid #bfdbfe',
                            backgroundColor: '#eff6ff',
                            color: '#2563eb',
                            fontSize: '0.82rem',
                            fontWeight: 700,
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '0.4rem',
                            marginTop: 'auto',
                            transition: 'all 0.15s ease'
                          }}
                        >
                          <svg style={{ width: '14px', height: '14px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                          </svg>
                          Message Student
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: WORKERS */}
          {activeTab === 'Workers' && (
            <div className="tab-focused-view">
              <div className="section-header">
                <div>
                  <h2>Global Maintenance Workers</h2>
                  <p style={{ color: '#64748b' }}>Manage shared hostel technicians, view contact details & assign tasks</p>
                </div>
                <button 
                  className="lodge-complaint-trigger-btn" 
                  onClick={() => {
                    setWorkerForm({ id: null, name: '', email: 'workers@campuscare.com', phone: '', category: 'Electrician', experience: '', address: '', status: 'Active' });
                    setShowAddWorkerModal(true);
                  }}
                >
                  + Add New Worker
                </button>
              </div>

              {/* GLOBAL WORKER NOTICE BANNER */}
              <div style={{ backgroundColor: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: '12px', padding: '1rem 1.25rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <svg width="24" height="24" fill="none" stroke="#2563eb" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span style={{ fontSize: '0.85rem', color: '#1e40af', fontWeight: 600 }}>
                  <strong>Global Worker Pool:</strong> All workers added by any Block Warden (A-F) or Head Warden are available across the entire hostel campus.
                </span>
              </div>

              {/* CATEGORY FILTER PILLS */}
              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '1.25rem' }}>
                {['All', 'Electrician', 'Plumber', 'Carpenter', 'Housekeeping', 'Network Technician', 'Painter', 'Mess Staff', 'Other'].map(cat => (
                  <button
                    key={cat}
                    onClick={() => setWorkerCategoryFilter(cat)}
                    style={{
                      padding: '0.4rem 0.9rem',
                      borderRadius: '20px',
                      fontSize: '0.8rem',
                      fontWeight: 700,
                      cursor: 'pointer',
                      border: workerCategoryFilter === cat ? 'none' : '1px solid #cbd5e1',
                      backgroundColor: workerCategoryFilter === cat ? '#2563eb' : '#ffffff',
                      color: workerCategoryFilter === cat ? '#ffffff' : '#475569',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    {cat}
                  </button>
                ))}
              </div>

              <div className="grid-card" style={{ padding: '1.5rem' }}>
                {workers.filter(w => workerCategoryFilter === 'All' || (w.category || w.role) === workerCategoryFilter).length === 0 ? (
                  <div style={{ color: '#64748b', textAlign: 'center', padding: '3rem 0' }}>
                    No workers found in this category. Click "+ Add New Worker" to register a technician.
                  </div>
                ) : (
                  <div className="workers-expanded-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.25rem' }}>
                    {workers
                      .filter(w => workerCategoryFilter === 'All' || (w.category || w.role) === workerCategoryFilter)
                      .map(w => {
                        const avatarLetters = w.avatar || (w.name ? w.name.split(' ').map(n=>n[0]).join('').toUpperCase().slice(0,2) : 'WK');
                        const cardColor = w.color || '#2563eb';
                        return (
                          <div key={w._id || w.id} className="worker-details-card" style={{ border: '1px solid #e2e8f0', borderRadius: '16px', padding: '1.25rem', backgroundColor: '#fff', boxShadow: '0 4px 12px rgba(0,0,0,0.03)' }}>
                            <div className="worker-card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                              <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                                <div className="worker-avatar" style={{ backgroundColor: `${cardColor}15`, color: cardColor, width: '48px', height: '48px', fontSize: '1.1rem', fontWeight: 800, borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                  {avatarLetters}
                                </div>
                                <div>
                                  <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 800, color: '#0f172a' }}>{w.name}</h3>
                                  <span style={{ fontSize: '0.8rem', color: cardColor, fontWeight: 700 }}>{w.category || w.role || 'Technician'}</span>
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

                            <div className="worker-meta" style={{ fontSize: '0.85rem', color: '#475569', display: 'flex', flexDirection: 'column', gap: '0.35rem', marginBottom: '1.25rem' }}>
                              <div><strong>Phone:</strong> {w.phone || 'N/A'}</div>
                              <div><strong>Email:</strong> {w.email || 'workers@campuscare.com'}</div>
                              {w.experience && <div><strong>Experience:</strong> {w.experience}</div>}
                              {w.address && <div><strong>Address / Station:</strong> {w.address}</div>}
                              <div><strong>Current Assigned Tasks:</strong> <span style={{ color: '#2563eb', fontWeight: 800 }}>{w.tasks || 0} active</span></div>
                            </div>

                            {/* WORKER ACTIONS */}
                            <div style={{ display: 'flex', gap: '0.5rem', borderTop: '1px solid #f1f5f9', paddingTop: '0.75rem' }}>
                              <button
                                onClick={() => handleEditWorker(w)}
                                style={{ flex: 1, padding: '0.5rem', borderRadius: '8px', border: '1px solid #cbd5e1', backgroundColor: '#ffffff', color: '#334155', fontWeight: 700, fontSize: '0.8rem', cursor: 'pointer' }}
                              >
                                Edit
                              </button>
                              <button
                                onClick={() => handleDeleteWorker(w._id || w.id)}
                                style={{ flex: 1, padding: '0.5rem', borderRadius: '8px', border: '1px solid #fca5a5', backgroundColor: '#fff1f2', color: '#e11d48', fontWeight: 700, fontSize: '0.8rem', cursor: 'pointer' }}
                              >
                                Remove
                              </button>
                            </div>
                          </div>
                        );
                      })}
                  </div>
                )}
              </div>
            </div>
          )}



          {/* TAB 6: MAINTENANCE TASKS */}
          {activeTab === 'Maintenance Tasks' && (
            <div className="tab-focused-view">
              <div className="section-header">
                <h2>Maintenance Tasks</h2>
                <p style={{ color: '#64748b' }}>Warden assignment log & updates</p>
              </div>

              <div className="grid-card" style={{ padding: '1.5rem' }}>
                <div className="task-log">
                  {complaints.filter(c => c.status === 'In Progress').length === 0 ? (
                    <div style={{ color: '#64748b', textAlign: 'center', padding: '2rem 0' }}>No active maintenance tasks in progress.</div>
                  ) : (
                    complaints.filter(c => c.status === 'In Progress').map((c, idx) => {
                      const assignedWorker = workers.find(w => w.role.toLowerCase().includes(c.category.toLowerCase()))?.name || 'Unassigned';
                      return (
                        <div key={c.id || idx} className="task-log-row">
                          <div style={{ display: 'flex', flexDirection: 'column' }}>
                            <span style={{ fontWeight: 600, color: '#0f172a' }}>{c.title}</span>
                            <span style={{ fontSize: '0.8rem', color: '#64748b' }}>ID: T-{c.id || idx} • Assigned Staff: {assignedWorker} • Location: {c.location}</span>
                          </div>
                          <span className="status-pill in-progress">
                            In Progress
                          </span>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            </div>
          )}

          {/* TAB 7: ANNOUNCEMENTS */}
          {/* TAB 7: ANNOUNCEMENTS & EVENTS */}
          {activeTab === 'Announcements' && (
            <div className="tab-focused-view">
              <div className="section-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <h2>Announcements & Events</h2>
                  <p style={{ color: '#64748b' }}>Post updates, files, and events for all resident students</p>
                </div>
                <div style={{ display: 'flex', gap: '0.75rem' }}>
                  <button className="lodge-complaint-trigger-btn" style={{ backgroundColor: '#10b981', display: 'flex', alignItems: 'center', gap: '0.35rem' }} onClick={() => setShowEventBannerModal(true)}>
                    <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19.114 5.636a9 9 0 010 12.728M16.463 8.288a5.25 5.25 0 010 7.424M6.75 8.25l4.72-4.72a.75.75 0 011.28.53v15.88a.75.75 0 01-1.28.53l-4.72-4.72H4.51c-.88 0-1.704-.507-1.938-1.354A9.01 9.01 0 012.25 12c0-.83.112-1.633.322-2.396C2.806 8.756 3.63 8.25 4.51 8.25H6.75z" />
                    </svg>
                    Manage Event Banner
                  </button>
                  <button className="lodge-complaint-trigger-btn" onClick={() => setShowAnnouncementModal(true)}>
                    + Post Announcement
                  </button>
                </div>
              </div>

              {/* Event Banner Control Bar & Preview for Warden */}
              {eventBanner && eventBanner.title && (
                <div style={{ marginBottom: '1.75rem', filter: eventBanner.active ? 'none' : 'grayscale(0.4) opacity(0.85)', transition: 'all 0.3s' }}>
                  <div style={{ 
                    display: 'flex', 
                    justify: 'space-between', 
                    alignItems: 'center', 
                    padding: '0.85rem 1.25rem', 
                    backgroundColor: '#0f172a', 
                    borderRadius: '16px 16px 0 0', 
                    border: '1px solid rgba(168, 85, 247, 0.3)',
                    borderBottom: 'none',
                    boxShadow: '0 4px 12px rgba(15, 23, 42, 0.3)'
                  }}>
                    {/* Left: Active Live Status Badge */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <span style={{ 
                        fontSize: '0.75rem', 
                        textTransform: 'uppercase', 
                        letterSpacing: '0.08em', 
                        backgroundColor: eventBanner.active ? 'rgba(225, 29, 72, 0.2)' : 'rgba(100, 116, 139, 0.2)', 
                        border: eventBanner.active ? '1px solid rgba(244, 63, 94, 0.5)' : '1px solid rgba(100, 116, 139, 0.4)',
                        padding: '0.35rem 0.75rem', 
                        borderRadius: '9999px', 
                        color: eventBanner.active ? '#f43f5e' : '#94a3b8',
                        fontWeight: '700',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.4rem'
                      }}>
                        <span style={{
                          width: '8px',
                          height: '8px',
                          borderRadius: '50%',
                          backgroundColor: eventBanner.active ? '#f43f5e' : '#64748b',
                          boxShadow: eventBanner.active ? '0 0 8px #f43f5e' : 'none'
                        }}></span>
                        {eventBanner.active ? 'Active Live Event Banner' : 'Banner Inactive (Hidden from Students)'}
                      </span>
                    </div>

                    {/* Right: Real Toggle Switch + Delete Button */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
                      
                      {/* Real Toggle Switch */}
                      <div 
                        onClick={async () => {
                          try {
                            const updatedActive = !eventBanner.active;
                            const res = await fetch('/api/event-banner', {
                              method: 'POST',
                              headers: { 'Content-Type': 'application/json' },
                              body: JSON.stringify({ ...eventBanner, active: updatedActive })
                            });
                            if (res.ok) {
                              const data = await res.json();
                              setEventBanner(data.banner);
                            }
                          } catch (err) {
                            console.error(err);
                          }
                        }}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.65rem',
                          cursor: 'pointer',
                          userSelect: 'none'
                        }}
                        title={eventBanner.active ? "Click to turn banner OFF" : "Click to turn banner ON"}
                      >
                        <span style={{ fontSize: '0.82rem', fontWeight: 650, color: eventBanner.active ? '#34d399' : '#94a3b8' }}>
                          {eventBanner.active ? 'LIVE ON' : 'OFF'}
                        </span>
                        <div style={{
                          width: '48px',
                          height: '26px',
                          borderRadius: '9999px',
                          backgroundColor: eventBanner.active ? '#10b981' : '#475569',
                          padding: '2px',
                          transition: 'background-color 0.25s ease',
                          display: 'flex',
                          alignItems: 'center',
                          boxShadow: eventBanner.active ? '0 0 12px rgba(16, 185, 129, 0.4)' : 'inset 0 2px 4px rgba(0,0,0,0.3)'
                        }}>
                          <div style={{
                            width: '22px',
                            height: '22px',
                            borderRadius: '50%',
                            backgroundColor: '#ffffff',
                            boxShadow: '0 2px 5px rgba(0,0,0,0.3)',
                            transform: eventBanner.active ? 'translateX(22px)' : 'translateX(0px)',
                            transition: 'transform 0.25s cubic-bezier(0.4, 0, 0.2, 1)'
                          }}></div>
                        </div>
                      </div>

                      {/* Delete Banner Button */}
                      <button 
                        onClick={handleDeleteEventBanner}
                        style={{
                          backgroundColor: 'rgba(239, 68, 68, 0.15)',
                          color: '#f87171',
                          border: '1px solid rgba(239, 68, 68, 0.3)',
                          padding: '0.35rem 0.85rem',
                          borderRadius: '8px',
                          fontSize: '0.8rem',
                          fontWeight: 650,
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.4rem',
                          transition: 'all 0.2s'
                        }}
                        title="Delete banner permanently"
                      >
                        <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                        Delete
                      </button>
                    </div>
                  </div>

                  <div style={{ marginTop: '-1px' }}>
                    <EventBannerCard banner={eventBanner} />
                  </div>
                </div>
              )}

              <div className="grid-card" style={{ padding: '1.5rem' }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.25rem' }}>
                  {announcements.length === 0 ? (
                    <p style={{ color: '#64748b', textAlign: 'center', padding: '2rem 0', gridColumn: '1 / -1' }}>No announcements posted yet.</p>
                  ) : (
                    announcements.map(ann => (
                      <div key={ann.id || ann._id} className={`announcement-card-expanded ${ann.important ? 'border-red-left' : ''}`} style={{ 
                        display: 'flex', 
                        flexDirection: 'column', 
                        justifyContent: 'space-between',
                        padding: '1.25rem', 
                        border: '1px solid #e2e8f0', 
                        borderRadius: '10px', 
                        backgroundColor: '#fff',
                        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)',
                        borderLeft: ann.important ? '4px solid #ef4444' : '4px solid #3b82f6',
                        position: 'relative'
                      }}>
                        <div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                            <span className="ann-date" style={{ fontSize: '0.8rem', color: '#94a3b8' }}>{ann.date}</span>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                              {ann.important && <span className="important-tag" style={{ margin: 0, padding: '0.15rem 0.4rem', fontSize: '0.75rem' }}>Urgent</span>}
                              <button 
                                onClick={() => handleDeleteAnnouncement(ann.id || ann._id)}
                                style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', padding: 0 }}
                                title="Delete announcement"
                              >
                                <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                              </button>
                            </div>
                          </div>
                          
                          <h4 style={{ margin: '0.25rem 0 0.5rem', fontSize: '1.1rem', color: '#0f172a', fontWeight: 700 }}>
                            {ann.title || 'General Update'}
                          </h4>
                          
                          <p className="ann-expanded-text" style={{ fontSize: '0.9rem', color: '#334155', lineHeight: 1.5, margin: '0.5rem 0', whiteSpace: 'pre-wrap' }}>
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

          {/* TAB 8: MESSAGES */}
          {activeTab === 'Messages' && (
            <div className="tab-focused-view" style={{ height: 'calc(100vh - 120px)', display: 'flex', flexDirection: 'column', width: '100%' }}>
              <div className="section-header" style={{ marginBottom: '1rem' }}>
                <h2>Message Center</h2>
              </div>

              <div className="message-center-layout" style={{ display: 'flex', flex: 1, width: '100%', backgroundColor: '#fff', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)', border: '1px solid #e2e8f0' }}>
                
                {/* 1. LEFT SIDEBAR: CHAT SESSIONS */}
                <div className={`chats-sidebar ${mobileChatView === 'chat' ? 'mobile-hidden' : ''}`} style={{ width: '320px', borderRight: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', backgroundColor: '#f8fafc' }}>
                  <div style={{ padding: '1rem 1rem 0.5rem', backgroundColor: '#fff' }}>
                    <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#0f172a', margin: 0 }}>Chats</h3>
                  </div>

                  {/* Block Selection Filter Bar */}
                  <div style={{ padding: '0.5rem 1rem', borderBottom: '1px solid #e2e8f0', backgroundColor: '#fff', display: 'flex', gap: '0.4rem', overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
                    {['All', ...(profile.block && profile.block !== 'All' && user?.role !== 'headwarden' && profile.block.length < 5 ? [profile.block] : ['A', 'B', 'C', 'D', 'E', 'F'])].map(blk => (
                      <button
                        key={blk}
                        onClick={() => setChatBlockFilter(blk)}
                        style={{
                          padding: '0.35rem 0.6rem',
                          borderRadius: '6px',
                          border: chatBlockFilter === blk ? '1px solid #2563eb' : '1px solid #cbd5e1',
                          backgroundColor: chatBlockFilter === blk ? '#eff6ff' : '#ffffff',
                          color: chatBlockFilter === blk ? '#2563eb' : '#475569',
                          fontSize: '0.75rem',
                          fontWeight: '650',
                          cursor: 'pointer',
                          whiteSpace: 'nowrap',
                          flexShrink: 0
                        }}
                      >
                        {blk === 'All' ? 'All Blocks' : `${blk} Block`}
                      </button>
                    ))}
                  </div>

                  <div style={{ flex: 1, overflowY: 'auto' }}>
                    {(() => {
                      const filteredChatResidents = residents.filter(res => {
                        if (chatBlockFilter !== 'All') {
                          const resBlockClean = (res.block || '').replace(/block/i, '').trim().toUpperCase();
                          return resBlockClean === chatBlockFilter.toUpperCase();
                        }
                        return true;
                      });

                      if (filteredChatResidents.length === 0) {
                        return (
                          <p style={{ color: '#64748b', fontSize: '0.85rem', textAlign: 'center', padding: '1.5rem' }}>
                            No residents found for block {chatBlockFilter}.
                          </p>
                        );
                      }

                      return filteredChatResidents.map(res => {
                        const isSelected = selectedResidentEmail === res.email;
                        const studentMessages = chatMessages.filter(m => m.studentEmail?.toLowerCase() === res.email.toLowerCase());
                        const lastMsg = studentMessages[studentMessages.length - 1];
                        const lastMsgText = lastMsg 
                          ? (lastMsg.sender === 'student' ? `${res.name.split(' ')[0]}: ${lastMsg.text}` : `You: ${lastMsg.text}`) 
                          : 'No messages yet';
                        const lastMsgTime = lastMsg ? lastMsg.time : '';

                        return (
                          <div 
                            key={res.id || res.email}
                            onClick={() => {
                              setSelectedResidentEmail(res.email);
                              setEditingMessageId(null);
                              setMobileChatView('chat');
                            }}
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: '0.75rem',
                              padding: '1rem 0.75rem',
                              borderBottom: '1px solid #f1f5f9',
                              cursor: 'pointer',
                              backgroundColor: isSelected ? '#eff6ff' : 'transparent',
                              transition: 'background-color 0.2s',
                              borderLeft: isSelected ? '4px solid #3b82f6' : '4px solid transparent'
                            }}
                          >
                            {res.profilePhoto ? (
                              <img src={res.profilePhoto} alt="avatar" style={{ width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover' }} />
                            ) : (
                              <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: '#cbd5e1', color: '#0f172a', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '0.9rem' }}>
                                {res.name.split(' ').map(n=>n[0]).join('')}
                              </div>
                            )}
                            <div style={{ flex: 1, minWidth: 0 }}>
                              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                                <h4 style={{ margin: 0, fontSize: '0.9rem', fontWeight: 650, color: '#0f172a', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{res.name}</h4>
                                <span style={{ fontSize: '0.7rem', color: '#64748b' }}>{lastMsgTime}</span>
                              </div>
                              <p style={{ margin: '4px 0 0', fontSize: '0.75rem', color: '#64748b', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                {lastMsgText}
                              </p>
                            </div>
                          </div>
                        );
                      });
                    })()}
                  </div>
                </div>

                {/* 2. RIGHT CONTENT: ACTIVE CONVERSATION BOX */}
                <div className={`active-chat-box ${mobileChatView === 'list' ? 'mobile-hidden' : ''}`} style={{ flex: 1, display: 'flex', flexDirection: 'column', backgroundColor: '#efeae2' }}>
                  {(() => {
                    const activeResident = residents.find(r => r.email === selectedResidentEmail);
                    if (!activeResident) {
                      return (
                        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#64748b' }}>
                          <svg width="48" height="48" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z" />
                          </svg>
                          <p style={{ marginTop: '0.75rem', fontWeight: 500 }}>Select a resident from the sidebar to chat</p>
                        </div>
                      );
                    }

                    const activeChatMessages = chatMessages.filter(m => m.studentEmail?.toLowerCase() === selectedResidentEmail.toLowerCase());

                    return (
                      <>
                        {/* Chat Header */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem 1rem', borderBottom: '1px solid #e2e8f0', backgroundColor: '#fff', boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)', zIndex: 10 }}>
                          <button 
                            className="chat-back-to-list-btn"
                            onClick={() => {
                              setMobileChatView('list');
                            }}
                            style={{
                              display: 'none',
                              background: 'none',
                              border: 'none',
                              color: '#2563eb',
                              fontSize: '0.9rem',
                              fontWeight: '600',
                              cursor: 'pointer',
                              marginRight: '0.5rem'
                            }}
                          >
                            ← Back
                          </button>
                          {activeResident.profilePhoto ? (
                            <img src={activeResident.profilePhoto} alt="avatar" style={{ width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover' }} />
                          ) : (
                            <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: '#cbd5e1', color: '#0f172a', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>
                              {activeResident.name.split(' ').map(n=>n[0]).join('')}
                            </div>
                          )}
                          <div style={{ flex: 1 }}>
                            <h3 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 700, color: '#0f172a' }}>{activeResident.name}</h3>
                            <p style={{ margin: '2px 0 0', fontSize: '0.75rem', color: '#64748b' }}>
                              Room {activeResident.roomNo} • Block {activeResident.block} • {activeResident.phoneNo}
                            </p>
                          </div>
                          <button
                            onClick={async () => {
                              if (!window.confirm(`Are you sure you want to clear chat history with ${activeResident.name}?`)) return;
                              try {
                                const res = await fetch(`/api/messages/conversation?studentEmail=${encodeURIComponent(activeResident.email)}`, {
                                  method: 'DELETE'
                                });
                                if (res.ok) {
                                  setChatMessages(prev => prev.filter(m => m.studentEmail?.toLowerCase() !== activeResident.email.toLowerCase()));
                                } else {
                                  alert('Failed to clear chat');
                                }
                              } catch (err) {
                                console.error(err);
                                alert('Error clearing chat');
                              }
                            }}
                            style={{
                              marginLeft: 'auto',
                              backgroundColor: '#fff1f2',
                              color: '#e11d48',
                              border: '1px solid #fecdd3',
                              borderRadius: '8px',
                              padding: '0.35rem 0.75rem',
                              fontSize: '0.75rem',
                              fontWeight: '700',
                              cursor: 'pointer'
                            }}
                            title="Clear conversation history"
                          >
                            🗑️ Clear Chat
                          </button>
                        </div>

                        {/* Chat Messages Body */}
                        <div style={{ flex: 1, overflowY: 'auto', padding: '1rem', display: 'flex', flexDirection: 'column' }}>
                          {activeChatMessages.length === 0 ? (
                            <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                              <span style={{ fontSize: '0.8rem', padding: '0.35rem 0.75rem', backgroundColor: '#e2e8f0', borderRadius: '8px', color: '#475569', fontWeight: 500 }}>
                                Chat session started
                              </span>
                            </div>
                          ) : (
                            activeChatMessages.map((msg, index) => {
                              const isOwn = msg.sender === 'warden';
                              const msgId = msg._id || msg.id;
                              const isEditing = editingMessageId === msgId;

                              return (
                                <div 
                                  key={msgId || index} 
                                  style={{
                                    alignSelf: isOwn ? 'flex-end' : 'flex-start',
                                    backgroundColor: isOwn ? '#d9fdd3' : '#fff',
                                    color: '#0f172a',
                                    padding: '0.6rem 0.8rem',
                                    borderRadius: '8px',
                                    maxWidth: '65%',
                                    margin: '0.35rem 0',
                                    boxShadow: '0 1px 1px rgba(0,0,0,0.06)',
                                    display: 'flex',
                                    flexDirection: 'column'
                                  }}
                                >
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
                                      <div style={{ fontSize: '0.9rem', whiteSpace: 'pre-wrap', color: '#0f172a' }}>{msg.text}</div>
                                      {isOwn && (
                                        <div className="message-actions" style={{ display: 'flex', gap: '0.35rem', marginLeft: '0.5rem', alignSelf: 'flex-start', padding: '2px 4px', backgroundColor: 'rgba(15, 23, 42, 0.08)', borderRadius: '4px' }}>
                                          <button 
                                            onClick={() => {
                                              setEditingMessageId(msgId);
                                              setEditingText(msg.text);
                                            }}
                                            style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#1d4ed8', padding: '0.2rem', display: 'flex', alignItems: 'center' }}
                                            title="Edit Message"
                                          >
                                            <svg width="11" height="11" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                                              <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L6.832 19.82a4.5 4.5 0 01-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 011.13-1.897L16.863 4.487zm0 0L19.5 7.125" />
                                            </svg>
                                          </button>
                                          <button 
                                            onClick={() => handleDeleteMessage(msgId)}
                                            style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#b91c1c', padding: '0.2rem', display: 'flex', alignItems: 'center' }}
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
                                  <span style={{ fontSize: '0.65rem', color: '#64748b', alignSelf: 'flex-end', marginTop: '0.15rem' }}>{msg.time}</span>
                                </div>
                              );
                            })
                          )}
                        </div>

                        {/* Chat Send Input Box */}
                        <form onSubmit={handleSendMessage} style={{ display: 'flex', gap: '0.75rem', padding: '0.75rem 1rem', backgroundColor: '#f0f2f5', zIndex: 10 }}>
                          <input
                            type="text"
                            placeholder={`Reply to ${activeResident.name.split(' ')[0]}...`}
                            value={newMsgText}
                            onChange={(e) => setNewMsgText(e.target.value)}
                            style={{ flex: 1, padding: '0.6rem 1rem', borderRadius: '20px', border: 'none', outline: 'none', fontSize: '0.9rem' }}
                          />
                          <button 
                            type="submit" 
                            style={{ 
                              padding: '0.6rem 1.25rem', 
                              backgroundColor: '#00a884', 
                              color: '#fff', 
                              border: 'none', 
                              borderRadius: '20px', 
                              fontWeight: 600, 
                              cursor: 'pointer', 
                              fontSize: '0.9rem' 
                            }}
                          >
                            Send
                          </button>
                        </form>
                      </>
                    );
                  })()}
                </div>
              </div>
            </div>
          )}

          {/* TAB: MANAGEMENT MESSAGES */}
          {activeTab === 'Management Messages' && (
            <div className="tab-focused-view" style={{ height: 'calc(100vh - 120px)', display: 'flex', flexDirection: 'column', width: '100%' }}>
              <div className="section-header mgt-chat-header-flex" style={{ marginBottom: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
                <div>
                  <h2>Management Direct Chat</h2>
                  <p style={{ color: '#64748b' }}>Official 2-way communication channel with Campus Management</p>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', backgroundColor: '#eff6ff', padding: '0.4rem 0.85rem', borderRadius: '9999px', border: '1px solid #bfdbfe', flexShrink: 0 }}>
                  <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#2563eb' }}></span>
                  <span style={{ fontSize: '0.8rem', color: '#1e40af', fontWeight: 600 }}>Official Channel</span>
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', flex: 1, width: '100%', backgroundColor: '#fff', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)', border: '1px solid #e2e8f0' }}>
                
                {/* Executive Header Strip */}
                <div style={{ padding: '1rem 1.25rem', backgroundColor: '#0f172a', color: '#fff', display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                  <div style={{ width: '42px', height: '42px', borderRadius: '50%', backgroundColor: '#1e293b', border: '1px solid #334155', color: '#38bdf8', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                  </div>
                  <div style={{ minWidth: 0 }}>
                    <h3 style={{ margin: 0, fontSize: '1.05rem', color: '#fff', fontWeight: 700, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>Hostel Management Executive</h3>
                    <p style={{ margin: 0, fontSize: '0.8rem', color: '#94a3b8', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>management@campuscare.com</p>
                  </div>
                </div>

                {/* Message Body */}
                <div style={{ flex: 1, overflowY: 'auto', padding: '1.25rem', backgroundColor: '#f8fafc', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  {managementMessages.length === 0 ? (
                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#64748b', textAlign: 'center', padding: '2rem' }}>
                      <svg width="48" height="48" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24" style={{ marginBottom: '1rem', color: '#cbd5e1' }}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                      </svg>
                      <h4 style={{ margin: '0 0 0.5rem', color: '#0f172a' }}>No Management Messages Yet</h4>
                      <p style={{ fontSize: '0.85rem', maxWidth: '400px' }}>
                        Management can send direct notices or inquiries to your hostel block. You can also send a direct query to Management below.
                      </p>
                    </div>
                  ) : (
                    managementMessages.map((msg, idx) => {
                      const isFromManagement = msg.sender === 'management';
                      return (
                        <div 
                          key={msg._id || msg.id || idx}
                          style={{
                            alignSelf: isFromManagement ? 'flex-start' : 'flex-end',
                            maxWidth: '70%',
                            backgroundColor: isFromManagement ? '#ffffff' : '#0f172a',
                            color: isFromManagement ? '#0f172a' : '#ffffff',
                            border: isFromManagement ? '1px solid #e2e8f0' : 'none',
                            padding: '0.85rem 1.1rem',
                            borderRadius: isFromManagement ? '12px 12px 12px 2px' : '12px 12px 2px 12px',
                            boxShadow: '0 2px 4px rgba(0,0,0,0.04)'
                          }}
                        >
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem', gap: '1rem' }}>
                            <span style={{ fontSize: '0.78rem', fontWeight: 700, color: isFromManagement ? '#2563eb' : '#38bdf8', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                              {isFromManagement ? (
                                <>
                                  <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1" />
                                  </svg>
                                  Management Executive
                                </>
                              ) : (
                                <>
                                  <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                  </svg>
                                  You (Block Warden)
                                </>
                              )}
                            </span>
                            <span style={{ fontSize: '0.65rem', color: isFromManagement ? '#94a3b8' : '#cbd5e1' }}>
                              {msg.time || 'Today'}
                            </span>
                          </div>
                          <p style={{ margin: 0, fontSize: '0.9rem', lineHeight: '1.45', whiteSpace: 'pre-wrap' }}>
                            {msg.text}
                          </p>
                        </div>
                      );
                    })
                  )}
                </div>

                {/* Send Input Form */}
                <form onSubmit={handleSendManagementReply} style={{ padding: '1rem', backgroundColor: '#fff', borderTop: '1px solid #e2e8f0', display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                  <input 
                    type="text" 
                    placeholder="Type your message to Management..." 
                    value={mgtMsgText}
                    onChange={(e) => setMgtMsgText(e.target.value)}
                    style={{ flex: 1, padding: '0.75rem 1rem', borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none', fontSize: '0.9rem', minWidth: 0 }}
                  />
                  <button 
                    type="submit" 
                    style={{ 
                      backgroundColor: '#0f172a', 
                      color: '#ffffff', 
                      padding: '0.75rem 1.25rem', 
                      border: 'none', 
                      borderRadius: '8px', 
                      fontWeight: 650, 
                      cursor: 'pointer', 
                      fontSize: '0.85rem',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      boxShadow: '0 4px 12px rgba(15, 23, 42, 0.15)',
                      whiteSpace: 'nowrap',
                      flexShrink: 0
                    }}
                  >
                    <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3 21l18-9L3 3l3 9zm0 0h7" />
                    </svg>
                    Send Reply
                  </button>
                </form>

              </div>
            </div>
          )}

          {/* TAB: WARDENS MANAGEMENT (HEAD WARDEN ONLY) */}
          {activeTab === 'Wardens' && (
            <div className="tab-focused-view" style={{ width: '100%' }}>
              <div className="section-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', width: '100%' }}>
                <div>
                  <h2>Wardens Management & Communication</h2>
                  <p style={{ color: '#64748b' }}>Oversee all block wardens across hostel blocks, view contact details & message directly</p>
                </div>
                <div style={{ maxWidth: '320px', width: '100%' }}>
                  <input 
                    type="text" 
                    className="standard-input-field" 
                    placeholder="Search wardens by name, block, phone..." 
                    value={searchWardenQuery} 
                    onChange={(e) => setSearchWardenQuery(e.target.value)} 
                    style={{ width: '100%', padding: '0.65rem 1rem', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.25rem', width: '100%' }}>
                {wardensList.filter(w => {
                  const q = searchWardenQuery.toLowerCase();
                  const blocksStr = Array.isArray(w.blocks) ? w.blocks.join(' ') : (w.block || '');
                  return (
                    (w.name || '').toLowerCase().includes(q) ||
                    (w.email || '').toLowerCase().includes(q) ||
                    (w.phoneNo || '').toLowerCase().includes(q) ||
                    blocksStr.toLowerCase().includes(q)
                  );
                }).length === 0 ? (
                  <div style={{ color: '#64748b', textAlign: 'center', padding: '3rem 0', gridColumn: '1 / -1', backgroundColor: '#fff', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                    No block wardens found.
                  </div>
                ) : (
                  wardensList.filter(w => {
                    const q = searchWardenQuery.toLowerCase();
                    const blocksStr = Array.isArray(w.blocks) ? w.blocks.join(' ') : (w.block || '');
                    return (
                      (w.name || '').toLowerCase().includes(q) ||
                      (w.email || '').toLowerCase().includes(q) ||
                      (w.phoneNo || '').toLowerCase().includes(q) ||
                      blocksStr.toLowerCase().includes(q)
                    );
                  }).map(w => (
                    <div 
                      key={w._id || w.email} 
                      style={{ 
                        padding: '1.5rem', 
                        backgroundColor: 'rgba(255, 255, 255, 0.95)', 
                        backdropFilter: 'blur(12px)',
                        borderRadius: '16px', 
                        border: '1px solid rgba(226, 232, 240, 0.9)', 
                        borderTop: w.role === 'headwarden' ? '3px solid #f59e0b' : '3px solid #2563eb',
                        display: 'flex', 
                        flexDirection: 'column', 
                        justify: 'space-between', 
                        boxShadow: '0 10px 25px -5px rgba(15, 23, 42, 0.06), 0 4px 6px -2px rgba(15, 23, 42, 0.02)',
                        transition: 'transform 0.2s ease, box-shadow 0.2s ease'
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
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '0.5rem',
                          fontSize: '0.9rem',
                          boxShadow: '0 4px 14px rgba(15, 23, 42, 0.18)',
                          transition: 'all 0.2s ease'
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

          {/* TAB: INCIDENT GROUPS */}
          {activeTab === 'Incident Groups' && (
            <div className="tab-focused-view">
              <div className="section-header" style={{ marginBottom: '1.5rem' }}>
                <h2>📢 Incident Discussion Groups</h2>
                <p style={{ color: '#64748b' }}>Discuss maintenance issues and collaborate with block residents.</p>
              </div>
              <IncidentGroupsChat user={{ ...profile, role: isHeadWarden ? 'headwarden' : 'warden' }} />
            </div>
          )}

          {/* TAB: GROUP INSIGHTS */}
          {activeTab === 'Group Insights' && (
            <div className="tab-focused-view">
              <div className="section-header" style={{ marginBottom: '1.5rem' }}>
                <h2>📊 Block Group Insights</h2>
                <p style={{ color: '#64748b' }}>View AI-generated discussion summaries and analytics for each hostel block.</p>
              </div>
              <GroupInsightsDashboard />
            </div>
          )}

          {/* TAB: FEEDBACK */}
          {activeTab === 'Feedback' && (
            <div className="tab-focused-view">
              <div className="section-header" style={{ marginBottom: '2rem' }}>
                <h2>Feedback Campaigns</h2>
                <p style={{ color: '#64748b' }}>Create, publish and manage feedback forms for hostel students</p>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.6fr', gap: '2rem' }}>
                
                {/* COLUMN 1: CREATE FORM */}
                <div style={{ padding: '2rem', backgroundColor: '#fff', borderRadius: '16px', border: '1px solid #e2e8f0', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.05), 0 4px 6px -2px rgba(0, 0, 0, 0.025)' }}>
                  <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <svg width="20" height="20" fill="none" stroke="#2563eb" strokeWidth="2" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                    Publish Feedback Form
                  </h3>
                  <form onSubmit={handleCreateFeedbackRequest} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                      <label style={{ fontWeight: 700, color: '#334155', fontSize: '0.85rem' }}>Title / Subject</label>
                      <input 
                        type="text" 
                        placeholder="e.g. Mess Food Quality - October"
                        style={{ padding: '0.65rem 0.85rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.9rem', outline: 'none', transition: 'border-color 0.2s' }}
                        value={newFeedbackTitle}
                        onChange={(e) => setNewFeedbackTitle(e.target.value)}
                        required
                      />
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                      <label style={{ fontWeight: 700, color: '#334155', fontSize: '0.85rem' }}>Description / Inquiries</label>
                      <textarea 
                        rows="4" 
                        placeholder="Explain what aspects the students should rate or suggestions they should provide..."
                        style={{ padding: '0.65rem 0.85rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.9rem', outline: 'none', resize: 'vertical', transition: 'border-color 0.2s', fontFamily: 'inherit' }}
                        value={newFeedbackDesc}
                        onChange={(e) => setNewFeedbackDesc(e.target.value)}
                        required
                      ></textarea>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                      <label style={{ fontWeight: 700, color: '#334155', fontSize: '0.85rem' }}>Target Block / Audience</label>
                      <select 
                        style={{ padding: '0.65rem 0.85rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.9rem', outline: 'none', backgroundColor: '#fff', cursor: 'pointer' }}
                        value={newFeedbackTargetBlock || profile.block || 'All'}
                        onChange={(e) => setNewFeedbackTargetBlock(e.target.value)}
                      >
                        {profile.block && profile.block !== 'All' && (
                          <option value={profile.block}>{profile.block.includes('Block') ? profile.block : `${profile.block} Block`}</option>
                        )}
                        <option value="A">A Block</option>
                        <option value="B">B Block</option>
                        <option value="C">C Block</option>
                        <option value="D">D Block</option>
                        <option value="E">E Block</option>
                        <option value="F">F Block</option>
                        <option value="A, B, C">ABC Block</option>
                        <option value="All">All Blocks</option>
                      </select>
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
                      Ask Feedback
                    </SpecularButton>
                  </form>
                </div>

                {/* COLUMN 2: FORMS LIST */}
                <div style={{ padding: '2rem', backgroundColor: '#fff', borderRadius: '16px', border: '1px solid #e2e8f0', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.05), 0 4px 6px -2px rgba(0, 0, 0, 0.025)' }}>
                  <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <svg width="20" height="20" fill="none" stroke="#10b981" strokeWidth="2" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    Campaign History
                  </h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', maxHeight: '455px', overflowY: 'auto', paddingRight: '0.5rem' }}>
                    {feedbackRequests.length === 0 ? (
                      <div style={{ textAlign: 'center', padding: '3rem 1rem' }}>
                        <svg width="48" height="48" fill="none" stroke="#94a3b8" strokeWidth="1.5" viewBox="0 0 24 24" style={{ margin: '0 auto 1rem' }}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0a2 2 0 01-2 2H6a2 2 0 01-2-2m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                        </svg>
                        <p style={{ color: '#64748b', fontSize: '0.9rem', margin: 0 }}>No feedback campaigns created yet.</p>
                      </div>
                    ) : (
                      feedbackRequests.map(req => (
                        <div 
                          key={req._id || req.id} 
                          style={{ 
                            padding: '1.25rem', 
                            borderRadius: '12px', 
                            border: '1px solid #e2e8f0', 
                            backgroundColor: '#f8fafc',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '0.75rem',
                            transition: 'border-color 0.2s'
                          }}
                        >
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <h4 style={{ margin: 0, fontSize: '1rem', fontWeight: 800, color: '#1e293b' }}>
                              {req.title}
                            </h4>
                            <div style={{ display: 'flex', gap: '0.4rem', alignItems: 'center' }}>
                              <span 
                                style={{ 
                                  padding: '4px 10px', 
                                  borderRadius: '9999px', 
                                  fontSize: '0.72rem', 
                                  fontWeight: 700, 
                                  backgroundColor: '#e0f2fe', 
                                  color: '#0369a1',
                                  border: '1px solid #bae6fd'
                                }}
                              >
                                Target: {req.targetBlock || 'All'}
                              </span>
                              <span 
                                style={{ 
                                  padding: '4px 10px', 
                                  borderRadius: '9999px', 
                                  fontSize: '0.72rem', 
                                  fontWeight: 700, 
                                  backgroundColor: req.active ? '#dcfce7' : '#f1f5f9', 
                                  color: req.active ? '#166534' : '#475569',
                                  border: req.active ? '1px solid #bbf7d0' : '1px solid #e2e8f0'
                                }}
                              >
                                {req.active ? 'Active' : 'Closed'}
                              </span>
                            </div>
                          </div>
                          <p style={{ margin: 0, fontSize: '0.85rem', color: '#475569', lineHeight: '1.5' }}>
                            {req.description}
                          </p>
                          <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.25rem' }}>
                            <SpecularButton 
                              onClick={() => handleViewResponses(req)}
                              size="sm" 
                              radius={6} 
                              tint="#2563eb" 
                              tintOpacity={1} 
                              textColor="#ffffff" 
                              lineColor="#ffffff" 
                              baseColor="#1d4ed8"
                            >
                              View Responses
                            </SpecularButton>
                            <SpecularButton 
                              onClick={() => handleDeleteFeedbackRequest(req._id || req.id)}
                              size="sm" 
                              radius={6} 
                              tint="#fee2e2" 
                              tintOpacity={1} 
                              textColor="#b91c1c" 
                              lineColor="#fca5a5" 
                              baseColor="#fee2e2"
                            >
                              Delete
                            </SpecularButton>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>

              </div>
            </div>
          )}

          {/* TAB 9: REPORTS */}
          {activeTab === 'Reports' && (
            <div className="tab-focused-view">
              <div className="section-header" style={{ marginBottom: '2rem' }}>
                <h2>Reports & Export Center</h2>
                <p style={{ color: '#64748b' }}>Generate and download real-time hostel activity reports in CSV format</p>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
                
                {/* CARD 1: COMPLAINT ACTIVITY */}
                <div style={{ padding: '2rem', backgroundColor: '#fff', borderRadius: '16px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
                  <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#0f172a', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <svg width="24" height="24" fill="none" stroke="#2563eb" strokeWidth="2" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    Complaint Activity
                  </h3>
                  
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    <div style={{ padding: '1rem', border: '1px solid #f1f5f9', borderRadius: '12px', backgroundColor: '#f8fafc', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div style={{ marginRight: '1rem' }}>
                        <h4 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 700, color: '#1e293b' }}>Daily Activity Report</h4>
                        <p style={{ margin: '4px 0 0', fontSize: '0.8rem', color: '#64748b', lineHeight: '1.4' }}>Complaints and tasks logged in the last 24 hours.</p>
                      </div>
                      <SpecularButton 
                        onClick={exportDailyComplaintsCSV}
                        size="sm"
                        radius={6}
                        tint="#2563eb"
                        tintOpacity={1}
                        textColor="#ffffff"
                        lineColor="#ffffff"
                        baseColor="#1d4ed8"
                      >
                        Export CSV
                      </SpecularButton>
                    </div>

                    <div style={{ padding: '1rem', border: '1px solid #f1f5f9', borderRadius: '12px', backgroundColor: '#f8fafc', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div style={{ marginRight: '1rem' }}>
                        <h4 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 700, color: '#1e293b' }}>Weekly Activity Report</h4>
                        <p style={{ margin: '4px 0 0', fontSize: '0.8rem', color: '#64748b', lineHeight: '1.4' }}>Complaints and tasks logged in the last 7 days.</p>
                      </div>
                      <SpecularButton 
                        onClick={exportWeeklyComplaintsCSV}
                        size="sm"
                        radius={6}
                        tint="#2563eb"
                        tintOpacity={1}
                        textColor="#ffffff"
                        lineColor="#ffffff"
                        baseColor="#1d4ed8"
                      >
                        Export CSV
                      </SpecularButton>
                    </div>
                  </div>
                </div>

                {/* CARD 2: FEEDBACK ACTIVITY */}
                <div style={{ padding: '2rem', backgroundColor: '#fff', borderRadius: '16px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
                  <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#0f172a', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <svg width="24" height="24" fill="none" stroke="#10b981" strokeWidth="2" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M11 3.055A9.003 9.003 0 1020.945 13H11V3.055z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z" />
                    </svg>
                    Feedback Activity
                  </h3>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    <div style={{ padding: '1rem', border: '1px solid #f1f5f9', borderRadius: '12px', backgroundColor: '#f8fafc', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div style={{ marginRight: '1rem' }}>
                        <h4 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 700, color: '#1e293b' }}>Feedback Campaigns Summary</h4>
                        <p style={{ margin: '4px 0 0', fontSize: '0.8rem', color: '#64748b', lineHeight: '1.4' }}>General details, dates, and statuses of all campaigns.</p>
                      </div>
                      <SpecularButton 
                        onClick={exportFeedbackSummaryCSV}
                        size="sm"
                        radius={6}
                        tint="#2563eb"
                        tintOpacity={1}
                        textColor="#ffffff"
                        lineColor="#ffffff"
                        baseColor="#1d4ed8"
                      >
                        Export CSV
                      </SpecularButton>
                    </div>
                  </div>
                </div>

              </div>
            </div>
          )}

          {/* TAB 10: SETTINGS */}
          {activeTab === 'Settings' && (
            <div className="tab-focused-view">
              <div className="section-header">
                <h2>Account Settings</h2>
                <p style={{ color: '#64748b' }}>Modify Warden profile details</p>
              </div>

              <div className="grid-card" style={{ padding: '2rem', maxWidth: '600px' }}>
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
                      <label className="settings-label">Warden Name</label>
                      <input
                        type="text"
                        className="standard-input-field"
                        value={profile.name}
                        onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                      />
                    </div>
                    <div>
                      <label className="settings-label">Employee ID</label>
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
                      <label className="settings-label">Official Mail ID</label>
                      <input
                        type="email"
                        className="standard-input-field"
                        value={profile.email}
                        readOnly
                        style={{ backgroundColor: '#f1f5f9', cursor: 'not-allowed' }}
                      />
                    </div>
                    <div>
                      <label className="settings-label">Phone Number</label>
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
                      <label className="settings-label">Office Room</label>
                      <input
                        type="text"
                        className="standard-input-field"
                        value={profile.roomNo}
                        onChange={(e) => setProfile({ ...profile, roomNo: e.target.value })}
                      />
                    </div>
                    <div>
                      <label className="settings-label">Hostel Block</label>
                      <input
                        type="text"
                        className="standard-input-field"
                        value={profile.block}
                        onChange={(e) => setProfile({ ...profile, block: e.target.value })}
                      />
                    </div>
                  </div>

                  <button type="submit" className="lodge-complaint-trigger-btn" style={{ padding: '0.8rem 2rem' }}>
                    Save Profile Changes
                  </button>
                </form>
              </div>
            </div>
          )}

        </main>
      </div>

      {/* 3. LODGE COMPLAINT MODAL */}
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
                <label>Specific Location (Leave blank for Warden Office)</label>
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

              <div className="modal-footer-actions">
                <button type="button" className="cancel-btn" onClick={() => setShowComplaintModal(false)}>Cancel</button>
                <button type="submit" className="submit-btn">File Ticket</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 4. NEW ANNOUNCEMENT MODAL */}
      {showAnnouncementModal && (
        <div className="modal-backdrop">
          <div className="modal-content-card">
            <div className="modal-header">
              <h3>Create Announcement</h3>
              <button className="close-modal-btn" onClick={() => {
                setAnnouncementForm({ title: '', text: '', attachment: '', attachmentName: '', isImportant: false });
                setShowAnnouncementModal(false);
              }}>×</button>
            </div>

            <form onSubmit={handleAddAnnouncement} className="modal-form-body">
              <div className="form-group">
                <label>Announcement Title *</label>
                <input
                  type="text"
                  placeholder="e.g. Water Supply Interruption"
                  required
                  value={announcementForm.title}
                  onChange={(e) => setAnnouncementForm({ ...announcementForm, title: e.target.value })}
                  className="modal-input-field"
                />
              </div>

              <div className="form-group">
                <label>Detailed Message / Text *</label>
                <textarea
                  rows="4"
                  placeholder="Enter detailed message for the announcement..."
                  required
                  value={announcementForm.text}
                  onChange={(e) => setAnnouncementForm({ ...announcementForm, text: e.target.value })}
                  className="modal-textarea-field"
                ></textarea>
              </div>

              <div className="form-group">
                <label>Attach Photo / File Document (Optional)</label>
                <input
                  type="file"
                  accept="image/*,application/pdf"
                  onChange={(e) => {
                    const file = e.target.files[0];
                    if (!file) return;
                    if (file.size > 2 * 1024 * 1024) {
                      alert("File size must be under 2MB.");
                      return;
                    }
                    const reader = new FileReader();
                    reader.onloadend = () => {
                      setAnnouncementForm(prev => ({
                        ...prev,
                        attachment: reader.result,
                        attachmentName: file.name
                      }));
                    };
                    reader.readAsDataURL(file);
                  }}
                  className="modal-input-field"
                  style={{ padding: '6px' }}
                />
                {announcementForm.attachmentName && (
                  <p style={{ fontSize: '0.8rem', color: '#10b981', marginTop: '4px' }}>
                    ✓ Selected: {announcementForm.attachmentName}
                  </p>
                )}
              </div>

              <div className="form-group" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <input
                  type="checkbox"
                  id="isImportant"
                  checked={announcementForm.isImportant}
                  onChange={(e) => setAnnouncementForm({ ...announcementForm, isImportant: e.target.checked })}
                  style={{ width: '16px', height: '16px', cursor: 'pointer' }}
                />
                <label htmlFor="isImportant" style={{ cursor: 'pointer', userSelect: 'none', margin: 0 }}>Mark as Important / Urgent</label>
              </div>

              <div className="modal-footer-actions">
                <button type="button" className="cancel-btn" onClick={() => {
                  setAnnouncementForm({ title: '', text: '', attachment: '', attachmentName: '', isImportant: false });
                  setShowAnnouncementModal(false);
                }}>Cancel</button>
                <button type="submit" className="submit-btn">Post Announcement</button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* 5. ADD / EDIT WORKER MODAL */}
      {showAddWorkerModal && (
        <div className="modal-backdrop">
          <div className="modal-content-card" style={{ maxWidth: '540px' }}>
            <div className="modal-header">
              <h3>{workerForm.id ? 'Edit Worker Details' : 'Add Maintenance Worker'}</h3>
              <button className="close-modal-btn" onClick={() => setShowAddWorkerModal(false)}>×</button>
            </div>

            <form onSubmit={handleSaveWorker} className="modal-form-body">
              {/* Full Name */}
              <div className="form-group">
                <label>Full Name *</label>
                <input
                  type="text"
                  placeholder="e.g. Ramesh Kumar"
                  required
                  value={workerForm.name}
                  onChange={(e) => setWorkerForm({ ...workerForm, name: e.target.value })}
                  className="modal-input-field"
                />
              </div>

              {/* Phone & Email */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label>Phone Number *</label>
                  <input
                    type="text"
                    placeholder="e.g. 9876543210"
                    required
                    value={workerForm.phone}
                    onChange={(e) => setWorkerForm({ ...workerForm, phone: e.target.value })}
                    className="modal-input-field"
                  />
                </div>

                <div className="form-group">
                  <label>Worker Email</label>
                  <input
                    type="email"
                    placeholder="workers@campuscare.com"
                    value={workerForm.email}
                    onChange={(e) => setWorkerForm({ ...workerForm, email: e.target.value })}
                    className="modal-input-field"
                  />
                </div>
              </div>

              {/* Category & Status */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label>Worker Category *</label>
                  <select
                    value={workerForm.category}
                    onChange={(e) => setWorkerForm({ ...workerForm, category: e.target.value })}
                    className="modal-select-field"
                  >
                    <option value="Electrician">Electrician</option>
                    <option value="Plumber">Plumber</option>
                    <option value="Carpenter">Carpenter</option>
                    <option value="Housekeeping">Housekeeping</option>
                    <option value="Network Technician">Network Technician</option>
                    <option value="Painter">Painter</option>
                    <option value="Mess Staff">Mess Staff</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Duty Status *</label>
                  <select
                    value={workerForm.status}
                    onChange={(e) => setWorkerForm({ ...workerForm, status: e.target.value })}
                    className="modal-select-field"
                  >
                    <option value="Active">Active (On Duty)</option>
                    <option value="Inactive">Inactive (Off Duty)</option>
                  </select>
                </div>
              </div>

              {/* Experience (Optional) */}
              <div className="form-group">
                <label>Experience (Optional)</label>
                <input
                  type="text"
                  placeholder="e.g. 5 Years in Industrial Electrical Repairs"
                  value={workerForm.experience}
                  onChange={(e) => setWorkerForm({ ...workerForm, experience: e.target.value })}
                  className="modal-input-field"
                />
              </div>

              {/* Address (Optional) */}
              <div className="form-group">
                <label>Address / Maintenance Station (Optional)</label>
                <input
                  type="text"
                  placeholder="e.g. Campus Staff Quarters, Block A"
                  value={workerForm.address}
                  onChange={(e) => setWorkerForm({ ...workerForm, address: e.target.value })}
                  className="modal-input-field"
                />
              </div>

              <div className="modal-footer-actions">
                <button type="button" className="cancel-btn" onClick={() => setShowAddWorkerModal(false)}>Cancel</button>
                <button type="submit" className="submit-btn">{workerForm.id ? 'Update Worker' : 'Save Worker'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 6. ASSIGN WORKER POPUP MODAL */}
      {showAssignWorkerModal && targetAssignComplaint && (
        <div className="modal-backdrop">
          <div className="modal-content-card" style={{ maxWidth: '580px' }}>
            <div className="modal-header">
              <div>
                <h3 style={{ margin: 0 }}>Assign Worker to Ticket</h3>
                <span style={{ fontSize: '0.8rem', color: '#64748b' }}>
                  Target: <strong>{targetAssignComplaint.title}</strong> ({targetAssignComplaint.category})
                </span>
              </div>
              <button className="close-modal-btn" onClick={() => {
                setShowAssignWorkerModal(false);
                setTargetAssignComplaint(null);
              }}>×</button>
            </div>

            <form onSubmit={handleAssignWorkerSubmit} className="modal-form-body">
              <div style={{ backgroundColor: '#eff6ff', border: '1px solid #bfdbfe', padding: '0.85rem 1rem', borderRadius: '10px', fontSize: '0.85rem', color: '#1e40af', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span><strong>Category Matching:</strong> Complaint Category is <strong>{targetAssignComplaint.category}</strong>. Suggested technicians matching this category are highlighted below.</span>
              </div>

              <div className="form-group">
                <label>Select Active Worker *</label>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', maxHeight: '240px', overflowY: 'auto', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '0.75rem' }}>
                  {workers.filter(w => w.status !== 'Inactive').length === 0 ? (
                    <div style={{ color: '#64748b', textAlign: 'center', padding: '1rem' }}>No active workers found in database.</div>
                  ) : (
                    workers
                      .filter(w => w.status !== 'Inactive')
                      .sort((a, b) => {
                        const targetCat = (targetAssignComplaint.category || '').toLowerCase();
                        const aMatches = (a.category || a.role || '').toLowerCase().includes(targetCat) || targetCat.includes((a.category || a.role || '').toLowerCase());
                        const bMatches = (b.category || b.role || '').toLowerCase().includes(targetCat) || targetCat.includes((b.category || b.role || '').toLowerCase());
                        return bMatches - aMatches;
                      })
                      .map(w => {
                        const targetCat = (targetAssignComplaint.category || '').toLowerCase();
                        const isSuggested = (w.category || w.role || '').toLowerCase().includes(targetCat) || targetCat.includes((w.category || w.role || '').toLowerCase());
                        const isSelected = selectedWorkerId === (w._id || w.id);
                        return (
                          <div
                            key={w._id || w.id}
                            onClick={() => setSelectedWorkerId(w._id || w.id)}
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'space-between',
                              padding: '0.75rem 1rem',
                              borderRadius: '10px',
                              border: isSelected ? '2px solid #2563eb' : '1px solid #e2e8f0',
                              backgroundColor: isSelected ? '#eff6ff' : isSuggested ? '#f0fdf4' : '#ffffff',
                              cursor: 'pointer',
                              transition: 'all 0.15s ease'
                            }}
                          >
                            <div>
                              <div style={{ fontWeight: 800, color: '#0f172a', fontSize: '0.92rem' }}>
                                {w.name} {isSuggested && <span style={{ fontSize: '0.72rem', backgroundColor: '#d1fae5', color: '#059669', padding: '0.15rem 0.5rem', borderRadius: '10px', marginLeft: '0.5rem', fontWeight: 800 }}>Suggested Match ★</span>}
                              </div>
                              <div style={{ fontSize: '0.8rem', color: '#64748b' }}>
                                {w.category || w.role} • Phone: {w.phone || 'N/A'} • Active Tasks: {w.tasks || 0}
                              </div>
                            </div>
                            <input
                              type="radio"
                              name="selectedWorker"
                              checked={isSelected}
                              onChange={() => setSelectedWorkerId(w._id || w.id)}
                              style={{ accentColor: '#2563eb', width: '18px', height: '18px', cursor: 'pointer' }}
                            />
                          </div>
                        );
                      })
                  )}
                </div>
              </div>

              <div className="modal-footer-actions">
                <button type="button" className="cancel-btn" onClick={() => {
                  setShowAssignWorkerModal(false);
                  setTargetAssignComplaint(null);
                }}>Cancel</button>
                <button type="submit" className="submit-btn" disabled={!selectedWorkerId}>Confirm Assignment</button>
              </div>
            </form>
          </div>
        </div>
      )}
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

      {/* FEEDBACK RESPONSES MODAL */}
      {showResponsesModal && selectedFeedbackRequest && (
        <div className="modal-backdrop">
          <div className="modal-content" style={{ maxWidth: '750px', width: '95%', borderRadius: '12px', padding: '2rem', backgroundColor: '#fff', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #e2e8f0', paddingBottom: '1rem', marginBottom: '1rem' }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '1.25rem', color: '#0f172a', fontWeight: 700 }}>{selectedFeedbackRequest.title}</h3>
                <span style={{ fontSize: '0.8rem', color: '#64748b' }}>Responses Summary & AI Categorization</span>
              </div>
              <button 
                onClick={() => {
                  setShowResponsesModal(false);
                  setSelectedFeedbackRequest(null);
                  setSelectedFeedbackResponses([]);
                  setAiAnalysis(null);
                  setAnalysisTab('raw');
                }}
                style={{ background: 'none', border: 'none', fontSize: '2rem', color: '#94a3b8', cursor: 'pointer', lineHeight: '0.5' }}
              >
                &times;
              </button>
            </div>

            <div style={{ display: 'flex', gap: '2rem', backgroundColor: '#f8fafc', padding: '1rem', borderRadius: '8px', marginBottom: '1.5rem', border: '1px solid #e2e8f0' }}>
              <div>
                <span style={{ display: 'block', fontSize: '0.75rem', color: '#64748b', fontWeight: 600, textTransform: 'uppercase' }}>Total Responses</span>
                <span style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0f172a' }}>{selectedFeedbackResponses.length}</span>
              </div>
              <div>
                <span style={{ display: 'block', fontSize: '0.75rem', color: '#64748b', fontWeight: 600, textTransform: 'uppercase' }}>Average Rating</span>
                <span style={{ fontSize: '1.5rem', fontWeight: 800, color: '#2563eb' }}>
                  {selectedFeedbackResponses.length === 0 
                    ? 'N/A' 
                    : (selectedFeedbackResponses.reduce((acc, curr) => acc + curr.rating, 0) / selectedFeedbackResponses.length).toFixed(1) + ' / 5.0'
                  }
                </span>
              </div>
            </div>

            {/* AI Control and Tab Bar */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.75rem', borderBottom: '1px solid #f1f5f9', paddingBottom: '0.75rem' }}>
              <div style={{ display: 'flex', gap: '0.25rem', backgroundColor: '#f1f5f9', padding: '0.25rem', borderRadius: '8px' }}>
                <button
                  onClick={() => setAnalysisTab('raw')}
                  style={{
                    padding: '0.45rem 1rem',
                    borderRadius: '6px',
                    border: 'none',
                    backgroundColor: analysisTab === 'raw' ? '#ffffff' : 'transparent',
                    color: analysisTab === 'raw' ? '#0f172a' : '#64748b',
                    fontSize: '0.82rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    boxShadow: analysisTab === 'raw' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none'
                  }}
                >
                  Raw Comments ({selectedFeedbackResponses.length})
                </button>
                <button
                  onClick={() => {
                    if (aiAnalysis) {
                      setAnalysisTab('ai');
                    } else {
                      handleAnalyzeFeedback(selectedFeedbackRequest._id || selectedFeedbackRequest.id);
                    }
                  }}
                  style={{
                    padding: '0.45rem 1rem',
                    borderRadius: '6px',
                    border: 'none',
                    backgroundColor: analysisTab === 'ai' ? '#ffffff' : 'transparent',
                    color: analysisTab === 'ai' ? '#2563eb' : '#64748b',
                    fontSize: '0.82rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    boxShadow: analysisTab === 'ai' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none'
                  }}
                >
                  ✨ AI Analysis
                </button>
              </div>

              <button
                onClick={() => handleAnalyzeFeedback(selectedFeedbackRequest._id || selectedFeedbackRequest.id)}
                disabled={isAnalyzing}
                style={{
                  backgroundColor: '#2563eb',
                  color: '#fff',
                  border: 'none',
                  padding: '0.5rem 1rem',
                  borderRadius: '6px',
                  fontSize: '0.8rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.35rem',
                  opacity: isAnalyzing ? 0.7 : 1
                }}
              >
                {isAnalyzing ? (
                  <>⏳ Analyzing...</>
                ) : (
                  <>✨ Categorize Feedback</>
                )}
              </button>
            </div>

            <div style={{ maxHeight: '48vh', overflowY: 'auto', textAlign: 'left', display: 'flex', flexDirection: 'column', gap: '0.75rem', paddingRight: '0.25rem' }}>
              {analysisTab === 'raw' ? (
                selectedFeedbackResponses.length === 0 ? (
                  <p style={{ color: '#64748b', fontSize: '0.9rem', textAlign: 'center', padding: '2rem 0' }}>No responses submitted yet.</p>
                ) : (
                  selectedFeedbackResponses.map((resp, idx) => (
                    <div key={resp._id || idx} style={{ padding: '0.85rem 1rem', border: '1px solid #e2e8f0', borderRadius: '8px', backgroundColor: '#fff' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
                        <div>
                          <span style={{ fontWeight: 700, fontSize: '0.9rem', color: '#1e293b' }}>{resp.studentName}</span>
                          <span style={{ fontSize: '0.75rem', color: '#64748b', marginLeft: '0.5rem' }}>({resp.studentEmail})</span>
                        </div>
                        <span style={{ color: '#eab308', fontWeight: 700, fontSize: '0.85rem' }}>
                          {'★'.repeat(resp.rating) + '☆'.repeat(5 - resp.rating)} ({resp.rating}/5)
                        </span>
                      </div>
                      <p style={{ margin: 0, fontSize: '0.85rem', color: '#475569', lineHeight: '1.4', fontStyle: 'italic' }}>
                        "{resp.comments || 'No comments left.'}"
                      </p>
                      <span style={{ display: 'block', fontSize: '0.7rem', color: '#94a3b8', marginTop: '0.25rem', textAlign: 'right' }}>
                        {new Date(resp.createdAt).toLocaleString()}
                      </span>
                    </div>
                  ))
                )
              ) : isAnalyzing ? (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '3rem 0', gap: '1rem' }}>
                  <div className="analyzing-spinner" style={{ width: '40px', height: '40px', border: '3px solid #f3f3f3', borderTop: '3px solid #2563eb', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
                  <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
                  <p style={{ color: '#475569', fontSize: '0.9rem', fontWeight: 600, margin: 0 }}>Gemini is clustering and categorizing student feedbacks...</p>
                </div>
              ) : aiAnalysis ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {/* Common Duplicate Feedback */}
                  <div>
                    <h4 style={{ margin: '0 0 0.5rem 0', fontSize: '0.95rem', fontWeight: 700, color: '#e11d48', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                      🚨 Common Repeating Feedback
                    </h4>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                      {(!aiAnalysis.common || aiAnalysis.common.length === 0) ? (
                        <p style={{ color: '#64748b', fontSize: '0.82rem', fontStyle: 'italic', margin: 0 }}>No matching clusters or repeat concerns found.</p>
                      ) : (
                        aiAnalysis.common.map((item, idx) => (
                          <div key={idx} style={{ padding: '0.85rem 1rem', border: '1px solid #fda4af', borderRadius: '8px', backgroundColor: '#fff5f5', borderLeft: '4px solid #f43f5e' }}>
                            <span style={{ fontWeight: 700, fontSize: '0.88rem', color: '#9f1239', display: 'block' }}>"{item.issue}"</span>
                            <span style={{ fontSize: '0.78rem', color: '#be123c', marginTop: '0.25rem', display: 'block' }}>
                              Affected by <strong>{item.count}</strong> students: {item.students?.join(', ') || 'Anonymous'}
                            </span>
                          </div>
                        ))
                      )}
                    </div>
                  </div>

                  <hr style={{ border: 'none', borderBottom: '1px solid #f1f5f9', margin: '0.25rem 0' }} />

                  {/* Positive vs Negative Splits */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.25rem' }}>
                    {/* Negative feedbacks list */}
                    <div>
                      <h4 style={{ margin: '0 0 0.5rem 0', fontSize: '0.92rem', fontWeight: 700, color: '#dc2626', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                        👎 Negative Sentiment ({aiAnalysis.negative?.length || 0})
                      </h4>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                        {(!aiAnalysis.negative || aiAnalysis.negative.length === 0) ? (
                          <p style={{ color: '#64748b', fontSize: '0.82rem', fontStyle: 'italic', margin: 0 }}>No negative remarks found.</p>
                        ) : (
                          aiAnalysis.negative.map((item, idx) => (
                            <div key={idx} style={{ padding: '0.65rem 0.85rem', border: '1px solid #fecaca', borderRadius: '8px', backgroundColor: '#fef2f2' }}>
                              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', color: '#991b1b', fontWeight: 700, marginBottom: '0.2rem' }}>
                                <span>{item.studentName}</span>
                                <span>{item.rating}★</span>
                              </div>
                              <p style={{ margin: 0, fontSize: '0.8rem', color: '#7f1d1d', fontStyle: 'italic' }}>"{item.comments}"</p>
                            </div>
                          ))
                        )}
                      </div>
                    </div>

                    {/* Positive feedbacks list */}
                    <div>
                      <h4 style={{ margin: '0 0 0.5rem 0', fontSize: '0.92rem', fontWeight: 700, color: '#16a34a', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                        👍 Positive Sentiment ({aiAnalysis.positive?.length || 0})
                      </h4>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                        {(!aiAnalysis.positive || aiAnalysis.positive.length === 0) ? (
                          <p style={{ color: '#64748b', fontSize: '0.82rem', fontStyle: 'italic', margin: 0 }}>No positive remarks found.</p>
                        ) : (
                          aiAnalysis.positive.map((item, idx) => (
                            <div key={idx} style={{ padding: '0.65rem 0.85rem', border: '1px solid #bbf7d0', borderRadius: '8px', backgroundColor: '#f0fdf4' }}>
                              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', color: '#166534', fontWeight: 700, marginBottom: '0.2rem' }}>
                                <span>{item.studentName}</span>
                                <span>{item.rating}★</span>
                              </div>
                              <p style={{ margin: 0, fontSize: '0.8rem', color: '#14532d', fontStyle: 'italic' }}>"{item.comments}"</p>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div style={{ textAlign: 'center', padding: '2rem 0', color: '#64748b' }}>
                  <p style={{ fontSize: '0.9rem', margin: '0 0 0.75rem' }}>AI feedback categorization has not been run yet.</p>
                  <SpecularButton onClick={() => handleAnalyzeFeedback(selectedFeedbackRequest._id || selectedFeedbackRequest.id)}>
                    ✨ Categorize Feedback Now
                  </SpecularButton>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* COMPLAINT DETAILS VIEW MODAL */}
      {selectedComplaint && (
        <div className="modal-backdrop" style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(15, 23, 42, 0.45)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 999 }}>
          <div className="modal-content" style={{ maxWidth: '650px', width: '90%', borderRadius: '16px', backgroundColor: '#fff', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.15)', overflow: 'hidden', border: '1px solid rgba(226, 232, 240, 0.8)' }}>
            {/* Header Banner */}
            <div style={{ background: 'linear-gradient(135deg, #092147 0%, #1d4ed8 100%)', padding: '1.5rem 2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: '#fff' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.1em', color: '#93c5fd', fontWeight: 600 }}>Warden Action Panel</span>
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

              {/* WORKER ASSIGNMENT CONTROL & CARD */}
              <div style={{ backgroundColor: '#f0f9ff', border: '1px solid #bae6fd', padding: '1.25rem', borderRadius: '14px', marginBottom: '1.75rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                  <h5 style={{ margin: 0, fontSize: '0.82rem', color: '#0369a1', textTransform: 'uppercase', letterSpacing: '0.07em', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M14.7 6.3a1 1 0 000 1.4l1.6 1.6a1 1 0 001.4 0l3.77-3.77a6 6 0 01-7.94 7.94l-6.91 6.91a2.12 2.12 0 01-3-3l6.91-6.91a6 6 0 017.94-7.94l-3.76 3.76z" />
                    </svg>
                    Assigned Maintenance Worker
                  </h5>
                  <button
                    onClick={() => {
                      setTargetAssignComplaint(selectedComplaint);
                      setSelectedComplaint(null);
                      setShowAssignWorkerModal(true);
                    }}
                    style={{
                      padding: '0.45rem 1rem',
                      borderRadius: '8px',
                      border: 'none',
                      backgroundColor: '#2563eb',
                      color: '#ffffff',
                      fontSize: '0.8rem',
                      fontWeight: 800,
                      cursor: 'pointer',
                      boxShadow: '0 2px 6px rgba(37, 99, 235, 0.25)',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.4rem'
                    }}
                  >
                    <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                    {selectedComplaint.assignedWorkerName ? 'Reassign Worker' : 'Assign Worker'}
                  </button>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.75rem' }}>
                  <div>
                    <span style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600 }}>WORKER NAME</span>
                    <div style={{ fontSize: '0.95rem', fontWeight: 800, color: '#0f172a' }}>
                      {selectedComplaint.assignedWorkerName || 'Not Assigned Yet'}
                    </div>
                  </div>
                  <div>
                    <span style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600 }}>WORKER CATEGORY</span>
                    <div style={{ fontSize: '0.95rem', fontWeight: 800, color: '#0f172a' }}>
                      {selectedComplaint.assignedWorkerCategory || selectedComplaint.category}
                    </div>
                  </div>
                  <div>
                    <span style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600 }}>WORKER STATUS</span>
                    <div style={{ fontSize: '0.95rem', fontWeight: 800, color: '#0284c7' }}>
                      {selectedComplaint.workerStatus || selectedComplaint.status || 'Pending Assignment'}
                    </div>
                  </div>
                </div>

                {/* WORKER COMPLETION NOTES & PROOF IF COMPLETED */}
                {selectedComplaint.workerNotes && (
                  <div style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid #bae6fd' }}>
                    <div style={{ fontSize: '0.78rem', fontWeight: 800, color: '#047857', marginBottom: '0.25rem' }}>WORKER COMPLETION REPORT & PROOF:</div>
                    <div style={{ fontSize: '0.88rem', color: '#065f46', fontStyle: 'italic' }}>"{selectedComplaint.workerNotes}"</div>
                    {selectedComplaint.workerProofImage && (
                      <div style={{ marginTop: '0.5rem' }}>
                        <img src={selectedComplaint.workerProofImage} alt="Worker Proof" style={{ maxHeight: '140px', borderRadius: '8px', border: '1px solid #6ee7b7' }} />
                      </div>
                    )}
                  </div>
                )}
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

              {/* Student Details Card */}
              <div style={{ marginBottom: '1.75rem', padding: '1.25rem', backgroundColor: '#f8fafc', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                <h5 style={{ margin: '0 0 0.75rem', fontSize: '0.8rem', color: '#475569', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.07em' }}>Filer Student Details</h5>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
                  {selectedComplaint.studentPhoto ? (
                    <img 
                      src={selectedComplaint.studentPhoto} 
                      alt="Student" 
                      style={{ width: '56px', height: '56px', borderRadius: '50%', objectFit: 'cover', border: '2.5px solid #2563eb' }} 
                    />
                  ) : (
                    <div style={{ width: '56px', height: '56px', borderRadius: '50%', backgroundColor: '#dbeafe', color: '#1e40af', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '1.2rem', border: '2.5px solid #2563eb' }}>
                      {selectedComplaint.studentName?.split(' ').map(n=>n[0]).join('') || 'S'}
                    </div>
                  )}
                  <div>
                    <p style={{ margin: 0, fontWeight: 800, color: '#0f172a', fontSize: '1rem' }}>
                      {selectedComplaint.studentName}
                    </p>
                    <p style={{ margin: '4px 0 0', color: '#475569', fontSize: '0.85rem' }}>
                      Roll No: <strong style={{ color: '#0f172a' }}>{selectedComplaint.studentRoll}</strong> • Room: <strong style={{ color: '#0f172a' }}>{selectedComplaint.studentBlock} - {selectedComplaint.studentRoom}</strong>
                    </p>
                    <p style={{ margin: '4px 0 0', color: '#475569', fontSize: '0.85rem' }}>
                      Phone No: <strong style={{ color: '#0f172a' }}>{selectedComplaint.studentPhone}</strong>
                    </p>
                  </div>
                </div>
              </div>

              {/* Attached Proof */}
              {selectedComplaint.proof && (
                <div style={{ marginBottom: '1.75rem' }}>
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

              {/* Status Update Control */}
              <div style={{ marginTop: '1.5rem', paddingTop: '1.25rem', borderTop: '2px dashed #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
                <span style={{ fontSize: '0.95rem', color: '#0f172a', fontWeight: 800 }}>Update Complaint Status:</span>
                <select
                  value={selectedComplaint.status}
                  onChange={(e) => {
                    handleStatusUpdate(selectedComplaint.id, e.target.value);
                    setSelectedComplaint(prev => ({ ...prev, status: e.target.value }));
                  }}
                  className="modal-select-field"
                  style={{ width: 'auto', padding: '0.5rem 1.5rem 0.5rem 1rem', fontSize: '0.9rem', margin: 0, height: 'auto', borderRadius: '8px', border: '2px solid #2563eb', color: '#1e40af', fontWeight: 700, outline: 'none', backgroundColor: '#f8fafc', cursor: 'pointer' }}
                >
                  <option value="Open">Open</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Resolved">Resolved</option>
                  <option value="High Priority">High Priority</option>
                </select>
              </div>

            </div>
          </div>
        </div>
      )}

      {/* 6. MANAGE EVENT BANNER MODAL */}
      {showEventBannerModal && (
        <div className="modal-backdrop">
          <div className="modal-content-card" style={{ maxWidth: '500px', backgroundColor: '#fff', borderRadius: '12px', padding: '2rem', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)' }}>
            <div className="modal-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #e2e8f0', paddingBottom: '1rem', marginBottom: '1.25rem' }}>
              <h3 style={{ margin: 0 }}>Manage Hostel Event Banner</h3>
              <button className="close-modal-btn" onClick={() => setShowEventBannerModal(false)} style={{ background: 'none', border: 'none', fontSize: '1.75rem', cursor: 'pointer', color: '#94a3b8' }}>&times;</button>
            </div>

            <form onSubmit={handleUpdateEventBanner} className="modal-form-body" style={{ textAlign: 'left' }}>
              <div className="form-group" style={{ marginBottom: '1.25rem' }}>
                <label style={{ display: 'block', marginBottom: '0.35rem', fontWeight: 600, color: '#475569', fontSize: '0.85rem' }}>Event / Banner Title *</label>
                <input
                  type="text"
                  placeholder="e.g. Hostel Day 2026 Celebration"
                  required
                  value={eventBanner.title}
                  onChange={(e) => setEventBanner({ ...eventBanner, title: e.target.value })}
                  className="modal-input-field"
                  style={{ width: '100%', padding: '0.6rem 0.75rem', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                />
              </div>

              <div className="form-group" style={{ marginBottom: '1.25rem' }}>
                <label style={{ display: 'block', marginBottom: '0.35rem', fontWeight: 600, color: '#475569', fontSize: '0.85rem' }}>Description / Details</label>
                <textarea
                  rows="3"
                  placeholder="Enter details about the event, rules, instructions..."
                  value={eventBanner.description}
                  onChange={(e) => setEventBanner({ ...eventBanner, description: e.target.value })}
                  className="modal-textarea-field"
                  style={{ width: '100%', padding: '0.6rem 0.75rem', borderRadius: '6px', border: '1px solid #cbd5e1', fontFamily: 'inherit' }}
                ></textarea>
              </div>

              <div className="form-group" style={{ marginBottom: '1.25rem' }}>
                <label style={{ display: 'block', marginBottom: '0.35rem', fontWeight: 600, color: '#475569', fontSize: '0.85rem' }}>Event Date / Schedule</label>
                <input
                  type="text"
                  placeholder="e.g. Friday, 28th July at 6:00 PM"
                  value={eventBanner.date}
                  onChange={(e) => setEventBanner({ ...eventBanner, date: e.target.value })}
                  className="modal-input-field"
                  style={{ width: '100%', padding: '0.6rem 0.75rem', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                />
              </div>

              <div className="form-group" style={{ marginBottom: '1.25rem' }}>
                <label style={{ display: 'block', marginBottom: '0.35rem', fontWeight: 600, color: '#475569', fontSize: '0.85rem' }}>Upload Banner Image / Photo (Optional)</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files[0];
                    if (!file) return;
                    if (file.size > 2 * 1024 * 1024) {
                      alert("File size must be under 2MB.");
                      return;
                    }
                    const reader = new FileReader();
                    reader.onloadend = () => {
                      setEventBanner(prev => ({
                        ...prev,
                        bannerImage: reader.result
                      }));
                    };
                    reader.readAsDataURL(file);
                  }}
                  className="modal-input-field"
                  style={{ padding: '6px', width: '100%', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                />
                {eventBanner.bannerImage && (
                  <div style={{ marginTop: '0.5rem', position: 'relative', width: '100px', height: '60px', borderRadius: '4px', overflow: 'hidden', border: '1px solid #cbd5e1' }}>
                    <img src={eventBanner.bannerImage} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  </div>
                )}
              </div>

              <div className="form-group" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem' }}>
                <input
                  type="checkbox"
                  id="bannerActive"
                  checked={eventBanner.active}
                  onChange={(e) => setEventBanner({ ...eventBanner, active: e.target.checked })}
                  style={{ width: '16px', height: '16px', cursor: 'pointer' }}
                />
                <label htmlFor="bannerActive" style={{ cursor: 'pointer', userSelect: 'none', margin: 0, fontWeight: 500, color: '#475569', fontSize: '0.85rem' }}>Show banner on student dashboard (Active)</label>
              </div>

              <div className="modal-footer-actions" style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
                <button type="button" className="cancel-btn" onClick={() => setShowEventBannerModal(false)} style={{ padding: '0.5rem 1rem', borderRadius: '6px', border: '1px solid #cbd5e1', background: '#fff', cursor: 'pointer' }}>Cancel</button>
                <button type="submit" className="submit-btn" style={{ padding: '0.5rem 1rem', borderRadius: '6px', border: 'none', background: '#10b981', color: '#fff', cursor: 'pointer', fontWeight: 600 }}>Update Banner</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DIRECT CHAT MODAL OVERLAY WITH BLOCK WARDEN */}
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
                  const isSelf = m.sender === 'headwarden' || m.sender === user?.role;
                  return (
                    <div key={m._id || idx} style={{ alignSelf: isSelf ? 'flex-end' : 'flex-start', maxWidth: '80%' }}>
                      <div style={{
                        padding: '0.75rem 1rem',
                        borderRadius: isSelf ? '12px 12px 2px 12px' : '12px 12px 12px 2px',
                        backgroundColor: isSelf ? '#0f172a' : '#ffffff',
                        color: isSelf ? '#ffffff' : '#0f172a',
                        boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
                        border: isSelf ? 'none' : '1px solid #e2e8f0',
                        fontSize: '0.9rem'
                      }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.25rem', gap: '0.75rem' }}>
                          <span style={{ fontSize: '0.75rem', fontWeight: 700, color: isSelf ? '#38bdf8' : '#2563eb' }}>
                            {isSelf ? 'Head Warden' : selectedWardenChat.name}
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
            <form onSubmit={handleSendWardenDirectMessage} style={{ display: 'flex', gap: '0.5rem' }}>
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

    </div>
  );
};

export default WardenDashboard;
