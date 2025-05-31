const CACHE_NAME = 'creaite-cache-v1.0.3.9'; // ОБЯЗАТЕЛЬНО МЕНЯЙ ЭТОТ ХЭШ КАЖДЫЙ РАЗ!

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
      console.log('✅ Service Worker: Ресурсы успешно кэшированы и готовы к активации.');
      self.skipWaiting(); // <--- ВОЗВРАЩАЕМ ЭТУ СТРОКУ: НОВЫЙ SW АКТИВИРУЕТСЯ СРАЗУ
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
      self.clients.claim(); // <--- ЭТО ВАЖНО: НОВЫЙ SW СРАЗУ БЕРЕТ КОНТРОЛЬ НАД ВСЕМИ КЛИЕНТАМИ
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

// <--- ОБРАБОТЧИК СООБЩЕНИЙ self.addEventListener('message', ...) БОЛЬШЕ НЕ НУЖЕН И УДАЛЯЕТСЯ
// Так как мы не будем отправлять SKIP_WAITING из theme.js
