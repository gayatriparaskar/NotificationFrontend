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

      // Restore badge count for mobile devices
      this.restoreBadgeCount();

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
      
      // Detect device type for better badge handling
      const userAgent = navigator.userAgent.toLowerCase();
      const isMobile = /android|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(userAgent);
      const isAndroid = userAgent.includes('android');
      const isIOS = userAgent.includes('iphone') || userAgent.includes('ipad');
      
      console.log('Notification Service: Device info - Mobile:', isMobile, 'Android:', isAndroid, 'iOS:', isIOS);
      
      // For mobile devices, prioritize mobile-specific badge handling
      if (isMobile) {
        console.log('Notification Service: Mobile device detected, using mobile badge handling');
        this.setMobileBadgeFallback(count);
        
        // Also try native Badge API if available (Android Chrome)
        if ('setAppBadge' in navigator) {
          console.log('Notification Service: Also trying native Badge API on mobile');
          if (count > 0) {
            navigator.setAppBadge(count).then(() => {
              console.log('Notification Service: Mobile native badge set successfully to', count);
            }).catch(error => {
              console.log('Notification Service: Mobile native badge failed:', error);
            });
          } else {
            navigator.clearAppBadge().then(() => {
              console.log('Notification Service: Mobile native badge cleared successfully');
            }).catch(error => {
              console.log('Notification Service: Mobile native badge clear failed:', error);
            });
          }
        }
        
        // Additional mobile badge methods
        this.setMobileAppIconBadge(count);
      } else {
        // Desktop: Use native Badge API
        if ('setAppBadge' in navigator) {
          if (count > 0) {
            navigator.setAppBadge(count).then(() => {
              console.log('Notification Service: Desktop badge set successfully to', count);
            }).catch(error => {
              console.log('Notification Service: Could not set desktop badge:', error);
              this.setMobileBadgeFallback(count);
            });
          } else {
            navigator.clearAppBadge().then(() => {
              console.log('Notification Service: Desktop badge cleared successfully');
            }).catch(error => {
              console.log('Notification Service: Could not clear desktop badge:', error);
              this.setMobileBadgeFallback(0);
            });
          }
        } else {
          console.log('Notification Service: Badge API not supported, using fallback');
          this.setMobileBadgeFallback(count);
        }
      }
      
      // Also send to service worker for additional support
      if (this.registration && this.registration.active) {
        this.registration.active.postMessage({
          type: 'SET_BADGE',
          count: count
        });
      }
      
      // Store badge count in localStorage as fallback
      if (count > 0) {
        localStorage.setItem('badge-count', count.toString());
      } else {
        localStorage.removeItem('badge-count');
      }
      
      // Force badge update event for UI components
      this.forceBadgeUpdate(count);
      
    } catch (error) {
      console.log('Notification Service: Could not set badge count:', error);
    }
  }

  // Mobile badge fallback (for iOS and unsupported browsers)
  setMobileBadgeFallback(count) {
    console.log('Notification Service: Using mobile badge fallback for count:', count);
    
    // Update document title with badge count (most reliable on mobile)
    this.updateDocumentTitle(count);
    console.log('Notification Service: Document title updated for mobile');
    
    // Update favicon with badge (if possible)
    this.updateFaviconBadge(count);
    console.log('Notification Service: Favicon badge updated for mobile');
    
    // Store in localStorage for persistence
    if (count > 0) {
      localStorage.setItem('mobile-badge-count', count.toString());
      localStorage.setItem('badge-timestamp', Date.now().toString());
      console.log('Notification Service: Mobile badge count stored in localStorage:', count);
    } else {
      localStorage.removeItem('mobile-badge-count');
      localStorage.removeItem('badge-timestamp');
      console.log('Notification Service: Mobile badge count cleared from localStorage');
    }
    
    // Force update the badge count in the UI
    this.forceBadgeUpdate(count);
    
    // Additional mobile-specific badge handling
    this.handleMobileSpecificBadge(count);
  }

  // Handle mobile-specific badge features
  handleMobileSpecificBadge(count) {
    try {
      const userAgent = navigator.userAgent.toLowerCase();
      const isAndroid = userAgent.includes('android');
      const isIOS = userAgent.includes('iphone') || userAgent.includes('ipad');
      
      if (isAndroid) {
        console.log('Notification Service: Android-specific badge handling');
        // Android Chrome might support some badge features
        this.handleAndroidBadge(count);
      } else if (isIOS) {
        console.log('Notification Service: iOS-specific badge handling');
        // iOS Safari has limited badge support
        this.handleiOSBadge(count);
      }
    } catch (error) {
      console.log('Notification Service: Mobile-specific badge handling failed:', error);
    }
  }

  // Handle Android-specific badge features
  handleAndroidBadge(count) {
    try {
      // Try to use Android-specific badge methods if available
      if (navigator.setAppBadge) {
        if (count > 0) {
          navigator.setAppBadge(count).then(() => {
            console.log('Notification Service: Android badge set successfully');
          }).catch(error => {
            console.log('Notification Service: Android badge failed:', error);
          });
        } else {
          navigator.clearAppBadge().then(() => {
            console.log('Notification Service: Android badge cleared successfully');
          }).catch(error => {
            console.log('Notification Service: Android badge clear failed:', error);
          });
        }
      }
    } catch (error) {
      console.log('Notification Service: Android badge handling failed:', error);
    }
  }

  // Handle iOS-specific badge features
  handleiOSBadge(count) {
    try {
      // iOS has very limited badge support, rely on fallbacks
      console.log('Notification Service: iOS badge fallback - using document title and in-app indicators');
      
      // Force update document title (most reliable on iOS)
      this.updateDocumentTitle(count);
      
      // Store badge count for in-app display
      if (count > 0) {
        localStorage.setItem('ios-badge-count', count.toString());
      } else {
        localStorage.removeItem('ios-badge-count');
      }
    } catch (error) {
      console.log('Notification Service: iOS badge handling failed:', error);
    }
  }

  // Set mobile app icon badge using multiple methods
  setMobileAppIconBadge(count) {
    try {
      console.log('Notification Service: Setting mobile app icon badge to', count);
      
      // Method 1: Try to set badge through service worker
      if (this.registration && this.registration.active) {
        this.registration.active.postMessage({
          type: 'SET_BADGE',
          count: count,
          force: true
        });
        console.log('Notification Service: Badge message sent to service worker');
      }
      
      // Method 2: Try to trigger badge through silent notification
      if (count > 0) {
        this.triggerBadgeNotification(count);
      }
      
      // Method 3: Update favicon with badge
      this.updateFaviconBadge(count);
      
    } catch (error) {
      console.log('Notification Service: Mobile app icon badge failed:', error);
    }
  }

  // Trigger badge through silent notification
  triggerBadgeNotification(count) {
    try {
      if (Notification.permission === 'granted') {
        // Show a very brief notification to trigger badge
        const notification = new Notification('SnakeShop', {
          body: `${count} new notifications`,
          icon: '/logo192.png',
          badge: '/logo192.png',
          tag: 'badge-trigger',
          silent: true,
          requireInteraction: false
        });
        
        // Close immediately to just trigger the badge
        setTimeout(() => {
          notification.close();
        }, 50);
        
        console.log('Notification Service: Badge notification triggered');
      }
    } catch (error) {
      console.log('Notification Service: Badge notification failed:', error);
    }
  }

  // Force badge update in the UI
  forceBadgeUpdate(count) {
    try {
      // Dispatch a custom event to update UI components
      window.dispatchEvent(new CustomEvent('badge-update', { 
        detail: { count: count } 
      }));
      console.log('Notification Service: Badge update event dispatched with count:', count);
    } catch (error) {
      console.log('Notification Service: Could not dispatch badge update event:', error);
    }
  }

  // Update document title with badge count
  updateDocumentTitle(count) {
    const originalTitle = 'SnakeShop - Premium Snake Collection';
    if (count > 0) {
      document.title = `(${count}) ${originalTitle}`;
    } else {
      document.title = originalTitle;
    }
  }

  // Update favicon with badge (experimental)
  updateFaviconBadge(count) {
    try {
      if (count > 0) {
        // Create a canvas with badge
        const canvas = document.createElement('canvas');
        canvas.width = 32;
        canvas.height = 32;
        const ctx = canvas.getContext('2d');
        
        // Draw red circle background
        ctx.fillStyle = '#ff0000';
        ctx.beginPath();
        ctx.arc(24, 8, 8, 0, 2 * Math.PI);
        ctx.fill();
        
        // Draw white text
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 10px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(count.toString(), 24, 8);
        
        // Update favicon
        const link = document.querySelector("link[rel*='icon']") || document.createElement('link');
        link.type = 'image/x-icon';
        link.rel = 'shortcut icon';
        link.href = canvas.toDataURL();
        document.getElementsByTagName('head')[0].appendChild(link);
      } else {
        // Reset to original favicon
        const link = document.querySelector("link[rel*='icon']");
        if (link) {
          link.href = '/favicon.ico';
        }
      }
    } catch (error) {
      console.log('Notification Service: Could not update favicon badge:', error);
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
          // Use mobile fallback
          this.setMobileBadgeFallback(0);
        });
      } else {
        // Use mobile fallback for unsupported browsers
        this.setMobileBadgeFallback(0);
      }
      
      // Also send to service worker
      if (this.registration && this.registration.active) {
        this.registration.active.postMessage({
          type: 'SET_BADGE',
          count: 0
        });
      }
      
      // Clear badge count from localStorage
      localStorage.removeItem('badge-count');
      localStorage.removeItem('mobile-badge-count');
      
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
      
      // Always try to create a new audio context for better compatibility
      const audioContext = new (window.AudioContext || window.webkitAudioContext)();
      
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
    console.log('PWA: Initializing PWA installation...');
    
    // Check if app is already installed
    this.checkIfInstalled();
    
    // Listen for beforeinstallprompt event
    window.addEventListener('beforeinstallprompt', (e) => {
      console.log('PWA: beforeinstallprompt event fired');
      e.preventDefault();
      this.deferredPrompt = e;
      console.log('PWA: Deferred prompt stored');
    });

    // Listen for appinstalled event
    window.addEventListener('appinstalled', () => {
      console.log('PWA: App was installed');
      this.isInstalled = true;
      localStorage.setItem('pwa-installed', 'true');
      this.deferredPrompt = null;
    });

    // Additional mobile detection
    const userAgent = navigator.userAgent.toLowerCase();
    const isMobile = /android|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(userAgent);
    
    if (isMobile) {
      console.log('PWA: Mobile device detected');
      console.log('PWA: User Agent:', userAgent);
      
      // Force check for installability after a delay
      setTimeout(() => {
        this.checkMobileInstallability();
      }, 3000);
    }
  }

  // Check mobile installability
  checkMobileInstallability() {
    const userAgent = navigator.userAgent.toLowerCase();
    const isAndroid = userAgent.includes('android');
    const isIOS = userAgent.includes('iphone') || userAgent.includes('ipad');
    
    console.log('PWA: Checking mobile installability...');
    console.log('PWA: Is Android:', isAndroid);
    console.log('PWA: Is iOS:', isIOS);
    console.log('PWA: Has deferred prompt:', !!this.deferredPrompt);
    console.log('PWA: Is installed:', this.isInstalled);
    console.log('PWA: Standalone mode:', window.matchMedia('(display-mode: standalone)').matches);
  }

  // Restore badge count on page load (for mobile fallback)
  restoreBadgeCount() {
    try {
      const badgeCount = localStorage.getItem('mobile-badge-count');
      if (badgeCount && parseInt(badgeCount) > 0) {
        console.log('Notification Service: Restoring badge count:', badgeCount);
        this.setMobileBadgeFallback(parseInt(badgeCount));
      }
    } catch (error) {
      console.log('Notification Service: Could not restore badge count:', error);
    }
  }

  // Debug function to check badge status
  debugBadgeStatus() {
    const userAgent = navigator.userAgent.toLowerCase();
    const isMobile = /android|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(userAgent);
    const isAndroid = userAgent.includes('android');
    const isIOS = userAgent.includes('iphone') || userAgent.includes('ipad');
    
    console.log('=== BADGE DEBUG INFO ===');
    console.log('User Agent:', userAgent);
    console.log('Is Mobile:', isMobile);
    console.log('Is Android:', isAndroid);
    console.log('Is iOS:', isIOS);
    console.log('Badge API Support:', 'setAppBadge' in navigator);
    console.log('Current Badge Count (localStorage):', localStorage.getItem('mobile-badge-count'));
    console.log('Current Badge Count (badge-count):', localStorage.getItem('badge-count'));
    console.log('Document Title:', document.title);
    console.log('Service Worker Registration:', !!this.registration);
    console.log('========================');
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
    // Always show install button if not installed
    return !this.isInstalled;
  }

  // Install PWA - Direct installation
  async installPWA() {
    console.log('PWA: Starting installation process...');
    
    const userAgent = navigator.userAgent.toLowerCase();
    const isMobile = /android|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(userAgent);
    const isAndroid = userAgent.includes('android');
    const isIOS = userAgent.includes('iphone') || userAgent.includes('ipad');
    
    console.log('PWA: Device info - Mobile:', isMobile, 'Android:', isAndroid, 'iOS:', isIOS);
    console.log('PWA: Has deferred prompt:', !!this.deferredPrompt);
    console.log('PWA: Is already installed:', this.isInstalled);
    
    // Check if already in standalone mode
    if (window.matchMedia && window.matchMedia('(display-mode: standalone)').matches) {
      console.log('PWA: Already in standalone mode');
      this.isInstalled = true;
      localStorage.setItem('pwa-installed', 'true');
      return { success: true, message: 'App is already installed and running!' };
    }
    
    // Try to use deferred prompt first (Android Chrome)
    if (this.deferredPrompt) {
      try {
        console.log('PWA: Using deferred prompt for installation');
        
        // Show the install prompt immediately
        this.deferredPrompt.prompt();
        
        // Wait for user choice
        const { outcome } = await this.deferredPrompt.userChoice;
        console.log('PWA: Install prompt outcome:', outcome);
        
        // Clear the prompt
        this.deferredPrompt = null;
        
        if (outcome === 'accepted') {
          this.isInstalled = true;
          localStorage.setItem('pwa-installed', 'true');
          console.log('PWA: App installation accepted');
          return { success: true, message: 'App installed successfully! You can now access it from your home screen.' };
        } else {
          console.log('PWA: App installation declined by user');
          return { success: false, message: 'Installation was declined' };
        }
      } catch (error) {
        console.error('PWA: Deferred prompt failed:', error);
        // Fall through to manual installation
      }
    }
    
    // For mobile devices, provide manual installation instructions
    if (isMobile) {
      console.log('PWA: Mobile device detected, providing manual installation instructions');
      
      if (isAndroid) {
        return { 
          success: false, 
          message: 'Android Installation:\n\n1. Tap the menu button (⋮) in your browser\n2. Look for "Add to Home screen" or "Install app"\n3. Tap "Add" or "Install"\n4. The app will be added to your home screen!',
          isManual: true
        };
      } else if (isIOS) {
        return { 
          success: false, 
          message: 'iOS Installation:\n\n1. Tap the Share button (⬆️) at the bottom\n2. Scroll down and tap "Add to Home Screen"\n3. Tap "Add" in the top right\n4. The app will be added to your home screen!',
          isManual: true
        };
      } else {
        return { 
          success: false, 
          message: 'Mobile Installation:\n\nPlease use your browser menu to "Add to Home Screen" or "Install app".',
          isManual: true
        };
      }
    }
    
    // For desktop
    return { 
      success: false, 
      message: 'Desktop Installation:\n\nPlease use your browser menu to "Install App" or "Add to Home Screen".',
      isManual: true
    };
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
