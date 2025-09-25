import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { Link } from 'react-router-dom';
import { ordersAPI, usersAPI, productsAPI, notificationsAPI } from '../utils/api';
import { useAuth } from '../contexts/AuthContext';
import { Calendar, Users, DollarSign, TrendingUp, Eye, Plus, Check, X, Settings, Bell, AlertCircle } from 'lucide-react';

const AdminDashboard = () => {
  const { user, isAuthenticated, isAdmin } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [showNotificationModal, setShowNotificationModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [rejectReason, setRejectReason] = useState('');
  const [newStatus, setNewStatus] = useState('');
  const [trackingNumber, setTrackingNumber] = useState('');
  const [adminNotes, setAdminNotes] = useState('');
  const [showNewNotificationAlert, setShowNewNotificationAlert] = useState(false);
  const queryClient = useQueryClient();

  const { data: ordersData, isLoading: ordersLoading, error: ordersError, refetch: refetchOrders } = useQuery('admin-orders', () => ordersAPI.getAll({ limit: 10 }));
  const { data: usersData } = useQuery('admin-users', () => usersAPI.getAll({ limit: 10 }));
  const { data: productsData, isLoading: productsLoading, error: productsError } = useQuery('admin-products', () => productsAPI.getAll({ limit: 10 }));
  const { data: statsData } = useQuery('admin-stats', () => usersAPI.getStats(), {
    refetchInterval: 10000, // Refetch every 10 seconds
    staleTime: 0 // Always consider data stale
  });
  
  // Notification queries
  const { data: notificationsData, refetch: refetchNotifications } = useQuery(
    'admin-notifications',
    () => notificationsAPI.getAll({ limit: 50 }),
    {
      enabled: showNotificationModal,
      refetchInterval: 5000, // Refetch every 5 seconds
      staleTime: 0 // Always consider data stale
    }
  );
  
  const { data: notificationCountData } = useQuery(
    'admin-notification-count',
    () => notificationsAPI.getUnreadCount(),
    {
      refetchInterval: 5000, // Refetch every 5 seconds
      staleTime: 0 // Always consider data stale
    }
  );

  // Mutations for order actions
  const confirmOrderMutation = useMutation(ordersAPI.confirm, {
    onSuccess: () => {
      queryClient.invalidateQueries('admin-orders');
      alert('Order confirmed successfully!');
    },
    onError: (error) => {
      alert('Error confirming order: ' + (error.response?.data?.message || error.message));
    }
  });

  const rejectOrderMutation = useMutation(ordersAPI.reject, {
    onSuccess: () => {
      queryClient.invalidateQueries('admin-orders');
      setShowRejectModal(false);
      setSelectedOrder(null);
      setRejectReason('');
      alert('Order rejected successfully!');
    },
    onError: (error) => {
      alert('Error rejecting order: ' + (error.response?.data?.message || error.message));
    }
  });

  const updateStatusMutation = useMutation(ordersAPI.updateStatus, {
    onSuccess: () => {
      queryClient.invalidateQueries('admin-orders');
      setShowStatusModal(false);
      setSelectedOrder(null);
      setNewStatus('');
      setTrackingNumber('');
      setAdminNotes('');
      alert('Order status updated successfully!');
    },
    onError: (error) => {
      alert('Error updating order status: ' + (error.response?.data?.message || error.message));
    }
  });

  // Notification mutations
  const markAsReadMutation = useMutation(notificationsAPI.markAsRead, {
    onSuccess: () => {
      refetchNotifications();
    }
  });

  const markAllAsReadMutation = useMutation(notificationsAPI.markAllAsRead, {
    onSuccess: () => {
      refetchNotifications();
    }
  });

  const handleConfirmOrder = (orderId) => {
    if (window.confirm('Are you sure you want to confirm this order?')) {
      confirmOrderMutation.mutate(orderId);
    }
  };

  const handleRejectOrder = (order) => {
    setSelectedOrder(order);
    setShowRejectModal(true);
  };

  const handleRejectSubmit = () => {
    if (!rejectReason.trim()) {
      alert('Please provide a reason for rejection');
      return;
    }
    if (window.confirm('Are you sure you want to reject this order?')) {
      rejectOrderMutation.mutate(selectedOrder._id, { reason: rejectReason });
    }
  };

  const handleStatusChange = (order) => {
    setSelectedOrder(order);
    setNewStatus(order.status);
    setShowStatusModal(true);
  };

  const handleStatusSubmit = () => {
    if (!newStatus) {
      alert('Please select a status');
      return;
    }
    if (window.confirm('Are you sure you want to update the order status?')) {
      const updateData = { status: newStatus };
      if (trackingNumber) updateData.trackingNumber = trackingNumber;
      if (adminNotes) updateData.notes = adminNotes;
      updateStatusMutation.mutate(selectedOrder._id, updateData);
    }
  };

  const handleMarkAsRead = (notificationId) => {
    markAsReadMutation.mutate(notificationId);
  };

  const handleMarkAllAsRead = () => {
    markAllAsReadMutation.mutate();
  };

  // Fix data extraction paths - backend returns { success: true, data: { orders: [...] } }
  const orders = ordersData?.data?.data?.orders || [];
  const users = usersData?.data?.data?.users || [];
  const products = productsData?.data?.data?.products || [];
  const stats = statsData?.data?.data || {};
  
  // Notification data
  const notifications = notificationsData?.data?.data?.notifications || [];
  const unreadCount = notificationCountData?.data?.data?.unreadCount || 0;

  // Debug logging
  console.log('Admin Dashboard notification count data:', notificationCountData);
  console.log('Admin Dashboard notifications data:', notificationsData);
  console.log('Admin Dashboard notifications:', notifications);
  console.log('Admin Dashboard unread count:', unreadCount);
  console.log('Admin Dashboard stats data:', statsData);
  console.log('Admin Dashboard stats:', stats);

  // Listen for real-time notifications
  useEffect(() => {
    const handleNewNotification = (event) => {
      console.log('Real-time notification received in Admin Dashboard:', event.detail);
      
      // Play notification sound
      if (event.detail?.notification) {
        // Create notification sound
        try {
          const audioContext = new (window.AudioContext || window.webkitAudioContext)();
          const oscillator = audioContext.createOscillator();
          const gainNode = audioContext.createGain();
          
          oscillator.connect(gainNode);
          gainNode.connect(audioContext.destination);
          
          // WhatsApp-like notification sound
          oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
          oscillator.frequency.setValueAtTime(600, audioContext.currentTime + 0.1);
          oscillator.frequency.setValueAtTime(800, audioContext.currentTime + 0.2);
          
          gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
          gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
          
          oscillator.start(audioContext.currentTime);
          oscillator.stop(audioContext.currentTime + 0.3);
        } catch (error) {
          console.log('Could not play notification sound:', error);
        }
      }
      
      // Show new notification alert
      setShowNewNotificationAlert(true);
      setTimeout(() => setShowNewNotificationAlert(false), 3000);
      
      // Refetch notifications and stats
      queryClient.invalidateQueries('admin-notifications');
      queryClient.invalidateQueries('admin-notification-count');
      queryClient.invalidateQueries('admin-stats');
    };

    window.addEventListener('new-notification', handleNewNotification);
    
    return () => {
      window.removeEventListener('new-notification', handleNewNotification);
    };
  }, [queryClient]);

  // Debug: Log API responses to see what data we're getting
  console.log('=== ADMIN DASHBOARD DEBUG ===');
  console.log('User:', user);
  console.log('Is Admin:', isAdmin);
  console.log('Is Authenticated:', isAuthenticated);
  console.log('Orders API Response:', ordersData);
  console.log('Orders Array:', orders);
  console.log('Orders Loading:', ordersLoading);
  console.log('Orders Error:', ordersError);
  console.log('Users API Response:', usersData);
  console.log('Products API Response:', productsData);
  console.log('================================');




  // Check if user is admin
  if (!isAuthenticated) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Authentication Required</h2>
        <p className="text-gray-600">Please login to access the admin dashboard.</p>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h2>
        <p className="text-gray-600">You don't have permission to access the admin dashboard.</p>
      </div>
    );
  }

  const overviewStats = [
    {
      title: 'Total Users',
      value: stats.totalUsers || 0,
      icon: <Users className="h-6 w-6" />,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100'
    },
    {
      title: 'Total Orders',
      value: stats.totalOrders || orders.length,
      icon: <Calendar className="h-6 w-6" />,
      color: 'text-green-600',
      bgColor: 'bg-green-100'
    },
    {
      title: 'Total Products',
      value: stats.totalProducts || products.length,
      icon: <TrendingUp className="h-6 w-6" />,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100'
    },
    {
      title: 'Revenue',
      value: `$${stats.totalRevenue || orders.reduce((sum, o) => sum + (o.totalAmount || 0), 0)}`,
      icon: <DollarSign className="h-6 w-6" />,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-100'
    }
  ];

  const tabs = [
    { id: 'overview', label: 'Overview', icon: <TrendingUp className="h-4 w-4" /> },
    { id: 'orders', label: 'Orders', icon: <Calendar className="h-4 w-4" /> },
    { id: 'users', label: 'Users', icon: <Users className="h-4 w-4" /> },
    { id: 'products', label: 'Products', icon: <TrendingUp className="h-4 w-4" /> }
  ];

  const getStatusBadge = (status) => {
    const statusConfig = {
      pending: { class: 'badge-warning', text: 'Pending' },
      confirmed: { class: 'badge-success', text: 'Confirmed' },
      processing: { class: 'badge-primary', text: 'Processing' },
      shipped: { class: 'badge-primary', text: 'Shipped' },
      delivered: { class: 'badge-success', text: 'Delivered' },
      cancelled: { class: 'badge-danger', text: 'Cancelled' },
      refunded: { class: 'badge-danger', text: 'Refunded' }
    };

    const config = statusConfig[status] || { class: 'badge-default', text: status };
    return <span className={`badge ${config.class}`}>{config.text}</span>;
  };

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-gray-600 mt-2">Manage your booking platform</p>
        </div>
        <button
          onClick={() => setShowNotificationModal(true)}
          className="relative btn btn-outline hover:bg-gray-50 transition-colors"
        >
          <Bell className="h-5 w-5 mr-2" />
          Notifications
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full min-w-5 h-5 flex items-center justify-center font-bold animate-pulse shadow-lg px-1">
              {unreadCount > 99 ? '99+' : unreadCount}
            </span>
          )}
        </button>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 mb-8">
        <nav className="-mb-px flex space-x-8">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === tab.id
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {tab.icon}
              <span className="ml-2">{tab.label}</span>
            </button>
          ))}
        </nav>
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <div className="space-y-8">
          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {overviewStats.map((stat, index) => (
              <div key={index} className="card">
                <div className="card-content">
                  <div className="flex items-center">
                    <div className={`p-3 rounded-full ${stat.bgColor} ${stat.color}`}>
                      {stat.icon}
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                      <p className="text-2xl font-semibold text-gray-900">{stat.value}</p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Recent Activity */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="card">
              <div className="card-header">
                <h3 className="text-lg font-semibold text-gray-900">Recent Orders</h3>
              </div>
              <div className="card-content">
                {orders.length === 0 ? (
                  <p className="text-gray-500 text-center py-4">No recent orders</p>
                ) : (
                  <div className="space-y-4">
                    {orders.slice(0, 5).map((order) => (
                      <div key={order._id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div>
                          <p className="font-medium text-gray-900">Order #{order.orderNumber}</p>
                          <p className="text-sm text-gray-500">
                            {order.customer?.name} • ${order.totalAmount} • {new Date(order.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="flex items-center space-x-2">
                          {getStatusBadge(order.status)}
                          <button className="btn btn-outline btn-sm">
                            <Eye className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="card">
              <div className="card-header">
                <h3 className="text-lg font-semibold text-gray-900">Recent Users</h3>
              </div>
              <div className="card-content">
                {users.length === 0 ? (
                  <p className="text-gray-500 text-center py-4">No recent users</p>
                ) : (
                  <div className="space-y-4">
                    {users.slice(0, 5).map((user) => (
                      <div key={user._id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div>
                          <p className="font-medium text-gray-900">{user.name}</p>
                          <p className="text-sm text-gray-500">{user.email}</p>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className="badge badge-primary">{user.role}</span>
                          <button className="btn btn-outline btn-sm">
                            <Eye className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Orders Tab */}
      {activeTab === 'orders' && (
        <div className="card">
          <div className="card-header flex justify-between items-center">
            <h3 className="text-lg font-semibold text-gray-900">All Orders</h3>
            <button
              onClick={() => refetchOrders()}
              className="btn btn-outline btn-sm"
            >
              Refresh
            </button>
          </div>
          <div className="card-content">
            {ordersLoading ? (
              <p className="text-gray-500 text-center py-8">Loading orders...</p>
            ) : ordersError ? (
              <div className="text-center py-8">
                <p className="text-red-500 mb-2">Error loading orders:</p>
                <p className="text-sm text-gray-600">{ordersError.response?.data?.message || ordersError.message}</p>
                <button
                  onClick={() => refetchOrders()}
                  className="btn btn-outline btn-sm mt-4"
                >
                  Try Again
                </button>
              </div>
            ) : orders.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-500 mb-4">No orders found</p>
                <p className="text-sm text-gray-600">Orders will appear here when customers place them.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Order #
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Customer
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Date
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Amount
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {orders.map((order) => (
                      <tr key={order._id}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">
                            {order.orderNumber}
                          </div>
                          <div className="text-sm text-gray-500">
                            {order.items.length} item(s)
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{order.customer?.name}</div>
                          <div className="text-sm text-gray-500">{order.customer?.email}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {new Date(order.createdAt).toLocaleDateString()}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {getStatusBadge(order.status)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          ${order.totalAmount}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex items-center space-x-2">
                            <button className="btn btn-outline btn-sm">
                              <Eye className="h-4 w-4" />
                            </button>
                            {order.status === 'pending' && (
                              <>
                                <button
                                  onClick={() => handleConfirmOrder(order._id)}
                                  disabled={confirmOrderMutation.isLoading}
                                  className="btn btn-success btn-sm"
                                  title="Confirm Order"
                                >
                                  <Check className="h-4 w-4" />
                                </button>
                                <button
                                  onClick={() => handleRejectOrder(order)}
                                  disabled={rejectOrderMutation.isLoading}
                                  className="btn btn-danger btn-sm"
                                  title="Reject Order"
                                >
                                  <X className="h-4 w-4" />
                                </button>
                              </>
                            )}
                            <button
                              onClick={() => handleStatusChange(order)}
                              disabled={updateStatusMutation.isLoading}
                              className="btn btn-primary btn-sm"
                              title="Change Status"
                            >
                              <Settings className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Users Tab */}
      {activeTab === 'users' && (
        <div className="card">
          <div className="card-header">
            <h3 className="text-lg font-semibold text-gray-900">All Users</h3>
          </div>
          <div className="card-content">
            {users.length === 0 ? (
              <p className="text-gray-500 text-center py-8">No users found</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Name
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Email
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Role
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {users.map((user) => (
                      <tr key={user._id}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">{user.name}</div>
                          <div className="text-sm text-gray-500">{user.phone}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {user.email}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="badge badge-primary">{user.role}</span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`badge ${user.isActive ? 'badge-success' : 'badge-danger'}`}>
                            {user.isActive ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <button className="btn btn-outline btn-sm">
                            <Eye className="h-4 w-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Products Tab */}
      {activeTab === 'products' && (
        <div className="card">
          <div className="card-header flex justify-between items-center">
            <h3 className="text-lg font-semibold text-gray-900">All Products</h3>
            <Link
              to="/admin/add-product"
              className="btn btn-primary btn-sm inline-flex items-center"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Product
            </Link>
          </div>
          <div className="card-content">
            {productsLoading ? (
              <p className="text-gray-500 text-center py-8">Loading products...</p>
            ) : productsError ? (
              <p className="text-red-500 text-center py-8">Error loading products: {productsError.message}</p>
            ) : products.length === 0 ? (
              <p className="text-gray-500 text-center py-8">No products found</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Product
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Price
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Offer Price
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Quantity
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {products.map((product) => (
                      <tr key={product._id}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">{product.name}</div>
                          <div className="text-sm text-gray-500 line-clamp-2">{product.description}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          ${product.price}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {product.offerPrice ? `$${product.offerPrice}` : '-'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {product.quantity}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`badge ${product.isActive ? 'badge-success' : 'badge-danger'}`}>
                            {product.isActive ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <Link
                            to={`/products/${product._id}`}
                            className="btn btn-outline btn-sm"
                          >
                            <Eye className="h-4 w-4" />
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Status Change Modal */}
      {showStatusModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-96 max-w-md mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Change Order Status</h3>
            <p className="text-sm text-gray-600 mb-4">
              Order #{selectedOrder?.orderNumber} - {selectedOrder?.customer?.name}
            </p>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                New Status *
              </label>
              <select
                value={newStatus}
                onChange={(e) => setNewStatus(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="">Select Status</option>
                <option value="pending">Pending</option>
                <option value="confirmed">Confirmed</option>
                <option value="processing">Processing</option>
                <option value="shipped">Shipped</option>
                <option value="delivered">Delivered</option>
                <option value="cancelled">Cancelled</option>
                <option value="refunded">Refunded</option>
              </select>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tracking Number
              </label>
              <input
                type="text"
                value={trackingNumber}
                onChange={(e) => setTrackingNumber(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter tracking number (optional)"
              />
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Admin Notes
              </label>
              <textarea
                value={adminNotes}
                onChange={(e) => setAdminNotes(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows={3}
                placeholder="Add notes for this status change (optional)"
              />
            </div>

            <div className="flex justify-end space-x-3">
              <button
                onClick={() => {
                  setShowStatusModal(false);
                  setSelectedOrder(null);
                  setNewStatus('');
                  setTrackingNumber('');
                  setAdminNotes('');
                }}
                className="btn btn-outline"
                disabled={updateStatusMutation.isLoading}
              >
                Cancel
              </button>
              <button
                onClick={handleStatusSubmit}
                disabled={updateStatusMutation.isLoading || !newStatus}
                className="btn btn-primary"
              >
                {updateStatusMutation.isLoading ? 'Updating...' : 'Update Status'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reject Order Modal */}
      {showRejectModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-96 max-w-md mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Reject Order</h3>
            <p className="text-sm text-gray-600 mb-4">
              Order #{selectedOrder?.orderNumber} - {selectedOrder?.customer?.name}
            </p>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Reason for rejection *
              </label>
              <textarea
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows={3}
                placeholder="Please provide a reason for rejecting this order..."
                required
              />
            </div>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => {
                  setShowRejectModal(false);
                  setSelectedOrder(null);
                  setRejectReason('');
                }}
                className="btn btn-outline"
                disabled={rejectOrderMutation.isLoading}
              >
                Cancel
              </button>
              <button
                onClick={handleRejectSubmit}
                disabled={rejectOrderMutation.isLoading || !rejectReason.trim()}
                className="btn btn-danger"
              >
                {rejectOrderMutation.isLoading ? 'Rejecting...' : 'Reject Order'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Admin Notification Modal */}
      {showNotificationModal && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          <div className="absolute inset-0 bg-black bg-opacity-50" onClick={() => setShowNotificationModal(false)} />
          
          <div className="absolute right-0 top-0 h-full w-96 bg-white shadow-xl">
            <div className="flex flex-col h-full">
              {/* Header */}
              <div className="flex items-center justify-between p-4 border-b bg-blue-50">
                <div className="flex items-center">
                  <Bell className="h-5 w-5 text-blue-600 mr-2" />
                  <h3 className="text-lg font-semibold text-gray-900">Admin Notifications</h3>
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
                      className="text-sm text-blue-600 hover:text-blue-800"
                      disabled={markAllAsReadMutation.isLoading}
                    >
                      Mark all read
                    </button>
                  )}
                  <button
                    onClick={() => setShowNotificationModal(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
              </div>

              {/* Notifications List */}
              <div className="flex-1 overflow-y-auto">
                {notifications.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-gray-500 p-8">
                    <Bell className="h-16 w-16 text-gray-300 mb-4" />
                    <p className="text-lg font-medium">No notifications</p>
                    <p className="text-sm text-center">You're all caught up! New order notifications will appear here.</p>
                  </div>
                ) : (
                  <div className="divide-y divide-gray-200">
                    {notifications.map((notification) => (
                      <div
                        key={notification._id}
                        className={`p-4 hover:bg-gray-50 cursor-pointer border-l-4 ${
                          !notification.isRead ? 'bg-blue-50 border-blue-500' : 'bg-gray-50 border-gray-300'
                        }`}
                        onClick={() => handleMarkAsRead(notification._id)}
                      >
                        <div className="flex items-start">
                          <div className="flex-shrink-0 mr-3">
                            {notification.type === 'order_placed' ? (
                              <Calendar className="h-5 w-5 text-green-500" />
                            ) : notification.type === 'stock_low' ? (
                              <AlertCircle className="h-5 w-5 text-yellow-500" />
                            ) : notification.type === 'stock_out' ? (
                              <AlertCircle className="h-5 w-5 text-red-500" />
                            ) : (
                              <Bell className="h-5 w-5 text-blue-500" />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between">
                              <p className={`text-sm font-medium ${
                                !notification.isRead ? 'text-gray-900' : 'text-gray-700'
                              }`}>
                                {notification.title}
                              </p>
                              {!notification.isRead && (
                                <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0" />
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
                                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
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
      )}

      {/* Floating New Notification Alert */}
      {showNewNotificationAlert && (
        <div className="fixed top-4 right-4 z-50 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg animate-bounce">
          <div className="flex items-center">
            <Bell className="h-5 w-5 mr-2" />
            <span className="font-medium">New notification received!</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;