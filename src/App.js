import React, { useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import notificationService from './services/notificationService';
import { AuthProvider } from './contexts/AuthContext';
import { CartProvider } from './contexts/CartContext';
import { SocketProvider } from './contexts/SocketContext';
import ProtectedRoute from './components/ProtectedRoute';
import Navbar from './components/Navbar';
import PWAInstallPrompt from './components/PWAInstallPrompt';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Products from './pages/Products';
import ProductDetail from './pages/ProductDetail';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import Dashboard from './pages/Dashboard';
import Profile from './pages/Profile';
import Orders from './pages/Orders';
import AdminDashboard from './pages/AdminDashboard';
import AddProduct from './pages/AddProduct';
import CustomerProducts from './pages/CustomerProducts';

function App() {
  useEffect(() => {
    // Initialize notification service completely
    const initializeNotifications = async () => {
      try {
        console.log('App: Initializing notification service...');
        
        // Register service worker
        await notificationService.registerServiceWorker();
        console.log('App: Service worker registered');
        
        // Initialize PWA installation
        notificationService.initializePWAInstall();
        console.log('App: PWA installation initialized');
        
        // Initialize audio context
        notificationService.initializeAudioContext();
        console.log('App: Audio context initialized');
        
        // Restore badge count for mobile devices
        notificationService.restoreBadgeCount();
        console.log('App: Badge count restored');
        
        console.log('App: Notification service fully initialized');
      } catch (error) {
        console.error('App: Error initializing notification service:', error);
      }
    };
    
    initializeNotifications();
    
    // Handle online/offline events
    const handleOnline = () => notificationService.handleOnline();
    const handleOffline = () => notificationService.handleOffline();
    
    // Handle global badge updates
    const handleBadgeUpdate = (event) => {
      console.log('App: Global badge update received:', event.detail);
      // Force update document title
      if (event.detail && event.detail.count !== undefined) {
        notificationService.updateDocumentTitle(event.detail.count);
      }
    };
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    window.addEventListener('badge-update', handleBadgeUpdate);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener('badge-update', handleBadgeUpdate);
    };
  }, []);

  return (
    <AuthProvider>
      <CartProvider>
        <SocketProvider>
          <div className="min-h-screen bg-gray-50">
            <Navbar />
            <PWAInstallPrompt />
            <main className="container mx-auto px-4 py-8">
          <Routes>
            {/* Public routes */}
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/products" element={<Products />} />
            <Route path="/products/:id" element={<ProductDetail />} />
            <Route path="/customer-products" element={<CustomerProducts />} />
            <Route path="/cart" element={<Cart />} />
            
            {/* Protected routes */}
            <Route path="/checkout" element={
              <ProtectedRoute>
                <Checkout />
              </ProtectedRoute>
            } />
            <Route path="/dashboard" element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            } />
            <Route path="/profile" element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            } />
            <Route path="/my-orders" element={
              <ProtectedRoute>
                <Orders />
              </ProtectedRoute>
            } />
            <Route path="/admin" element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AdminDashboard />
              </ProtectedRoute>
            } />
            <Route path="/admin/add-product" element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AddProduct />
              </ProtectedRoute>
            } />
          </Routes>
        </main>
        
        </div>
        </SocketProvider>
      </CartProvider>
    </AuthProvider>
  );
}

export default App;