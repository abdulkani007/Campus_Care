import React, { useState, useEffect, useRef } from 'react';
import './IncidentGroupsChat.css';
import { useSocket } from '../context/SocketContext';

export default function IncidentGroupsChat({ user, hostelType }) {
  const [groups, setGroups] = useState([]);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const [currentMobileView, setCurrentMobileView] = useState('list'); // 'list' or 'chat'
  
  // AI Summary States
  const [summaryModalOpen, setSummaryModalOpen] = useState(false);
  const [summaryText, setSummaryText] = useState('');
  const [summaryMetadata, setSummaryMetadata] = useState(null);
  const [isSummarizing, setIsSummarizing] = useState(false);

  const socketCtx = useSocket();
  const socket = socketCtx?.socket;
  const joinRoom = socketCtx?.joinRoom;
  const leaveRoom = socketCtx?.leaveRoom;
  const startTyping = socketCtx?.startTyping;
  const stopTyping = socketCtx?.stopTyping;
  const sendRealtimeMessage = socketCtx?.sendRealtimeMessage;
  const typingState = socketCtx?.typingState || {};
  const isUserOnline = socketCtx?.isUserOnline;

  const currentRoomKey = selectedGroup ? `group_${selectedGroup.id}` : null;
  const activeTypingUser = currentRoomKey ? typingState[currentRoomKey] : null;

  // Real-time group room joining & message listener
  useEffect(() => {
    if (!selectedGroup) return;

    const roomName = `group_${selectedGroup.id}`;
    if (joinRoom) joinRoom(roomName);

    const handleNewMessage = (msg) => {
      if (msg && msg.blockGroup === selectedGroup.id) {
        setMessages(prev => {
          const exists = prev.some(m => (m._id && m._id === msg._id) || (m.id && m.id === msg.id));
          if (exists) return prev;
          return [...prev, msg];
        });
        setTimeout(scrollToBottom, 50);
      }
    };

    if (socket) {
      socket.on('receive_group_message', handleNewMessage);
    }

    return () => {
      if (leaveRoom) leaveRoom(roomName);
      if (socket) socket.off('receive_group_message', handleNewMessage);
    };
  }, [selectedGroup, socket]);

  // Emoji Popover State
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

  // Chat lock status notification banner states
  const [showUnlockBanner, setShowUnlockBanner] = useState(false);
  const prevLockStateRef = useRef(true);

  // Real-time group lock state listener
  useEffect(() => {
    if (!socket) return;

    const handleLockStateChange = ({ groupId, chatEnabled }) => {
      setGroups(prev => prev.map(g => g.id === groupId ? { ...g, chatEnabled } : g));
      setSelectedGroup(prev => prev && prev.id === groupId ? { ...prev, chatEnabled } : prev);
    };

    socket.on('chat_lock_state_changed', handleLockStateChange);

    return () => {
      socket.off('chat_lock_state_changed', handleLockStateChange);
    };
  }, [socket]);

  // Manage unlocked transient banner timeout (4 seconds)
  useEffect(() => {
    if (!selectedGroup) {
      setShowUnlockBanner(false);
      return;
    }
    const currentEnabled = selectedGroup.chatEnabled !== false;
    const prevEnabled = prevLockStateRef.current;

    if (currentEnabled && !prevEnabled) {
      setShowUnlockBanner(true);
      const timer = setTimeout(() => {
        setShowUnlockBanner(false);
      }, 4000);
      return () => clearTimeout(timer);
    }

    prevLockStateRef.current = currentEnabled;
  }, [selectedGroup?.chatEnabled]);

  const handleToggleChatLock = async (chatEnabled) => {
    if (!selectedGroup) return;
    try {
      const res = await fetch(`/api/incident-groups/${selectedGroup.id}/lock`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chatEnabled,
          userRole,
          userEmail: user?.email
        })
      });
      if (res.ok) {
        const updatedGroup = await res.json();
        setGroups(prev => prev.map(g => g.id === selectedGroup.id ? { ...g, chatEnabled: updatedGroup.chatEnabled } : g));
        setSelectedGroup(prev => prev && prev.id === selectedGroup.id ? { ...prev, chatEnabled: updatedGroup.chatEnabled } : prev);
      } else {
        alert('Failed to update group lock state.');
      }
    } catch (err) {
      console.error('Error toggling lock:', err);
      alert('Failed to update group lock state.');
    }
  };

  const messagesEndRef = useRef(null);
  const pollIntervalRef = useRef(null);

  // Detect user details
  const userRole = user?.role || 
    (user?.email?.toLowerCase().includes('management') ? 'management' : 
     (user?.email?.toLowerCase().includes('warden') ? 'warden' : 'student'));
  const userBlock = user?.block || '';
  const canSearch = ['warden', 'headwarden', 'management'].includes(userRole);

  const commonEmojis = [
    '💧', '⚡', '📶', '🧹', '🛗', '🔧', '🍎', '🚨', 
    '😀', '😂', '👍', '👎', '❤️', '🙏', '🔥', '👏'
  ];

  // Monitor screen size
  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth <= 768;
      setIsMobile(mobile);
      if (!mobile) {
        setCurrentMobileView('list');
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Fetch groups on mount or when user/hostelType changes
  useEffect(() => {
    setSelectedGroup(null);
    setGroups([]);
    fetchGroups();
  }, [user, hostelType]);

  // Handle polling when group changes
  useEffect(() => {
    if (selectedGroup) {
      fetchMessages();
      scrollToBottom();
    } else {
      setMessages([]);
    }
  }, [selectedGroup]);

  // Fetch messages if search query changes
  useEffect(() => {
    if (selectedGroup) {
      fetchMessages();
    }
  }, [searchQuery]);

  const fetchGroups = async () => {
    try {
      const headers = {};
      if (hostelType) {
        headers['X-Hostel-Type'] = hostelType;
      }
      const res = await fetch(`/api/incident-groups?userEmail=${encodeURIComponent(user?.email || '')}&userRole=${encodeURIComponent(userRole)}&userBlock=${encodeURIComponent(userBlock)}`, { headers });
      if (res.ok) {
        const data = await res.json();
        setGroups(data);
        if (data.length > 0 && !selectedGroup && !isMobile) {
          setSelectedGroup(data[0]);
        }
      }
    } catch (err) {
      console.error('Failed to fetch groups', err);
    }
  };

  const fetchMessages = async (silent = false) => {
    if (!selectedGroup) return;
    try {
      const searchParam = searchQuery ? `&search=${encodeURIComponent(searchQuery)}` : '';
      const res = await fetch(`/api/incident-groups/messages?blockGroup=${selectedGroup.id}${searchParam}`);
      if (res.ok) {
        const data = await res.json();
        setMessages(data);
        if (!silent) {
          setTimeout(scrollToBottom, 50);
        }
      }
    } catch (err) {
      console.error('Failed to fetch messages', err);
    }
  };

  const handleSendMessage = async (e) => {
    if (e) e.preventDefault();
    if (!newMessage.trim() || !selectedGroup) return;

    if (stopTyping && selectedGroup) {
      stopTyping(`group_${selectedGroup.id}`, null);
    }

    try {
      const textToSend = newMessage.trim();
      setNewMessage('');
      setShowEmojiPicker(false);

      const payload = {
        blockGroup: selectedGroup.id,
        senderName: user?.name || 'Anonymous User',
        senderEmail: user?.email || '',
        senderRole: userRole,
        senderRoomNo: userRole === 'student' ? user?.roomNo : undefined,
        text: textToSend
      };

      const res = await fetch('/api/incident-groups/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        const createdMsg = await res.json();
        if (sendRealtimeMessage) {
          sendRealtimeMessage(createdMsg);
        }
        setMessages(prev => {
          const exists = prev.some(m => (m._id && m._id === createdMsg._id) || (m.id && m.id === createdMsg.id));
          if (exists) return prev;
          return [...prev, createdMsg];
        });
        setTimeout(scrollToBottom, 50);
      }
    } catch (err) {
      console.error('Failed to send message', err);
    }
  };

  const handleSummarize = async () => {
    if (!selectedGroup) return;
    setIsSummarizing(true);
    setSummaryModalOpen(true);
    try {
      const res = await fetch('/api/incident-groups/summarize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ blockGroup: selectedGroup.id })
      });

      if (res.ok) {
        const data = await res.json();
        setSummaryText(data.summary);
        setSummaryMetadata(data);
      } else {
        setSummaryText('Failed to generate summary. Please try again.');
      }
    } catch (err) {
      console.error('Summarization failed', err);
      setSummaryText('Error calling summarization endpoint.');
    } finally {
      setIsSummarizing(false);
    }
  };

  const handleClearChat = async () => {
    if (!selectedGroup) return;
    if (!window.confirm(`Are you sure you want to clear all messages in ${selectedGroup.name}?`)) {
      return;
    }
    try {
      const res = await fetch(`/api/incident-groups/messages/clear?blockGroup=${selectedGroup.id}`, {
        method: 'DELETE'
      });
      if (res.ok) {
        setMessages([]);
      } else {
        alert('Failed to clear chat.');
      }
    } catch (err) {
      console.error('Error clearing chat:', err);
      alert('Failed to clear chat.');
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const getAvatarInitials = (name) => {
    if (!name) return 'U';
    return name.trim().split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
  };

  const getAvatarColor = (name) => {
    if (!name) return '#2563eb';
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    const colors = ['#2563eb', '#7c3aed', '#db2777', '#ea580c', '#16a34a', '#0d9488', '#d97706'];
    const index = Math.abs(hash) % colors.length;
    return colors[index];
  };

  const handleEmojiClick = (emoji) => {
    setNewMessage(prev => prev + emoji);
  };

  const handleGroupSelect = (group) => {
    setSelectedGroup(group);
    if (isMobile) {
      setCurrentMobileView('chat');
    }
  };

  const formatTime = (timestamp) => {
    if (!timestamp) return '';
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="incident-groups-container">
      {/* 1. LEFT COLUMN: GROUP LIST */}
      {(!isMobile || currentMobileView === 'list') && (
        <div className="groups-sidebar-panel">
          <div className="groups-sidebar-header">
            <h3>📢 Discussion Groups</h3>
            <span className="groups-count-badge">{groups.length} Groups</span>
          </div>

          <div className="groups-list-area">
            {groups.length === 0 ? (
              <div className="empty-groups-state">
                <p>No discussion groups available.</p>
              </div>
            ) : (
              groups.map((group) => {
                const isSelected = selectedGroup?.id === group.id;
                return (
                  <div
                    key={group.id}
                    className={`group-item-card ${isSelected ? 'active' : ''}`}
                    onClick={() => handleGroupSelect(group)}
                  >
                    <div className="group-avatar" style={{ backgroundColor: getAvatarColor(group.name) }}>
                      <span style={{ fontSize: group.id.replace('boys_', '').replace('girls_', '').length > 2 ? '0.82rem' : '1.1rem' }}>
                        {group.id.replace('boys_', '').replace('girls_', '').toUpperCase()}
                      </span>
                    </div>
                    <div className="group-item-details">
                      <div className="group-item-row">
                        <span className="group-item-name">{group.name}</span>
                        {group.lastMessage && (
                          <span className="group-item-time">
                            {formatTime(group.lastMessage.timestamp)}
                          </span>
                        )}
                      </div>
                      <div className="group-item-row">
                        <span className="group-item-sub">
                          {group.lastMessage 
                            ? `${group.lastMessage.senderName}: ${group.lastMessage.text}`
                            : group.description}
                        </span>
                        <span className="group-member-count">
                          👥 {group.memberCount || 0}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* 2. RIGHT COLUMN: CHAT WINDOW */}
      {(!isMobile || currentMobileView === 'chat') && (
        <div className="chat-window-panel">
          {selectedGroup ? (
            <>
              {/* CHAT HEADER */}
              <div className="chat-header-bar">
                {isMobile && (
                  <button 
                    className="chat-back-btn" 
                    onClick={() => setCurrentMobileView('list')}
                  >
                    ← Back
                  </button>
                )}

                <div 
                  className="chat-header-avatar" 
                  style={{ backgroundColor: getAvatarColor(selectedGroup.name) }}
                >
                  <span style={{ fontSize: selectedGroup.id.replace('boys_', '').replace('girls_', '').length > 2 ? '0.78rem' : '1rem', fontWeight: 700 }}>
                    {selectedGroup.id.replace('boys_', '').replace('girls_', '').toUpperCase()}
                  </span>
                </div>

                <div className="chat-header-info">
                  <h4>{selectedGroup.name}</h4>
                  <p>{selectedGroup.memberCount || 0} members</p>
                </div>

                <div className="chat-header-actions">
                  {canSearch && (
                    <div className="chat-search-input-wrapper">
                      <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                      <input 
                        type="text" 
                        placeholder="Search messages..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                      />
                      {searchQuery && (
                        <button className="clear-search-btn" onClick={() => setSearchQuery('')}>×</button>
                      )}
                    </div>
                  )}

                  {(userRole === 'warden' || userRole === 'headwarden') && (
                    <div className="chat-lock-toggle-wrapper" title="Toggle student messaging lock status for this group">
                      <span className="toggle-label">Students Can Chat</span>
                      <label className="ios-toggle-switch">
                        <input 
                          type="checkbox" 
                          checked={selectedGroup.chatEnabled !== false}
                          onChange={(e) => handleToggleChatLock(e.target.checked)}
                        />
                        <span className="slider round"></span>
                      </label>
                      <span className={`toggle-status-text ${selectedGroup.chatEnabled !== false ? 'on' : 'off'}`}>
                        {selectedGroup.chatEnabled !== false ? 'ON' : 'OFF'}
                      </span>
                    </div>
                  )}

                  <button className="ai-summarize-btn" onClick={handleSummarize}>
                    <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24" style={{ flexShrink: 0 }}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 21L8.188 15.904L3 15L8.188 14.096L9 9L9.813 14.096L15 15L9.813 15.904ZM19.071 7.071L18.5 10.5L17.929 7.071L14.5 6.5L17.929 5.929L18.5 2.5L19.071 5.929L22.5 6.5L19.071 7.071ZM19.071 18.571L18.5 22L17.929 18.571L14.5 18L17.929 17.429L18.5 14L19.071 17.429L22.5 18L19.071 18.571Z" />
                    </svg>
                    <span>Summarize</span>
                  </button>

                  <button className="clear-chat-btn" onClick={handleClearChat} title="Clear all messages in this group">
                    <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24" style={{ flexShrink: 0 }}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                    <span>Clear Chat</span>
                  </button>
                </div>
              </div>

              {/* CHAT MESSAGES CONTAINER */}
              <div className="chat-messages-area">
                {messages.length === 0 ? (
                  <div className="empty-chat-state">
                    <div className="empty-chat-bubble">
                      <span style={{ fontSize: '2rem' }}>💬</span>
                      <p>Welcome to the {selectedGroup.name}!</p>
                      <p className="subtext">Discuss maintenance issues, food quality, or internet troubles here.</p>
                    </div>
                  </div>
                ) : (
                  messages.map((msg) => {
                    const isOwnMessage = msg.senderEmail === user?.email;
                    const isWarden = ['warden', 'headwarden'].includes(msg.senderRole);
                    const isMgt = msg.senderRole === 'management';

                    return (
                      <div 
                        key={msg._id || msg.id} 
                        className={`message-bubble-wrapper ${isOwnMessage ? 'own-message' : ''}`}
                      >
                        {!isOwnMessage && (
                          <div 
                            className="message-avatar"
                            style={{ backgroundColor: getAvatarColor(msg.senderName) }}
                            title={msg.senderName}
                          >
                            {getAvatarInitials(msg.senderName)}
                          </div>
                        )}

                        <div className="message-bubble-content">
                          {!isOwnMessage && (
                            <div className="message-sender-header">
                              <span className="sender-name">{msg.senderName}</span>
                              {msg.senderRoomNo && (
                                <span className="sender-room"> (Room {msg.senderRoomNo})</span>
                              )}
                              {isWarden && <span className="sender-role-tag warden-tag">Warden</span>}
                              {isMgt && <span className="sender-role-tag mgt-tag">Management</span>}
                            </div>
                          )}
                          <p className="message-text">{msg.text}</p>
                          <span className="message-time-stamp">
                            {formatTime(msg.timestamp)}
                          </span>
                        </div>
                      </div>
                    );
                  })
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Lock warning persistent banner or transient unlock confirmation banner */}
              {selectedGroup.chatEnabled === false ? (
                <div className="chat-lock-banner locked-banner">
                  <span className="banner-icon">🔒</span>
                  <span className="banner-text">Student messaging has been temporarily disabled by your Warden. You can still view all previous messages.</span>
                </div>
              ) : showUnlockBanner ? (
                <div className="chat-lock-banner unlocked-banner">
                  <span className="banner-icon">✅</span>
                  <span className="banner-text">Student messaging has been enabled.</span>
                </div>
              ) : null}

              {/* CHAT INPUT AREA (Hidden for Management Read-only view) */}
              {userRole !== 'management' && (
                <form className="chat-input-bar" onSubmit={handleSendMessage}>
                  <div className="emoji-picker-container">
                    <button 
                      type="button" 
                      className="emoji-toggle-btn"
                      onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                      disabled={selectedGroup.chatEnabled === false && !['warden', 'headwarden'].includes(userRole)}
                    >
                      😊
                    </button>
                    {showEmojiPicker && (
                      <div className="emoji-popover-menu">
                        {commonEmojis.map((emoji) => (
                          <button
                            key={emoji}
                            type="button"
                            className="emoji-item-btn"
                            onClick={() => handleEmojiClick(emoji)}
                          >
                            {emoji}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  {activeTypingUser && (
                    <div style={{ padding: '0.4rem 1.25rem', backgroundColor: '#eff6ff', borderTop: '1px solid #dbeafe', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <span style={{ fontSize: '0.82rem', color: '#0F4FA8', fontWeight: 600 }}>
                        ✍️ {activeTypingUser} is typing...
                      </span>
                    </div>
                  )}

                  {selectedGroup.chatEnabled === false && !['warden', 'headwarden'].includes(userRole) ? (
                    <div className="locked-input-replacement">
                      <span className="lock-icon">🔒</span>
                      <span>This group has been temporarily locked by the Warden.</span>
                    </div>
                  ) : (
                    <input 
                      type="text" 
                      placeholder="Type a message to discuss hostel problems..."
                      value={newMessage}
                      onChange={(e) => {
                        setNewMessage(e.target.value);
                        if (selectedGroup && startTyping) {
                          startTyping(`group_${selectedGroup.id}`, null, user?.name || 'User');
                        }
                      }}
                      maxLength={1000}
                    />
                  )}

                  <button 
                    type="submit" 
                    className="send-message-btn" 
                    disabled={(selectedGroup.chatEnabled === false && !['warden', 'headwarden'].includes(userRole)) || !newMessage.trim()}
                  >
                    Send
                  </button>
                </form>
              )}
            </>
          ) : (
            <div className="no-selected-group-state">
              <div className="card-illustration">
                <span>📢</span>
                <h3>Incident Discussion Groups</h3>
                <p>Select a block discussion group from the left side panel to start discussing hostel topics.</p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* 3. AI SUMMARY DIALOG MODAL */}
      {summaryModalOpen && (
        <div className="summary-modal-overlay" onClick={() => setSummaryModalOpen(false)}>
          <div className="summary-modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>✨ AI Summary - {selectedGroup?.name}</h3>
              <button className="close-modal-btn" onClick={() => setSummaryModalOpen(false)}>×</button>
            </div>
            
            <div className="modal-body">
              {isSummarizing ? (
                <div className="summary-loading-state">
                  <div className="loading-spinner"></div>
                  <p>Analyzing conversation history...</p>
                  <p className="sub">This uses Groq Llama-3 model processing.</p>
                </div>
              ) : (
                <div className="summary-results-panel">
                  <div className="summary-stats-pills">
                    <div className="stat-pill">
                      <span className="lbl">Messages Analyzed</span>
                      <span className="val">{summaryMetadata?.messageCount || 0}</span>
                    </div>
                    <div className="stat-pill">
                      <span className="lbl">Active Students</span>
                      <span className="val">{summaryMetadata?.activeStudentsCount || 0}</span>
                    </div>
                    <div className="stat-pill">
                      <span className="lbl">Main Topic</span>
                      <span className="val highlight">{summaryMetadata?.mostDiscussedTopic || 'General'}</span>
                    </div>
                    <div className="stat-pill">
                      <span className="lbl">Category</span>
                      <span className="val tag">{summaryMetadata?.mostMentionedCategory || 'General'}</span>
                    </div>
                  </div>

                  <div className="summary-text-box">
                    <h4>Today's Discussion Summary</h4>
                    <div className="summary-bullet-points">
                      {summaryText.split('\n').map((line, idx) => (
                        <p key={idx}>{line}</p>
                      ))}
                    </div>
                  </div>
                  
                  <div className="summary-footer-meta">
                    Last Updated: {summaryMetadata?.lastUpdated ? new Date(summaryMetadata.lastUpdated).toLocaleString() : 'Just now'}
                  </div>
                </div>
              )}
            </div>

            <div className="modal-footer">
              <button className="done-btn" onClick={() => setSummaryModalOpen(false)}>Done</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
