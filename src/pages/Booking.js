import React, { useState } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation } from 'react-query';
import { productsAPI, ordersAPI } from '../utils/api';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'react-toastify';
import { Calendar, Clock, DollarSign, User, ArrowLeft } from 'lucide-react';

const Booking = () => {
  const { productId } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [formData, setFormData] = useState({
    quantity: searchParams.get('quantity') || 1,
    notes: ''
  });

  const { data: productData, isLoading: productLoading } = useQuery(
    ['product', productId],
    () => productsAPI.getById(productId),
    {
      enabled: !!productId
    }
  );

  const createOrderMutation = useMutation(
    (orderData) => ordersAPI.create(orderData),
    {
      onSuccess: (response) => {
        toast.success('Order created successfully!');
        navigate('/my-orders');
      },
      onError: (error) => {
        toast.error(error.response?.data?.message || 'Failed to create order');
      }
    }
  );

  const product = productData?.data?.product;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSpecialRequestChange = (e) => {
    const value = e.target.value;
    if (value && !formData.specialRequests.includes(value)) {
      setFormData(prev => ({
        ...prev,
        specialRequests: [...prev.specialRequests, value]
      }));
      e.target.value = '';
    }
  };

  const removeSpecialRequest = (index) => {
    setFormData(prev => ({
      ...prev,
      specialRequests: prev.specialRequests.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!formData.quantity) {
      toast.error('Please select quantity');
      return;
    }

    const orderData = {
      items: [{
        product: productId,
        quantity: parseInt(formData.quantity),
        price: product.price
      }],
      notes: formData.notes
    };

    createOrderMutation.mutate(orderData);
  };

  if (productLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="spinner"></div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Product Not Found</h2>
        <p className="text-gray-600">The product you're trying to order doesn't exist.</p>
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
        Back
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Order Form */}
        <div className="lg:col-span-2">
          <div className="card">
            <div className="card-header">
              <h2 className="text-2xl font-bold text-gray-900">Complete Your Order</h2>
            </div>
            <div className="card-content">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Quantity *
                  </label>
                  <input
                    type="number"
                    name="quantity"
                    value={formData.quantity}
                    onChange={handleChange}
                    min="1"
                    max={product.stock}
                    required
                    className="input"
                  />
                  <p className="text-sm text-gray-500 mt-1">
                    {product.stock} available in stock
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Additional Notes
                  </label>
                  <textarea
                    name="notes"
                    value={formData.notes}
                    onChange={handleChange}
                    rows={4}
                    placeholder="Any additional notes for your order..."
                    className="input"
                  />
                </div>

                <button
                  type="submit"
                  disabled={createOrderMutation.isLoading}
                  className="btn btn-primary btn-lg w-full"
                >
                  {createOrderMutation.isLoading ? (
                    <div className="flex items-center justify-center">
                      <div className="spinner mr-2"></div>
                      Creating Order...
                    </div>
                  ) : (
                    'Confirm Order'
                  )}
                </button>
              </form>
            </div>
          </div>
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-1">
          <div className="card sticky top-8">
            <div className="card-header">
              <h3 className="text-lg font-semibold text-gray-900">Order Summary</h3>
            </div>
            <div className="card-content">
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium text-gray-900">{product.name}</h4>
                  <p className="text-sm text-gray-600">{product.category?.replace('_', ' ')}</p>
                </div>

                <div className="flex items-center text-sm text-gray-600">
                  <Clock className="h-4 w-4 mr-2" />
                  <span>{product.species}</span>
                </div>

                <div className="flex items-center text-sm text-gray-600">
                  <User className="h-4 w-4 mr-2" />
                  <span>{product.morph}</span>
                </div>

                <div className="flex items-center text-sm text-gray-600">
                  <Calendar className="h-4 w-4 mr-2" />
                  <span>Age: {product.age} months</span>
                </div>

                <div className="flex items-center text-sm text-gray-600">
                  <Clock className="h-4 w-4 mr-2" />
                  <span>Quantity: {formData.quantity}</span>
                </div>

                <div className="border-t pt-4">
                  <div className="flex justify-between items-center">
                    <span className="font-medium text-gray-900">Total Amount</span>
                    <div className="flex items-center">
                      <DollarSign className="h-4 w-4 mr-1" />
                      <span className="text-xl font-bold text-primary-600">
                        ${(product.price * formData.quantity).toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Booking;