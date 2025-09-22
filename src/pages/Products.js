import React, { useState } from 'react';
import { useQuery } from 'react-query';
import { Link } from 'react-router-dom';
import { productsAPI } from '../utils/api';
import { Search, Star, ShoppingCart, Eye, DollarSign } from 'lucide-react';

const Products = () => {
  const [filters, setFilters] = useState({
    search: '',
    category: '',
    minPrice: '',
    maxPrice: '',
    age: '',
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

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Our Snake Collection</h1>
        <p className="text-gray-600">Discover and purchase beautiful snakes from our collection</p>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border p-6 mb-8">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Search
            </label>
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

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Category
            </label>
            <select
              value={filters.category}
              onChange={(e) => handleFilterChange('category', e.target.value)}
              className="input"
            >
              <option value="">All Categories</option>
              <option value="ball_python">Ball Python</option>
              <option value="corn_snake">Corn Snake</option>
              <option value="king_snake">King Snake</option>
              <option value="milk_snake">Milk Snake</option>
              <option value="boa_constrictor">Boa Constrictor</option>
              <option value="python">Python</option>
              <option value="other">Other</option>
            </select>
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
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Age
            </label>
            <select
              value={filters.age || ''}
              onChange={(e) => handleFilterChange('age', e.target.value)}
              className="input"
            >
              <option value="">All Ages</option>
              <option value="hatchling">Hatchling</option>
              <option value="juvenile">Juvenile</option>
              <option value="sub_adult">Sub Adult</option>
              <option value="adult">Adult</option>
            </select>
          </div>
        </div>
      </div>

      {/* Products Grid */}
      {products.length === 0 ? (
        <div className="text-center py-12">
          <h3 className="text-xl font-semibold text-gray-900 mb-2">No Snakes Found</h3>
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
                    <span className="badge badge-primary">
                      {product.category.replace('_', ' ')}
                    </span>
                  </div>

                  <p className="text-gray-600 mb-4 line-clamp-3">
                    {product.description}
                  </p>

                  <div className="flex items-center text-sm text-gray-500 mb-2">
                    <span className="font-medium">Species:</span>
                    <span className="ml-1">{product.species}</span>
                  </div>

                  <div className="flex items-center text-sm text-gray-500 mb-2">
                    <span className="font-medium">Morph:</span>
                    <span className="ml-1">{product.morph}</span>
                  </div>

                  <div className="flex items-center text-sm text-gray-500 mb-2">
                    <span className="font-medium">Age:</span>
                    <span className="ml-1 capitalize">{product.age}</span>
                  </div>

                  <div className="flex items-center text-sm text-gray-500 mb-4">
                    <span className="font-medium">Size:</span>
                    <span className="ml-1">{product.size.length}" {product.size.unit}</span>
                    <DollarSign className="h-4 w-4 ml-4 mr-1" />
                    <span className="font-semibold text-gray-900">${product.price}</span>
                  </div>

                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center">
                      <span className={`badge ${product.stock > 0 ? 'badge-success' : 'badge-danger'}`}>
                        {product.stock > 0 ? `In Stock (${product.stock})` : 'Out of Stock'}
                      </span>
                    </div>
                    <div className="flex items-center">
                      <Star className="h-4 w-4 text-yellow-400 fill-current" />
                      <span className="ml-1 text-sm text-gray-600">4.8</span>
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
                      className="btn btn-primary btn-sm"
                      disabled={product.stock === 0}
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