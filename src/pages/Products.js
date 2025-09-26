import React, { useState } from 'react';
import { useQuery } from 'react-query';
import { Link } from 'react-router-dom';
import { productsAPI } from '../utils/api';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'react-toastify';
import { Search, ShoppingCart, Eye } from 'lucide-react';

const Products = () => {
  const { addToCart } = useCart();
  const { isAuthenticated } = useAuth();
  const [filters, setFilters] = useState({
    search: '',
    minPrice: '',
    maxPrice: '',
    page: 1
  });

  const { data, isLoading, error } = useQuery(
    ['products', filters],
    () => productsAPI.getAll(filters),
    {
      keepPreviousData: true
    }
  );

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

  const handleAddToCart = (product) => {
    if (!isAuthenticated) {
      toast.error('Please login to add items to cart');
      return;
    }

    if (product.quantity === 0) {
      toast.error('This product is out of stock');
      return;
    }

    addToCart(product, 1);
    toast.success(`${product.name} added to cart!`);
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

  const products = data?.data?.data?.products || [];
  const pagination = data?.data?.data?.pagination || {};

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Our Snacks Collection</h1>
        <p className="text-gray-600">Discover and purchase delicious snacks from our collection</p>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border p-6 mb-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Search
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search products..."
                value={filters.search}
                onChange={(e) => handleFilterChange('search', e.target.value)}
                className="input pl-10"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Min Price
            </label>
            <input
              type="number"
              placeholder="Min price"
              value={filters.minPrice}
              onChange={(e) => handleFilterChange('minPrice', e.target.value)}
              className="input"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Max Price
            </label>
            <input
              type="number"
              placeholder="Max price"
              value={filters.maxPrice}
              onChange={(e) => handleFilterChange('maxPrice', e.target.value)}
              className="input"
            />
          </div>
        </div>
      </div>

      {/* Products Grid */}
      {products.length === 0 ? (
        <div className="text-center py-12">
          <h3 className="text-xl font-semibold text-gray-900 mb-2">No Products Found</h3>
          <p className="text-gray-600">Try adjusting your search criteria.</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {products.map((product) => (
              <div key={product._id} className="card hover:shadow-lg transition-shadow">
                <div className="card-content">
                  <div className="flex items-start justify-between mb-4">
                    <h3 className="text-xl font-semibold text-gray-900">
                      {product.name}
                    </h3>
                  </div>

                  <p className="text-gray-600 mb-4 line-clamp-3">
                    {product.description}
                  </p>

                  <div className="space-y-2 mb-4">
                    {product.offerPrice && product.offerPrice < product.price ? (
                      <div className="flex items-center space-x-2">
                        <span className="text-2xl font-bold text-primary-600">
                          ${product.offerPrice}
                        </span>
                        <span className="text-lg text-gray-500 line-through">
                          ${product.price}
                        </span>
                        <span className="badge badge-success">
                          {Math.round(((product.price - product.offerPrice) / product.price) * 100)}% OFF
                        </span>
                      </div>
                    ) : (
                      <div className="text-2xl font-bold text-primary-600">
                        ${product.price}
                      </div>
                    )}
                  </div>

                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center">
                      <span className={`badge ${product.quantity > 0 ? 'badge-success' : 'badge-danger'}`}>
                        {product.quantity > 0 ? `In Stock (${product.quantity})` : 'Out of Stock'}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <Link
                      to={`/products/${product._id}`}
                      className="btn btn-outline btn-sm"
                    >
                      <Eye className="h-4 w-4 mr-1" />
                      View Details
                    </Link>
                        <button
                          onClick={() => handleAddToCart(product)}
                          className="btn btn-primary btn-sm"
                          disabled={product.quantity === 0}
                        >
                          <ShoppingCart className="h-4 w-4 mr-1" />
                          Add to Cart
                        </button>
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
                  onClick={() => handlePageChange(pagination.currentPage - 1)}
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
                      onClick={() => handlePageChange(page)}
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
                  onClick={() => handlePageChange(pagination.currentPage + 1)}
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

export default Products;