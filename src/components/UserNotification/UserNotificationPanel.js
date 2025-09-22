import React, { useState } from 'react';
import { useQuery, useMutation } from 'react-query';
import { notificationsAPI } from '../../utils/api';
import { Bell, X, Check, AlertCircle, Info, CheckCircle, ShoppingCart, Package, Truck } from 'lucide-react';

const UserNotificationPanel = ({ isOpen, onClose }) => {
  const [filter, setFilter] = useState('all');

  const { data: notificationsData, refetch } = useQuery(
    'user-notifications',
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

  const notifications = notificationsData?.data?.notifications || [];
  const unreadCount = notifications.filter(n => !n.isRead).length;

  const filteredNotifications = notifications.filter(notification => {
    if (filter === 'unread') return !notification.isRead;
    if (filter === 'read') return notification.isRead;
    return true;
  });

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'order_placed':
        return <ShoppingCart className="h-5 w-5 text-green-500" />;
      case 'order_confirmed':
        return <CheckCircle className="h-5 w-5 text-blue-500" />;
      case 'order_processing':
        return <Package className="h-5 w-5 text-purple-500" />;
      case 'order_shipped':
        return <Truck className="h-5 w-5 text-orange-500" />;
      case 'order_delivered':
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case 'order_cancelled':
        return <AlertCircle className="h-5 w-5 text-red-500" />;
      default:
        return <Info className="h-5 w-5 text-gray-500" />;
    }
  };

  const getNotificationColor = (type) => {
    switch (type) {
      case 'order_placed':
        return 'bg-green-50 border-green-200';
      case 'order_confirmed':
        return 'bg-blue-50 border-blue-200';
      case 'order_processing':
        return 'bg-purple-50 border-purple-200';
      case 'order_shipped':
        return 'bg-orange-50 border-orange-200';
      case 'order_delivered':
        return 'bg-green-50 border-green-200';
      case 'order_cancelled':
        return 'bg-red-50 border-red-200';
      default:
        return 'bg-gray-50 border-gray-200';
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
          <div className="flex items-center justify-between p-4 border-b bg-primary-50">
            <div className="flex items-center">
              <Bell className="h-5 w-5 text-primary-600 mr-2" />
              <h3 className="text-lg font-semibold text-gray-900">My Notifications</h3>
              {unreadCount > 0 && (
                <span className="ml-2 bg-red-500 text-white text-xs rounded-full px-2 py-1">
                  {unreadCount}
                </span>
              )}
            </div>
            <div className="flex items-center space-x-2">
              {unreadCount > 0 && (
                <button
                  onClick={handleMarkAllAsRead}
                  className="text-sm text-primary-600 hover:text-primary-800"
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
                  filter === 'all' ? 'bg-primary-100 text-primary-800' : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                All
              </button>
              <button
                onClick={() => setFilter('unread')}
                className={`px-3 py-1 text-sm rounded-full ${
                  filter === 'unread' ? 'bg-primary-100 text-primary-800' : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                Unread ({unreadCount})
              </button>
              <button
                onClick={() => setFilter('read')}
                className={`px-3 py-1 text-sm rounded-full ${
                  filter === 'read' ? 'bg-primary-100 text-primary-800' : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                Read
              </button>
            </div>
          </div>

          {/* Notifications List */}
          <div className="flex-1 overflow-y-auto">
            {filteredNotifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-gray-500 p-8">
                <Bell className="h-16 w-16 text-gray-300 mb-4" />
                <p className="text-lg font-medium">No notifications</p>
                <p className="text-sm text-center">You're all caught up! Check back later for updates on your orders.</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-200">
                {filteredNotifications.map((notification) => (
                  <div
                    key={notification._id}
                    className={`p-4 hover:bg-gray-50 cursor-pointer border-l-4 ${
                      getNotificationColor(notification.type)
                    } ${!notification.isRead ? 'bg-opacity-100' : 'bg-opacity-50'}`}
                    onClick={() => !notification.isRead && handleMarkAsRead(notification._id)}
                  >
                    <div className="flex items-start">
                      <div className="flex-shrink-0 mr-3">
                        {getNotificationIcon(notification.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <p className={`text-sm font-medium ${
                            !notification.isRead ? 'text-gray-900' : 'text-gray-700'
                          }`}>
                            {notification.title}
                          </p>
                          {!notification.isRead && (
                            <div className="w-2 h-2 bg-primary-500 rounded-full flex-shrink-0" />
                          )}
                        </div>
                        <p className={`text-sm mt-1 ${
                          !notification.isRead ? 'text-gray-800' : 'text-gray-600'
                        }`}>
                          {notification.message}
                        </p>
                        <p className="text-xs text-gray-500 mt-2">
                          {new Date(notification.createdAt).toLocaleString()}
                        </p>
                        {notification.data?.orderNumber && (
                          <div className="mt-2">
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-primary-100 text-primary-800">
                              Order #{notification.data.orderNumber}
                            </span>
                          </div>
                        )}
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

export default UserNotificationPanel;