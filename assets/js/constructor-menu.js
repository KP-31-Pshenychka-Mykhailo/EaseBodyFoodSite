document.addEventListener('DOMContentLoaded', async function() {
  const menuSlider = document.querySelector('.menu-slider');
  const leftBtn = document.querySelector('.menu-slider-arrow.left');
  const rightBtn = document.querySelector('.menu-slider-arrow.right');
  if (!menuSlider || !leftBtn || !rightBtn) return;

  const scrollStep = 320; // ширина одной карточки + gap

  leftBtn.addEventListener('click', function() {
    menuSlider.scrollBy({ left: -scrollStep, behavior: 'smooth' });
  });
  rightBtn.addEventListener('click', function() {
    menuSlider.scrollBy({ left: scrollStep, behavior: 'smooth' });
  });

  const typeTabs = document.querySelectorAll('.menu-type-tab');
  let currentType = 'breakfast';

  // Маппинг вкладок к type в dishes.json
  const typeMap = {
    'сніданок': 'breakfast',
    'полуденок': 'afternoonsnask',
    'обід': 'dinnerdish',
    'вечеря': 'eveningmealdish'
  };

  // Загрузка блюд
  let dishesData = [];
  async function loadDishes() {
    const resp = await fetch('../EaseBodyFoodSite/assets/data/dishes.json');
    dishesData = await resp.json();
  }

  // Сохраняем состояние плюса/минуса для каждого блюда по id и дню недели
  const cardState = {};
  let currentDay = 'monday';

  function createMenuCard(dish) {
    if (!cardState[currentDay]) cardState[currentDay] = {};
    const isActive = cardState[currentDay][dish.id] !== false; // по умолчанию active (минус)
    return `
      <div class="menu-card" data-dish-id="${dish.id}">
        <div class="menu-card-img-wrap">
          <img src="${dish.img || '../EaseBodyFoodSite/assets/img/food1.jpg'}" alt="${dish.title}" class="menu-card-img">
          <div class="gallery-card-icons">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" class="gallery-heart icon-heart" data-dish-id="${dish.id}">
              <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 
                       4.42 3 7.5 3c1.74 0 3.41 0.81 4.5 2.09C13.09 3.81 
                       14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 
                       6.86-8.55 11.54L12 21.35z"/>
            </svg>
          </div>
          <span class="menu-card-plus${isActive ? ' active' : ''}" data-dish-id="${dish.id}">${isActive ? '−' : '+'}</span>
        </div>
        <div class="menu-card-content">
          <div class="menu-card-title">${dish.title}</div>
          <div class="menu-card-macros">Б: ${dish.p} г, Ж: ${dish.f} г, В: ${dish.c} г</div>
          <div class="menu-card-desc">${dish.subtitle || ''}</div>
        </div>
      </div>
    `;
  }

  function renderCards(type) {
    menuSlider.innerHTML = '';
    const filtered = dishesData.filter(d => d.type === type);
    if (filtered.length === 0) {
      menuSlider.innerHTML = '<div style="padding:2rem">Немає страв для цієї категорії.</div>';
      return;
    }
    menuSlider.innerHTML = filtered.map(createMenuCard).join('');
    attachCardEvents();
  }

  function attachCardEvents() {
    // Удаляем старый обработчик toggle('active') для сердечек
    // Сердечки теперь обрабатываются в favorites.js
    document.querySelectorAll('.menu-card-plus').forEach(plus => {
      plus.addEventListener('click', function() {
        const dishId = this.getAttribute('data-dish-id');
        if (!cardState[currentDay]) cardState[currentDay] = {};
        this.classList.toggle('active');
        if (this.classList.contains('active')) {
          this.textContent = '−';
          cardState[currentDay][dishId] = true;
        } else {
          this.textContent = '+';
          cardState[currentDay][dishId] = false;
        }
      });
    });
  }

  // Обработчики для вкладок
  typeTabs.forEach(tab => {
    tab.addEventListener('click', function() {
      typeTabs.forEach(t => t.classList.remove('active'));
      this.classList.add('active');
      const typeText = this.textContent.toLowerCase();
      currentType = typeMap[typeText] || 'breakfast';
      renderCards(currentType);
    });
  });

  // Обработчики для дней недели
  const dayButtons = document.querySelectorAll('.menu-day');
  const dayMap = {
    'пн': 'monday',
    'вт': 'tuesday',
    'ср': 'wednesday',
    'чт': 'thursday',
    'пт': 'friday',
    'сб': 'saturday',
    'нд': 'sunday'
  };
  dayButtons.forEach(button => {
    button.addEventListener('click', function() {
      dayButtons.forEach(btn => btn.classList.remove('active'));
      this.classList.add('active');
      const dayText = this.textContent.toLowerCase();
      currentDay = dayMap[dayText] || 'monday';
      renderCards(currentType);
    });
  });

  // Загрузка и первичный рендер
  await loadDishes();
  renderCards(currentType);
}); 