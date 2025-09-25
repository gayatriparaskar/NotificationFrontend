// Notification Service for handling push notifications, offline functionality, and PWA installation
class NotificationService {
  constructor() {
    this.registration = null;
    this.subscription = null;
    this.deferredPrompt = null;
    this.isInstalled = false;
  }

  // Register service worker
  async registerServiceWorker() {
    if ('serviceWorker' in navigator) {
      try {
        const registration = await navigator.serviceWorker.register('/sw.js');
        console.log('Notification Service: Service Worker registered successfully:', registration);
        this.registration = registration;
        return registration;
      } catch (error) {
        console.error('Notification Service: Service Worker registration failed:', error);
        throw error;
      }
    } else {
      console.log('Notification Service: Service Worker not supported');
      return null;
    }
  }

  // Request notification permission
  async requestNotificationPermission() {
    if (!('Notification' in window)) {
      console.log('Notification Service: Notifications not supported');
      return false;
    }

    if (Notification.permission === 'granted') {
      console.log('Notification Service: Notifications already granted');
      return true;
    }

    if (Notification.permission === 'denied') {
      console.log('Notification Service: Notifications denied');
      return false;
    }

    const permission = await Notification.requestPermission();
    console.log('Notification Service: Notification permission:', permission);
    return permission === 'granted';
  }

  // Subscribe to push notifications
  async subscribeToPushNotifications() {
    if (!this.registration) {
      console.log('Notification Service: No service worker registration');
      return null;
    }

    try {
      const subscription = await this.registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: this.urlBase64ToUint8Array(
          'BEl62iUYgUivxIkv69yViEuiBIa40HI8YF5jxaH3XKEuGTPJj-T8nWOPFroDxS_byONc7XQ'
        )
      });

      console.log('Notification Service: Push subscription created:', subscription);
      this.subscription = subscription;
      return subscription;
    } catch (error) {
      console.error('Notification Service: Push subscription failed:', error);
      return null;
    }
  }

  // Send subscription to server
  async sendSubscriptionToServer(subscription, userId) {
    try {
      const response = await fetch('/api/notifications/subscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          subscription,
          userId
        })
      });

      if (response.ok) {
        console.log('Notification Service: Subscription sent to server');
        return true;
      } else {
        console.error('Notification Service: Failed to send subscription to server');
        return false;
      }
    } catch (error) {
      console.error('Notification Service: Error sending subscription to server:', error);
      return false;
    }
  }

  // Initialize notification features
  async initialize(userId) {
    try {
      // Register service worker
      await this.registerServiceWorker();

      // Request notification permission
      const hasPermission = await this.requestNotificationPermission();
      
      if (hasPermission) {
        // Subscribe to push notifications
        const subscription = await this.subscribeToPushNotifications();
        
        if (subscription && userId) {
          // Send subscription to server
          await this.sendSubscriptionToServer(subscription, userId);
        }
      }

      // Initialize PWA install functionality
      this.initializePWAInstall();

      // Initialize audio context for notification sounds
      this.initializeAudioContext();

      return true;
    } catch (error) {
      console.error('Notification Service: Initialization failed:', error);
      return false;
    }
  }

  // Initialize audio context for notification sounds
  initializeAudioContext() {
    try {
      // Create audio context
      this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
      console.log('Notification Service: Audio context initialized');
      
      // Add user interaction listeners to resume audio context
      const resumeAudio = () => {
        if (this.audioContext && this.audioContext.state === 'suspended') {
          this.audioContext.resume().then(() => {
            console.log('Notification Service: Audio context resumed on user interaction');
          });
        }
      };

      // Listen for user interactions
      document.addEventListener('click', resumeAudio, { once: true });
      document.addEventListener('touchstart', resumeAudio, { once: true });
      document.addEventListener('keydown', resumeAudio, { once: true });
      
    } catch (error) {
      console.log('Notification Service: Could not initialize audio context:', error);
    }
  }

  // Set badge count (WhatsApp-like notifications)
  setBadgeCount(count) {
    try {
      console.log('Notification Service: Setting badge count to', count);
      
      // Set badge using Badge API (modern browsers)
      if ('setAppBadge' in navigator) {
        navigator.setAppBadge(count).then(() => {
          console.log('Notification Service: Badge set successfully');
        }).catch(error => {
          console.log('Notification Service: Could not set badge:', error);
        });
      }
      
      // Also send to service worker for additional support
      if (this.registration && this.registration.active) {
        this.registration.active.postMessage({
          type: 'SET_BADGE',
          count: count
        });
      }
      
    } catch (error) {
      console.log('Notification Service: Could not set badge count:', error);
    }
  }

  // Clear badge count
  clearBadge() {
    try {
      console.log('Notification Service: Clearing badge');
      
      // Clear badge using Badge API
      if ('clearAppBadge' in navigator) {
        navigator.clearAppBadge().then(() => {
          console.log('Notification Service: Badge cleared successfully');
        }).catch(error => {
          console.log('Notification Service: Could not clear badge:', error);
        });
      }
      
      // Also send to service worker
      if (this.registration && this.registration.active) {
        this.registration.active.postMessage({
          type: 'SET_BADGE',
          count: 0
        });
      }
      
    } catch (error) {
      console.log('Notification Service: Could not clear badge:', error);
    }
  }

  // Show local notification
  showLocalNotification(title, options = {}) {
    if (Notification.permission === 'granted') {
      const notification = new Notification(title, {
        icon: '/logo192.png',
        badge: '/logo192.png',
        ...options
      });

      // Auto close after 5 seconds
      setTimeout(() => {
        notification.close();
      }, 5000);

      console.log('Notification Service: Local notification shown:', title);
    } else {
      console.log('Notification Service: Notification permission not granted, cannot show notification');
    }
  }

  // Play notification sound
  playNotificationSound() {
    try {
      console.log('Notification Service: Playing notification sound');
      
      // Check if audio context is suspended and resume if needed
      let audioContext = this.audioContext;
      
      if (!audioContext) {
        audioContext = new (window.AudioContext || window.webkitAudioContext)();
        this.audioContext = audioContext;
      }
      
      // Resume audio context if suspended (required for user interaction)
      if (audioContext.state === 'suspended') {
        audioContext.resume().then(() => {
          console.log('Notification Service: Audio context resumed');
          this.playSound(audioContext);
        }).catch(error => {
          console.log('Notification Service: Could not resume audio context:', error);
          // Fallback to HTML5 audio
          this.playFallbackSound();
        });
      } else {
        this.playSound(audioContext);
      }
    } catch (error) {
      console.log('Notification Service: Could not play notification sound:', error);
      // Fallback to HTML5 audio
      this.playFallbackSound();
    }
  }

  // Play the actual sound
  playSound(audioContext) {
    try {
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      // WhatsApp-like notification sound
      oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
      oscillator.frequency.setValueAtTime(600, audioContext.currentTime + 0.1);
      oscillator.frequency.setValueAtTime(800, audioContext.currentTime + 0.2);
      
      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
      
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.3);
      console.log('Notification Service: Notification sound played successfully');
    } catch (error) {
      console.log('Notification Service: Could not play sound:', error);
      this.playFallbackSound();
    }
  }

  // Fallback sound using HTML5 audio
  playFallbackSound() {
    try {
      console.log('Notification Service: Playing fallback sound');
      
      // Create a simple beep sound using Web Audio API
      const audioContext = new (window.AudioContext || window.webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      // Simple beep sound
      oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
      oscillator.frequency.setValueAtTime(600, audioContext.currentTime + 0.1);
      
      gainNode.gain.setValueAtTime(0.5, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.2);
      
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.2);
      
      console.log('Notification Service: Fallback sound played');
    } catch (error) {
      console.log('Notification Service: Could not play fallback sound:', error);
    }
  }

  // Handle offline functionality
  handleOffline() {
    console.log('Notification Service: App is offline');
    // You can show an offline indicator or queue actions
  }

  // Handle online functionality
  handleOnline() {
    console.log('Notification Service: App is back online');
    // You can sync offline data or hide offline indicators
  }

  // PWA Install functionality
  initializePWAInstall() {
    // Check if app is already installed
    this.checkIfInstalled();
    
    // Listen for beforeinstallprompt event
    window.addEventListener('beforeinstallprompt', (e) => {
      console.log('PWA: beforeinstallprompt event fired');
      e.preventDefault();
      this.deferredPrompt = e;
    });

    // Listen for appinstalled event
    window.addEventListener('appinstalled', () => {
      console.log('PWA: App was installed');
      this.isInstalled = true;
      this.deferredPrompt = null;
    });
  }

  // Check if PWA is already installed
  checkIfInstalled() {
    // Check if running in standalone mode
    if (window.matchMedia('(display-mode: standalone)').matches) {
      this.isInstalled = true;
      console.log('PWA: App is already installed (standalone mode)');
    } else if (window.navigator.standalone === true) {
      this.isInstalled = true;
      console.log('PWA: App is already installed (iOS standalone)');
    } else {
      // Check if app was previously installed (stored in localStorage)
      const wasInstalled = localStorage.getItem('pwa-installed');
      if (wasInstalled === 'true') {
        this.isInstalled = true;
        console.log('PWA: App was previously installed (localStorage)');
      } else {
        this.isInstalled = false;
      }
    }
    
    // Additional mobile detection
    this.detectMobileInstallation();
  }

  // Detect mobile-specific installation methods
  detectMobileInstallation() {
    const userAgent = navigator.userAgent.toLowerCase();
    const isMobile = /android|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(userAgent);
    
    if (isMobile) {
      console.log('PWA: Mobile device detected');
      
      // Check for Android Chrome
      if (userAgent.includes('chrome') && userAgent.includes('android')) {
        console.log('PWA: Android Chrome detected - PWA should work');
      }
      // Check for iOS Safari
      else if (userAgent.includes('safari') && (userAgent.includes('iphone') || userAgent.includes('ipad'))) {
        console.log('PWA: iOS Safari detected - Limited PWA support');
        this.handleiOSPWA();
      }
    }
  }

  // Handle iOS-specific PWA functionality
  handleiOSPWA() {
    // iOS doesn't support beforeinstallprompt event
    // We need to detect if running in standalone mode
    if (window.navigator.standalone === true) {
      this.isInstalled = true;
      console.log('PWA: iOS app is running in standalone mode');
    } else {
      // Check if user has previously added to home screen
      const wasAddedToHomeScreen = localStorage.getItem('ios-added-to-homescreen');
      if (wasAddedToHomeScreen === 'true') {
        this.isInstalled = true;
        console.log('PWA: iOS app was previously added to home screen');
      }
    }
  }

  // Mark iOS app as added to home screen
  markiOSAsInstalled() {
    localStorage.setItem('ios-added-to-homescreen', 'true');
    this.isInstalled = true;
    console.log('PWA: iOS app marked as added to home screen');
  }

  // Check if PWA can be installed
  canInstall() {
    // For mobile devices, show install button even without deferredPrompt
    const userAgent = navigator.userAgent.toLowerCase();
    const isMobile = /android|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(userAgent);
    
    if (isMobile && !this.isInstalled) {
      return true; // Always show install button on mobile
    }
    
    return this.deferredPrompt !== null && !this.isInstalled;
  }

  // Install PWA - Direct installation
  async installPWA() {
    const userAgent = navigator.userAgent.toLowerCase();
    const isMobile = /android|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(userAgent);
    
    if (!this.deferredPrompt) {
      console.log('PWA: No install prompt available');
      
      // For mobile devices, provide manual installation instructions
      if (isMobile) {
        return { 
          success: false, 
          message: 'Mobile PWA installation requires manual steps. Please use your browser menu to "Add to Home Screen" or "Install app".' 
        };
      }
      
      return { success: false, message: 'Install prompt not available' };
    }

    try {
      console.log('PWA: Triggering direct installation');
      
      // Show the install prompt immediately
      this.deferredPrompt.prompt();
      
      // Wait for user choice
      const { outcome } = await this.deferredPrompt.userChoice;
      console.log('PWA: Install prompt outcome:', outcome);
      
      // Clear the prompt
      this.deferredPrompt = null;
      
      if (outcome === 'accepted') {
        this.isInstalled = true;
        // Mark as installed in localStorage
        localStorage.setItem('pwa-installed', 'true');
        console.log('PWA: App installation accepted');
        return { success: true, message: 'App installed successfully! You can now access it from your home screen.' };
      } else {
        console.log('PWA: App installation declined by user');
        return { success: false, message: 'Installation was declined' };
      }
    } catch (error) {
      console.error('PWA: Install failed:', error);
      return { success: false, message: 'Installation failed. Please try again.' };
    }
  }

  // Get install status
  getInstallStatus() {
    return {
      canInstall: this.canInstall(),
      isInstalled: this.isInstalled,
      hasPrompt: this.deferredPrompt !== null
    };
  }

  // Utility function to convert VAPID key
  urlBase64ToUint8Array(base64String) {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding)
      .replace(/-/g, '+')
      .replace(/_/g, '/');

    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
  }
}

// Create singleton instance
const notificationService = new NotificationService();

export default notificationService;
