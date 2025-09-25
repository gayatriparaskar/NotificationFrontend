import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, Clock, Users, Shield, Star, ArrowRight, Download, Smartphone, CheckCircle } from 'lucide-react';
import pwaService from '../services/pwaService';

const Home = () => {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [showInstallButton, setShowInstallButton] = useState(false);

  useEffect(() => {
    // Check if app is already installed
    const checkInstallStatus = () => {
      const installed = pwaService.isAppInstalled();
      const canInstall = pwaService.canInstall();
      const isAndroid = pwaService.isAndroid();
      
      setIsInstalled(installed);
      setShowInstallButton(canInstall && !installed);
      
      console.log('PWA: Install status check:', { 
        installed, 
        canInstall, 
        isAndroid,
        userAgent: navigator.userAgent 
      });
    };

    checkInstallStatus();

    // Listen for the beforeinstallprompt event
    const handleBeforeInstallPrompt = (e) => {
      console.log('PWA: Before install prompt triggered on Home page');
      e.preventDefault();
      setDeferredPrompt(e);
      setShowInstallButton(true);
    };

    // Listen for the appinstalled event
    const handleAppInstalled = () => {
      console.log('PWA: App was installed from Home page');
      setIsInstalled(true);
      setShowInstallButton(false);
      setDeferredPrompt(null);
    };

    // Listen for display mode changes
    const handleDisplayModeChange = () => {
      checkInstallStatus();
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);
    window.matchMedia('(display-mode: standalone)').addEventListener('change', handleDisplayModeChange);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
      window.matchMedia('(display-mode: standalone)').removeEventListener('change', handleDisplayModeChange);
    };
  }, []);

  const handleInstallClick = async () => {
    try {
      console.log('PWA: Install button clicked');
      
      // Check if app is already installed
      if (pwaService.isAppInstalled()) {
        console.log('PWA: App is already installed');
        alert('SnakeShop app is already installed!');
        return;
      }

      // Try to use deferred prompt if available
      if (deferredPrompt) {
        console.log('PWA: Using deferred prompt');
        try {
          deferredPrompt.prompt();
          
          const { outcome } = await deferredPrompt.userChoice;
          console.log('PWA: User choice outcome:', outcome);
          
          if (outcome === 'accepted') {
            console.log('PWA: User accepted the install prompt');
            setShowInstallButton(false);
            setIsInstalled(true);
          } else {
            console.log('PWA: User dismissed the install prompt');
          }
        } catch (error) {
          console.error('PWA: Deferred prompt error:', error);
        }
        
        setDeferredPrompt(null);
        return;
      }

      // If no deferred prompt, check if we can trigger install
      console.log('PWA: No deferred prompt available');
      
      // Check if service worker is ready
      if ('serviceWorker' in navigator) {
        try {
          const registration = await navigator.serviceWorker.ready;
          console.log('PWA: Service worker ready:', registration);
          
          // For some browsers, the install prompt should appear automatically
          // If it doesn't, show a message
          if (pwaService.isAndroid() && pwaService.isChrome()) {
            alert('To install SnakeShop:\n\n1. Tap the three dots menu (⋮) in Chrome\n2. Look for "Add to Home screen"\n3. Tap "Add" to confirm');
          } else {
            alert('To install SnakeShop:\n\n1. Look for the install icon (⊞) in your browser\'s address bar\n2. Or use the browser menu (⋮) and select "Install SnakeShop"');
          }
        } catch (error) {
          console.error('PWA: Service worker not ready:', error);
          alert('Service worker not ready. Please refresh the page and try again.');
        }
      } else {
        console.log('PWA: Service worker not supported');
        alert('Your browser doesn\'t support PWA installation.');
      }
      
    } catch (error) {
      console.error('PWA: Install error:', error);
      alert('Installation failed. Please try using your browser\'s menu to install the app.');
    }
  };

  const handleTestSound = () => {
    console.log('Testing notification sound...');
    pwaService.showLocalNotification('Test Notification', {
      body: 'This is a test notification sound',
      tag: 'test-notification'
    });
  };

  const features = [
    {
      icon: <Calendar className="h-8 w-8 text-primary-600" />,
      title: 'Easy Ordering',
      description: 'Browse and purchase snakes with our intuitive shopping experience.'
    },
    {
      icon: <Clock className="h-8 w-8 text-primary-600" />,
      title: 'Fast Shipping',
      description: 'Get your new snake companion delivered safely and quickly.'
    },
    {
      icon: <Users className="h-8 w-8 text-primary-600" />,
      title: 'Expert Care',
      description: 'All snakes come with detailed care instructions and health guarantees.'
    },
    {
      icon: <Shield className="h-8 w-8 text-primary-600" />,
      title: 'Secure & Safe',
      description: 'Your data and payments are protected with enterprise-grade security.'
    }
  ];

  const stats = [
    { label: 'Happy Customers', value: '5,000+' },
    { label: 'Snakes Available', value: '200+' },
    { label: 'Species', value: '15+' },
    { label: 'Average Rating', value: '4.9/5' }
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-primary-600 to-primary-800 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              Find Your Perfect
              <span className="block text-primary-200">Snake Companion</span>
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-primary-100 max-w-3xl mx-auto">
              Discover and purchase beautiful snakes from our curated collection. 
              From ball pythons to corn snakes, king snakes to boas - we've got the perfect snake for you.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/products"
                className="btn btn-lg bg-white text-primary-600 hover:bg-gray-100 inline-flex items-center"
              >
                Browse Snakes
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
              <Link
                to="/register"
                className="btn btn-lg btn-outline border-white text-white hover:bg-white hover:text-primary-600"
              >
                Get Started
              </Link>
              
              {/* PWA Install Button */}
              {showInstallButton && !isInstalled && (
                <button
                  onClick={handleInstallClick}
                  className="btn btn-lg bg-green-600 hover:bg-green-700 text-white inline-flex items-center animate-pulse"
                >
                  <Download className="mr-2 h-5 w-5" />
                  Install App
                </button>
              )}
              
              {isInstalled && (
                <div className="inline-flex items-center px-4 py-2 bg-green-100 text-green-800 rounded-lg">
                  <CheckCircle className="mr-2 h-5 w-5" />
                  App Installed
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-primary-600 mb-2">
                  {stat.value}
                </div>
                <div className="text-gray-600">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Why Choose Our Snake Collection?
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              We make finding and purchasing your perfect snake simple, secure, and convenient.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="card p-6 text-center hover:shadow-lg transition-shadow">
                <div className="flex justify-center mb-4">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">
                  {feature.title}
                </h3>
                <p className="text-gray-600">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-primary-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Ready to Find Your Snake?
            </h2>
            <p className="text-xl text-primary-100 mb-8 max-w-2xl mx-auto">
              Join thousands of satisfied customers who trust us with their snake companions.
            </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/register"
              className="btn btn-lg bg-white text-primary-600 hover:bg-gray-100"
            >
              Create Account
            </Link>
            <Link
              to="/products"
              className="btn btn-lg btn-outline border-white text-white hover:bg-white hover:text-primary-600"
            >
              View Snakes
            </Link>
          </div>
        </div>
      </section>

      {/* PWA Install Section */}
      {!isInstalled && (
        <section className="py-20 bg-gradient-to-r from-green-600 to-green-800 text-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <div className="flex justify-center mb-6">
                <div className="w-16 h-16 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                  <Smartphone className="h-8 w-8" />
                </div>
              </div>
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Install SnakeShop App
              </h2>
              <p className="text-xl text-green-100 mb-8 max-w-2xl mx-auto">
                Get the full SnakeShop experience with our mobile app. 
                Enjoy offline access, push notifications, and faster loading.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                <button
                  onClick={handleInstallClick}
                  className="btn btn-lg bg-white text-green-600 hover:bg-gray-100 inline-flex items-center"
                >
                  <Download className="mr-2 h-5 w-5" />
                  {isInstalled ? 'App Installed ✓' : (deferredPrompt ? 'Install Now' : 'Install App')}
                </button>
                
                {!showInstallButton && (
                  <div className="text-green-200 text-center">
                    <p className="text-sm">
                      {pwaService.isAndroid() ? 
                        'For Android: Tap the three dots menu (⋮) → "Add to Home screen"' :
                        'If install button doesn\'t work, try: Chrome/Edge menu → "Install SnakeShop"'
                      }
                    </p>
                    <button
                      onClick={handleTestSound}
                      className="mt-2 btn bg-white text-green-600 hover:bg-gray-100 text-sm"
                    >
                      Test Notification Sound
                    </button>
                  </div>
                )}
                
                <div className="flex items-center space-x-6 text-green-200">
                  <div className="flex items-center">
                    <CheckCircle className="h-5 w-5 mr-2" />
                    <span>Offline Access</span>
                  </div>
                  <div className="flex items-center">
                    <CheckCircle className="h-5 w-5 mr-2" />
                    <span>Push Notifications</span>
                  </div>
                  <div className="flex items-center">
                    <CheckCircle className="h-5 w-5 mr-2" />
                    <span>Fast Loading</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Testimonials Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              What Our Customers Say
            </h2>
            <p className="text-xl text-gray-600">
              Don't just take our word for it - hear from our satisfied customers.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                name: 'Sarah Johnson',
                role: 'Customer',
                content: 'The booking process was so smooth and easy. I found exactly what I was looking for and the service was excellent!',
                rating: 5
              },
              {
                name: 'Mike Chen',
                role: 'Customer',
                content: 'Great platform! The real-time availability feature saved me so much time. Highly recommended.',
                rating: 5
              },
              {
                name: 'Emily Davis',
                role: 'Customer',
                content: 'Professional service providers and excellent customer support. Will definitely use again.',
                rating: 5
              }
            ].map((testimonial, index) => (
              <div key={index} className="card p-6">
                <div className="flex items-center mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="h-5 w-5 text-yellow-400 fill-current" />
                  ))}
                </div>
                <p className="text-gray-600 mb-4 italic">
                  "{testimonial.content}"
                </p>
                <div>
                  <div className="font-semibold text-gray-900">{testimonial.name}</div>
                  <div className="text-sm text-gray-500">{testimonial.role}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;