// ===== API ФУНКЦИИ =====

// Глобальная переменная для базового URL сервера
let SERVER_BASE_URL = '';

// Кэш для данных
const dataCache = {
  menu: null,
  dishes: null
};

// Флаг загрузки для предотвращения дублирующих запросов
const loadingFlags = {
  menu: false,
  dishes: false
};

// Очередь запросов для предотвращения перегрузки
let requestQueue = [];
let isProcessingQueue = false;

// ===== УТИЛИТЫ ДЛЯ ОЧЕРЕДИ =====

/**
 * Добавление запроса в очередь
 */
function addToQueue(requestFn) {
  return new Promise((resolve, reject) => {
    requestQueue.push({ requestFn, resolve, reject });
    processQueue();
  });
}

/**
 * Обработка очереди запросов
 */
async function processQueue() {
  if (isProcessingQueue || requestQueue.length === 0) {
    return;
  }
  
  isProcessingQueue = true;
  
  while (requestQueue.length > 0) {
    const { requestFn, resolve, reject } = requestQueue.shift();
    
    try {
      // Добавляем небольшую задержку между запросами
      if (requestQueue.length > 0) {
        await new Promise(resolve => setTimeout(resolve, 100));
      }
      
      const result = await requestFn();
      resolve(result);
    } catch (error) {
      reject(error);
    }
  }
  
  isProcessingQueue = false;
}

// ===== ЗАГРУЗКА НАСТРОЕК =====

/**
 * Загрузка настроек сервера из констант
 */
async function loadServerSettings() {
  // Используем настройки из констант
  const settings = window.SERVER_SETTINGS || {
    serverBaseUrl: 'http://localhost:3000',
    apiVersion: '1.0',
    timeout: 5000,
    retryAttempts: 3
  };
  
  // Устанавливаем базовый URL
  SERVER_BASE_URL = settings.serverBaseUrl;
  
  return settings;
}

/**
 * Получение базового URL сервера
 */
function getServerBaseUrl() {
  return SERVER_BASE_URL;
}

// ===== БАЗОВЫЙ FETCH =====

/**
 * Базовый fetch с обработкой ошибок
 */
async function apiRequest(endpoint, options = {}) {
  if (!SERVER_BASE_URL) {
    await loadServerSettings();
  }
  
  const url = `${SERVER_BASE_URL}${endpoint}`;
  const settings = window.SERVER_SETTINGS || {};
  
  const defaultOptions = {
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
  };
  
  const finalOptions = { ...defaultOptions, ...options };
  
  // Добавляем timeout из настроек
  if (settings.timeout) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), settings.timeout);
    finalOptions.signal = controller.signal;
    
    try {
      const response = await fetch(url, finalOptions);
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      clearTimeout(timeoutId);
      throw error;
    }
  } else {
    try {
      const response = await fetch(url, finalOptions);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      throw error;
    }
  }
}

// ===== ПОЛЬЗОВАТЕЛИ =====

/**
 * Регистрация пользователя
 */
async function registerUser(userData) {
  try {
    const result = await apiRequest(window.API_ENDPOINTS?.REGISTRATION || '/user/registration', {
      method: 'POST',
      body: JSON.stringify(userData)
    });
    
    if (result && result.userId) {
      // Сохраняем данные пользователя
      window.setStorageItem(window.STORAGE_KEYS?.USER_ID || 'userId', result.userId);
      window.setStorageItem(window.STORAGE_KEYS?.USER_NAME || 'userName', userData.FirstName);
      
      return { success: true, userId: result.userId, userName: userData.FirstName };
    }
    
    return { success: false, message: result?.message || 'Ошибка регистрации' };
  } catch (error) {
    return { success: false, message: error.message };
  }
}

/**
 * Вход пользователя
 */
async function loginUser(loginData) {
  try {
    const result = await apiRequest(window.API_ENDPOINTS?.LOGIN || '/user/login', {
      method: 'POST',
      body: JSON.stringify(loginData)
    });
    
    if (result && result.userId) {
      // Сохраняем данные пользователя
      window.setStorageItem(window.STORAGE_KEYS?.USER_ID || 'userId', result.userId);
      const userName = loginData.Email.split('@')[0];
      window.setStorageItem(window.STORAGE_KEYS?.USER_NAME || 'userName', userName);
      
      return { success: true, userId: result.userId, userName };
    }
    
    return { success: false, message: result?.message || 'Ошибка входа' };
  } catch (error) {
    return { success: false, message: error.message };
  }
}

/**
 * Получение профиля пользователя
 */
async function getUserProfile() {
  try {
    const userId = window.getUserId();
    if (!userId) {
      throw new Error('Пользователь не авторизован');
    }
    
    return await apiRequest(`${window.API_ENDPOINTS?.PROFILE || '/user/profile'}/${userId}`, {
      method: 'POST'
    });
  } catch (error) {
    throw error;
  }
}

