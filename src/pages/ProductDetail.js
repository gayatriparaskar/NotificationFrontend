import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from 'react-query';
import { productsAPI } from '../utils/api';
import { useAuth } from '../contexts/AuthContext';
import { useCart } from '../contexts/CartContext';
import { toast } from 'react-toastify';
import { ArrowLeft, ShoppingCart, Heart, Share2, Package } from 'lucide-react';

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { addToCart } = useCart();
  const [quantity, setQuantity] = useState(1);

  const { data: productData, isLoading } = useQuery(
    ['product', id],
    () => productsAPI.getById(id),
    {
      enabled: !!id
    }
  );

  const product = productData?.data?.product;

  const handleAddToCart = () => {
    if (!isAuthenticated) {
      toast.error('Please login to add items to cart');
      navigate('/login');
      return;
    }

    if (quantity > product.quantity) {
      toast.error('Not enough stock available');
      return;
    }

    addToCart(product, quantity);
    toast.success(`${quantity} ${product.name} added to cart!`);
  };

  const handleBuyNow = () => {
    if (!isAuthenticated) {
      toast.error('Please login to purchase');
      navigate('/login');
      return;
    }

    if (quantity > product.quantity) {
      toast.error('Not enough stock available');
      return;
    }

    // Navigate to checkout with this product
    navigate('/checkout', { state: { items: [{ productId: product._id, quantity }] } });
  };

  if (isLoading) {
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
        <p className="text-gray-600">The product you're looking for doesn't exist.</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto">
      <button
        onClick={() => navigate(-1)}
        className="flex items-center text-gray-600 hover:text-gray-900 mb-6"
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back to Products
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Product Image */}
        <div className="space-y-4">
          <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
            <img
              src="https://via.placeholder.com/500x500"
              alt={product.name}
              className="w-full h-full object-cover"
            />
          </div>
        </div>

        {/* Product Details */}
        <div className="space-y-6">
          <div>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center space-x-2">
                <button className="p-2 text-gray-400 hover:text-red-500">
                  <Heart className="h-5 w-5" />
                </button>
                <button className="p-2 text-gray-400 hover:text-blue-500">
                  <Share2 className="h-5 w-5" />
                </button>
              </div>
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">{product.name}</h1>
            <div className="flex items-center space-x-4 text-sm text-gray-600">
              <div className="flex items-center">
                <Package className="h-4 w-4" />
                <span className="ml-1">{product.quantity} in stock</span>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            {product.offerPrice && product.offerPrice < product.price ? (
              <div className="flex items-center space-x-3">
                <span className="text-3xl font-bold text-primary-600">
                  ${product.offerPrice}
                </span>
                <span className="text-xl text-gray-500 line-through">
                  ${product.price}
                </span>
                <span className="badge badge-success">
                  {Math.round(((product.price - product.offerPrice) / product.price) * 100)}% OFF
                </span>
              </div>
            ) : (
              <div className="text-3xl font-bold text-primary-600">
                ${product.price}
              </div>
            )}
          </div>

          <div className="space-y-4">
            <div className="grid grid-cols-1 gap-4 text-sm">
              <div>
                <span className="font-medium text-gray-700">Quantity Available:</span>
                <span className={`ml-2 ${product.quantity > 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {product.quantity > 0 ? `${product.quantity} available` : 'Out of stock'}
                </span>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">Description</h3>
            <p className="text-gray-600 leading-relaxed">{product.description}</p>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">Purchase Options</h3>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <label className="text-sm font-medium text-gray-700">Quantity:</label>
                <select
                  value={quantity}
                  onChange={(e) => setQuantity(parseInt(e.target.value))}
                  className="input w-20"
                  disabled={product.quantity === 0}
                >
                  {[...Array(Math.min(product.quantity, 10))].map((_, i) => (
                    <option key={i + 1} value={i + 1}>{i + 1}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex space-x-4">
              <button
                onClick={handleAddToCart}
                disabled={product.quantity === 0}
                className="btn btn-outline btn-lg flex-1 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ShoppingCart className="h-5 w-5 mr-2" />
                Add to Cart
              </button>
              <button
                onClick={handleBuyNow}
                disabled={product.quantity === 0}
                className="btn btn-primary btn-lg flex-1 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Buy Now
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;