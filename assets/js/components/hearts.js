// Универсальная логика для сердечек
class HeartsManager {
  constructor() {
    this.init();
  }

  init() {
    // Добавляем обработчики для всех существующих сердечек
    this.addHeartHandlers();
    
    // Наблюдаем за изменениями в DOM для динамически добавленных сердечек
    this.observeDOMChanges();
  }

  addHeartHandlers() {
    // Обрабатываем все типы сердечек
    const heartSelectors = window.SELECTORS?.HEARTS || [
      '.gallery-heart',
      '.gallery-heart-alt', 
      '.menu-card-heart',
      '.menu-card-heart-alt',
      '.menu-constructor-card-heart',
      '.menu-constructor-card-heart-alt'
    ];

    let totalHearts = 0;
    let addedHandlers = 0;

    heartSelectors.forEach(selector => {
      const hearts = window.getElements(selector);
      totalHearts += hearts.length;
      
      hearts.forEach(heart => {
        if (!heart.hasAttribute('data-heart-handler-added')) {
          heart.setAttribute('data-heart-handler-added', 'true');
          heart.addEventListener('click', (e) => this.handleHeartClick(e, heart));
          addedHandlers++;
        }
      });
    });


  }

  handleHeartClick(e, heart) {
    // Проверяем авторизацию перед переключением
    if (typeof window.showRegisterModalIfNotAuth === 'function' && window.showRegisterModalIfNotAuth()) {
      e.preventDefault();
      return;
    }

    // Переключаем состояние сердечка
    heart.classList.toggle('active');
    
    // Дополнительная логика при необходимости
    this.onHeartToggle(heart);
  }

  onHeartToggle(heart) {
    // Получаем информацию о блюде
    const cardSelectors = window.SELECTORS?.CARDS || [
      '.gallery-card',
      '.menu-card',
      '.menu-card-alt',
      '.menu-constructor-card',
      '.menu-constructor-card-alt'
    ];
    const card = heart.closest(cardSelectors.join(', '));
    if (card) {
      const dishId = card.getAttribute('data-dish-id') || 
                    card.querySelector('[data-dish-id]')?.getAttribute('data-dish-id') ||
                    this.extractDishIdFromCard(card);
      
      const isActive = heart.classList.contains('active');
      
      if (dishId) {
        this.saveHeartState(dishId, isActive);
      }
    }
  }

  extractDishIdFromCard(card) {
    // Попытка извлечь ID блюда из различных источников
    const possibleSelectors = [
      '[data-dish-id]',
      '.menu-card-plus[data-dish-id]',
      'img[data-dish-id]'
    ];
    
    for (const selector of possibleSelectors) {
      const element = card.querySelector(selector);
      if (element && element.getAttribute('data-dish-id')) {
        return element.getAttribute('data-dish-id');
      }
    }
    
    // Если не нашли data-dish-id, попробуем извлечь из других атрибутов
    const img = card.querySelector('img');
    if (img && img.src) {
      const match = img.src.match(/(\d+)\.(jpg|png|jpeg|webp)$/);
      if (match) {
        return `dish_${match[1]}`;
      }
    }
    
    return null;
  }

  saveHeartState(dishId, isActive) {
    try {
      // Сохраняем состояние в формате heartsState: {"id": true/false}
      const heartsState = window.getStorageItem(window.STORAGE_KEYS?.HEARTS_STATE || 'heartsState', {});
      heartsState[dishId] = isActive;
      window.setStorageItem(window.STORAGE_KEYS?.HEARTS_STATE || 'heartsState', heartsState);
      
      // Отправляем запрос на сервер
      this.sendHeartStateToServer(dishId, isActive);
      
    } catch (error) {
      // Ошибка сохранения
    }
  }

  async sendHeartStateToServer(dishId, isActive) {
    try {
      if (!window.isUserAuthenticated()) {
        return;
      }

      if (isActive) {
        await window.addToFavorites(dishId);
      } else {
        await window.removeFromFavorites(dishId);
      }
      
    } catch (error) {
      // Ошибка отправки
    }
  }

  async loadFavoritesFromServer() {
    try {
      if (!window.isUserAuthenticated()) {
        return;
      }

      const favorites = await window.getFavorites();
      
      // Обновляем localStorage на основе данных с сервера
      const heartsState = {};
      favorites.forEach(dishId => {
        heartsState[dishId] = true;
      });
      
      window.setStorageItem(window.STORAGE_KEYS?.HEARTS_STATE || 'heartsState', heartsState);
      
      // Применяем состояния к DOM
      this.loadHeartStates();
      
    } catch (error) {
      // Ошибка загрузки
    }
  }