// ===== ИЗБРАННОЕ =====

/**
 * Добавление в избранное
 */
async function addToFavorites(dishId) {
  try {
    const userId = window.getUserId();
    if (!userId) {
      throw new Error('Пользователь не авторизован');
    }
    
    return await apiRequest(window.API_ENDPOINTS?.FAVORITE_ADD || '/user/favorite/add', {
      method: 'POST',
      body: JSON.stringify({ UserId: userId, DishId: parseInt(dishId) })
    });
  } catch (error) {
    throw error;
  }
}

/**
 * Удаление из избранного
 */
async function removeFromFavorites(dishId) {
  try {
    const userId = window.getUserId();
    if (!userId) {
      throw new Error('Пользователь не авторизован');
    }
    
    return await apiRequest(window.API_ENDPOINTS?.FAVORITE_REMOVE || '/user/favorite/remove', {
      method: 'POST',
      body: JSON.stringify({ UserId: userId, DishId: parseInt(dishId) })
    });
  } catch (error) {
    throw error;
  }
}

/**
 * Получение избранного
 */
async function getFavorites() {
  try {
    const userId = window.getUserId();
    if (!userId) {
      throw new Error('Пользователь не авторизован');
    }
    
    const result = await apiRequest(`${window.API_ENDPOINTS?.FAVORITE_GET || '/user/favorite'}/${userId}`, {
      method: 'POST'
    });
    
    return Array.isArray(result) ? result : [];
  } catch (error) {
    return [];
  }
}

/**
 * Очистка избранного
 */
async function clearFavorites() {
  try {
    const userId = window.getUserId();
    if (!userId) {
      throw new Error('Пользователь не авторизован');
    }
    
    return await apiRequest(window.API_ENDPOINTS?.FAVORITE_CLEAR || '/user/favorite/clear', {
      method: 'POST',
      body: JSON.stringify({ UserId: userId })
    });
  } catch (error) {
    throw error;
  }
}

// ===== КОРЗИНА =====

/**
 * Добавление в корзину
 */
async function addToCart(cartData) {
  try {
    const userId = window.getUserId();
    if (!userId) {
      throw new Error('Пользователь не авторизован');
    }
    
    return await apiRequest(window.API_ENDPOINTS?.CART_ADD || '/cart/add', {
      method: 'POST',
      body: JSON.stringify({ UserId: userId, CartData: cartData })
    });
  } catch (error) {
    throw error;
  }
}

/**
 * Получение корзины
 */
async function getCart() {
  try {
    const userId = window.getUserId();
    if (!userId) {
      throw new Error('Пользователь не авторизован');
    }
    
    const result = await apiRequest(`${window.API_ENDPOINTS?.CART_GET || '/cart/get'}/${userId}`, {
      method: 'POST'
    });
    
    return Array.isArray(result) ? result : [];
  } catch (error) {
    return [];
  }
}

/**
 * Очистка корзины
 */
async function clearCart() {
  try {
    const userId = window.getUserId();
    if (!userId) {
      throw new Error('Пользователь не авторизован');
    }
    
    return await apiRequest(window.API_ENDPOINTS?.CART_CLEAR || '/cart/clear', {
      method: 'POST',
      body: JSON.stringify({ UserId: userId })
    });
  } catch (error) {
    throw error;
  }
}

// ===== ДАННЫЕ =====

/**
 * Загрузка данных меню с fallback путями
 */
async function loadMenuData() {
  // Проверяем кэш
  if (dataCache.menu) {
    console.log('Menu data loaded from cache');
    return dataCache.menu;
  }
  
  // Проверяем флаг загрузки
  if (loadingFlags.menu) {
    console.log('Menu data is already loading, waiting...');
    // Ждем завершения текущей загрузки
    while (loadingFlags.menu) {
      await new Promise(resolve => setTimeout(resolve, 50));
    }
    return dataCache.menu;
  }
  
  loadingFlags.menu = true;
  console.log('Loading menu data...');
  
  try {
    const result = await addToQueue(async () => {
      const fallbackPaths = [
        '../../data/datafiles/menu.json',
        '../../../data/datafiles/menu.json',
        '/data/datafiles/menu.json',
        'data/datafiles/menu.json',
        './data/datafiles/menu.json'
      ];
      
      try {
        // Сначала пробуем путь из констант
        if (window.DATA_PATHS?.MENU) {
          try {
            console.log('Trying path from constants:', window.DATA_PATHS.MENU);
            const response = await fetch(window.DATA_PATHS.MENU);
            if (response.ok) {
              const menuData = await response.json();
              console.log('Menu data loaded from constants path');
              return menuData;
            }
          } catch (e) {
            console.warn('Failed to load from constants path:', e);
            // Пробуем fallback пути
          }
        }
        
        // Пробуем fallback пути
        for (const path of fallbackPaths) {
          try {
            console.log('Trying fallback path:', path);
            const response = await fetch(path);
            if (response.ok) {
              const menuData = await response.json();
              console.log('Menu data loaded from fallback path:', path);
              return menuData;
            }
          } catch (e) {
            console.warn('Failed to load from path:', path, e);
            continue;
          }
        }
        
        throw new Error('Не удалось загрузить данные меню ни из одного источника');
      } catch (error) {
        throw error;
      }
    });
    
    // Сохраняем в кэш
    dataCache.menu = result;
    console.log('Menu data cached, keys:', Object.keys(result));
    return result;
  } finally {
    loadingFlags.menu = false;
  }
}

