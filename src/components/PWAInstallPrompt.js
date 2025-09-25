import React, { useState, useEffect } from 'react';
import { Download, Smartphone, X } from 'lucide-react';
import notificationService from '../services/notificationService';

const PWAInstallPrompt = () => {
  const [showPrompt, setShowPrompt] = useState(false);
  const [installStatus, setInstallStatus] = useState({
    canInstall: false,
    isInstalled: false,
    hasPrompt: false
  });
  const [isInstalling, setIsInstalling] = useState(false);

  useEffect(() => {
    // Check install status
    const checkStatus = () => {
      const status = notificationService.getInstallStatus();
      setInstallStatus(status);
      
      // Only show prompt if can install, not already installed, and user hasn't dismissed it
      const hasDismissed = localStorage.getItem('pwa-install-dismissed');
      if (status.canInstall && !status.isInstalled && !hasDismissed) {
        setShowPrompt(true);
      }
    };

    // Check status immediately
    checkStatus();

    // Check status periodically (less frequent)
    const interval = setInterval(checkStatus, 5000);

    return () => clearInterval(interval);
  }, []);

  const handleInstall = async () => {
    setIsInstalling(true);
    try {
      const result = await notificationService.installPWA();
      if (result.success) {
        setShowPrompt(false);
        // Show success message
        alert('App installed successfully! You can now access it from your home screen.');
      } else {
        alert(result.message);
      }
    } catch (error) {
      console.error('Install failed:', error);
      alert('Installation failed. Please try again.');
    } finally {
      setIsInstalling(false);
    }
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    // Remember that user dismissed the prompt
    localStorage.setItem('pwa-install-dismissed', 'true');
  };

  // Don't show if already installed or can't install
  if (installStatus.isInstalled || !installStatus.canInstall) {
    return null;
  }

  return (
    <>
      {showPrompt && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2">
                <Smartphone className="h-6 w-6 text-blue-600" />
                <h3 className="text-lg font-semibold text-gray-900">
                  Install SnakeShop App
                </h3>
              </div>
              <button
                onClick={handleDismiss}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <div className="mb-6">
              <p className="text-gray-600 mb-4 text-center">
                Install SnakeShop for offline access and push notifications
              </p>
            </div>

            <div className="flex space-x-3">
              <button
                onClick={handleDismiss}
                className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Maybe Later
              </button>
              <button
                onClick={handleInstall}
                disabled={isInstalling}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center space-x-2"
              >
                {isInstalling ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>Installing...</span>
                  </>
                ) : (
                  <>
                    <Download className="h-4 w-4" />
                    <span>Install App</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default PWAInstallPrompt;
