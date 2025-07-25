let API_URL = '';
fetch('assets/js/settings.json')
  .then(r => r.json())
  .then(settings => { API_URL = settings.API_URL; });

function getUserId() {
  return localStorage.getItem('userId');
}

async function addFavorite(dishId, heart) {
  const userId = getUserId();
  if (!userId) {
    if (window.showRegisterModalIfNotAuth) window.showRegisterModalIfNotAuth();
    return;
  }
  try {
    const response = await fetch(`${API_URL}/favorite`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: Number(userId), dishId: String(dishId) })
    });
    const result = await response.text();
    if (response.ok) {
      heart.classList.add('active');
    } else {
      alert(result);
    }
  } catch (e) {
    alert('Ошибка добавления в избранное: ' + e.message);
  }
}

async function removeFavorite(dishId, heart) {
  const userId = getUserId();
  if (!userId) return;
  try {
    const response = await fetch(`${API_URL}/favorite`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: Number(userId), dishId: String(dishId) })
    });
    const result = await response.text();
    if (response.ok) {
      heart.classList.remove('active');
    } else {
      alert(result);
    }
  } catch (e) {
    alert('Ошибка удаления из избранного: ' + e.message);
  }
}

function attachFavoriteHandlers() {
  document.querySelectorAll('.gallery-heart, .gallery-heart-alt').forEach(function(heart) {
    let dishId = heart.dataset.dishId;
    if (!dishId) {
      const parent = heart.closest('[data-dish-id]');
      if (parent) dishId = parent.dataset.dishId;
    }
    if (!dishId) return;
    heart.addEventListener('click', function(e) {
      e.preventDefault();
      if (heart.classList.contains('active')) {
        removeFavorite(dishId, heart);
      } else {
        addFavorite(dishId, heart);
      }
    });
  });
}

document.addEventListener('DOMContentLoaded', function() {
  attachFavoriteHandlers();
});

// Для профиля:
window.loadFavorites = async function() {
  const userId = getUserId();
  if (!userId) return;
  const container = document.getElementById('tab-favorites');
  container.innerHTML = 'Загрузка...';
  try {
    // 1. Получаем id избранных блюд пользователя
    const response = await fetch(`${API_URL}/favorite/${userId}`);
    const favoriteIds = await response.json();
    if (!favoriteIds.length) {
      container.innerHTML = '<div class="profile-cart-empty" style="background:#f8fff8;color:#36b23a;">Тут будуть ваші улюблені страви.</div>';
      return;
    }
    // 2. Загружаем все блюда из dishes.json
    const dishesResp = await fetch('assets/data/dishes.json');
    const allDishes = await dishesResp.json();
    // 3. Фильтруем блюда по id
    const favoriteDishes = allDishes.filter(dish => favoriteIds.includes(Number(dish.id)));
    // 4. Рендерим
    container.innerHTML = favoriteDishes.map(dish => `
      <div class="favorite-dish-card" data-dish-id="${dish.id}">
        <span>${dish.title}</span>
        <svg class="gallery-heart active" data-dish-id="${dish.id}" width="24" height="24" viewBox="0 0 24 24">
          <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41 0.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
        </svg>
      </div>
    `).join('');
    document.querySelectorAll('#tab-favorites .gallery-heart').forEach(heart => {
      heart.addEventListener('click', function(e) {
        e.preventDefault();
        const dishId = heart.dataset.dishId;
        removeFavorite(dishId, heart);
        heart.closest('.favorite-dish-card').remove();
      });
    });
  } catch (e) {
    container.innerHTML = 'Ошибка загрузки избранного';
  }
} 