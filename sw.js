const CACHE_NAME = 'creaite-cache-v1.1.1.3'; // ОБЯЗАТЕЛЬНО МЕНЯЙ ЭТОТ ХЭШ КАЖДЫЙ РАЗ!

self.addEventListener('install', e => {
  console.log('📦 Service Worker: Установка и кэширование основных ресурсов для creAIte...');
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
    }).then(() => {
      console.log('✅ Service Worker: Ресурсы успешно кэшированы.');
      self.skipWaiting(); // Активировать новый Service Worker сразу
    }).catch(error => {
      console.error('❌ Service Worker: Ошибка при кэшировании:', error);
    })
  );
});

self.addEventListener('activate', e => {
  console.log('🔄 Service Worker: Активация и очистка старых кэшей...');
  e.waitUntil(
    caches.keys().then(keys => {
      return Promise.all(
        keys.filter(key => key !== CACHE_NAME)
            .map(key => {
              console.log(`🗑️ Service Worker: Удаление старого кэша: ${key}`);
              return caches.delete(key);
            })
      );
    }).then(() => {
      console.log('✅ Service Worker: Старые кэши удалены. Новый Service Worker активен.');
      self.clients.claim(); // Взять контроль над всеми клиентами
      // Сообщаем всем клиентам (вкладкам), что Service Worker активирован
      self.clients.matchAll().then(clients => {
          clients.forEach(client => client.postMessage({ type: 'UPDATE_ACTIVATED' }));
      });
    }).catch(error => {
      console.error('❌ Service Worker: Ошибка при активации:', error);
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
      console.error('❌ Service Worker: Ошибка при перехвате запроса:', error);
    })
  );
});

// Новый слушатель для сообщений от страниц (например, от theme.js)
self.addEventListener('message', (event) => {
    if (event.data && event.data.type === 'SKIP_WAITING') {
        self.skipWaiting(); // Принудительно активировать Service Worker
        console.log('⚡️ Service Worker: Получено сообщение SKIP_WAITING, принудительная активация.');
    }
});
