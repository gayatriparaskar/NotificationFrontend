import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, Clock, Users, Shield, Star, ArrowRight, Download, CheckCircle } from 'lucide-react';
import notificationService from '../services/notificationService';

const Home = () => {
  const [showInstallButton, setShowInstallButton] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isInstalling, setIsInstalling] = useState(false);

  useEffect(() => {
    // Check PWA install status
    const checkInstallStatus = () => {
      const status = notificationService.getInstallStatus();
      console.log('Home: PWA status:', status);
      
      // Show button only if not installed
      setShowInstallButton(status.canInstall);
      setIsInstalled(status.isInstalled);
    };

    // Check immediately
    checkInstallStatus();

    // Check periodically (less frequent)
    const interval = setInterval(checkInstallStatus, 3000);

    return () => clearInterval(interval);
  }, []);

  const handleInstallClick = async () => {
    setIsInstalling(true);
    try {
      console.log('Home: Starting PWA installation...');
      const result = await notificationService.installPWA();
      
      if (result.success) {
        console.log('Home: PWA installation successful');
        setIsInstalled(true);
        setShowInstallButton(false);
        // Force update the notification service status
        notificationService.isInstalled = true;
        // Show success message
        alert('🎉 App installed successfully! You can now access SnakeShop from your home screen.');
      } else {
        console.log('Home: PWA installation failed:', result.message);
        // For mobile devices, try to trigger the browser's install prompt
        const userAgent = navigator.userAgent.toLowerCase();
        const isMobile = /android|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(userAgent);
        
        if (isMobile) {
          // Try to trigger the browser's native install prompt
          try {
            // Request notification permission to trigger install prompt
            const permission = await Notification.requestPermission();
            if (permission === 'granted') {
              // Show a notification to trigger install prompt
              new Notification('SnakeShop', {
                body: 'Tap to install the app',
                icon: '/logo192.png',
                tag: 'install-prompt'
              });
              
              // Mark as installed
              setIsInstalled(true);
              setShowInstallButton(false);
              notificationService.isInstalled = true;
              localStorage.setItem('pwa-installed', 'true');
              
              alert('📱 App installation initiated! Check your browser for the install prompt.');
            } else {
              alert('📱 Please allow notifications and try again, or use your browser menu to "Add to Home Screen".');
            }
          } catch (error) {
            console.log('Home: Could not trigger install prompt:', error);
            alert('📱 Please use your browser menu to "Add to Home Screen" or "Install App".');
          }
        } else {
          alert('💻 Please use your browser menu to "Install App" or "Add to Home Screen".');
        }
      }
    } catch (error) {
      console.error('Home: Install failed:', error);
      alert('Installation failed. Please try again.');
    } finally {
      setIsInstalling(false);
    }
  };

  const handleTestSound = () => {
    notificationService.playNotificationSound();
  };

  const handleTestBadge = () => {
    // Test badge notification
    notificationService.setBadgeCount(5);
    alert('Badge count set to 5! Check your app icon.');
    
    // Clear badge after 3 seconds
    setTimeout(() => {
      notificationService.clearBadge();
      alert('Badge cleared!');
    }, 3000);
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
              
            </div>

            {/* Direct Install Button */}
            {showInstallButton && (
              <div className="mt-6">
                <button
                  onClick={handleInstallClick}
                  disabled={isInstalling}
                  className="btn btn-lg bg-green-600 hover:bg-green-700 text-white font-bold py-4 px-8 rounded-lg shadow-lg transform hover:scale-105 transition-all duration-200 inline-flex items-center justify-center space-x-3"
                >
                  {isInstalling ? (
                    <>
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
                      <span>Installing App...</span>
                    </>
                  ) : (
                    <>
                      <Download className="h-6 w-6" />
                      <span>
                        {(() => {
                          const userAgent = navigator.userAgent.toLowerCase();
                          const isMobile = /android|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(userAgent);
                          const isIOS = userAgent.includes('iphone') || userAgent.includes('ipad');
                          
                          if (isIOS) {
                            return 'Add SnakeShop to Home Screen (iOS)';
                          } else if (isMobile) {
                            return 'Install SnakeShop App (Mobile)';
                          } else {
                            return 'Install SnakeShop App';
                          }
                        })()}
                      </span>
                    </>
                  )}
                </button>
                <div className="flex flex-col sm:flex-row gap-3 justify-center mt-3">
                  <button
                    onClick={handleTestSound}
                    className="btn btn-sm bg-white bg-opacity-20 text-white hover:bg-opacity-30 border border-white border-opacity-30"
                  >
                    Test Notification Sound
                  </button>
                  <button
                    onClick={handleTestBadge}
                    className="btn btn-sm bg-white bg-opacity-20 text-white hover:bg-opacity-30 border border-white border-opacity-30"
                  >
                    Test Badge Count
                  </button>
                </div>
                <p className="text-primary-100 text-sm mt-2 text-center">
                  Get offline access, push notifications & app-like experience
                </p>
              </div>
            )}


            {isInstalled && (
              <div className="mt-8 p-4 bg-green-500 bg-opacity-20 rounded-lg border border-green-400 border-opacity-30">
                <div className="flex items-center justify-center space-x-2 text-green-100">
                  <CheckCircle className="h-5 w-5" />
                  <span className="font-medium">App is installed! Access it from your home screen.</span>
                </div>
              </div>
            )}
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