  loadHeartStates() {
    try {
      // Загружаем состояние сердечек из localStorage
      const heartsState = window.getStorageItem(window.STORAGE_KEYS?.HEARTS_STATE || 'heartsState', {});
      
      // Применяем активные состояния ко всем найденным карточкам
      Object.keys(heartsState).forEach(dishId => {
        if (heartsState[dishId]) { // Если сердечко активно
          // Ищем карточки по data-dish-id
          const cards = window.getElements(`[data-dish-id="${dishId}"]`);
          cards.forEach(card => {
            const heartSelectors = window.SELECTORS?.HEARTS || [
              '.gallery-heart',
              '.gallery-heart-alt', 
              '.menu-card-heart',
              '.menu-card-heart-alt',
              '.menu-constructor-card-heart',
              '.menu-constructor-card-heart-alt'
            ];
            const heart = card.querySelector(heartSelectors.join(', '));
            if (heart) {
              heart.classList.add('active');
            }
          });
          
          // Также ищем карточки по извлеченному ID из изображений
          const cardSelectors = window.SELECTORS?.CARDS || [
            '.gallery-card',
            '.menu-card',
            '.menu-card-alt',
            '.menu-constructor-card',
            '.menu-constructor-card-alt'
          ];
          const allCards = window.getElements(cardSelectors.join(', '));
          allCards.forEach(card => {
            const extractedId = this.extractDishIdFromCard(card);
            if (extractedId === dishId) {
              const heartSelectors = window.SELECTORS?.HEARTS || [
                '.gallery-heart',
                '.gallery-heart-alt', 
                '.menu-card-heart',
                '.menu-card-heart-alt',
                '.menu-constructor-card-heart',
                '.menu-constructor-card-heart-alt'
              ];
              const heart = card.querySelector(heartSelectors.join(', '));
              if (heart) {
                heart.classList.add('active');
              }
            }
          });
        }
      });
      
    } catch (error) {
      // Ошибка загрузки состояний
    }
  }

  observeDOMChanges() {
    // Наблюдаем за изменениями в DOM для обработки динамически добавленных сердечек
    const observer = new MutationObserver((mutations) => {
      let shouldReinit = false;
      
      mutations.forEach((mutation) => {
        if (mutation.type === 'childList') {
          mutation.addedNodes.forEach((node) => {
            if (node.nodeType === Node.ELEMENT_NODE) {
              const heartSelectors = window.SELECTORS?.HEARTS || [
                '.gallery-heart',
                '.gallery-heart-alt', 
                '.menu-card-heart',
                '.menu-card-heart-alt',
                '.menu-constructor-card-heart',
                '.menu-constructor-card-heart-alt'
              ];
              if (node.querySelector(heartSelectors.join(', '))) {
                shouldReinit = true;
              }
            }
          });
        }
      });
      
      if (shouldReinit) {
        this.addHeartHandlers();
      }
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true
    });
  }

  // Публичный метод для принудительного обновления обработчиков
  refresh() {
    this.addHeartHandlers();
  }

  // Публичный метод для получения списка избранных блюд
  getFavoriteDishes() {
    try {
      const heartsState = window.getStorageItem(window.STORAGE_KEYS?.HEARTS_STATE || 'heartsState', {});
      // Возвращаем только ID блюд с активными сердечками
      return Object.keys(heartsState).filter(dishId => heartsState[dishId]);
    } catch (error) {
      return [];
    }
  }

  // Публичный метод для очистки избранного
  async clearFavorites() {
    try {
      window.removeStorageItem(window.STORAGE_KEYS?.HEARTS_STATE || 'heartsState');
      
      // Также очищаем на сервере
      await this.clearFavoritesOnServer();
      
    } catch (error) {
      // Ошибка очистки
    }
  }

  async clearFavoritesOnServer() {
    try {
      if (!window.isUserAuthenticated()) {
        return;
      }

      await window.clearFavorites();
      
    } catch (error) {
      // Ошибка очистки на сервере
    }
  }

}

function initHearts() {
  window.heartsManager = new HeartsManager();
  
  // Загружаем избранные блюда с сервера и применяем состояния
  setTimeout(async () => {
    await window.heartsManager.loadFavoritesFromServer();
    window.heartsManager.loadHeartStates();
  }, 100);
}

// Поддержка обеих систем - старой и новой
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initHearts);
} else {
  // DOM уже загружен, инициализируем сразу
  initHearts();
}

// Экспортируем для использования в других модулях
window.HeartsManager = HeartsManager;
window.initHearts = initHearts;