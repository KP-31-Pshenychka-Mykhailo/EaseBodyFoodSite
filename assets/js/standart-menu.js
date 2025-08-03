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

  // Маппинг дней недели и калорийности
  const dayButtons = document.querySelectorAll('.menu-day');
  const typeTabs = document.querySelectorAll('.menu-type-tab');

  const dayMap = {
    'пн': 'Mon',
    'вт': 'Tue',
    'ср': 'Wed',
    'чт': 'Thu',
    'пт': 'Fri',
    'сб': 'Sat'
  };

  let selectedCalories = '900';
  let selectedDay = 'Mon';

  // Загрузка данных
  let menuData = {};
  let dishesData = [];
  async function loadData() {
    const menuResp = await fetch('assets/data/menu.json').catch(() => fetch('../assets/data/menu.json'));
    menuData = await menuResp.json();
    const dishesResp = await fetch('assets/data/dishes.json').catch(() => fetch('../assets/data/dishes.json'));
    dishesData = await dishesResp.json();
  }

  // Получить объект меню по калорийности и дню
  function getMenuForSelection(calories, day) {
    const arr = menuData[calories];
    if (!arr) return null;
    return arr.find(item => item.dayOfWeek && item.dayOfWeek.toLowerCase().startsWith(day.toLowerCase()));
  }

  // Получить блюдо по id
  function getDishById(id) {
    return dishesData.find(dish => dish.id === id);
  }

  // Генерация карточки
  function createMenuCard(dish, mealType) {
    if (!dish) return '';
    // mealType: название приёма пищи ("Сніданок", "Обід" и т.д.)
    return `
      <div class="menu-card" data-dish-id="${dish.id}">
        <div class="menu-card-img-wrap">
          <img src="${dish.img || 'assets/img/food1.jpg'}" alt="${dish.title}" class="menu-card-img">
          <div class="gallery-card-icons">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" class="gallery-heart icon-heart">
              <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 
                       4.42 3 7.5 3c1.74 0 3.41 0.81 4.5 2.09C13.09 3.81 
                       14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 
                       6.86-8.55 11.54L12 21.35z"/>
            </svg>
          </div>
          <span class="menu-card-plus">+</span>
        </div>
        <div class="menu-card-content">
          <div class="menu-card-title">${mealType}</div>
          <div class="menu-card-macros">Б: ${dish.p} г, Ж: ${dish.f} г, В: ${dish.c} г</div>
          <div class="menu-card-desc">${dish.title}</div>
        </div>
      </div>
    `;
  }

  // Маппинг типов приёмов пищи к ключам в menu.json и названиям для карточек
  const mealMap = [
    { key: 'breakfastId', name: 'Сніданок' },
    { key: 'additionaldishesId', name: 'Додаткова страва' },
    { key: 'sweetbreakfastId', name: 'Солодкий сніданок' },
    { key: 'afternoonsnaskId', name: 'Полуденок' },
    { key: 'sweetafternoonsnaskId', name: 'Солодкий полуденок' },
    { key: 'dinnerdishId', name: 'Обід' },
    { key: 'eveningmealdishId', name: 'Вечеря' }
  ];

  const menuTotal = document.querySelector('.menu-total');

  // Основная функция генерации карточек
  function renderMenuCards() {
    menuSlider.innerHTML = '';
    const menuObj = getMenuForSelection(selectedCalories, selectedDay);
    if (!menuObj) {
      menuSlider.innerHTML = '<div style="padding:2rem">Немає меню для цього дня.</div>';
      if (menuTotal) menuTotal.textContent = 'Загалом у меню: 0 Білки 0 Жири 0 Вуглеводи.';
      return;
    }
    let cardsHTML = '';
    let totalP = 0, totalF = 0, totalC = 0;
    mealMap.forEach(meal => {
      if (menuObj[meal.key]) {
        const dish = getDishById(menuObj[meal.key]);
        if (dish) {
          totalP += Number(dish.p) || 0;
          totalF += Number(dish.f) || 0;
          totalC += Number(dish.c) || 0;
        }
        cardsHTML += createMenuCard(dish, meal.name);
      }
    });
    menuSlider.innerHTML = cardsHTML;
    // Подсчёт калорий
    const totalKcal = Math.round(totalP * 4 + totalF * 9 + totalC * 4);
    if (menuTotal) {
      menuTotal.textContent = `Загалом у меню: ${totalP} Білки ${totalF} Жири ${totalC} Вуглеводи.`;
    }
    attachCardEvents();
  }

  // Восстановление интерактивности для сердечек и плюсиков
  function attachCardEvents() {
    // Сердечки обрабатываются универсальным HeartsManager
    if (window.heartsManager) {
      window.heartsManager.refresh();
    }
    
    const plusIcons = document.querySelectorAll('.menu-card-plus');
    plusIcons.forEach(plus => {
      plus.addEventListener('click', function() {
        this.classList.toggle('active');
        if (this.classList.contains('active')) {
          this.textContent = '−';
        } else {
          this.textContent = '+';
        }
      });
    });
  }

  // Обработчики для дней недели
  dayButtons.forEach(button => {
    button.addEventListener('click', function() {
      dayButtons.forEach(btn => btn.classList.remove('active'));
      this.classList.add('active');
      const dayText = this.textContent.toLowerCase();
      selectedDay = dayMap[dayText] || 'Mon';
      renderMenuCards();
    });
  });

  // Обработчики для калорийности
  typeTabs.forEach(tab => {
    tab.addEventListener('click', function() {
      typeTabs.forEach(t => t.classList.remove('active'));
      this.classList.add('active');
      selectedCalories = this.textContent.trim();
      renderMenuCards();
    });
  });

  // Загрузка данных и первичный рендер
  await loadData();
  renderMenuCards();
}); 