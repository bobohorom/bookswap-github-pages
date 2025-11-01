const CACHE_NAME = 'bookswap-github-v1';
const urlsToCache = [
  './',
  './index.html',
  './js/app.js',
  './css/styles.css',
  './manifest.json',
  'https://cdn.tailwindcss.com?plugins=forms,container-queries',
  'https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined',
  'https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap'
];

// Fallback images for offline use
const FALLBACK_BOOK_IMAGE = 'data:image/svg+xml;base64,' + btoa(`
<svg xmlns="http://www.w3.org/2000/svg" width="200" height="300" viewBox="0 0 200 300">
  <rect width="200" height="300" fill="#E2725B"/>
  <rect x="20" y="20" width="160" height="260" fill="white" stroke="#333" stroke-width="2"/>
  <line x1="40" y1="20" x2="40" y2="280" stroke="#ccc" stroke-width="1"/>
  <rect x="45" y="40" width="120" height="30" fill="#E2725B"/>
  <text x="100" y="60" text-anchor="middle" fill="white" font-family="Arial" font-size="16" font-weight="bold">BOOK</text>
  <text x="100" y="150" text-anchor="middle" fill="#666" font-family="Arial" font-size="12">Image non</text>
  <text x="100" y="170" text-anchor="middle" fill="#666" font-family="Arial" font-size="12">disponible</text>
  <text x="100" y="190" text-anchor="middle" fill="#666" font-family="Arial" font-size="12">hors ligne</text>
</svg>
`);

// Install event - cache resources
self.addEventListener('install', (event) => {
  console.log('Service Worker: Install event');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Service Worker: Caching files');
        return cache.addAll(urlsToCache);
      })
      .then(() => {
        console.log('Service Worker: Cache created successfully');
        return self.skipWaiting();
      })
      .catch((error) => {
        console.error('Service Worker: Cache failed', error);
      })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('Service Worker: Activate event');
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('Service Worker: Deleting old cache', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => {
      console.log('Service Worker: Activated successfully');
      return self.clients.claim();
    })
  );
});

// Fetch event - serve cached content when offline or server down
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // CACHE FIRST STRATEGY: Return cached version if available
        if (response) {
          console.log('Service Worker: Serving from cache:', event.request.url);
          return response;
        }
        
        // Try to fetch from network with timeout
        return fetchWithTimeout(event.request, 5000)
          .then((response) => {
            // Check if we received a valid response
            if (!response || response.status !== 200 || response.type !== 'basic') {
              return response;
            }

            // Clone the response for caching
            const responseToCache = response.clone();

            caches.open(CACHE_NAME)
              .then((cache) => {
                cache.put(event.request, responseToCache);
              });

            return response;
          })
          .catch((error) => {
            console.log('Service Worker: Network failed, serving fallback:', error);
            
            // Handle different types of failed requests
            if (event.request.destination === 'document') {
              // Serve cached index.html for navigation requests
              return caches.match('/index.html') || caches.match('/');
            }
            
            // For image requests, return fallback image
            if (event.request.destination === 'image') {
              return new Response(FALLBACK_BOOK_IMAGE, {
                headers: { 'Content-Type': 'image/svg+xml' }
              });
            }
            
            // For API calls, return cached data or error response
            if (event.request.url.includes('/api/')) {
              return new Response(JSON.stringify({
                error: 'Serveur indisponible - Mode hors ligne',
                cached: true,
                timestamp: Date.now()
              }), {
                status: 503,
                statusText: 'Service Unavailable',
                headers: { 'Content-Type': 'application/json' }
              });
            }
            
            // For other requests, return a generic offline response
            if (event.request.method === 'GET') {
              return new Response('Service indisponible - Application en mode cache', {
                status: 503,
                statusText: 'Service Unavailable',
                headers: { 'Content-Type': 'text/plain' }
              });
            }
          });
      })
  );
});

// Helper function to fetch with timeout
function fetchWithTimeout(request, timeout = 5000) {
  return new Promise((resolve, reject) => {
    const timeoutId = setTimeout(() => {
      reject(new Error('Network timeout'));
    }, timeout);

    fetch(request)
      .then(response => {
        clearTimeout(timeoutId);
        resolve(response);
      })
      .catch(error => {
        clearTimeout(timeoutId);
        reject(error);
      });
  });
}

// Background sync for offline actions
self.addEventListener('sync', (event) => {
  if (event.tag === 'background-sync') {
    console.log('Service Worker: Background sync triggered');
    event.waitUntil(doBackgroundSync());
  }
});

function doBackgroundSync() {
  // Handle offline actions when back online
  return new Promise((resolve) => {
    // Check for pending actions in IndexedDB
    // Sync data with server
    // This would be implemented based on your specific needs
    resolve();
  });
}

// Push notification handling
self.addEventListener('push', (event) => {
  console.log('Service Worker: Push notification received');
  
  const options = {
    body: event.data ? event.data.text() : 'Nouvelle notification BookSwap',
    icon: '/icons/icon-192x192.png',
    badge: '/icons/badge-72x72.png',
    vibrate: [100, 50, 100],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 1
    },
    actions: [
      {
        action: 'explore',
        title: 'Voir',
        icon: '/icons/checkmark.png'
      },
      {
        action: 'close',
        title: 'Fermer',
        icon: '/icons/xmark.png'
      }
    ]
  };

  event.waitUntil(
    self.registration.showNotification('BookSwap', options)
  );
});

// Notification click handling
self.addEventListener('notificationclick', (event) => {
  console.log('Service Worker: Notification click received');

  event.notification.close();

  if (event.action === 'explore') {
    event.waitUntil(
      clients.openWindow('/')
    );
  } else if (event.action === 'close') {
    // Just close the notification
  } else {
    // Default action - open the app
    event.waitUntil(
      clients.openWindow('/')
    );
  }
});

// Error handling
self.addEventListener('error', (event) => {
  console.error('Service Worker error:', event.error);
});

self.addEventListener('unhandledrejection', (event) => {
  console.error('Service Worker unhandled promise rejection:', event.reason);
});

// Helper function to cache important resources
function cacheImportantResources() {
  return caches.open(CACHE_NAME).then((cache) => {
    return cache.addAll([
      '/',
      '/index.html',
      '/js/app.js'
    ]);
  });
}

// Periodic background sync (if supported)
self.addEventListener('periodicsync', (event) => {
  if (event.tag === 'get-latest-books') {
    event.waitUntil(updateBooks());
  }
});

function updateBooks() {
  return fetch('/api/books')
    .then((response) => response.json())
    .then((books) => {
      // Update local storage or IndexedDB with latest books
      return self.registration.showNotification('BookSwap', {
        body: `${books.length} livres synchronisés`,
        icon: '/icons/icon-192x192.png'
      });
    })
    .catch((error) => {
      console.log('Background sync failed:', error);
    });
}