/**
 * Загрузка данных блюд с fallback путями
 */
async function loadDishesData() {
  // Проверяем кэш
  if (dataCache.dishes) {
    console.log('Dishes data loaded from cache');
    return dataCache.dishes;
  }
  
  // Проверяем флаг загрузки
  if (loadingFlags.dishes) {
    console.log('Dishes data is already loading, waiting...');
    // Ждем завершения текущей загрузки
    while (loadingFlags.dishes) {
      await new Promise(resolve => setTimeout(resolve, 50));
    }
    return dataCache.dishes;
  }
  
  loadingFlags.dishes = true;
  console.log('Loading dishes data...');
  
  try {
    const result = await addToQueue(async () => {
      const fallbackPaths = [
        '../../data/datafiles/dishes.json',
        '../../../data/datafiles/dishes.json',
        '/data/datafiles/dishes.json',
        'data/datafiles/dishes.json',
        './data/datafiles/dishes.json'
      ];
      
      try {
        // Сначала пробуем путь из констант
        if (window.DATA_PATHS?.DISHES) {
          try {
            console.log('Trying dishes path from constants:', window.DATA_PATHS.DISHES);
            const response = await fetch(window.DATA_PATHS.DISHES);
            if (response.ok) {
              const dishesData = await response.json();
              console.log('Dishes data loaded from constants path');
              return dishesData;
            }
          } catch (e) {
            console.warn('Failed to load dishes from constants path:', e);
            // Пробуем fallback пути
          }
        }
        
        // Пробуем fallback пути
        for (const path of fallbackPaths) {
          try {
            console.log('Trying dishes fallback path:', path);
            const response = await fetch(path);
            if (response.ok) {
              const dishesData = await response.json();
              console.log('Dishes data loaded from fallback path:', path);
              return dishesData;
            }
          } catch (e) {
            console.warn('Failed to load dishes from path:', path, e);
            continue;
          }
        }
        
        throw new Error('Не удалось загрузить данные блюд ни из одного источника');
      } catch (error) {
        throw error;
      }
    });
    
    // Сохраняем в кэш
    dataCache.dishes = result;
    console.log('Dishes data cached, count:', result.length);
    return result;
  } finally {
    loadingFlags.dishes = false;
  }
}

/**
 * Загрузка всех данных
 */
async function loadAllData() {
  try {
    console.log('loadAllData called');
    const [menuData, dishesData] = await Promise.all([
      loadMenuData(),
      loadDishesData()
    ]);
    
    console.log('loadAllData result:', { 
      menuDataKeys: Object.keys(menuData), 
      dishesCount: dishesData.length 
    });
    
    return { menuData, dishesData };
  } catch (error) {
    console.error('loadAllData error:', error);
    throw error;
  }
}

// ===== ИНИЦИАЛИЗАЦИЯ =====

// Загружаем настройки при загрузке скрипта
loadServerSettings().catch(error => {
  // Ошибка загрузки настроек
});

// ===== УТИЛИТЫ КЭША =====

/**
 * Очистка кэша данных
 */
function clearDataCache() {
  dataCache.settings = null;
  dataCache.menu = null;
  dataCache.dishes = null;
}

/**
 * Получение статуса кэша
 */
function getCacheStatus() {
  return {
    settings: !!dataCache.settings,
    menu: !!dataCache.menu,
    dishes: !!dataCache.dishes
  };
}

// Экспорт в глобальную область
window.loadServerSettings = loadServerSettings;
window.getServerBaseUrl = getServerBaseUrl;
window.registerUser = registerUser;
window.loginUser = loginUser;
window.getUserProfile = getUserProfile;
window.addToFavorites = addToFavorites;
window.removeFromFavorites = removeFromFavorites;
window.getFavorites = getFavorites;
window.clearFavorites = clearFavorites;
window.addToCart = addToCart;
window.getCart = getCart;
window.clearCart = clearCart;
window.loadMenuData = loadMenuData;
window.loadDishesData = loadDishesData;
window.loadAllData = loadAllData;
window.clearDataCache = clearDataCache;
window.getCacheStatus = getCacheStatus;
