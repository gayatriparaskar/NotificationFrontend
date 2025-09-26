import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from 'react-query';
import { productsAPI, ordersAPI } from '../utils/api';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'react-toastify';
import { Clock, DollarSign, MapPin, Star, Calendar, User, ArrowLeft } from 'lucide-react';

const ServiceDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');

  const { data: serviceData, isLoading: serviceLoading } = useQuery(
    ['product', id],
    () => productsAPI.getById(id),
    {
      enabled: !!id
    }
  );

  // Note: Availability checking is not needed for products, they are always available if in stock
  const availabilityData = { available: true };
  const availabilityLoading = false;

  const handleBookNow = () => {
    if (!isAuthenticated) {
      toast.error('Please login to order this product');
      navigate('/login');
      return;
    }

    if (!selectedDate) {
      toast.error('Please select quantity');
      return;
    }

    navigate(`/checkout?product=${id}&quantity=${selectedDate}`);
  };

  if (serviceLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="spinner"></div>
      </div>
    );
  }

  const product = serviceData?.data?.product;
  const availableSlots = availabilityData?.data?.availableSlots || [];

  if (!product) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Product Not Found</h2>
        <p className="text-gray-600">The product you're looking for doesn't exist.</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <button
        onClick={() => navigate(-1)}
        className="flex items-center text-gray-600 hover:text-gray-900 mb-6"
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back to Products
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Product Details */}
        <div className="lg:col-span-2">
          <div className="card">
            <div className="card-content">
              <div className="flex items-start justify-between mb-6">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 mb-2">
                    {product.name}
                  </h1>
                  <span className="badge badge-primary text-sm">
                    {product.category?.replace('_', ' ')}
                  </span>
                </div>
                <div className="text-right">
                  <div className="text-3xl font-bold text-primary-600">
                    ${product.price}
                  </div>
                  <div className="text-sm text-gray-500">per snack</div>
                </div>
              </div>

              <div className="flex items-center text-gray-600 mb-6">
                <Clock className="h-5 w-5 mr-2" />
                <span className="mr-6">{product.species}</span>
                <User className="h-5 w-5 mr-2" />
                <span>{product.morph}</span>
              </div>

              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Description</h3>
                <p className="text-gray-600 leading-relaxed">
                  {product.description}
                </p>
              </div>

              {product.features && product.features.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Features</h3>
                  <ul className="list-disc list-inside text-gray-600 space-y-1">
                    {product.features.map((feature, index) => (
                      <li key={index}>{feature}</li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Product Information</h3>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="flex items-center mb-2">
                    <User className="h-5 w-5 mr-2 text-gray-400" />
                    <span className="font-medium">Age: {product.age} months</span>
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <MapPin className="h-4 w-4 mr-2" />
                    <span>Stock: {product.stock} available</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Order Section */}
        <div className="lg:col-span-1">
          <div className="card sticky top-8">
            <div className="card-header">
              <h3 className="text-xl font-semibold text-gray-900">Order This Product</h3>
            </div>
            <div className="card-content space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Quantity
                </label>
                <input
                  type="number"
                  min="1"
                  max={product.stock}
                  value={selectedDate || 1}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="input"
                />
                <p className="text-sm text-gray-500 mt-1">
                  {product.stock} available in stock
                </p>
              </div>

              <button
                onClick={handleBookNow}
                disabled={!selectedDate}
                className="btn btn-primary btn-lg w-full disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Calendar className="h-4 w-4 mr-2" />
                Order Now
              </button>

              <div className="text-xs text-gray-500 text-center">
                You will be redirected to complete your order
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ServiceDetail;