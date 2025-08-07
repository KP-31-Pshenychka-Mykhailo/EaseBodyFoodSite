/**
 * ===== MAIN.JS - ЕДИНЫЙ ТОЧКА ВХОДА ДЛЯ ВСЕХ JS МОДУЛЕЙ =====
 * 
 * Этот файл отвечает за подключение всех JavaScript модулей в правильном порядке.
 * Порядок загрузки критичен для корректной работы всей системы.
 * 
 * Структура загрузки:
 * 1. Core модули (константы, утилиты, API)
 * 2. Layout модули (header, footer, navigation) 
 * 3. Components (общие компоненты)
 * 4. Auth модули (авторизация)
 * 5. Service модули (специфичные для страниц)
 */

class EasyBodyApp {
    constructor() {
        this.loadedScripts = new Set();
        this.loadingPromises = new Map();
        this.pageModules = new Map();
        this.currentPage = this.detectCurrentPage();
        
        console.log('🚀 EasyBodyApp: Initializing application...');
        console.log('📍 Current page:', this.currentPage);
    }

    /**
     * Определение текущей страницы
     */
    detectCurrentPage() {
        const path = window.location.pathname;
        
        if (path.includes('calculator.html')) return 'calculator';
        if (path.includes('constructor.html')) return 'constructor';
        if (path.includes('cart.html')) return 'cart';
        if (path.includes('profile.html')) return 'profile';
        if (path.includes('standart.html')) return 'standart';
        if (path.includes('star.html')) return 'star';
        
        return 'index'; // главная страница
    }

    /**
     * Определение базового пути для скриптов
     */
    getBasePath() {
        const path = window.location.pathname;
        
        // Если мы в подпапке pages/main/, то нужно вернуться на 2 уровня вверх
        if (path.includes('/pages/main/')) {
            return '/assets/js/';
        }
        
        // Если мы в корне сайта
        return 'assets/js/';
    }

    /**
     * Загрузка одного скрипта
     */
    loadScript(src) {
        // Проверяем, не загружается ли уже этот скрипт
        if (this.loadingPromises.has(src)) {
            return this.loadingPromises.get(src);
        }

        // Проверяем, не загружен ли уже этот скрипт
        if (this.loadedScripts.has(src)) {
            return Promise.resolve();
        }

        const promise = new Promise((resolve, reject) => {
            const script = document.createElement('script');
            script.src = src;
            script.async = false; // Важно для сохранения порядка
            
            script.onload = () => {
                this.loadedScripts.add(src);
                this.loadingPromises.delete(src);
                console.log('✅ Loaded:', src);
                resolve();
            };
            
            script.onerror = () => {
                this.loadingPromises.delete(src);
                console.error('❌ Failed to load:', src);
                reject(new Error(`Failed to load script: ${src}`));
            };
            
            document.head.appendChild(script);
        });

        this.loadingPromises.set(src, promise);
        return promise;
    }

    /**
     * Последовательная загрузка массива скриптов
     */
    async loadScriptsSequentially(scripts) {
        const basePath = this.getBasePath();
        
        for (const script of scripts) {
            const fullPath = basePath + script;
            try {
                await this.loadScript(fullPath);
            } catch (error) {
                console.warn(`⚠️ Optional script failed to load: ${script}`, error);
                // Продолжаем загрузку остальных скриптов даже если один не загрузился
            }
        }
    }

    /**
     * Параллельная загрузка массива скриптов (для независимых модулей)
     */
    async loadScriptsParallel(scripts) {
        const basePath = this.getBasePath();
        
        const promises = scripts.map(script => {
            const fullPath = basePath + script;
            return this.loadScript(fullPath).catch(error => {
                console.warn(`⚠️ Optional script failed to load: ${script}`, error);
                return null; // Возвращаем null вместо выброса ошибки
            });
        });
        
        await Promise.all(promises);
    }

    /**
     * Конфигурация модулей для каждой страницы
     */
    getPageModules() {
        return {
            // Базовые модули для всех страниц
            core: [
                'core/constants.js',
                'core/utils.js', 
                'core/api.js'
            ],
            
            // Layout модули (загружаются везде)
            layout: [
                'layout/header.js',
                'layout/footer.js',
                'layout/navigation.js'
            ],
            
            // Основные компоненты
            components: [
                'components/modal.js',
                'components/message.js',
                'components/hearts.js',
                'components/card.js',
                'components/carousel.js'
            ],
            
            // Авторизация
            auth: [
                'auth/auth.js'
            ],
            
            // Специфичные для страниц модули
            pageSpecific: {
                index: [],
                calculator: ['service/calculator.js', 'service/cart.js'],
                constructor: ['service/constructor.js', 'service/cart.js'],
                cart: ['service/cart.js'],
                profile: ['auth/profile.js', 'service/cart.js'],
                standart: ['service/standart.js', 'service/cart.js'],
                star: ['service/cart.js']
            }
        };
    }

