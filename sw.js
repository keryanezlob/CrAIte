const CACHE_NAME = 'creaite-cache-v1.0.0.9'; // НЕ ЗАБЫВАЕМ ОБНОВЛЯТЬ ХЭШ

self.addEventListener('install', e => {
  console.log('📦 Service Worker: Установка и кэширование основных ресурсов для creAIte...');
  e.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll([
        '.', // Кэшируем корневой путь
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
        keys.filter(key => key !== CACHE_NAME) // Отфильтровываем все кэши, кроме текущего
            .map(key => {
              console.log(`🗑️ Service Worker: Удаление старого кэша: ${key}`);
              return caches.delete(key); // Удаляем старые кэши
            })
      );
    }).then(() => {
      console.log('✅ Service Worker: Старые кэши удалены. Новый Service Worker активен.');
      self.clients.claim(); // Взять контроль над всеми клиентами (открытыми страницами) сразу
    }).catch(error => {
      console.error('❌ Service Worker: Ошибка при активации:', error);
    })
  );
});

self.addEventListener('fetch', e => {
  e.respondWith(
    caches.match(e.request).then(response => {
      if (response) {
        return response; // Если ресурс в кэше, отдаем его оттуда
      }
      return fetch(e.request); // Иначе - делаем сетевой запрос
    }).catch(error => {
      console.error('❌ Service Worker: Ошибка при перехвате запроса:', error);
      // Опционально: можно вернуть fallback-страницу для офлайна, если запрос не удался
      // return caches.match('/offline.html');
    })
  );
});
