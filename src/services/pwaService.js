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
           window.navigator.standalone === true;
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
      // Fallback to HTML5 audio
      this.playFallbackSound();
    }
  }

  // Fallback sound using HTML5 audio
  playFallbackSound() {
    try {
      console.log('PWA: Playing fallback notification sound');
      // Create a simple beep sound using HTML5 audio
      const audio = new Audio();
      const audioContext = new (window.AudioContext || window.webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
      oscillator.frequency.setValueAtTime(600, audioContext.currentTime + 0.1);
      oscillator.frequency.setValueAtTime(800, audioContext.currentTime + 0.2);
      
      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
      
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.3);
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
