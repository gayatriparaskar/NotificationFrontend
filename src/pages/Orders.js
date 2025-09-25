import React, { useState } from 'react';
import { useQuery } from 'react-query';
import { ordersAPI } from '../utils/api';
import { useAuth } from '../contexts/AuthContext';
import { Package, Clock, DollarSign, Eye, X } from 'lucide-react';

const Orders = () => {
  const { isAuthenticated } = useAuth();
  const [filters, setFilters] = useState({
    status: '',
    page: 1
  });

  const { data, isLoading, error } = useQuery(
    ['orders', filters],
    () => ordersAPI.getAll(filters),
    {
      keepPreviousData: true,
      enabled: isAuthenticated // Only fetch if user is authenticated
    }
  );

  const orders = data?.data?.data?.orders || [];
  const pagination = data?.data?.data?.pagination || {};

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value,
      page: 1
    }));
  };

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

  if (!isAuthenticated) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Authentication Required</h2>
        <p className="text-gray-600">Please login to view your orders.</p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="spinner"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Error Loading Orders</h2>
        <p className="text-gray-600 mb-4">Please try again later.</p>
        <p className="text-sm text-red-600">
          {error.response?.data?.message || error.message || 'Unknown error occurred'}
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">My Orders</h1>
        <p className="text-gray-600">Track and manage your snake orders</p>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border p-6 mb-8">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Filter by Status
            </label>
            <select
              value={filters.status}
              onChange={(e) => handleFilterChange('status', e.target.value)}
              className="input"
            >
              <option value="">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="confirmed">Confirmed</option>
              <option value="processing">Processing</option>
              <option value="shipped">Shipped</option>
              <option value="delivered">Delivered</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
        </div>
      </div>

      {/* Orders List */}
      {orders.length === 0 ? (
        <div className="text-center py-12">
          <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">No Orders Found</h3>
          <p className="text-gray-600 mb-6">You haven't placed any orders yet.</p>
          <a href="/products" className="btn btn-primary">
            Browse Products
          </a>
        </div>
      ) : (
        <>
          <div className="space-y-4 mb-8">
            {orders.map((order) => (
              <div key={order._id} className="card hover:shadow-lg transition-shadow">
                <div className="card-content">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">
                        Order #{order.orderNumber}
                      </h3>
                      <p className="text-sm text-gray-500">
                        Placed on {new Date(order.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    {getStatusBadge(order.status)}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <div className="flex items-center text-sm text-gray-600">
                      <Package className="h-4 w-4 mr-2" />
                      <span>{order.items.length} item(s)</span>
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <DollarSign className="h-4 w-4 mr-2" />
                      <span className="font-semibold text-gray-900">
                        ${order.totalAmount.toFixed(2)}
                      </span>
                    </div>
                    {order.trackingNumber && (
                      <div className="flex items-center text-sm text-gray-600">
                        <Clock className="h-4 w-4 mr-2" />
                        <span>Tracking: {order.trackingNumber}</span>
                      </div>
                    )}
                  </div>

                  {/* Order Items */}
                  <div className="space-y-2 mb-4">
                    {order.items.map((item, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center">
                          <div className="w-12 h-12 bg-gray-200 rounded-lg overflow-hidden mr-3 flex items-center justify-center">
                            <Package className="h-6 w-6 text-gray-400" />
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">{item.product?.name}</p>
                            <p className="text-sm text-gray-500">Qty: {item.quantity}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-medium text-gray-900">${item.price.toFixed(2)}</p>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="text-sm text-gray-600">
                      <p>Shipping to: {order.shippingAddress.city}, {order.shippingAddress.state}</p>
                      {order.estimatedDelivery && (
                        <p>Estimated delivery: {new Date(order.estimatedDelivery).toLocaleDateString()}</p>
                      )}
                    </div>
                    <div className="flex items-center space-x-2">
                      <button className="btn btn-outline btn-sm">
                        <Eye className="h-4 w-4 mr-1" />
                        View Details
                      </button>
                      {(order.status === 'pending' || order.status === 'confirmed') && (
                        <button className="btn btn-outline btn-sm text-red-600 hover:bg-red-50">
                          <X className="h-4 w-4 mr-1" />
                          Cancel
                        </button>
                      )}
                    </div>
                  </div>

                  {order.notes?.customer && (
                    <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                      <p className="text-sm font-medium text-blue-900 mb-1">Order Notes:</p>
                      <p className="text-sm text-blue-700">{order.notes.customer}</p>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-700">
                Showing {((pagination.currentPage - 1) * pagination.itemsPerPage) + 1} to{' '}
                {Math.min(pagination.currentPage * pagination.itemsPerPage, pagination.totalItems)} of{' '}
                {pagination.totalItems} results
              </div>

              <div className="flex space-x-2">
                <button
                  onClick={() => handleFilterChange('page', pagination.currentPage - 1)}
                  disabled={pagination.currentPage === 1}
                  className="btn btn-outline btn-sm disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>

                {[...Array(pagination.totalPages)].map((_, index) => {
                  const page = index + 1;
                  return (
                    <button
                      key={page}
                      onClick={() => handleFilterChange('page', page)}
                      className={`btn btn-sm ${
                        page === pagination.currentPage
                          ? 'btn-primary'
                          : 'btn-outline'
                      }`}
                    >
                      {page}
                    </button>
                  );
                })}

                <button
                  onClick={() => handleFilterChange('page', pagination.currentPage + 1)}
                  disabled={pagination.currentPage === pagination.totalPages}
                  className="btn btn-outline btn-sm disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default Orders;