    /**
     * Основная функция загрузки всех модулей
     */
    async loadAllModules() {
        console.log('📦 Loading modules...');
        
        const modules = this.getPageModules();
        
        try {
            // 1. Загружаем core модули (критичны, должны быть первыми)
            console.log('🔧 Loading core modules...');
            await this.loadScriptsSequentially(modules.core);
            
            // 2. Загружаем layout модули (зависят от core)
            console.log('🖼️ Loading layout modules...');
            await this.loadScriptsSequentially(modules.layout);
            
            // 3. Загружаем компоненты параллельно (независимы друг от друга)
            console.log('🧩 Loading components...');
            await this.loadScriptsParallel(modules.components);
            
            // 4. Загружаем модули авторизации
            console.log('🔐 Loading auth modules...');
            await this.loadScriptsParallel(modules.auth);
            
            // 5. Загружаем специфичные для страницы модули
            const pageModules = modules.pageSpecific[this.currentPage] || [];
            if (pageModules.length > 0) {
                console.log(`📄 Loading page-specific modules for: ${this.currentPage}`);
                await this.loadScriptsParallel(pageModules);
            }
            
            console.log('✅ All modules loaded successfully!');
            
            // Небольшая задержка для инициализации модулей
            await new Promise(resolve => setTimeout(resolve, 100));
            
            // Принудительная инициализация критичных модулей
            this.forceInitializeModules();
            
            // Вызываем событие завершения загрузки
            this.dispatchLoadComplete();
            
        } catch (error) {
            console.error('❌ Error loading modules:', error);
            // Всё равно вызываем событие, чтобы страница могла работать с частично загруженными модулями
            this.dispatchLoadComplete();
        }
    }

    /**
     * Принудительная инициализация критичных модулей
     */
    forceInitializeModules() {
        console.log('🔄 Force initializing modules...');
        
        // Инициализируем модули в правильном порядке
        const initFunctions = [
            'initModal',      // Модальные окна
            'initHeader',     // Хедер
            'initFooter',     // Футер  
            'initNavigation', // Навигация
            'initAuth',       // Авторизация
            'initCarousel',   // Карусели
            'initHearts'      // Сердечки
        ];
        
        // Инициализируем страничные модули
        const pageInitFunctions = {
            calculator: 'initCalculatorPage',
            constructor: 'initConstructorPage',
            cart: 'initCartPage',
            standart: 'initStandartPage',
            profile: 'initProfilePage'
        };
        
        initFunctions.forEach(funcName => {
            if (typeof window[funcName] === 'function') {
                try {
                    console.log(`🔄 Initializing ${funcName}...`);
                    window[funcName]();
                } catch (error) {
                    console.warn(`⚠️ Failed to initialize ${funcName}:`, error);
                }
            } else {
                console.warn(`⚠️ Function ${funcName} not found`);
            }
        });
        
        // Инициализируем страничные модули для текущей страницы
        const pageInitFunc = pageInitFunctions[this.currentPage];
        if (pageInitFunc && typeof window[pageInitFunc] === 'function') {
            try {
                console.log(`📄 Initializing page module: ${pageInitFunc}...`);
                window[pageInitFunc]();
            } catch (error) {
                console.warn(`⚠️ Failed to initialize page module ${pageInitFunc}:`, error);
            }
        }
    }

    /**
     * Отправка события о завершении загрузки
     */
    dispatchLoadComplete() {
        const event = new CustomEvent('easybodyAppReady', {
            detail: {
                currentPage: this.currentPage,
                loadedScripts: Array.from(this.loadedScripts)
            }
        });
        
        document.dispatchEvent(event);
        console.log('🎉 EasyBodyApp ready! Event dispatched.');
    }

    /**
     * Вспомогательная функция для добавления CSS
     */
    addCSS(href) {
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = href;
        document.head.appendChild(link);
    }

    /**
     * Инициализация приложения
     */
    async init() {
        console.log('🚀 Starting EasyBodyApp initialization...');
        
        // Дожидаемся загрузки DOM
        if (document.readyState === 'loading') {
            await new Promise(resolve => {
                document.addEventListener('DOMContentLoaded', resolve);
            });
        }

        console.log('📄 DOM ready, loading modules...');
        
        // Загружаем все модули
        await this.loadAllModules();
    }
}

// Создаем глобальный экземпляр приложения
window.EasyBodyApp = new EasyBodyApp();

// Автоматически инициализируем приложение
window.EasyBodyApp.init().catch(error => {
    console.error('❌ Failed to initialize EasyBodyApp:', error);
});

// Экспортируем класс для возможности создания дополнительных экземпляров
window.EasyBodyAppClass = EasyBodyApp;

// Совместимость с старым кодом - экспортируем основные функции загрузки
window.loadScript = function(src) {
    return window.EasyBodyApp.loadScript(src);
};

window.loadScriptsSequentially = function(scripts) {
    return window.EasyBodyApp.loadScriptsSequentially(scripts);
};

window.loadScriptsParallel = function(scripts) {
    return window.EasyBodyApp.loadScriptsParallel(scripts);
};
