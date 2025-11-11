// Service Worker for キャラプロンプト辞書
const CACHE_NAME = 'character-prompt-dict-v2';
const STATIC_CACHE_NAME = 'static-v2';
const RUNTIME_CACHE_NAME = 'runtime-v2';

// 静的アセットのキャッシュリスト
const STATIC_ASSETS = [
  '/',
  '/manifest.json',
];

// インストール時: 静的アセットをキャッシュ
self.addEventListener('install', (event) => {
  console.log('[SW] Installing Service Worker...');
  event.waitUntil(
    caches.open(STATIC_CACHE_NAME).then((cache) => {
      console.log('[SW] Caching static assets');
      return cache.addAll(STATIC_ASSETS);
    })
  );
  self.skipWaiting();
});

// アクティベーション時: 古いキャッシュを削除
self.addEventListener('activate', (event) => {
  console.log('[SW] Activating Service Worker...');
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (
            cacheName !== STATIC_CACHE_NAME &&
            cacheName !== RUNTIME_CACHE_NAME
          ) {
            console.log('[SW] Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// フェッチイベント: リクエストのキャッシュ戦略
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // API呼び出し（Gemini、Imagen）: ネットワークファースト
  if (
    url.hostname.includes('googleapis.com') ||
    url.hostname.includes('generativelanguage.googleapis.com')
  ) {
    event.respondWith(networkFirst(request));
    return;
  }

  // 静的アセット: キャッシュファースト
  if (
    request.destination === 'style' ||
    request.destination === 'script' ||
    request.destination === 'image' ||
    request.destination === 'font'
  ) {
    event.respondWith(cacheFirst(request));
    return;
  }

  // デフォルト: ネットワークファースト（HTMLページ等）
  event.respondWith(networkFirst(request));
});

// キャッシュファースト戦略
async function cacheFirst(request) {
  const cache = await caches.open(RUNTIME_CACHE_NAME);
  const cached = await cache.match(request);

  if (cached) {
    console.log('[SW] Cache hit:', request.url);
    return cached;
  }

  console.log('[SW] Cache miss, fetching:', request.url);
  try {
    const response = await fetch(request);
    // 成功したレスポンスをキャッシュ
    if (response && response.status === 200) {
      cache.put(request, response.clone());
    }
    return response;
  } catch (error) {
    console.error('[SW] Fetch failed:', error);
    // オフライン時のフォールバック
    return new Response('Offline', {
      status: 503,
      statusText: 'Service Unavailable',
    });
  }
}

// ネットワークファースト戦略
async function networkFirst(request) {
  const cache = await caches.open(RUNTIME_CACHE_NAME);

  try {
    console.log('[SW] Fetching from network:', request.url);
    const response = await fetch(request);
    // 成功したレスポンスをキャッシュ
    if (response && response.status === 200) {
      cache.put(request, response.clone());
    }
    return response;
  } catch (error) {
    console.error('[SW] Network failed, trying cache:', error);
    const cached = await cache.match(request);
    if (cached) {
      console.log('[SW] Serving from cache:', request.url);
      return cached;
    }
    // キャッシュもない場合
    return new Response('Offline and no cache available', {
      status: 503,
      statusText: 'Service Unavailable',
    });
  }
}
