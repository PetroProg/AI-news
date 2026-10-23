/**
 * AI News — Service Worker (PWA)
 * Архитектура кэширования:
 * 1. Navigation & HTML ('/'): Network-First с мгновенным откатом к кэшу при оффлайне.
 * 2. API ('/api/news', '/api/stats' и др. GET-запросы): Network-First с сохранением копии для оффлайн-чтения.
 * 3. Статика ('/css/', '/js/', '/icons/'): Stale-While-Revalidate для быстрой загрузки и фонового обновления.
 * 4. Медиа ('/media/'): Cache-First с ограничением размера кэша.
 */

const CACHE_VERSION = 'v1.0.0';
const SHELL_CACHE = `ai-news-shell-${CACHE_VERSION}`;
const API_CACHE = `ai-news-api-${CACHE_VERSION}`;
const MEDIA_CACHE = `ai-news-media-${CACHE_VERSION}`;

const PRECACHE_URLS = [
  '/',
  '/manifest.webmanifest',
  '/icons/icon-192.png',
  '/icons/icon-512.png',
  '/icons/icon-maskable-192.png',
  '/icons/icon-maskable-512.png',
  '/icons/apple-touch-icon.png',
  '/icons/favicon.svg'
];

self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(SHELL_CACHE).then(async (cache) => {
      for (const url of PRECACHE_URLS) {
        try {
          await cache.add(url);
        } catch (err) {
          console.warn('[SW] Precache warning for:', url, err);
        }
      }
    })
  );
});

self.addEventListener('activate', (event) => {
  const allowedCaches = new Set([SHELL_CACHE, API_CACHE, MEDIA_CACHE]);
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys.map((key) => {
          if (!allowedCaches.has(key)) {
            return caches.delete(key);
          }
          return null;
        })
      )
    ).then(() => self.clients.claim())
  );
});

async function limitCacheSize(cacheName, maxItems) {
  try {
    const cache = await caches.open(cacheName);
    const keys = await cache.keys();
    if (keys.length > maxItems) {
      await Promise.all(keys.slice(0, keys.length - maxItems).map((k) => cache.delete(k)));
    }
  } catch (e) {
    // Ignore cache trim errors
  }
}

self.addEventListener('fetch', (event) => {
  const { request } = event;

  // Кэшируем только GET-запросы
  if (request.method !== 'GET') {
    return;
  }

  const url = new URL(request.url);

  // Пропускаем chrome-extension и не-HTTP схемы
  if (!url.protocol.startsWith('http')) {
    return;
  }

  // 1. Запросы к API (/api/...) — Network-First с оффлайн-кэшем
  if (url.origin === self.location.origin && url.pathname.startsWith('/api/')) {
    event.respondWith(
      (async () => {
        const cache = await caches.open(API_CACHE);
        try {
          const networkResponse = await fetch(request);
          if (networkResponse && networkResponse.ok) {
            cache.put(request, networkResponse.clone());
          }
          return networkResponse;
        } catch (err) {
          const cachedResponse = await cache.match(request);
          if (cachedResponse) {
            return cachedResponse;
          }
          return new Response(
            JSON.stringify({
              offline: true,
              error: 'Offline mode: no cached data available for this endpoint',
              items: []
            }),
            {
              status: 200,
              headers: { 'Content-Type': 'application/json', 'X-PWA-Offline': 'true' }
            }
          );
        }
      })()
    );
    return;
  }

  // 2. Навигационные запросы (HTML страница) — Network-First с фоллбэком на App Shell
  if (request.mode === 'navigate' || (url.origin === self.location.origin && url.pathname === '/')) {
    event.respondWith(
      (async () => {
        const cache = await caches.open(SHELL_CACHE);
        try {
          const networkResponse = await fetch(request);
          if (networkResponse && networkResponse.ok) {
            cache.put('/', networkResponse.clone());
          }
          return networkResponse;
        } catch (err) {
          const cachedRoot = await cache.match('/');
          if (cachedRoot) {
            return cachedRoot;
          }
          throw err;
        }
      })()
    );
    return;
  }

  // 3. Медиафайлы новостей (/media/...) — Cache-First с подгрузкой из сети
  if (url.origin === self.location.origin && url.pathname.startsWith('/media/')) {
    event.respondWith(
      (async () => {
        const cache = await caches.open(MEDIA_CACHE);
        const cached = await cache.match(request);
        if (cached) {
          return cached;
        }
        try {
          const networkResponse = await fetch(request);
          if (networkResponse && networkResponse.ok) {
            cache.put(request, networkResponse.clone());
            limitCacheSize(MEDIA_CACHE, 120);
          }
          return networkResponse;
        } catch (err) {
          return new Response('', { status: 404 });
        }
      })()
    );
    return;
  }

  // 4. Статика (CSS, JS, иконки, внешние CDN шрифты/скрипты) — Stale-While-Revalidate
  if (
    url.origin === self.location.origin ||
    url.hostname.includes('tailwindcss.com') ||
    url.hostname.includes('fonts.googleapis.com') ||
    url.hostname.includes('fonts.gstatic.com')
  ) {
    event.respondWith(
      (async () => {
        const cache = await caches.open(SHELL_CACHE);
        const cached = await cache.match(request);
        const networkPromise = fetch(request)
          .then((networkResponse) => {
            if (networkResponse && (networkResponse.ok || networkResponse.type === 'opaque')) {
              cache.put(request, networkResponse.clone());
            }
            return networkResponse;
          })
          .catch(() => null);

        if (cached) {
          return cached;
        }
        const netResp = await networkPromise;
        if (netResp) {
          return netResp;
        }
        return new Response('', { status: 504, statusText: 'Offline' });
      })()
    );
  }
});

self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});
