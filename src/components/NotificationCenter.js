import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { notificationsAPI } from '../utils/api';
import WhatsAppBadge from './WhatsAppBadge';
import { Bell, X, AlertCircle, Info, CheckCircle } from 'lucide-react';

const NotificationCenter = ({ isOpen, onClose }) => {
  const [filter, setFilter] = useState('all');
  const queryClient = useQueryClient();

  const { data: notificationsData, refetch, error: notificationsError } = useQuery(
    'notifications',
    () => notificationsAPI.getAll({ limit: 50 }),
    {
      enabled: isOpen,
      refetchInterval: 30000 // Refetch every 30 seconds
    }
  );

  const markAsReadMutation = useMutation(notificationsAPI.markAsRead, {
    onSuccess: () => {
      refetch();
    }
  });

  const markAllAsReadMutation = useMutation(notificationsAPI.markAllAsRead, {
    onSuccess: () => {
      refetch();
    }
  });

  const notifications = notificationsData?.data?.data?.notifications || [];
  const unreadCount = notifications.filter(n => !n.isRead).length;

  // Debug logging
  console.log('NotificationCenter data:', notificationsData);
  console.log('NotificationCenter error:', notificationsError);
  console.log('NotificationCenter notifications:', notifications);
  console.log('NotificationCenter unread count:', unreadCount);

  // Listen for real-time notifications
  useEffect(() => {
    const handleNewNotification = (event) => {
      console.log('Real-time notification received in NotificationCenter:', event.detail);
      // Refetch notifications
      queryClient.invalidateQueries('notifications');
      queryClient.invalidateQueries('notification-count');
    };

    window.addEventListener('new-notification', handleNewNotification);
    
    return () => {
      window.removeEventListener('new-notification', handleNewNotification);
    };
  }, [queryClient]);

  const filteredNotifications = notifications.filter(notification => {
    if (filter === 'unread') return !notification.isRead;
    if (filter === 'read') return notification.isRead;
    return true;
  });

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'order_placed':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'order_confirmed':
        return <CheckCircle className="h-5 w-5 text-blue-500" />;
      case 'order_shipped':
        return <CheckCircle className="h-5 w-5 text-purple-500" />;
      case 'order_delivered':
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case 'order_cancelled':
        return <AlertCircle className="h-5 w-5 text-red-500" />;
      default:
        return <Info className="h-5 w-5 text-gray-500" />;
    }
  };

  const handleMarkAsRead = (notificationId) => {
    markAsReadMutation.mutate(notificationId);
  };

  const handleMarkAllAsRead = () => {
    markAllAsReadMutation.mutate();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      <div className="absolute inset-0 bg-black bg-opacity-50" onClick={onClose} />
      
      <div className="absolute right-0 top-0 h-full w-96 bg-white shadow-xl">
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b">
            <div className="flex items-center">
              <Bell className="h-5 w-5 text-gray-600 mr-2" />
              <h3 className="text-lg font-semibold text-gray-900">Notifications</h3>
              <WhatsAppBadge count={unreadCount} className="ml-2" />
            </div>
            <div className="flex items-center space-x-2">
              {unreadCount > 0 && (
                <button
                  onClick={handleMarkAllAsRead}
                  className="text-sm text-blue-600 hover:text-blue-800"
                  disabled={markAllAsReadMutation.isLoading}
                >
                  Mark all read
                </button>
              )}
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* Filter */}
          <div className="p-4 border-b">
            <div className="flex space-x-2">
              <button
                onClick={() => setFilter('all')}
                className={`px-3 py-1 text-sm rounded-full ${
                  filter === 'all' ? 'bg-blue-100 text-blue-800' : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                All
              </button>
              <button
                onClick={() => setFilter('unread')}
                className={`px-3 py-1 text-sm rounded-full ${
                  filter === 'unread' ? 'bg-blue-100 text-blue-800' : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                Unread ({unreadCount})
              </button>
              <button
                onClick={() => setFilter('read')}
                className={`px-3 py-1 text-sm rounded-full ${
                  filter === 'read' ? 'bg-blue-100 text-blue-800' : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                Read
              </button>
            </div>
          </div>

          {/* Notifications List */}
          <div className="flex-1 overflow-y-auto">
            {filteredNotifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-gray-500">
                <Bell className="h-12 w-12 text-gray-300 mb-4" />
                <p className="text-lg font-medium">No notifications</p>
                <p className="text-sm">You're all caught up!</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-200">
                {filteredNotifications.map((notification) => (
                  <div
                    key={notification._id}
                    className={`p-4 hover:bg-gray-50 cursor-pointer transition-colors ${
                      !notification.isRead ? 'bg-blue-50 border-l-4 border-blue-500 shadow-sm' : 'hover:bg-gray-100'
                    }`}
                    onClick={() => !notification.isRead && handleMarkAsRead(notification._id)}
                  >
                    <div className="flex items-start">
                      <div className="flex-shrink-0 mr-3">
                        {getNotificationIcon(notification.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <p className={`text-sm font-medium ${
                            !notification.isRead ? 'text-gray-900 font-bold' : 'text-gray-700'
                          }`}>
                            {notification.title}
                          </p>
                          <div className="flex items-center space-x-2">
                            {!notification.isRead && (
                              <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0 animate-pulse" />
                            )}
                            <span className="text-xs text-gray-500">
                              {new Date(notification.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                            </span>
                          </div>
                        </div>
                        <p className={`text-sm mt-1 ${
                          !notification.isRead ? 'text-gray-800 font-medium' : 'text-gray-600'
                        }`}>
                          {notification.message}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          {new Date(notification.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotificationCenter;