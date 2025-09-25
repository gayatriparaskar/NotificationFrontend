// PWA Service for handling push notifications and offline functionality
class PWAService {
  constructor() {
    this.registration = null;
    this.subscription = null;
  }

  // Register service worker
  async registerServiceWorker() {
    if ('serviceWorker' in navigator) {
      try {
        const registration = await navigator.serviceWorker.register('/sw.js');
        console.log('PWA: Service Worker registered successfully:', registration);
        this.registration = registration;
        return registration;
      } catch (error) {
        console.error('PWA: Service Worker registration failed:', error);
        throw error;
      }
    } else {
      console.log('PWA: Service Worker not supported');
      return null;
    }
  }

  // Request notification permission
  async requestNotificationPermission() {
    if (!('Notification' in window)) {
      console.log('PWA: Notifications not supported');
      return false;
    }

    if (Notification.permission === 'granted') {
      console.log('PWA: Notifications already granted');
      return true;
    }

    if (Notification.permission === 'denied') {
      console.log('PWA: Notifications denied');
      return false;
    }

    const permission = await Notification.requestPermission();
    console.log('PWA: Notification permission:', permission);
    return permission === 'granted';
  }

  // Subscribe to push notifications
  async subscribeToPushNotifications() {
    if (!this.registration) {
      console.log('PWA: Service Worker not registered');
      return null;
    }

    try {
      const subscription = await this.registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: this.urlBase64ToUint8Array(
          'BEl62iUYgUivxIkv69yViEuiBIa40HI80F8b7VJ1aU8F7pKd9ACoz8HyYQVK8VjVjH8LQz4rUcXW4vM8N2vE8'
        )
      });

      console.log('PWA: Push subscription created:', subscription);
      this.subscription = subscription;
      return subscription;
    } catch (error) {
      console.error('PWA: Push subscription failed:', error);
      throw error;
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
        console.log('PWA: Subscription sent to server successfully');
        return true;
      } else {
        console.error('PWA: Failed to send subscription to server');
        return false;
      }
    } catch (error) {
      console.error('PWA: Error sending subscription to server:', error);
      return false;
    }
  }

  // Initialize PWA features
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

      // Initialize audio context for sounds
      this.initializeAudioContext();

      return true;
    } catch (error) {
      console.error('PWA: Initialization failed:', error);
      return false;
    }
  }

  // Initialize audio context for notification sounds
  initializeAudioContext() {
    try {
      console.log('PWA: Initializing audio context for notification sounds');
      this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
      console.log('PWA: Audio context initialized, state:', this.audioContext.state);
      
      // Add user interaction listener to enable audio
      this.addUserInteractionListener();
    } catch (error) {
      console.log('PWA: Could not initialize audio context:', error);
    }
  }

  // Add user interaction listener to enable audio
  addUserInteractionListener() {
    const enableAudio = () => {
      if (this.audioContext && this.audioContext.state === 'suspended') {
        console.log('PWA: User interaction detected, resuming audio context');
        this.audioContext.resume().then(() => {
          console.log('PWA: Audio context resumed successfully');
        }).catch(error => {
          console.log('PWA: Could not resume audio context:', error);
        });
      }
    };

    // Listen for user interactions
    document.addEventListener('click', enableAudio, { once: true });
    document.addEventListener('keydown', enableAudio, { once: true });
    document.addEventListener('touchstart', enableAudio, { once: true });
  }

  // Check if app is installed
  isAppInstalled() {
    return window.matchMedia('(display-mode: standalone)').matches ||
           window.navigator.standalone === true ||
           document.referrer.includes('android-app://');
  }

  // Check if install prompt is available
  canInstall() {
    // Basic PWA requirements
    const hasServiceWorker = 'serviceWorker' in navigator;
    const hasPushManager = 'PushManager' in window;
    const notInstalled = !this.isAppInstalled();
    const inBrowser = window.matchMedia('(display-mode: browser)').matches;
    
    // Check for Android Chrome
    const isAndroid = /Android/i.test(navigator.userAgent);
    const isChrome = /Chrome/i.test(navigator.userAgent);
    
    // For Android Chrome, check if PWA criteria are met
    if (isAndroid && isChrome) {
      return hasServiceWorker && hasPushManager && notInstalled && inBrowser;
    }
    
    // For other browsers, be more permissive
    return hasServiceWorker && notInstalled;
  }

  // Get install button visibility
  shouldShowInstallButton() {
    return this.canInstall() && !this.isAppInstalled();
  }

  // Check if running on Android
  isAndroid() {
    return /Android/i.test(navigator.userAgent);
  }

  // Check if running on Chrome
  isChrome() {
    return /Chrome/i.test(navigator.userAgent);
  }

  // Get Android-specific install instructions
  getAndroidInstallInstructions() {
    if (this.isAndroid() && this.isChrome()) {
      return {
        title: 'Install SnakeShop on Android',
        steps: [
          '1. Tap the three dots menu (⋮) in Chrome',
          '2. Look for "Add to Home screen" or "Install app"',
          '3. Tap "Add" or "Install" to confirm',
          '4. The app will be added to your home screen'
        ],
        alternative: 'Or look for the install icon (⊞) in the address bar'
      };
    }
    return null;
  }

  // Try to trigger install prompt programmatically
  async triggerInstallPrompt() {
    try {
      console.log('PWA: Attempting to trigger install prompt');
      
      // Check if we have a deferred prompt
      if (window.deferredPrompt) {
        console.log('PWA: Using deferred prompt');
        window.deferredPrompt.prompt();
        const { outcome } = await window.deferredPrompt.userChoice;
        console.log('PWA: Install prompt outcome:', outcome);
        return outcome === 'accepted';
      }

      // Check if service worker is ready
      if ('serviceWorker' in navigator) {
        const registration = await navigator.serviceWorker.ready;
        console.log('PWA: Service worker ready:', registration);
        
        // Check PWA criteria
        const hasManifest = document.querySelector('link[rel="manifest"]');
        const hasServiceWorker = !!registration;
        const isHTTPS = window.location.protocol === 'https:' || window.location.hostname === 'localhost';
        
        console.log('PWA: Install criteria check:', {
          hasManifest: !!hasManifest,
          hasServiceWorker,
          isHTTPS,
          isInstalled: this.isAppInstalled()
        });
        
        // If all criteria are met, the browser should show install prompt
        if (hasManifest && hasServiceWorker && isHTTPS && !this.isAppInstalled()) {
          console.log('PWA: All criteria met, install prompt should be available');
          return true;
        } else {
          console.log('PWA: Install criteria not met');
          return false;
        }
      }

      return false;
    } catch (error) {
      console.log('PWA: Could not trigger install prompt:', error);
      return false;
    }
  }

  // Check if app is running in PWA mode
  isPWAMode() {
    return this.isAppInstalled() || 
           window.matchMedia('(display-mode: standalone)').matches;
  }

  // Show local notification with WhatsApp-style features
  showLocalNotification(title, options = {}) {
    console.log('PWA: Attempting to show notification:', title);
    console.log('PWA: Notification permission:', Notification.permission);
    
    if (Notification.permission === 'granted') {
      console.log('PWA: Creating notification with sound and vibration');
      const notification = new Notification(title, {
        icon: '/logo192.png',
        badge: '/logo192.png',
        vibrate: [200, 100, 200, 100, 200], // WhatsApp-like vibration pattern
        requireInteraction: true, // Keep notification until user interacts
        ...options
      });

      // Play notification sound (if supported)
      console.log('PWA: Playing notification sound');
      this.playNotificationSound();

      // Auto close after 8 seconds (longer than before)
      setTimeout(() => {
        notification.close();
      }, 8000);

      return notification;
    } else {
      console.log('PWA: Notification permission not granted, cannot show notification');
    }
  }

  // Play notification sound
  playNotificationSound() {
    try {
      console.log('PWA: Creating audio context for notification sound');
      
      // Check if audio context is suspended (requires user interaction)
      let audioContext = this.audioContext;
      if (!audioContext || audioContext.state === 'closed') {
        audioContext = new (window.AudioContext || window.webkitAudioContext)();
        this.audioContext = audioContext;
      }
      
      // Resume audio context if suspended
      if (audioContext.state === 'suspended') {
        console.log('PWA: Resuming suspended audio context');
        audioContext.resume().then(() => {
          this.playNotificationTone(audioContext);
        }).catch(error => {
          console.log('PWA: Could not resume audio context:', error);
          // Fallback: try to play without resuming
          this.playNotificationTone(audioContext);
        });
      } else {
        this.playNotificationTone(audioContext);
      }
    } catch (error) {
      console.log('PWA: Could not play notification sound:', error);
    }
  }

  // Play the actual notification tone
  playNotificationTone(audioContext) {
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
      console.log('PWA: Notification sound played successfully');
    } catch (error) {
      console.log('PWA: Could not play notification tone:', error);
      // Try fallback method
      this.playFallbackSound();
    }
  }

  // Fallback sound using HTML5 audio
  playFallbackSound() {
    try {
      console.log('PWA: Playing fallback notification sound');
      // Create a simple beep sound using HTML5 Audio
      const audio = new Audio();
      const audioContext = new (window.AudioContext || window.webkitAudioContext)();
      
      // Create a simple beep using oscillator
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      // Simple beep sound
      oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
      oscillator.frequency.setValueAtTime(600, audioContext.currentTime + 0.1);
      
      gainNode.gain.setValueAtTime(0.2, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.2);
      
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.2);
      
      console.log('PWA: Fallback sound played successfully');
    } catch (error) {
      console.log('PWA: Fallback sound also failed:', error);
    }
  }

  // Handle offline functionality
  handleOffline() {
    console.log('PWA: App is offline');
    // You can show an offline indicator or queue actions
  }

  // Handle online functionality
  handleOnline() {
    console.log('PWA: App is back online');
    // You can sync offline data or hide offline indicators
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
const pwaService = new PWAService();

export default pwaService;
