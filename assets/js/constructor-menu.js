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
    const resp = await fetch('assets/data/dishes.json').catch(() => fetch('../assets/data/dishes.json'));
    dishesData = await resp.json();
  }

  // Сохраняем состояние плюса/минуса для каждого блюда по id и дню недели
  const cardState = {};
  let currentDay = 'monday';
  
  // Инициализируем cardState для всех дней недели (с понедельника по субботу)
  const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
  days.forEach(day => {
    cardState[day] = {};
  });

  function createMenuCard(dish) {
    if (!cardState[currentDay]) cardState[currentDay] = {};
    
    // По умолчанию все блюда НЕ выбраны (неактивны)
    if (cardState[currentDay][dish.id] === undefined) {
      cardState[currentDay][dish.id] = false;
    }
    
    const isActive = cardState[currentDay][dish.id] === true;
    
    console.log(`Creating card for dish ${dish.id} on day ${currentDay}, active: ${isActive}`);
    
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
    // Сердечки обрабатываются универсальным HeartsManager
    if (window.heartsManager) {
      window.heartsManager.refresh();
    }
    
    document.querySelectorAll('.menu-card-plus').forEach(plus => {
      plus.addEventListener('click', function() {
        const dishId = this.getAttribute('data-dish-id');
        if (!cardState[currentDay]) cardState[currentDay] = {};
        
        // Переключаем состояние
        const isCurrentlyActive = this.classList.contains('active');
        
        if (isCurrentlyActive) {
          // Если активно (красный минус), то убираем из меню
          this.classList.remove('active');
          this.textContent = '+';
          cardState[currentDay][dishId] = false;
        } else {
          // Если неактивно (зеленый плюс), то добавляем в меню
          this.classList.add('active');
          this.textContent = '−';
          cardState[currentDay][dishId] = true;
        }
      });
    });
  }

  // Функция для получения выбранных блюд
  function getSelectedDishes() {
    const selectedDishes = [];
    const dayMap = {
      'monday': 'Пн',
      'tuesday': 'Вт', 
      'wednesday': 'Ср',
      'thursday': 'Чт',
      'friday': 'Пт',
      'saturday': 'Сб'
    };

    console.log('Getting selected dishes from cardState:', cardState);

    // Проходим по всем дням недели
    Object.keys(cardState).forEach(day => {
      if (cardState[day]) {
        console.log(`Checking day ${day}:`, cardState[day]);
        Object.keys(cardState[day]).forEach(dishId => {
          console.log(`Dish ${dishId} in ${day}:`, cardState[day][dishId]);
          if (cardState[day][dishId] === true) {
            const dish = dishesData.find(d => d.id == dishId);
            if (dish) {
              selectedDishes.push({
                ...dish,
                day: day,
                dayName: dayMap[day],
                quantity: 1
              });
            }
          }
        });
      }
    });

    console.log('Final selected dishes:', selectedDishes);
    return selectedDishes;
  }

  // Функция для проверки минимального количества дней
  function checkMinimumDays(selectedDishes) {
    const uniqueDays = new Set(selectedDishes.map(dish => dish.day));
    const daysCount = uniqueDays.size;
    
    console.log('Unique days selected:', Array.from(uniqueDays));
    console.log('Days count:', daysCount);
    
    if (daysCount < 3) {
      const remainingDays = 3 - daysCount;
      const dayNames = {
        1: 'день',
        2: 'дні',
        3: 'днів'
      };
      
      const dayMap = {
        'monday': 'Понеділок',
        'tuesday': 'Вівторок',
        'wednesday': 'Середа',
        'thursday': 'Четвер',
        'friday': 'П\'ятниця',
        'saturday': 'Субота'
      };
      
      const selectedDayNames = Array.from(uniqueDays).map(day => dayMap[day]).join(', ');
      
      alert(`Мінімум потрібно додати страви для 3 днів.\n\nВи додали страви для: ${selectedDayNames}\n\nВам залишилося додати страви ще для ${remainingDays} ${dayNames[remainingDays]}.`);
      return false;
    }
    
    return true;
  }

  // Функция для сохранения шаблона в корзину
  function saveTemplateToCart() {
    const selectedDishes = getSelectedDishes();
    
    console.log('Selected dishes:', selectedDishes);
    console.log('Card state:', cardState);
    console.log('Current day:', currentDay);
    
    if (selectedDishes.length === 0) {
      alert('Будь ласка, додайте хоча б одну страву до меню, натиснувши на "+" біля страви');
      return;
    }

    // Проверяем минимальное количество дней
    if (!checkMinimumDays(selectedDishes)) {
      return;
    }

    // Используем CartManager для добавления блюд в корзину
    if (window.cartManager) {
      selectedDishes.forEach(dish => {
        window.cartManager.addItem(dish);
      });
    } else {
      // Fallback для случая, если CartManager не загружен
      let cart = JSON.parse(localStorage.getItem('cart') || '[]');
      
      selectedDishes.forEach(dish => {
        const existingDishIndex = cart.findIndex(item => 
          item.id === dish.id && item.day === dish.day
        );
        
        if (existingDishIndex !== -1) {
          cart[existingDishIndex].quantity += dish.quantity;
        } else {
          cart.push(dish);
        }
      });

      localStorage.setItem('cart', JSON.stringify(cart));
    }
    
    console.log('Cart after saving:', localStorage.getItem('cart'));
    
    // Перенаправляем в корзину
    window.location.href = 'cart.html';
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
    'сб': 'saturday'
  };
  dayButtons.forEach(button => {
    button.addEventListener('click', function() {
      dayButtons.forEach(btn => btn.classList.remove('active'));
      this.classList.add('active');
      const dayText = this.textContent.toLowerCase();
      const newDay = dayMap[dayText] || 'monday';
      
      console.log('Switching from day', currentDay, 'to day', newDay);
      console.log('Card state before switch:', cardState);
      
      currentDay = newDay;
      renderCards(currentType);
      
      console.log('Card state after switch:', cardState);
    });
  });

  // Обработчик для кнопки "Затвердити шаблон"
  const confirmBtn = document.querySelector('.menu-choose-btn');
  if (confirmBtn) {
    confirmBtn.addEventListener('click', saveTemplateToCart);
  }

  // Загрузка и первичный рендер
  await loadDishes();
  renderCards(currentType);
}); 