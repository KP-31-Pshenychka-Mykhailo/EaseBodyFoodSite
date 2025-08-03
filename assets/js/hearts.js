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
    const heartSelectors = [
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
      const hearts = document.querySelectorAll(selector);
      totalHearts += hearts.length;
      
      hearts.forEach(heart => {
        if (!heart.hasAttribute('data-heart-handler-added')) {
          heart.setAttribute('data-heart-handler-added', 'true');
          heart.addEventListener('click', (e) => this.handleHeartClick(e, heart));
          addedHandlers++;
        }
      });
    });

    if (addedHandlers > 0) {
      console.log(`Добавлено обработчиков для сердечек: ${addedHandlers}`);
    }
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
    const card = heart.closest('.gallery-card, .menu-card, .menu-card-alt, .menu-constructor-card, .menu-constructor-card-alt');
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
      const heartsState = JSON.parse(localStorage.getItem('heartsState') || '{}');
      heartsState[dishId] = isActive;
      localStorage.setItem('heartsState', JSON.stringify(heartsState));
      
    } catch (error) {
      console.warn('Не удалось сохранить состояние сердечка:', error);
    }
  }

  loadHeartStates() {
    try {
      // Загружаем состояние сердечек из localStorage
      const heartsState = JSON.parse(localStorage.getItem('heartsState') || '{}');
      console.log('Загружено состояние сердечек:', heartsState);
      
      // Применяем активные состояния ко всем найденным карточкам
      Object.keys(heartsState).forEach(dishId => {
        if (heartsState[dishId]) { // Если сердечко активно
          // Ищем карточки по data-dish-id
          const cards = document.querySelectorAll(`[data-dish-id="${dishId}"]`);
          cards.forEach(card => {
            const heart = card.querySelector('.gallery-heart, .gallery-heart-alt, .menu-card-heart, .menu-card-heart-alt, .menu-constructor-card-heart, .menu-constructor-card-heart-alt');
            if (heart) {
              heart.classList.add('active');
            }
          });
          
          // Также ищем карточки по извлеченному ID из изображений
          const allCards = document.querySelectorAll('.gallery-card, .menu-card, .menu-card-alt, .menu-constructor-card, .menu-constructor-card-alt');
          allCards.forEach(card => {
            const extractedId = this.extractDishIdFromCard(card);
            if (extractedId === dishId) {
              const heart = card.querySelector('.gallery-heart, .gallery-heart-alt, .menu-card-heart, .menu-card-heart-alt, .menu-constructor-card-heart, .menu-constructor-card-heart-alt');
              if (heart) {
                heart.classList.add('active');
              }
            }
          });
        }
      });
      
    } catch (error) {
      console.warn('Не удалось загрузить состояния сердечек:', error);
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
              if (node.querySelector('.gallery-heart, .gallery-heart-alt, .menu-card-heart, .menu-card-heart-alt, .menu-constructor-card-heart, .menu-constructor-card-heart-alt')) {
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
      const heartsState = JSON.parse(localStorage.getItem('heartsState') || '{}');
      // Возвращаем только ID блюд с активными сердечками
      return Object.keys(heartsState).filter(dishId => heartsState[dishId]);
    } catch (error) {
      console.warn('Не удалось получить список избранных блюд:', error);
      return [];
    }
  }

  // Публичный метод для очистки избранного
  clearFavorites() {
    try {
      localStorage.removeItem('heartsState');
      console.log('Избранное очищено');
    } catch (error) {
      console.warn('Не удалось очистить избранное:', error);
    }
  }
}

// Инициализация при загрузке DOM
document.addEventListener('DOMContentLoaded', () => {
  console.log('DOM загружен, инициализируем HeartsManager...');
  window.heartsManager = new HeartsManager();
  console.log('HeartsManager создан:', window.heartsManager);
  
  // Загружаем сохраненные состояния после небольшой задержки
  // чтобы все карточки успели отрендериться
  setTimeout(() => {
    console.log('Загружаем сохраненные состояния сердечек...');
    window.heartsManager.loadHeartStates();
  }, 100);
});

// Экспортируем для использования в других модулях
if (typeof module !== 'undefined' && module.exports) {
  module.exports = HeartsManager;
} 