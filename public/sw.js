// Service Worker for SnakeShop - Offline functionality and push notifications
const CACHE_NAME = 'snakeshop-v1';
const urlsToCache = [
  '/',
  '/static/js/bundle.js',
  '/static/css/main.css',
  '/manifest.json'
];

// Install event
self.addEventListener('install', (event) => {
  console.log('Service Worker: Install');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Service Worker: Caching files');
        return cache.addAll(urlsToCache);
      })
      .catch((error) => {
        console.log('Service Worker: Cache failed', error);
      })
  );
});

// Activate event
self.addEventListener('activate', (event) => {
  console.log('Service Worker: Activate');
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('Service Worker: Deleting old cache');
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

// Fetch event - Offline functionality
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // Return cached version or fetch from network
        return response || fetch(event.request);
      })
      .catch(() => {
        // If both cache and network fail, show offline page
        if (event.request.destination === 'document') {
          return caches.match('/');
        }
      })
  );
});

// Push notification event
self.addEventListener('push', (event) => {
  console.log('Service Worker: Push received');
  
  const options = {
    body: event.data ? event.data.text() : 'New notification from SnakeShop',
    icon: '/logo192.png',
    badge: '/logo192.png',
    vibrate: [200, 100, 200],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 1
    },
    actions: [
      {
        action: 'explore',
        title: 'View Details',
        icon: '/logo192.png'
      },
      {
        action: 'close',
        title: 'Close',
        icon: '/logo192.png'
      }
    ]
  };

  event.waitUntil(
    self.registration.showNotification('SnakeShop Notification', options)
  );
});

// Handle badge notifications
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SET_BADGE') {
    const count = event.data.count || 0;
    console.log('Service Worker: Setting badge count to', count);
    
    // Set badge count with multiple approaches for mobile
    setBadgeWithFallback(count);
  }
});

// Enhanced badge setting with mobile fallbacks
async function setBadgeWithFallback(count) {
  try {
    console.log('Service Worker: Setting badge with count:', count);
    
    // Method 1: Try native Badge API (most reliable)
    if ('setAppBadge' in navigator) {
      console.log('Service Worker: Trying native Badge API');
      try {
        if (count > 0) {
          await navigator.setAppBadge(count);
          console.log('Service Worker: Native badge set successfully to', count);
        } else {
          await navigator.clearAppBadge();
          console.log('Service Worker: Native badge cleared successfully');
        }
        return;
      } catch (error) {
        console.log('Service Worker: Native Badge API failed:', error);
      }
    }
    
    // Method 2: Force badge through persistent notification (Android)
    console.log('Service Worker: Trying persistent notification method');
    if (count > 0) {
      try {
        // Show a persistent notification to force badge
        await self.registration.showNotification('SnakeShop', {
          body: `${count} new notifications`,
          icon: '/logo192.png',
          badge: '/logo192.png',
          tag: 'persistent-badge',
          silent: false,
          requireInteraction: false,
          data: { 
            badgeCount: count,
            persistent: true 
          },
          actions: [
            {
              action: 'view',
              title: 'View Notifications',
              icon: '/logo192.png'
            }
          ]
        });
        console.log('Service Worker: Persistent notification badge set');
      } catch (error) {
        console.log('Service Worker: Persistent notification failed:', error);
      }
    } else {
      // Clear persistent notification
      try {
        const notifications = await self.registration.getNotifications({ tag: 'persistent-badge' });
        notifications.forEach(notification => notification.close());
        console.log('Service Worker: Persistent notification cleared');
      } catch (error) {
        console.log('Service Worker: Clear persistent notification failed:', error);
      }
    }
    
    // Method 3: Try silent notification method
    if (count > 0) {
      try {
        await self.registration.showNotification('SnakeShop', {
          body: `${count} new notifications`,
          icon: '/logo192.png',
          badge: '/logo192.png',
          tag: 'silent-badge',
          silent: true,
          requireInteraction: false,
          data: { badgeCount: count }
        });
        
        // Close after a short delay
        setTimeout(async () => {
          try {
            const notifications = await self.registration.getNotifications({ tag: 'silent-badge' });
            notifications.forEach(notification => notification.close());
          } catch (error) {
            console.log('Service Worker: Close silent notification failed:', error);
          }
        }, 200);
        
        console.log('Service Worker: Silent notification badge triggered');
      } catch (error) {
        console.log('Service Worker: Silent notification failed:', error);
      }
    }
    
  } catch (error) {
    console.log('Service Worker: All badge methods failed:', error);
  }
}

// Clear badge when notification is clicked
self.addEventListener('notificationclick', (event) => {
  console.log('Service Worker: Notification click received');
  
  event.notification.close();
  
  // Clear badge count
  if ('clearAppBadge' in navigator) {
    navigator.clearAppBadge().catch(error => {
      console.log('Service Worker: Could not clear badge:', error);
    });
  }
  
  if (event.action === 'explore') {
    // Open the app
    event.waitUntil(
      clients.openWindow('/')
    );
  } else if (event.action === 'close') {
    // Just close the notification
    event.notification.close();
  } else {
    // Default action - open the app
    event.waitUntil(
      clients.openWindow('/')
    );
  }
});

// Background sync for offline orders
self.addEventListener('sync', (event) => {
  console.log('Service Worker: Background sync');
  
  if (event.tag === 'order-sync') {
    event.waitUntil(
      // Sync offline orders when connection is restored
      syncOfflineOrders()
    );
  }
});

async function syncOfflineOrders() {
  try {
    // Get offline orders from IndexedDB
    const offlineOrders = await getOfflineOrders();
    
    for (const order of offlineOrders) {
      try {
        const response = await fetch('/api/orders', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${order.token}`
          },
          body: JSON.stringify(order.data)
        });
        
        if (response.ok) {
          // Remove from offline storage
          await removeOfflineOrder(order.id);
        }
      } catch (error) {
        console.log('Sync failed for order:', order.id);
      }
    }
  } catch (error) {
    console.log('Background sync failed:', error);
  }
}

// Helper functions for offline storage
async function getOfflineOrders() {
  // Implementation for getting offline orders from IndexedDB
  return [];
}

async function removeOfflineOrder(orderId) {
  // Implementation for removing synced orders from IndexedDB
  console.log('Removing offline order:', orderId);
}
