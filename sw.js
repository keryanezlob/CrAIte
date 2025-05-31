const CACHE_NAME = 'creaite-cache-v0.1.0.0.2'; // НЕ ЗАБЫВАЕМ ОБНОВЛЯТЬ ХЭШ

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      console.log('📦 Кэширование основных ресурсов для creAIte...');
      return cache.addAll([
        '.',
        'index.html',
        'manifest.json',
        'icon-192.png',
        'icon-512.png',
        'theme.js',
        'icon-moon.png', // Убедимся, что иконки тоже кэшируются
        'icon-sun.png'   // Убедимся, что иконки тоже кэшируются
      ]);
    }).catch(error => {
      console.error('❌ Ошибка при кэшировании:', error);
    })
  );
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys => {
      return Promise.all(
        keys.filter(k => k !== CACHE_NAME)
            .map(k => {
              console.log(`🗑️ Удаление старого кэша: ${k}`);
              return caches.delete(k);
            })
      );
    }).catch(error => {
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
