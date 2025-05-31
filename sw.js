const CACHE_NAME = 'creaite-cache-v1.0.0.8'; // НЕ ЗАБЫВАЕМ ОБНОВЛЯТЬ ХЭШ

self.addEventListener('install', e => {
  console.log('📦 Кэширование основных ресурсов для creAIte...');
  e.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll([
        '.',
        'index.html',
        'manifest.json',
        'icon-192.png',
        'icon-512.png',
        'theme.js',
        'icon-moon.png',
        'icon-sun.png'
      ]);
    }).then(() => self.skipWaiting()) // <-- ДОБАВИТЬ ЭТУ СТРОКУ
    .catch(error => {
      console.error('❌ Ошибка при кэшировании:', error);
    })
  );
});

self.addEventListener('activate', e => {
  console.log('🔄 Активация Service Worker...');
  e.waitUntil(
    caches.keys().then(keys => {
      return Promise.all(
        keys.filter(k => k !== CACHE_NAME)
            .map(k => {
              console.log(`🗑️ Удаление старого кэша: ${k}`);
              return caches.delete(k);
            })
      );
    }).then(() => self.clients.claim()) // <-- И ЭТУ СТРОКУ
    .catch(error => {
      console.error('❌ Ошибка при активации Service Worker:', error);
    })
  );
});

self.addEventListener('fetch', e => {
  e.respondWith(
    caches.match(e.request).then(response => {
      if (response) {
        return response;
      }
      return fetch(e.request);
    }).catch(error => {
      console.error('❌ Ошибка при перехвате запроса:', error);
    })
  );
});
