import React, { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';
import notificationService from '../services/notificationService';

const SocketContext = createContext();

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
};

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const { user, isAuthenticated } = useAuth();

  useEffect(() => {
    if (isAuthenticated && user) {
      // Connect to Socket.IO server
      const socketUrl = process.env.REACT_APP_SOCKET_URL || 'https://notificationbackend-35f6.onrender.com';
      const newSocket = io(socketUrl, {
        transports: ['websocket', 'polling']
      });

      newSocket.on('connect', () => {
        console.log('Socket connected:', newSocket.id);
        setIsConnected(true);
        
        // Join user-specific room
        newSocket.emit('join-user-room', user._id);
      });

      newSocket.on('disconnect', () => {
        console.log('Socket disconnected');
        setIsConnected(false);
      });

      newSocket.on('new-notification', (data) => {
        console.log('Real-time notification received:', data);
        console.log('Notification type:', data.notification?.type);
        console.log('Notification title:', data.notification?.title);
        
        // Show notification and play sound
        if (data.notification) {
          console.log('Showing local notification for customer');
          notificationService.showLocalNotification(data.notification.title, {
            body: data.notification.message,
            tag: data.notification._id,
            data: data.notification
          });
          notificationService.playNotificationSound();
          
          // Set badge count (WhatsApp-like)
          const unreadCount = data.unreadCount || 1;
          notificationService.setBadgeCount(unreadCount);
          console.log('Badge count set to:', unreadCount);
        }
        
        // Trigger a refetch of notifications
        window.dispatchEvent(new CustomEvent('new-notification', { detail: data }));
      });

      setSocket(newSocket);

      return () => {
        newSocket.close();
      };
    }
  }, [isAuthenticated, user]);

  return (
    <SocketContext.Provider value={{ socket, isConnected }}>
      {children}
    </SocketContext.Provider>
  );
};

export default SocketContext;
