const CACHE_NAME = 'pwa-camera-gps-v1';

// App Shell - todos los recursos que deben estar en caché
const urlsToCache = [
  './',
  './index.html',
  './css/style.css',
  './js/app.js',
  './manifest.json',
  './icons/icon-192.png',
  './icons/icon-512.png'
];

// Instalar Service Worker y cachear App Shell
self.addEventListener('install', event => {
  console.log('Service Worker: Instalando...');
  
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Cacheando App Shell');
        return cache.addAll(urlsToCache);
      })
      .then(() => {
        console.log('App Shell cacheado exitosamente');
        return self.skipWaiting(); // Activar inmediatamente
      })
      .catch(error => {
        console.error('Error al cachear:', error);
      })
  );
});

// Activar Service Worker y limpiar cachés antiguos
self.addEventListener('activate', event => {
  console.log('Service Worker: Activando...');
  
  event.waitUntil(
    caches.keys()
      .then(cacheNames => {
        return Promise.all(
          cacheNames.map(cacheName => {
            if (cacheName !== CACHE_NAME) {
              console.log('Eliminando caché antiguo:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(() => {
        console.log('Service Worker activado');
        return self.clients.claim(); // Tomar control inmediato
      })
  );
});

// Estrategia: ONLY CACHE (Cache Only) para App Shell
// El App Shell se sirve exclusivamente desde caché
// Las APIs externas pueden usar la red
self.addEventListener('fetch', event => {
  const { request } = event;
  const url = new URL(request.url);
  
  // URLs externas (Google Maps, APIs, etc.) - permitir fetch
  if (!url.origin.includes('localhost') && 
      !url.origin.includes('127.0.0.1') && 
      !url.hostname === window?.location?.hostname) {
    event.respondWith(fetch(request));
    return;
  }
  
  // App Shell - usar caché
  event.respondWith(
    caches.match(request)
      .then(response => {
        if (response) {
          return response;
        }
        
        // Si no está en caché, intentar fetch de la red
        return fetch(request)
          .catch(() => {
            // Si falla la red, devolver página offline
            console.warn('Recurso no disponible:', request.url);
            return new Response('No disponible', { status: 503 });
          });
      })
  );
});

console.log('Service Worker cargado');
