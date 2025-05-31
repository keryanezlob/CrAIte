document.addEventListener('DOMContentLoaded', () => {
    const themeToggleBtn = document.getElementById('theme-toggle');
    const htmlElement = document.documentElement;
    const sunIcon = document.getElementById('theme-icon-sun');
    const moonIcon = document.getElementById('theme-icon-moon');
    const updateAppBtn = document.getElementById('update-app-btn'); // Новая кнопка

    let newServiceWorker = null; // Для хранения ссылки на новый SW

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

    // Событие от index.html, когда новый Service Worker установлен и ждет
    document.addEventListener('swUpdateReady', (e) => {
        newServiceWorker = e.detail; // Сохраняем ссылку на установленный SW
        if (updateAppBtn) {
            updateAppBtn.classList.add('show'); // Показываем кнопку
        }
    });

    // Обработчик клика по кнопке обновления
    if (updateAppBtn) {
        updateAppBtn.addEventListener('click', () => {
            if (newServiceWorker) {
                // Отправляем сообщение Service Worker'у, чтобы он активировался
                newServiceWorker.postMessage({ type: 'SKIP_WAITING' });
                updateAppBtn.textContent = 'Обновление...';
                updateAppBtn.style.backgroundColor = '#FFA500'; // Меняем цвет на оранжевый
                updateAppBtn.disabled = true; // Отключаем кнопку
            }
        });
    }

    // Слушаем сообщения от Service Worker'а
    navigator.serviceWorker.addEventListener('message', (event) => {
        if (event.data && event.data.type === 'UPDATE_ACTIVATED') {
            // Service Worker сообщил, что он активировался
            console.log('✅ Service Worker активирован, перезагружаем страницу...');
            window.location.reload(); // Перезагружаем страницу, чтобы применить изменения
        }
    });
});
