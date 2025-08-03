document.addEventListener('DOMContentLoaded', async function() {
  const favoritesContainer = document.getElementById('tab-favorites');
  if (!favoritesContainer) return;

  let dishesData = [];

  // Загрузка данных блюд
  async function loadDishesData() {
    try {
      const dishesResp = await fetch('assets/data/dishes.json').catch(() => fetch('../assets/data/dishes.json'));
      dishesData = await dishesResp.json();
    } catch (error) {
      console.error('Ошибка загрузки данных блюд:', error);
    }
  }

  // Получить блюдо по id
  function getDishById(id) {
    return dishesData.find(dish => dish.id === parseInt(id));
  }

  // Генерация карточки избранного блюда
  function createFavoriteCard(dish) {
    if (!dish) return '';
    
    return `
      <div class="menu-card" data-dish-id="${dish.id}">
        <div class="menu-card-img-wrap">
          <img src="${dish.img || 'assets/img/food1.jpg'}" alt="${dish.title}" class="menu-card-img">
          <div class="gallery-card-icons">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" class="gallery-heart icon-heart active">
              <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 
                       4.42 3 7.5 3c1.74 0 3.41 0.81 4.5 2.09C13.09 3.81 
                       14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 
                       6.86-8.55 11.54L12 21.35z"/>
            </svg>
          </div>
        </div>
        <div class="menu-card-content">
          <div class="menu-card-title">${dish.title}</div>
          <div class="menu-card-macros">Б: ${dish.p} г, Ж: ${dish.f} г, В: ${dish.c} г</div>
          <div class="menu-card-desc">${dish.subtitle || ''}</div>
          ${dish.allergens ? `<div class="menu-card-allergens">Алергени: ${dish.allergens}</div>` : ''}
        </div>
      </div>
    `;
  }

  // Отображение избранных блюд
  function renderFavorites() {
    const heartsState = JSON.parse(localStorage.getItem('heartsState') || '{}');
    const favoriteIds = Object.keys(heartsState).filter(id => heartsState[id] === true);
    
    if (favoriteIds.length === 0) {
      favoritesContainer.innerHTML = `
        <div class="profile-cart-title">Улюблені страви</div>
        <div class="profile-cart-empty" style="background:#f8fff8;color:#36b23a;">
          У вас поки немає улюблених страв. Додайте їх, натиснувши на сердечко біля блюда!
        </div>
      `;
      return;
    }

    const favoriteDishes = favoriteIds.map(id => getDishById(id)).filter(dish => dish);
    
    favoritesContainer.innerHTML = `
      <div class="profile-cart-title">Улюблені страви</div>
      <div class="favorites-carousel">
        <button class="favorites-arrow favorites-arrow-left">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" stroke="#4CAF50" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="15 18 9 12 15 6"></polyline>
          </svg>
        </button>
        <div class="favorites-slider">
          ${favoriteDishes.map(dish => createFavoriteCard(dish)).join('')}
        </div>
        <button class="favorites-arrow favorites-arrow-right">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" stroke="#4CAF50" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="9 18 15 12 9 6"></polyline>
          </svg>
        </button>
      </div>
    `;

    // Добавляем обработчики для стрелок карусели
    const slider = favoritesContainer.querySelector('.favorites-slider');
    const leftBtn = favoritesContainer.querySelector('.favorites-arrow-left');
    const rightBtn = favoritesContainer.querySelector('.favorites-arrow-right');
    
    if (slider && leftBtn && rightBtn) {
      const scrollStep = 320; // ширина одной карточки + gap
      
      leftBtn.addEventListener('click', function() {
        slider.scrollBy({ left: -scrollStep, behavior: 'smooth' });
      });
      
      rightBtn.addEventListener('click', function() {
        slider.scrollBy({ left: scrollStep, behavior: 'smooth' });
      });
    }

    // Обновляем HeartsManager для новых карточек
    if (window.heartsManager) {
      window.heartsManager.refresh();
    }
  }

  // Инициализация
  await loadDishesData();
  renderFavorites();

  // Обновляем избранное при изменении localStorage
  window.addEventListener('storage', function(e) {
    if (e.key === 'heartsState') {
      renderFavorites();
    }
  });

  // Обновляем избранное при переключении на вкладку
  const favoritesTab = document.querySelector('.profile-tab[data-tab="favorites"]');
  if (favoritesTab) {
    favoritesTab.addEventListener('click', function() {
      setTimeout(renderFavorites, 100); // Небольшая задержка для корректного отображения
    });
  }
}); 