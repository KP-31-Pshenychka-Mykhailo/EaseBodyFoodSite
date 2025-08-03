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

  // Генерация карточки избранного блюда в стиле корзины
  function createFavoriteCard(dish) {
    if (!dish) return '';
    
    const calories = (dish.p * 4) + (dish.f * 9) + (dish.c * 4);
    
    return `
      <div class="cart-item" data-dish-id="${dish.id}">
        <img src="${dish.img || 'assets/img/food1.jpg'}" alt="${dish.title}" class="cart-item-img">
        <div class="cart-item-content">
          <div class="cart-item-title">${dish.title}</div>
          <div class="cart-item-macros">Б: ${dish.p}г Ж: ${dish.f}г В: ${dish.c}г, ${calories} ккал</div>
          <div class="cart-item-description">${dish.subtitle || ''}</div>
          ${dish.allergens ? `<div class="cart-item-allergens">Алергени: ${dish.allergens}</div>` : ''}
        </div>
        <div class="cart-item-controls">
          <div class="cart-item-actions">
            <button class="add-to-cart-btn" onclick="addToCart(${dish.id})">Додати в кошик</button>
            <button class="delete-btn" onclick="removeFromFavorites(${dish.id})">Видалити з улюблених</button>
          </div>
        </div>
      </div>
    `;
  }

  // Функция добавления в корзину
  window.addToCart = function(dishId) {
    const dish = getDishById(dishId);
    if (!dish) return;

    const cartItem = {
      id: dish.id,
      title: dish.title,
      subtitle: dish.subtitle,
      img: dish.img,
      p: dish.p,
      f: dish.f,
      c: dish.c,
      quantity: 1,
      day: 'today',
      dayName: 'Сьогодні'
    };

    if (window.cartManager) {
      window.cartManager.addItem(cartItem);
      alert('Блюдо додано до кошика!');
    } else {
      // Fallback если cartManager не загружен
      const cart = JSON.parse(localStorage.getItem('cart') || '[]');
      cart.push(cartItem);
      localStorage.setItem('cart', JSON.stringify(cart));
      alert('Блюдо додано до кошика!');
    }
  };

  // Функция удаления из избранного
  window.removeFromFavorites = function(dishId) {
    if (confirm('Ви впевнені, що хочете видалити це блюдо з улюблених?')) {
      const heartsState = JSON.parse(localStorage.getItem('heartsState') || '{}');
      heartsState[dishId] = false;
      localStorage.setItem('heartsState', JSON.stringify(heartsState));
      renderFavorites();
    }
  };

  // Отображение избранных блюд в стиле корзины
  window.renderFavorites = function() {
    const heartsState = JSON.parse(localStorage.getItem('heartsState') || '{}');
    const favoriteIds = Object.keys(heartsState).filter(id => heartsState[id] === true);
    
    if (favoriteIds.length === 0) {
      favoritesContainer.innerHTML = `
        <div class="cart-container">
          <div class="cart-header">
            <h1 class="profile-header-title">Улюблені страви</h1>
          </div>
          <div class="profile-cart-empty">
            <div class="profile-cart-empty-title">У вас поки немає улюблених страв</div>
            <div class="profile-cart-empty-desc">Додайте їх, натиснувши на сердечко біля блюда!</div>
            <div class="profile-cart-btns">
              <a href="index.html" class="profile-cart-btn">Переглянути меню</a>
            </div>
          </div>
        </div>
      `;
      return;
    }

    const favoriteDishes = favoriteIds.map(id => getDishById(id)).filter(dish => dish);
    
    // Подсчет общих макронутриентов
    const totalMacros = favoriteDishes.reduce((total, dish) => ({
      protein: total.protein + dish.p,
      fat: total.fat + dish.f,
      carbs: total.carbs + dish.c
    }), { protein: 0, fat: 0, carbs: 0 });
    
    const totalCalories = favoriteDishes.reduce((total, dish) => {
      const calories = (dish.p * 4) + (dish.f * 9) + (dish.c * 4);
      return total + calories;
    }, 0);
    
    favoritesContainer.innerHTML = `
      <div class="cart-container">
        <div class="cart-header">
          <h1 class="profile-header-title">Улюблені страви</h1>
          <button class="clear-cart-btn" onclick="clearAllFavorites()">Очистити улюблені</button>
        </div>
        
        <div class="cart-items">
          ${favoriteDishes.map(dish => createFavoriteCard(dish)).join('')}
        </div>
        
        <div class="cart-summary">
          <div class="cart-total">Загалом у улюблених: ${totalMacros.protein} Білки ${totalMacros.fat} Жири ${totalMacros.carbs} Вуглеводи, ${totalCalories} ккал.</div>
          <div class="cart-actions">
            <button class="checkout-btn" onclick="addAllToCart()">Додати все в кошик</button>
            <a href="index.html" class="continue-shopping-btn">Переглянути меню</a>
          </div>
        </div>
      </div>
    `;
  }

  // Функция очистки всех избранных
  window.clearAllFavorites = function() {
    if (confirm('Ви впевнені, що хочете видалити всі улюблені страви?')) {
      localStorage.setItem('heartsState', '{}');
      renderFavorites();
    }
  };

  // Функция добавления всех избранных в корзину
  window.addAllToCart = function() {
    const heartsState = JSON.parse(localStorage.getItem('heartsState') || '{}');
    const favoriteIds = Object.keys(heartsState).filter(id => heartsState[id] === true);
    
    if (favoriteIds.length === 0) {
      alert('У вас немає улюблених страв для додавання в кошик');
      return;
    }

    let addedCount = 0;
    favoriteIds.forEach(id => {
      const dish = getDishById(id);
      if (dish) {
        const cartItem = {
          id: dish.id,
          title: dish.title,
          subtitle: dish.subtitle,
          img: dish.img,
          p: dish.p,
          f: dish.f,
          c: dish.c,
          quantity: 1,
          day: 'today',
          dayName: 'Сьогодні'
        };

        if (window.cartManager) {
          window.cartManager.addItem(cartItem);
        } else {
          const cart = JSON.parse(localStorage.getItem('cart') || '[]');
          cart.push(cartItem);
          localStorage.setItem('cart', JSON.stringify(cart));
        }
        addedCount++;
      }
    });

    alert(`Додано ${addedCount} страв до кошика!`);
  };

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