import React, { createContext, useContext, useEffect, useState, useRef } from 'react';
import { io } from 'socket.io-client';

const SocketContext = createContext(null);

export const SocketProvider = ({ user, children }) => {
  const [socket, setSocket] = useState(null);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [typingState, setTypingState] = useState({}); // { [key]: userName }
  const typingTimersRef = useRef({});

  useEffect(() => {
    // Determine socket host url dynamically
    const socketUrl = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
      ? 'http://localhost:5000'
      : window.location.origin;

    const newSocket = io(socketUrl, {
      transports: ['polling', 'websocket'],
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 1000
    });

    newSocket.on('connect', () => {
      if (user?.email) {
        newSocket.emit('register_user', { email: user.email, role: user.role });
      }
    });

    newSocket.on('connect_error', (err) => {
      // Gracefully attempt fallback polling without interrupting rendering
    });

    newSocket.on('online_users_list', (users) => {
      setOnlineUsers(users);
    });

    newSocket.on('user_typing', ({ userName, userEmail, room, recipientEmail }) => {
      const key = room || recipientEmail || userEmail;
      setTypingState(prev => ({ ...prev, [key]: userName || 'Someone' }));

      // Reset auto-clear timer
      if (typingTimersRef.current[key]) clearTimeout(typingTimersRef.current[key]);
      typingTimersRef.current[key] = setTimeout(() => {
        setTypingState(prev => {
          const next = { ...prev };
          delete next[key];
          return next;
        });
      }, 3000);
    });

    newSocket.on('user_stopped_typing', ({ room, recipientEmail, userEmail }) => {
      const key = room || recipientEmail || userEmail;
      setTypingState(prev => {
        const next = { ...prev };
        delete next[key];
        return next;
      });
    });

    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
    };
  }, []);

  // Re-register if user details change
  useEffect(() => {
    if (socket && user?.email) {
      socket.emit('register_user', { email: user.email, role: user.role });
    }
  }, [socket, user?.email, user?.role]);

  const joinRoom = (roomName) => {
    if (socket && roomName) {
      socket.emit('join_room', roomName);
    }
  };

  const leaveRoom = (roomName) => {
    if (socket && roomName) {
      socket.emit('leave_room', roomName);
    }
  };

  const startTyping = (room, recipientEmail, userName) => {
    if (socket) {
      socket.emit('typing_start', { room, recipientEmail, userName });
    }
  };

  const stopTyping = (room, recipientEmail) => {
    if (socket) {
      socket.emit('typing_stop', { room, recipientEmail });
    }
  };

  const sendRealtimeMessage = (msgData) => {
    if (socket) {
      socket.emit('send_realtime_message', msgData);
    }
  };

  const markMessagesRead = (studentEmail, sender) => {
    if (socket && studentEmail) {
      socket.emit('mark_messages_read', { studentEmail, sender });
    }
  };

  const isUserOnline = (email) => {
    if (!email) return false;
    return onlineUsers.includes(email.toLowerCase().trim());
  };

  return (
    <SocketContext.Provider value={{
      socket,
      onlineUsers,
      isUserOnline,
      typingState,
      joinRoom,
      leaveRoom,
      startTyping,
      stopTyping,
      sendRealtimeMessage,
      markMessagesRead
    }}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => useContext(SocketContext);
