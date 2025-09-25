import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation } from 'react-query';
import { ordersAPI } from '../utils/api';
import { useAuth } from '../contexts/AuthContext';
import { useCart } from '../contexts/CartContext';
import { toast } from 'react-toastify';
import { CreditCard, Truck, Shield, ArrowLeft } from 'lucide-react';

const Checkout = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { cartItems, clearCart } = useCart();
  const [formData, setFormData] = useState({
    shippingAddress: {
      street: user?.address?.street || '',
      city: user?.address?.city || '',
      state: user?.address?.state || '',
      zipCode: user?.address?.zipCode || '',
      country: user?.address?.country || 'USA',
      phone: user?.phone || ''
    },
    billingAddress: {
      sameAsShipping: true,
      street: '',
      city: '',
      state: '',
      zipCode: '',
      country: 'USA'
    },
    paymentMethod: 'card',
    notes: ''
  });

  const createOrderMutation = useMutation(
    (orderData) => ordersAPI.create(orderData),
    {
      onSuccess: (response) => {
        toast.success('Order placed successfully!');
        clearCart(); // Clear cart after successful order
        navigate('/my-orders');
      },
      onError: (error) => {
        toast.error(error.response?.data?.message || 'Failed to place order');
      }
    }
  );

  // Redirect if cart is empty
  if (cartItems.length === 0) {
    navigate('/cart');
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Your cart is empty</h2>
          <p className="text-gray-600 mb-4">Redirecting to cart...</p>
          <div className="spinner"></div>
        </div>
      </div>
    );
  }

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (name.startsWith('shippingAddress.')) {
      const field = name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        shippingAddress: {
          ...prev.shippingAddress,
          [field]: value
        }
      }));
    } else if (name.startsWith('billingAddress.')) {
      const field = name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        billingAddress: {
          ...prev.billingAddress,
          [field]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: type === 'checkbox' ? checked : value
      }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Validate cart items have proper product data
    const invalidItems = cartItems.filter(item => !item.product || !item.product._id);
    if (invalidItems.length > 0) {
      toast.error('Some cart items are invalid. Please refresh and try again.');
      return;
    }
    
    // Format cart items for API
    const formattedItems = cartItems.map(item => ({
      productId: item.product._id, // Backend expects 'productId', not 'product'
      quantity: item.quantity,
      price: item.product.price
    }));
    
    const orderData = {
      items: formattedItems,
      shippingAddress: formData.shippingAddress,
      billingAddress: formData.billingAddress.sameAsShipping 
        ? formData.shippingAddress 
        : formData.billingAddress,
      paymentMethod: formData.paymentMethod,
      notes: formData.notes
    };

    createOrderMutation.mutate(orderData);
  };

  const subtotal = cartItems.reduce((total, item) => total + (item.product.price * item.quantity), 0);
  const shipping = subtotal > 100 ? 0 : 25;
  const tax = subtotal * 0.08;
  const total = subtotal + shipping + tax;

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex items-center mb-8">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center text-gray-600 hover:text-gray-900 mr-6"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </button>
        <h1 className="text-3xl font-bold text-gray-900">Checkout</h1>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Checkout Form */}
        <div className="lg:col-span-2 space-y-8">
          {/* Shipping Address */}
          <div className="card">
            <div className="card-header">
              <h2 className="text-xl font-semibold text-gray-900 flex items-center">
                <Truck className="h-5 w-5 mr-2" />
                Shipping Address
              </h2>
            </div>
            <div className="card-content">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Street Address
                  </label>
                  <input
                    type="text"
                    name="shippingAddress.street"
                    value={formData.shippingAddress.street}
                    onChange={handleChange}
                    required
                    className="input"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    City
                  </label>
                  <input
                    type="text"
                    name="shippingAddress.city"
                    value={formData.shippingAddress.city}
                    onChange={handleChange}
                    required
                    className="input"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    State
                  </label>
                  <input
                    type="text"
                    name="shippingAddress.state"
                    value={formData.shippingAddress.state}
                    onChange={handleChange}
                    required
                    className="input"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    ZIP Code
                  </label>
                  <input
                    type="text"
                    name="shippingAddress.zipCode"
                    value={formData.shippingAddress.zipCode}
                    onChange={handleChange}
                    required
                    className="input"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Country
                  </label>
                  <select
                    name="shippingAddress.country"
                    value={formData.shippingAddress.country}
                    onChange={handleChange}
                    className="input"
                  >
                    <option value="USA">United States</option>
                    <option value="Canada">Canada</option>
                    <option value="Mexico">Mexico</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Phone
                  </label>
                  <input
                    type="tel"
                    name="shippingAddress.phone"
                    value={formData.shippingAddress.phone}
                    onChange={handleChange}
                    required
                    className="input"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Billing Address */}
          <div className="card">
            <div className="card-header">
              <h2 className="text-xl font-semibold text-gray-900 flex items-center">
                <CreditCard className="h-5 w-5 mr-2" />
                Billing Address
              </h2>
            </div>
            <div className="card-content">
              <div className="mb-4">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    name="billingAddress.sameAsShipping"
                    checked={formData.billingAddress.sameAsShipping}
                    onChange={handleChange}
                    className="mr-2"
                  />
                  <span className="text-sm text-gray-700">Same as shipping address</span>
                </label>
              </div>

              {!formData.billingAddress.sameAsShipping && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Street Address
                    </label>
                    <input
                      type="text"
                      name="billingAddress.street"
                      value={formData.billingAddress.street}
                      onChange={handleChange}
                      className="input"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      City
                    </label>
                    <input
                      type="text"
                      name="billingAddress.city"
                      value={formData.billingAddress.city}
                      onChange={handleChange}
                      className="input"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      State
                    </label>
                    <input
                      type="text"
                      name="billingAddress.state"
                      value={formData.billingAddress.state}
                      onChange={handleChange}
                      className="input"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      ZIP Code
                    </label>
                    <input
                      type="text"
                      name="billingAddress.zipCode"
                      value={formData.billingAddress.zipCode}
                      onChange={handleChange}
                      className="input"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Country
                    </label>
                    <select
                      name="billingAddress.country"
                      value={formData.billingAddress.country}
                      onChange={handleChange}
                      className="input"
                    >
                      <option value="USA">United States</option>
                      <option value="Canada">Canada</option>
                      <option value="Mexico">Mexico</option>
                    </select>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Payment Method */}
          <div className="card">
            <div className="card-header">
              <h2 className="text-xl font-semibold text-gray-900">Payment Method</h2>
            </div>
            <div className="card-content">
              <div className="space-y-4">
                <div className="flex items-center">
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="card"
                    checked={formData.paymentMethod === 'card'}
                    onChange={handleChange}
                    className="mr-3"
                  />
                  <span className="text-sm text-gray-700">Credit/Debit Card</span>
                </div>
                <div className="flex items-center">
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="bank_transfer"
                    checked={formData.paymentMethod === 'bank_transfer'}
                    onChange={handleChange}
                    className="mr-3"
                  />
                  <span className="text-sm text-gray-700">Bank Transfer</span>
                </div>
                <div className="flex items-center">
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="cash"
                    checked={formData.paymentMethod === 'cash'}
                    onChange={handleChange}
                    className="mr-3"
                  />
                  <span className="text-sm text-gray-700">Cash on Delivery</span>
                </div>
              </div>
            </div>
          </div>

          {/* Order Notes */}
          <div className="card">
            <div className="card-header">
              <h2 className="text-xl font-semibold text-gray-900">Order Notes</h2>
            </div>
            <div className="card-content">
              <textarea
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                rows={4}
                placeholder="Any special instructions for your order..."
                className="input"
              />
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
              {/* Cart Items */}
              <div className="space-y-3 mb-6">
                {cartItems.map((item) => (
                  <div key={item.product._id} className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                      <img
                        src="https://via.placeholder.com/100x100"
                        alt={item.product.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-medium text-gray-900 truncate">
                        {item.product.name}
                      </h4>
                      <p className="text-sm text-gray-500">Qty: {item.quantity}</p>
                    </div>
                    <div className="text-sm font-medium text-gray-900">
                      ${(item.product.price * item.quantity).toFixed(2)}
                    </div>
                  </div>
                ))}
              </div>

              <div className="space-y-4">
                <div className="flex justify-between text-sm">
                  <span>Subtotal</span>
                  <span>${subtotal.toFixed(2)}</span>
                </div>
                
                <div className="flex justify-between text-sm">
                  <span>Shipping</span>
                  <span>{shipping === 0 ? 'Free' : `$${shipping}`}</span>
                </div>
                
                <div className="flex justify-between text-sm">
                  <span>Tax</span>
                  <span>${tax.toFixed(2)}</span>
                </div>
                
                <div className="border-t pt-4">
                  <div className="flex justify-between text-lg font-bold">
                    <span>Total</span>
                    <span>${total.toFixed(2)}</span>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={createOrderMutation.isLoading}
                  className="btn btn-primary btn-lg w-full"
                >
                  {createOrderMutation.isLoading ? (
                    <div className="flex items-center justify-center">
                      <div className="spinner mr-2"></div>
                      Placing Order...
                    </div>
                  ) : (
                    'Place Order'
                  )}
                </button>

                <div className="flex items-center text-xs text-gray-500">
                  <Shield className="h-4 w-4 mr-2" />
                  <span>Secure checkout protected by SSL</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};

export default Checkout;