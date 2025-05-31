document.addEventListener('DOMContentLoaded', () => {
    const themeToggleBtn = document.getElementById('theme-toggle');
    const htmlElement = document.documentElement;
    const sunIcon = document.getElementById('theme-icon-sun');
    const moonIcon = document.getElementById('theme-icon-moon');
    const updateAppBtn = document.getElementById('update-app-btn'); // Кнопка проверки/обновления

    let newServiceWorker = null; // Для хранения ссылки на новый SW, если он ждет
    let serviceWorkerRegistration = null; // Для хранения объекта регистрации SW

    // Функция для применения темы
    function applyTheme(theme) {
        htmlElement.setAttribute('data-theme', theme);
        const metaThemeColor = document.querySelector('meta[name="theme-color"]');
        if (metaThemeColor) {
            metaThemeColor.setAttribute('content', theme === 'dark' ? '#000000' : '#FFFFFF');
        }

        if (theme === 'dark') {
            if (moonIcon) moonIcon.classList.add('hidden');
            if (sunIcon) sunIcon.classList.remove('hidden');
        } else { // light theme
            if (sunIcon) sunIcon.classList.add('hidden');
            if (moonIcon) moonIcon.classList.remove('hidden');
        }

        localStorage.setItem('theme', theme);
    }

    // Проверяем сохраненную тему при загрузке страницы
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
        applyTheme(savedTheme);
    } else if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
        applyTheme('dark');
    } else {
        applyTheme('light');
    }

    // Обработчик клика по кнопке переключения темы
    themeToggleBtn.addEventListener('click', () => {
        const currentTheme = htmlElement.getAttribute('data-theme');
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        applyTheme(newTheme);
    });

    // --- Логика обновления Service Worker ---

    // Получаем объект регистрации Service Worker после его готовности
    navigator.serviceWorker.ready.then(reg => {
        serviceWorkerRegistration = reg; // Сохраняем объект регистрации
        // Проверяем, есть ли уже ожидающий SW при старте приложения
        if (serviceWorkerRegistration.waiting) {
            newServiceWorker = serviceWorkerRegistration.waiting;
            if (updateAppBtn) {
                updateAppBtn.classList.add('update-available');
                updateAppBtn.textContent = 'Доступне оновлення! Натисніть для оновлення.';
            }
        }
    });

    // Событие от index.html, когда новый Service Worker установлен и ждет
    document.addEventListener('swUpdateReady', (e) => {
        newServiceWorker = e.detail; // Это сам установленный SW
        if (updateAppBtn) {
            updateAppBtn.classList.add('update-available'); // Делаем кнопку зеленой
            updateAppBtn.textContent = 'Доступне оновлення! Натисніть для оновлення.';
            updateAppBtn.disabled = false; // Убеждаемся, что кнопка активна
        }
    });

    // Обработчик клика по кнопке "Перевірити оновлення" / "Доступне оновлення!"
    if (updateAppBtn) {
        updateAppBtn.addEventListener('click', () => {
            if (newServiceWorker) {
                // Если есть ожидающий SW, активируем его
                newServiceWorker.postMessage({ type: 'SKIP_WAITING' });
                updateAppBtn.textContent = 'Оновлення...';
                updateAppBtn.style.backgroundColor = '#FFA500'; // Меняем цвет на оранжевый
                updateAppBtn.disabled = true; // Отключаем кнопку
            } else if (serviceWorkerRegistration) {
                // Если нет ожидающего SW, запускаем проверку обновлений
                updateAppBtn.textContent = 'Перевірка оновлень...';
                updateAppBtn.disabled = true; // Отключаем кнопку на время проверки
                updateAppBtn.classList.remove('update-available'); // Убираем зеленый цвет

                serviceWorkerRegistration.update().then(() => {
                    console.log('🔍 Service Worker: Запущена ручна перевірка оновлень.');
                    // После reg.update() мы ожидаем, что updatefound или swUpdateReady сработают,
                    // если найдено обновление.
                    // Если обновление не найдено после проверки, нужно вернуть кнопку в исходное состояние
                    // (но это произойдет только если не сработает updatefound).
                    setTimeout(() => { // Даем время на обнаружение updatefound
                        if (!newServiceWorker && updateAppBtn.textContent === 'Перевірка оновлень...') {
                           updateAppBtn.textContent = 'Немає оновлень. Перевірити ще раз.';
                           updateAppBtn.disabled = false;
                           updateAppBtn.style.backgroundColor = ''; // Возвращаем исходный цвет
                        }
                    }, 5000); // 5 секунд на обнаружение обновления
                }).catch(error => {
                    console.error('❌ Помилка при ручній перевірці оновлень:', error);
                    updateAppBtn.textContent = 'Помилка перевірки. Спробуйте ще раз.';
                    updateAppBtn.disabled = false;
                    updateAppBtn.style.backgroundColor = '#dc3545'; // Красный цвет для ошибки
                });
            } else {
                console.warn('Service Worker не зарегистрирован или объект регистрации недоступен.');
            }
        });
    }

    // Слушаем сообщения от Service Worker'а
    navigator.serviceWorker.addEventListener('message', (event) => {
        if (event.data && event.data.type === 'UPDATE_ACTIVATED') {
            // Service Worker сообщил, что он активировался
            console.log('✅ Service Worker активовано, перезавантажуємо сторінку...');
            window.location.reload(); // Перезагружаем страницу, чтобы применить изменения
        }
    });
});
