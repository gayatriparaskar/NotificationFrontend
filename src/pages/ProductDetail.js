import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from 'react-query';
import { productsAPI } from '../utils/api';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'react-toastify';
import { ArrowLeft, ShoppingCart, Heart, Share2, Star, Package, Truck, Shield } from 'lucide-react';

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
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

    if (quantity > product.stock) {
      toast.error('Not enough stock available');
      return;
    }

    // Add to cart logic here
    toast.success(`${quantity} ${product.name} added to cart!`);
  };

  const handleBuyNow = () => {
    if (!isAuthenticated) {
      toast.error('Please login to purchase');
      navigate('/login');
      return;
    }

    if (quantity > product.stock) {
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
        {/* Product Images */}
        <div className="space-y-4">
          <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
            <img
              src={product.images?.[0]?.url || 'https://via.placeholder.com/500x500'}
              alt={product.images?.[0]?.alt || product.name}
              className="w-full h-full object-cover"
            />
          </div>
          {product.images && product.images.length > 1 && (
            <div className="grid grid-cols-4 gap-2">
              {product.images.slice(1, 5).map((image, index) => (
                <div key={index} className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
                  <img
                    src={image.url}
                    alt={image.alt}
                    className="w-full h-full object-cover"
                  />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Product Details */}
        <div className="space-y-6">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="badge badge-primary text-sm">
                {product.category.replace('_', ' ')}
              </span>
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
                <Star className="h-4 w-4 text-yellow-400 fill-current" />
                <span className="ml-1">4.8 (24 reviews)</span>
              </div>
              <div className="flex items-center">
                <Package className="h-4 w-4" />
                <span className="ml-1">{product.stock} in stock</span>
              </div>
            </div>
          </div>

          <div className="text-3xl font-bold text-primary-600">
            ${product.price}
          </div>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="font-medium text-gray-700">Species:</span>
                <span className="ml-2 text-gray-600">{product.species}</span>
              </div>
              <div>
                <span className="font-medium text-gray-700">Morph:</span>
                <span className="ml-2 text-gray-600">{product.morph}</span>
              </div>
              <div>
                <span className="font-medium text-gray-700">Age:</span>
                <span className="ml-2 text-gray-600 capitalize">{product.age}</span>
              </div>
              <div>
                <span className="font-medium text-gray-700">Size:</span>
                <span className="ml-2 text-gray-600">{product.size.length}" {product.size.unit}</span>
              </div>
              <div>
                <span className="font-medium text-gray-700">Weight:</span>
                <span className="ml-2 text-gray-600">{product.weight}g</span>
              </div>
              <div>
                <span className="font-medium text-gray-700">Stock:</span>
                <span className={`ml-2 ${product.stock > 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {product.stock > 0 ? `${product.stock} available` : 'Out of stock'}
                </span>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">Description</h3>
            <p className="text-gray-600 leading-relaxed">{product.description}</p>
          </div>

          {product.features && product.features.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">Features</h3>
              <ul className="list-disc list-inside text-gray-600 space-y-1">
                {product.features.map((feature, index) => (
                  <li key={index}>{feature}</li>
                ))}
              </ul>
            </div>
          )}

          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">Care Instructions</h3>
            <div className="bg-gray-50 p-4 rounded-lg space-y-2">
              <div className="flex justify-between">
                <span className="font-medium">Temperature:</span>
                <span>{product.careInstructions.temperature.hot} - {product.careInstructions.temperature.cool}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">Humidity:</span>
                <span>{product.careInstructions.humidity}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">Feeding:</span>
                <span>{product.careInstructions.feeding}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">Housing:</span>
                <span>{product.careInstructions.housing}</span>
              </div>
            </div>
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
                  disabled={product.stock === 0}
                >
                  {[...Array(Math.min(product.stock, 10))].map((_, i) => (
                    <option key={i + 1} value={i + 1}>{i + 1}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex space-x-4">
              <button
                onClick={handleAddToCart}
                disabled={product.stock === 0}
                className="btn btn-outline btn-lg flex-1 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ShoppingCart className="h-5 w-5 mr-2" />
                Add to Cart
              </button>
              <button
                onClick={handleBuyNow}
                disabled={product.stock === 0}
                className="btn btn-primary btn-lg flex-1 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Buy Now
              </button>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">Shipping & Guarantee</h3>
            <div className="space-y-2 text-sm text-gray-600">
              <div className="flex items-center">
                <Truck className="h-4 w-4 mr-2" />
                <span>Shipping: ${product.shipping.cost} (${product.shipping.estimatedDays} days)</span>
              </div>
              <div className="flex items-center">
                <Shield className="h-4 w-4 mr-2" />
                <span>{product.healthGuarantee}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;