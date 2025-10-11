import React, { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';
import notificationService from '../services/notificationService';
import { toast } from 'react-toastify';

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
  const [notifications, setNotifications] = useState([]);
  const { user, isAuthenticated } = useAuth();

  useEffect(() => {
    if (isAuthenticated && user) {
      // Connect to Socket.IO server
      const socketUrl = process.env.REACT_APP_SOCKET_URL || 'https://notificationbackend-35f6.onrender.com';
      const newSocket = io(socketUrl, {
        transports: ['websocket', 'polling'],
        autoConnect: true,
        reconnection: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 1000
      });

      newSocket.on('connect', () => {
        console.log('Socket connected:', newSocket.id);
        setIsConnected(true);
        
        // Register user with the new system
        newSocket.emit('register', user._id);
        
        // Also join user-specific room for legacy support
        newSocket.emit('join-user-room', user._id);
      });

      newSocket.on('registered', (data) => {
        console.log('User registered successfully:', data);
      });

      newSocket.on('disconnect', () => {
        console.log('Socket disconnected');
        setIsConnected(false);
      });

      newSocket.on('connect_error', (error) => {
        console.error('Socket connection error:', error);
        setIsConnected(false);
      });

      // Handle new simplified notification format
      newSocket.on('notification', (notificationData) => {
        console.log('Real-time notification received:', notificationData);
        
        // Add to notifications list
        setNotifications(prev => [notificationData, ...prev]);
        
        // Show toast notification
        toast.success(notificationData.message, {
          position: "top-right",
          autoClose: 5000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
        });
        
        // Play notification sound
        notificationService.playNotificationSound();
        
        // Show browser notification if permission granted
        if (Notification.permission === 'granted') {
          new Notification(notificationData.title, {
            body: notificationData.message,
            icon: '/logo192.png',
            tag: notificationData.id
          });
        }
        
        // Trigger a refetch of notifications
        window.dispatchEvent(new CustomEvent('new-notification', { detail: notificationData }));
      });

      // Handle legacy notification format
      newSocket.on('new-notification', (data) => {
        console.log('Legacy notification received:', data);
        console.log('Notification type:', data.notification?.type);
        console.log('Notification title:', data.notification?.title);
        console.log('Unread count from server:', data.unreadCount);
        
        // Show notification and play sound
        if (data.notification) {
          console.log('Showing local notification for customer');
          
          // Use web push notification with badge
          const unreadCount = data.unreadCount || 1;
          notificationService.sendPushNotificationWithBadge(data.notification.title, {
            body: data.notification.message,
            tag: data.notification._id,
            badgeCount: unreadCount,
            data: data.notification
          });
          
          notificationService.playNotificationSound();
          
          // Set badge count (WhatsApp-like) - Aggressive badge update for real-time
          console.log('SocketContext: Real-time notification - Setting badge count to:', unreadCount);
          
          // Set badge count for real-time notifications
          try {
            // Primary method: Standard badge setting
            notificationService.setBadgeCount(unreadCount);
            console.log('SocketContext: Badge count set to:', unreadCount);
            
            // Dispatch badge update event for UI components
            window.dispatchEvent(new CustomEvent('badge-update', { 
              detail: { count: unreadCount } 
            }));
            console.log('SocketContext: Badge update event dispatched');
            
          } catch (error) {
            console.error('SocketContext: Error setting badge:', error);
          }
        }
        
        // Trigger a refetch of notifications
        window.dispatchEvent(new CustomEvent('new-notification', { detail: data }));
      });

      // Test connection handler
      newSocket.on('test-connection-response', (data) => {
        console.log('Test connection response:', data);
        toast.info('Socket connection test successful!');
      });

      setSocket(newSocket);

      return () => {
        newSocket.close();
      };
    }
  }, [isAuthenticated, user]);

  return (
    <SocketContext.Provider value={{ socket, isConnected, notifications }}>
      {children}
    </SocketContext.Provider>
  );
};

export default SocketContext;
