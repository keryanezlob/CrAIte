document.addEventListener('DOMContentLoaded', () => {
    const themeToggleBtn = document.getElementById('theme-toggle');
    const htmlElement = document.documentElement;
    const sunIcon = document.getElementById('theme-icon-sun'); // Получаем иконку солнца
    const moonIcon = document.getElementById('theme-icon-moon'); // Получаем иконку луны

    // Функция для применения темы
    function applyTheme(theme) {
        htmlElement.setAttribute('data-theme', theme);
        const metaThemeColor = document.querySelector('meta[name="theme-color"]');
        if (metaThemeColor) {
            metaThemeColor.setAttribute('content', theme === 'dark' ? '#000000' : '#FFFFFF');
        }
        
        // Переключаем видимость иконок:
        // Если тема "dark" (черный фон), показываем солнце (чтобы переключиться на светлую).
        // Если тема "light" (белый фон), показываем луну (чтобы переключиться на темную).
        if (theme === 'dark') {
            if (moonIcon) moonIcon.classList.add('hidden'); // Скрываем луну
            if (sunIcon) sunIcon.classList.remove('hidden'); // Показываем солнце
        } else { // light theme
            if (sunIcon) sunIcon.classList.add('hidden'); // Скрываем солнце
            if (moonIcon) moonIcon.classList.remove('hidden'); // Показываем луну
        }
        
        localStorage.setItem('theme', theme); // Сохраняем выбор пользователя
    }

    // Проверяем сохраненную тему при загрузке страницы
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
        applyTheme(savedTheme);
    } else if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
        applyTheme('dark'); // Если системная тема темная, применяем темную тему
    } else {
        applyTheme('light'); // Иначе по умолчанию светлая тема
    }

    // Обработчик клика по кнопке
    themeToggleBtn.addEventListener('click', () => {
        const currentTheme = htmlElement.getAttribute('data-theme');
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        applyTheme(newTheme);
    });
});
