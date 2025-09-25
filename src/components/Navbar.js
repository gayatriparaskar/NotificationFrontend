import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useCart } from '../contexts/CartContext';
import { useQuery, useQueryClient } from 'react-query';
import { notificationsAPI } from '../utils/api';
import NotificationCenter from './NotificationCenter';
import { Menu, X, User, LogOut, Calendar, Settings, Home, Bell, ShoppingCart } from 'lucide-react';

const Navbar = () => {
  const { user, isAuthenticated, logout, isAdmin } = useAuth();
  const { getCartItemCount } = useCart();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);

  // Get unread notification count
  const { data: notificationData, error: notificationError } = useQuery(
    'notification-count',
    () => notificationsAPI.getUnreadCount(),
    {
      enabled: isAuthenticated,
      refetchInterval: 5000, // Refetch every 5 seconds
      staleTime: 0 // Always consider data stale
    }
  );

  const unreadCount = notificationData?.data?.data?.unreadCount || 0;

  // Debug logging
  console.log('Navbar notification data:', notificationData);
  console.log('Navbar notification error:', notificationError);
  console.log('Navbar unread count:', unreadCount);

  // Listen for real-time notifications
  useEffect(() => {
    const handleNewNotification = (event) => {
      console.log('Real-time notification received in Navbar:', event.detail);
      // Refetch notification count
      queryClient.invalidateQueries('notification-count');
      queryClient.invalidateQueries('notifications');
    };

    window.addEventListener('new-notification', handleNewNotification);
    
    return () => {
      window.removeEventListener('new-notification', handleNewNotification);
    };
  }, [queryClient]);

  const handleLogout = () => {
    logout();
    navigate('/');
    setIsMenuOpen(false);
  };

  const handleDashboardClick = () => {
    if (isAdmin) {
      navigate('/admin');
    } else {
      navigate('/dashboard');
    }
    setIsMenuOpen(false);
  };

  const NavLink = ({ to, children, onClick }) => (
    <Link
      to={to}
      onClick={onClick}
      className="text-gray-700 hover:text-primary-600 px-3 py-2 rounded-md text-sm font-medium transition-colors"
    >
      {children}
    </Link>
  );

  return (
    <nav className="bg-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex-shrink-0 flex items-center">
              <Calendar className="h-8 w-8 text-primary-600" />
              <span className="ml-2 text-xl font-bold text-gray-900">SnakeShop</span>
            </Link>
          </div>

          {/* Desktop menu */}
          <div className="hidden md:flex items-center space-x-4">
            <NavLink to="/">Home</NavLink>
            <NavLink to="/products">Snakes</NavLink>
            
            {isAuthenticated ? (
              <>
                {/* Role-based navigation */}
                {user?.role === 'admin' ? (
                  // Admin navigation
                  <>
                    <button 
                      onClick={handleDashboardClick}
                      className="text-gray-700 hover:text-primary-600 px-3 py-2 rounded-md text-sm font-medium transition-colors"
                    >
                      Admin Dashboard
                    </button>
                  </>
                ) : (
                  // Customer/Service Provider navigation
                  <>
                    <NavLink to="/my-orders">My Orders</NavLink>
                    <Link to="/cart" className="relative text-gray-700 hover:text-primary-600 px-3 py-2 rounded-md text-sm font-medium transition-colors">
                      <ShoppingCart className="h-5 w-5" />
                      {getCartItemCount() > 0 && (
                        <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                          {getCartItemCount() > 9 ? '9+' : getCartItemCount()}
                        </span>
                      )}
                    </Link>
                    
                    {/* Notifications - For all authenticated users */}
        <button
          onClick={() => setIsNotificationOpen(true)}
          className="relative text-gray-700 hover:text-primary-600 px-3 py-2 rounded-md text-sm font-medium transition-colors group"
        >
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full min-w-5 h-5 flex items-center justify-center font-bold animate-pulse shadow-lg px-1">
              {unreadCount > 99 ? '99+' : unreadCount}
            </span>
          )}
        </button>
                  </>
                )}
                
                {/* User dropdown */}
                <div className="relative group">
                  <button className="flex items-center text-gray-700 hover:text-primary-600 px-3 py-2 rounded-md text-sm font-medium">
                    <User className="h-4 w-4 mr-2" />
                    {user?.name}
                  </button>
                  
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                    <Link
                      to="/profile"
                      className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      <Settings className="h-4 w-4 mr-2" />
                      Profile
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      <LogOut className="h-4 w-4 mr-2" />
                      Logout
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <>
                <NavLink to="/login">Login</NavLink>
                <NavLink to="/register">Register</NavLink>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-gray-700 hover:text-primary-600 p-2"
            >
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {isMenuOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-gray-50 rounded-lg mt-2">
              <NavLink to="/" onClick={() => setIsMenuOpen(false)}>
                <Home className="h-4 w-4 mr-2 inline" />
                Home
              </NavLink>
              <NavLink to="/products" onClick={() => setIsMenuOpen(false)}>
                Snakes
              </NavLink>
              
              {isAuthenticated ? (
                <>
                  {/* Role-based mobile navigation */}
                  {user?.role === 'admin' ? (
                    // Admin mobile navigation
                    <>
                      <button 
                        onClick={handleDashboardClick}
                        className="flex items-center w-full text-left text-gray-700 hover:text-primary-600 px-3 py-2 rounded-md text-sm font-medium"
                      >
                        Admin Dashboard
                      </button>
                      <button
                        onClick={() => {
                          setIsNotificationOpen(true);
                          setIsMenuOpen(false);
                        }}
                        className="flex items-center w-full text-left text-gray-700 hover:text-primary-600 px-3 py-2 rounded-md text-sm font-medium"
                      >
                        <Bell className="h-4 w-4 mr-2" />
                        Notifications
                        <div className="ml-auto">
                          {unreadCount > 0 && (
                            <span className="bg-red-500 text-white text-xs rounded-full min-w-5 h-5 flex items-center justify-center font-bold animate-pulse shadow-lg px-1">
                              {unreadCount > 99 ? '99+' : unreadCount}
                            </span>
                          )}
                        </div>
                      </button>
                    </>
                  ) : (
                    // Customer/Service Provider mobile navigation
                    <>
                      <NavLink to="/my-orders" onClick={() => setIsMenuOpen(false)}>
                        My Orders
                      </NavLink>
                      <Link to="/cart" onClick={() => setIsMenuOpen(false)} className="flex items-center w-full text-left text-gray-700 hover:text-primary-600 px-3 py-2 rounded-md text-sm font-medium">
                        <ShoppingCart className="h-4 w-4 mr-2" />
                        Cart
                        {getCartItemCount() > 0 && (
                          <span className="ml-auto bg-red-500 text-white text-xs rounded-full px-2 py-1">
                            {getCartItemCount()}
                          </span>
                        )}
                      </Link>
                      <button
                        onClick={() => {
                          setIsNotificationOpen(true);
                          setIsMenuOpen(false);
                        }}
                        className="flex items-center w-full text-left text-gray-700 hover:text-primary-600 px-3 py-2 rounded-md text-sm font-medium"
                      >
                        <Bell className="h-4 w-4 mr-2" />
                        Notifications
                        <div className="ml-auto">
                          {unreadCount > 0 && (
                            <span className="bg-red-500 text-white text-xs rounded-full min-w-5 h-5 flex items-center justify-center font-bold animate-pulse shadow-lg px-1">
                              {unreadCount > 99 ? '99+' : unreadCount}
                            </span>
                          )}
                        </div>
                      </button>
                    </>
                  )}
                  <NavLink to="/profile" onClick={() => setIsMenuOpen(false)}>
                    <Settings className="h-4 w-4 mr-2 inline" />
                    Profile
                  </NavLink>
                  <button
                    onClick={handleLogout}
                    className="flex items-center w-full text-left text-gray-700 hover:text-primary-600 px-3 py-2 rounded-md text-sm font-medium"
                  >
                    <LogOut className="h-4 w-4 mr-2" />
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <NavLink to="/login" onClick={() => setIsMenuOpen(false)}>
                    Login
                  </NavLink>
                  <NavLink to="/register" onClick={() => setIsMenuOpen(false)}>
                    Register
                  </NavLink>
                </>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Notification Center */}
      <NotificationCenter 
        isOpen={isNotificationOpen} 
        onClose={() => setIsNotificationOpen(false)} 
      />
    </nav>
  );
};

export default Navbar;