import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ShoppingCart, Eye, Star, Package, X } from 'lucide-react';

const ProductCard = ({ product, onOrderNow }) => {
  const [showOrderForm, setShowOrderForm] = useState(false);
  const [quantity, setQuantity] = useState(1);

  const handleOrderNow = () => {
    setShowOrderForm(true);
  };

  const handleConfirmOrder = () => {
    onOrderNow(product, quantity);
    setShowOrderForm(false);
    setQuantity(1);
  };

  const handleCancelOrder = () => {
    setShowOrderForm(false);
    setQuantity(1);
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(price);
  };

  const getStockStatus = (stock) => {
    if (stock === 0) return { text: 'Out of Stock', color: 'text-red-600' };
    if (stock < 5) return { text: 'Low Stock', color: 'text-orange-600' };
    return { text: 'In Stock', color: 'text-green-600' };
  };

  const stockStatus = getStockStatus(product.stock);

  return (
    <>
      <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 overflow-hidden">
        {/* Product Image */}
        <div className="relative h-48 bg-gray-200">
          {product.images && product.images.length > 0 ? (
            <img
              src={product.images[0].url}
              alt={product.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <Package className="h-16 w-16 text-gray-400" />
            </div>
          )}
          
          {/* Stock Badge */}
          <div className="absolute top-2 right-2">
            <span className={`px-2 py-1 rounded-full text-xs font-medium bg-white ${stockStatus.color}`}>
              {stockStatus.text}
            </span>
          </div>

          {/* Quick Actions */}
          <div className="absolute top-2 left-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <button className="p-2 bg-white rounded-full shadow-md hover:bg-gray-50">
              <Star className="h-4 w-4 text-gray-600" />
            </button>
          </div>
        </div>

        {/* Product Info */}
        <div className="p-4">
          <div className="mb-2">
            <h3 className="text-lg font-semibold text-gray-900 line-clamp-1">
              {product.name}
            </h3>
            <p className="text-sm text-gray-600">
              {product.species} • {product.morph}
            </p>
          </div>

          <div className="mb-3">
            <p className="text-sm text-gray-700 line-clamp-2">
              {product.description}
            </p>
          </div>

          {/* Product Details */}
          <div className="mb-3 space-y-1">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Age:</span>
              <span className="text-gray-900 capitalize">{product.age}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Size:</span>
              <span className="text-gray-900">{product.size?.length}" {product.size?.unit}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Stock:</span>
              <span className={stockStatus.color}>{product.stock} available</span>
            </div>
          </div>

          {/* Price */}
          <div className="mb-4">
            <div className="flex items-center justify-between">
              <span className="text-2xl font-bold text-primary-600">
                {formatPrice(product.price)}
              </span>
              {product.shipping?.available && (
                <span className="text-sm text-gray-600">
                  +{formatPrice(product.shipping.cost)} shipping
                </span>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex space-x-2">
            <Link
              to={`/products/${product._id}`}
              className="flex-1 btn btn-outline btn-sm flex items-center justify-center"
            >
              <Eye className="h-4 w-4 mr-2" />
              View Details
            </Link>
            <button
              onClick={handleOrderNow}
              disabled={product.stock === 0}
              className="flex-1 btn btn-primary btn-sm flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ShoppingCart className="h-4 w-4 mr-2" />
              Order Now
            </button>
          </div>
        </div>
      </div>

      {/* Order Form Modal */}
      {showOrderForm && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          <div className="absolute inset-0 bg-black bg-opacity-50" onClick={handleCancelOrder} />
          
          <div className="absolute inset-0 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">Place Order</h3>
                  <button
                    onClick={handleCancelOrder}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>

                {/* Product Info */}
                <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    {product.images && product.images.length > 0 ? (
                      <img
                        src={product.images[0].url}
                        alt={product.name}
                        className="w-16 h-16 object-cover rounded-lg"
                      />
                    ) : (
                      <div className="w-16 h-16 bg-gray-200 rounded-lg flex items-center justify-center">
                        <Package className="h-8 w-8 text-gray-400" />
                      </div>
                    )}
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900">{product.name}</h4>
                      <p className="text-sm text-gray-600">{product.species} • {product.morph}</p>
                      <p className="text-lg font-bold text-primary-600">
                        {formatPrice(product.price)}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Quantity Selection */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Quantity
                  </label>
                  <div className="flex items-center space-x-3">
                    <button
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="btn btn-outline btn-sm"
                      disabled={quantity <= 1}
                    >
                      -
                    </button>
                    <span className="text-lg font-medium w-12 text-center">{quantity}</span>
                    <button
                      onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                      className="btn btn-outline btn-sm"
                      disabled={quantity >= product.stock}
                    >
                      +
                    </button>
                  </div>
                  <p className="text-sm text-gray-600 mt-1">
                    {product.stock} available in stock
                  </p>
                </div>

                {/* Order Summary */}
                <div className="mb-6 p-4 bg-primary-50 rounded-lg">
                  <div className="flex justify-between text-sm mb-2">
                    <span>Price per unit:</span>
                    <span>{formatPrice(product.price)}</span>
                  </div>
                  <div className="flex justify-between text-sm mb-2">
                    <span>Quantity:</span>
                    <span>{quantity}</span>
                  </div>
                  <div className="flex justify-between text-sm mb-2">
                    <span>Subtotal:</span>
                    <span>{formatPrice(product.price * quantity)}</span>
                  </div>
                  {product.shipping?.available && (
                    <div className="flex justify-between text-sm mb-2">
                      <span>Shipping:</span>
                      <span>{formatPrice(product.shipping.cost)}</span>
                    </div>
                  )}
                  <div className="border-t pt-2">
                    <div className="flex justify-between font-semibold">
                      <span>Total:</span>
                      <span className="text-primary-600">
                        {formatPrice((product.price * quantity) + (product.shipping?.cost || 0))}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex space-x-3">
                  <button
                    onClick={handleCancelOrder}
                    className="flex-1 btn btn-outline"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleConfirmOrder}
                    className="flex-1 btn btn-primary"
                  >
                    Confirm Order
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ProductCard;