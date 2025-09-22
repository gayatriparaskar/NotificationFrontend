import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useQuery } from 'react-query';
import { productsAPI } from '../utils/api';
import { Calendar, Clock, DollarSign, TrendingUp, Users, Star, ShoppingCart, Eye } from 'lucide-react';

const Dashboard = () => {
  const { user, isAdmin, loading } = useAuth();
  const navigate = useNavigate();

  // Redirect admin users to admin dashboard
  useEffect(() => {
    console.log('Dashboard useEffect:', { user, isAdmin, loading });
    if (user && !loading) {
      if (isAdmin) {
        console.log('Redirecting admin to /admin');
        navigate('/admin');
      } else {
        console.log('Redirecting customer to /customer-products');
        // Redirect customers to customer products page
        navigate('/customer-products');
      }
    }
  }, [user, isAdmin, loading, navigate]);

  const { data: productsData, isLoading } = useQuery(
    'dashboard-products',
    () => productsAPI.getAll({ limit: 8 }),
    {
      enabled: !!user && !isAdmin
    }
  );

  const products = productsData?.data?.products || [];

  const stats = [
    {
      title: 'Available Snakes',
      value: products.length,
      icon: <ShoppingCart className="h-6 w-6" />,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100'
    },
    {
      title: 'Ball Pythons',
      value: products.filter(p => p.category === 'ball_python').length,
      icon: <TrendingUp className="h-6 w-6" />,
      color: 'text-green-600',
      bgColor: 'bg-green-100'
    },
    {
      title: 'Corn Snakes',
      value: products.filter(p => p.category === 'corn_snake').length,
      icon: <Star className="h-6 w-6" />,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-100'
    },
    {
      title: 'King Snakes',
      value: products.filter(p => p.category === 'king_snake').length,
      icon: <Users className="h-6 w-6" />,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100'
    }
  ];

  if (loading || isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Welcome back, {user?.name}!
          </h1>
          <p className="text-gray-600 mt-2">
            Discover amazing snakes available for purchase.
          </p>
        </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat, index) => (
          <div key={index} className="card">
            <div className="card-content">
              <div className="flex items-center">
                <div className={`p-3 rounded-full ${stat.bgColor} ${stat.color}`}>
                  {stat.icon}
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                  <p className="text-2xl font-semibold text-gray-900">{stat.value}</p>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Featured Snakes */}
        <div className="card">
          <div className="card-header">
            <h3 className="text-lg font-semibold text-gray-900">Featured Snakes</h3>
          </div>
          <div className="card-content">
            {products.length === 0 ? (
              <div className="text-center py-8">
                <ShoppingCart className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">No snakes available yet</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {products.slice(0, 4).map((product) => (
                  <div key={product._id} className="flex items-center p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                    <div className="flex-shrink-0">
                      <div className="h-16 w-16 bg-primary-100 rounded-lg flex items-center justify-center">
                        {product.images && product.images.length > 0 ? (
                          <img 
                            src={product.images[0].url} 
                            alt={product.name}
                            className="h-16 w-16 object-cover rounded-lg"
                          />
                        ) : (
                          <ShoppingCart className="h-8 w-8 text-primary-600" />
                        )}
                      </div>
                    </div>
                    <div className="ml-4 flex-1">
                      <p className="text-sm font-medium text-gray-900 line-clamp-1">
                        {product.name}
                      </p>
                      <p className="text-sm text-gray-500">
                        {product.species} • {product.morph}
                      </p>
                      <p className="text-sm font-bold text-primary-600">
                        ${product.price}
                      </p>
                    </div>
                    <div className="flex items-center">
                      <button className="btn btn-outline btn-sm">
                        <Eye className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="card">
          <div className="card-header">
            <h3 className="text-lg font-semibold text-gray-900">Quick Actions</h3>
          </div>
          <div className="card-content">
            <div className="space-y-4">
              <a
                href="/products"
                className="flex items-center p-4 bg-primary-50 rounded-lg hover:bg-primary-100 transition-colors"
              >
                <ShoppingCart className="h-6 w-6 text-primary-600 mr-4" />
                <div>
                  <p className="font-medium text-gray-900">Browse All Snakes</p>
                  <p className="text-sm text-gray-600">Explore our complete collection</p>
                </div>
              </a>

              <a
                href="/my-orders"
                className="flex items-center p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <Calendar className="h-6 w-6 text-gray-600 mr-4" />
                <div>
                  <p className="font-medium text-gray-900">My Orders</p>
                  <p className="text-sm text-gray-600">Track your snake orders</p>
                </div>
              </a>

              <a
                href="/profile"
                className="flex items-center p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <Users className="h-6 w-6 text-gray-600 mr-4" />
                <div>
                  <p className="font-medium text-gray-900">Update Profile</p>
                  <p className="text-sm text-gray-600">Manage your account settings</p>
                </div>
              </a>

              {isAdmin && (
                <a
                  href="/admin"
                  className="flex items-center p-4 bg-yellow-50 rounded-lg hover:bg-yellow-100 transition-colors"
                >
                  <Star className="h-6 w-6 text-yellow-600 mr-4" />
                  <div>
                    <p className="font-medium text-gray-900">Admin Dashboard</p>
                    <p className="text-sm text-gray-600">Manage the platform</p>
                  </div>
                </a>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;