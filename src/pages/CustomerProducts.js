import React, { useState } from 'react';
import { useQuery, useMutation } from 'react-query';
import { productsAPI, ordersAPI } from '../utils/api';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'react-toastify';
import { Search, Package } from 'lucide-react';
import ProductCard from '../components/UserNotification/ProductCard';
import UserNotificationPanel from '../components/UserNotification/UserNotificationPanel';

const CustomerProducts = () => {
  const { } = useAuth(); // eslint-disable-line no-empty-pattern
  const [filters, setFilters] = useState({
    search: '',
    category: '',
    minPrice: '',
    maxPrice: '',
    age: '',
    page: 1
  });
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);

  const { data, isLoading, error } = useQuery(
    ['customer-products', filters],
    () => productsAPI.getAll(filters),
    {
      keepPreviousData: true
    }
  );

  const createOrderMutation = useMutation(ordersAPI.create, {
    onSuccess: (response) => {
      toast.success('Order placed successfully! You will receive a confirmation notification.');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to place order');
    }
  });

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value,
      page: 1 // Reset to first page when filters change
    }));
  };

  const handlePageChange = (page) => {
    setFilters(prev => ({ ...prev, page }));
  };

  const handleOrderNow = async (product, quantity) => {
    try {
      const orderData = {
        items: [
          {
            product: product._id,
            quantity: quantity,
            price: product.price
          }
        ],
        shippingAddress: {
          street: '123 Customer St', // This should come from user profile
          city: 'Customer City',
          state: 'CC',
          zipCode: '12345',
          country: 'USA',
          phone: '+1234567890'
        },
        billingAddress: {
          street: '123 Customer St',
          city: 'Customer City',
          state: 'CC',
          zipCode: '12345',
          country: 'USA'
        },
        subtotal: product.price * quantity,
        shippingCost: product.shipping?.cost || 0,
        tax: (product.price * quantity) * 0.08, // 8% tax
        totalAmount: (product.price * quantity) + (product.shipping?.cost || 0) + ((product.price * quantity) * 0.08),
        status: 'pending',
        paymentStatus: 'pending',
        notes: {
          customer: `Order for ${quantity} x ${product.name}`
        }
      };

      await createOrderMutation.mutateAsync(orderData);
    } catch (error) {
      console.error('Order creation error:', error);
    }
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
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Error Loading Products</h2>
        <p className="text-gray-600">Please try again later.</p>
      </div>
    );
  }

  const products = data?.data?.products || [];
  const pagination = data?.data?.pagination || {};

  const categories = [
    { value: '', label: 'All Categories' },
    { value: 'ball_python', label: 'Ball Python' },
    { value: 'corn_snake', label: 'Corn Snake' },
    { value: 'king_snake', label: 'King Snake' },
    { value: 'boa_constrictor', label: 'Boa Constrictor' },
    { value: 'milk_snake', label: 'Milk Snake' },
    { value: 'garter_snake', label: 'Garter Snake' }
  ];

  const ages = [
    { value: '', label: 'All Ages' },
    { value: 'hatchling', label: 'Hatchling' },
    { value: 'juvenile', label: 'Juvenile' },
    { value: 'sub_adult', label: 'Sub-Adult' },
    { value: 'adult', label: 'Adult' }
  ];

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Available Snakes</h1>
            <p className="text-gray-600 mt-2">Find your perfect snake companion</p>
          </div>
          
          {/* Notification Button */}
          <button
            onClick={() => setIsNotificationOpen(true)}
            className="relative btn btn-outline"
          >
            <Package className="h-5 w-5 mr-2" />
            My Orders
          </button>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="card mb-8">
        <div className="card-content">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            {/* Search */}
            <div className="lg:col-span-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search snakes..."
                  value={filters.search}
                  onChange={(e) => handleFilterChange('search', e.target.value)}
                  className="input pl-10"
                />
              </div>
            </div>

            {/* Category Filter */}
            <div>
              <select
                value={filters.category}
                onChange={(e) => handleFilterChange('category', e.target.value)}
                className="input"
              >
                {categories.map(cat => (
                  <option key={cat.value} value={cat.value}>{cat.label}</option>
                ))}
              </select>
            </div>

            {/* Age Filter */}
            <div>
              <select
                value={filters.age}
                onChange={(e) => handleFilterChange('age', e.target.value)}
                className="input"
              >
                {ages.map(age => (
                  <option key={age.value} value={age.value}>{age.label}</option>
                ))}
              </select>
            </div>

            {/* Price Range */}
            <div className="flex space-x-2">
              <input
                type="number"
                placeholder="Min $"
                value={filters.minPrice}
                onChange={(e) => handleFilterChange('minPrice', e.target.value)}
                className="input flex-1"
              />
              <input
                type="number"
                placeholder="Max $"
                value={filters.maxPrice}
                onChange={(e) => handleFilterChange('maxPrice', e.target.value)}
                className="input flex-1"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Products Grid */}
      {products.length === 0 ? (
        <div className="text-center py-12">
          <Package className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No snakes found</h3>
          <p className="text-gray-600">Try adjusting your search criteria</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
            {products.map((product) => (
              <ProductCard
                key={product._id}
                product={product}
                onOrderNow={handleOrderNow}
              />
            ))}
          </div>

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="flex justify-center">
              <div className="flex space-x-2">
                <button
                  onClick={() => handlePageChange(pagination.currentPage - 1)}
                  disabled={pagination.currentPage === 1}
                  className="btn btn-outline btn-sm disabled:opacity-50"
                >
                  Previous
                </button>
                
                {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map(page => (
                  <button
                    key={page}
                    onClick={() => handlePageChange(page)}
                    className={`btn btn-sm ${
                      page === pagination.currentPage ? 'btn-primary' : 'btn-outline'
                    }`}
                  >
                    {page}
                  </button>
                ))}
                
                <button
                  onClick={() => handlePageChange(pagination.currentPage + 1)}
                  disabled={pagination.currentPage === pagination.totalPages}
                  className="btn btn-outline btn-sm disabled:opacity-50"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </>
      )}

      {/* User Notification Panel */}
      <UserNotificationPanel 
        isOpen={isNotificationOpen} 
        onClose={() => setIsNotificationOpen(false)} 
      />
    </div>
  );
};

export default CustomerProducts;