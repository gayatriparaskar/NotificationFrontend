import React, { useState } from 'react';
import { useQuery } from 'react-query';
import { ordersAPI } from '../utils/api';
import { Calendar, Clock, User, DollarSign, MoreVertical, Eye, X } from 'lucide-react';

const Bookings = () => {
  const [filters, setFilters] = useState({
    status: '',
    page: 1
  });

  const { data, isLoading, error } = useQuery(
    ['orders', filters],
    () => ordersAPI.getAll(filters),
    {
      keepPreviousData: true
    }
  );

  const orders = data?.data?.orders || [];
  const pagination = data?.data?.pagination || {};

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
      processing: { class: 'badge-info', text: 'Processing' },
      shipped: { class: 'badge-primary', text: 'Shipped' },
      delivered: { class: 'badge-success', text: 'Delivered' },
      cancelled: { class: 'badge-danger', text: 'Cancelled' }
    };

    const config = statusConfig[status] || { class: 'badge-default', text: status };
    return <span className={`badge ${config.class}`}>{config.text}</span>;
  };

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
        <p className="text-gray-600">Please try again later.</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">My Orders</h1>
        <p className="text-gray-600">Manage and track your orders</p>
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
          <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">No Orders Found</h3>
          <p className="text-gray-600 mb-6">You haven't made any orders yet.</p>
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
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold text-gray-900">
                          Order #{order.orderNumber}
                        </h3>
                        {getStatusBadge(order.status)}
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                        <div className="flex items-center text-sm text-gray-600">
                          <Calendar className="h-4 w-4 mr-2" />
                          <span>{new Date(order.createdAt).toLocaleDateString()}</span>
                        </div>
                        <div className="flex items-center text-sm text-gray-600">
                          <Clock className="h-4 w-4 mr-2" />
                          <span>{order.items?.length || 0} item(s)</span>
                        </div>
                        <div className="flex items-center text-sm text-gray-600">
                          <User className="h-4 w-4 mr-2" />
                          <span>Total: ${order.totalAmount}</span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center text-sm text-gray-600">
                          <DollarSign className="h-4 w-4 mr-1" />
                          <span className="font-semibold text-gray-900">
                            ${order.totalAmount}
                          </span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <button className="btn btn-outline btn-sm">
                            <Eye className="h-4 w-4 mr-1" />
                            View Details
                          </button>
                          {booking.status === 'pending' && (
                            <button className="btn btn-outline btn-sm text-red-600 hover:bg-red-50">
                              <X className="h-4 w-4 mr-1" />
                              Cancel
                            </button>
                          )}
                        </div>
                      </div>

                      {booking.specialRequests && booking.specialRequests.length > 0 && (
                        <div className="mt-4">
                          <p className="text-sm font-medium text-gray-700 mb-2">Special Requests:</p>
                          <div className="flex flex-wrap gap-2">
                            {booking.specialRequests.map((request, index) => (
                              <span key={index} className="badge badge-primary text-xs">
                                {request}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {booking.notes?.customer && (
                        <div className="mt-4">
                          <p className="text-sm font-medium text-gray-700 mb-1">Notes:</p>
                          <p className="text-sm text-gray-600">{booking.notes.customer}</p>
                        </div>
                      )}
                    </div>
                  </div>
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

export default Bookings;