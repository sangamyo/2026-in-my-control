self.addEventListener('install', event => {
  self.skipWaiting();
});

self.addEventListener('fetch', event => {
  // Simple network-first strategy for API calls
  if (event.request.url.includes('/api/')) {
    event.respondWith(fetch(event.request).catch(()=>caches.match(event.request)));
  }
});
