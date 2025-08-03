let currentStep = 1;
const totalSteps = 4;

function showStep(step) {
  for (let i = 1; i <= totalSteps; i++) {
    document.getElementById('form-step-' + i).style.display = (i === step) ? 'flex' : 'none';
    document.getElementById('step-' + i).classList.toggle('active', i === step);
  }
}

function nextStep() {
  // Validate current step
  const form = document.getElementById('calculator-form');
  const currentBox = document.getElementById('form-step-' + currentStep);
  const inputs = currentBox.querySelectorAll('input[required]');
  let valid = false;
  for (let input of inputs) {
    if ((input.type === 'radio' && input.checked) || (input.type !== 'radio' && input.value)) {
      valid = true;
      break;
    }
  }
  if (!valid) {
    alert('Будь ласка, заповніть поле!');
    return;
  }
  if (currentStep < totalSteps) {
    currentStep++;
    showStep(currentStep);
  }
}

function calculateCalories({ gender, age, weight, height, activity, goal }) {
  // Формулы Харриса-Бенедикта (BMR)
  let bmr;
  if (gender === 'male') {
    bmr = 88.36 + (13.4 * weight) + (4.8 * height) - (5.7 * age);
  } else {
    bmr = 447.6 + (9.2 * weight) + (3.1 * height) - (4.3 * age);
  }
  // Коэффициенты активности
  const activityFactors = {
    '1': 1.2,    // Очень низкая
    '2': 1.375,  // Низкая
    '3': 1.55,   // Средняя
    '4': 1.725,  // Высокая
    '5': 1.9     // Очень высокая
  };
  let calories = bmr * (activityFactors[activity] || 1.2);
  // Корректировка по цели
  if (goal === 'lose') {
    calories -= 300; // Для похудения
  } else if (goal === 'gain') {
    calories += 300; // Для набора
  } // Для поддержания — без изменений
  return Math.round(calories);
}

function getClosestMenuType(calories) {
  const types = [900, 1200, 1600, 1800, 2500, 3000, 3500];
  return types.reduce((prev, curr) => Math.abs(curr - calories) < Math.abs(prev - calories) ? curr : prev);
}

async function loadMenuData() {
  const menuResp = await fetch('assets/data/menu.json').catch(() => fetch('../assets/data/menu.json'));
  const menuData = await menuResp.json();
  const dishesResp = await fetch('assets/data/dishes.json').catch(() => fetch('../assets/data/dishes.json'));
  const dishesData = await dishesResp.json();
  return { menuData, dishesData };
}

function getMenuForDay(menuArr, day) {
  return menuArr.find(item => item.dayOfWeek && item.dayOfWeek.toLowerCase().startsWith(day.toLowerCase()));
}

function getDishById(dishes, id) {
  return dishes.find(d => d.id === id);
}

const mealMap = [
  { key: 'breakfastId', name: 'Сніданок' },
  { key: 'additionaldishesId', name: 'Додаткова страва' },
  { key: 'sweetbreakfastId', name: 'Солодкий сніданок' },
  { key: 'afternoonsnaskId', name: 'Полуденок' },
  { key: 'sweetafternoonsnaskId', name: 'Солодкий полуденок' },
  { key: 'dinnerdishId', name: 'Обід' },
  { key: 'eveningmealdishId', name: 'Вечеря' }
];

function createMenuCardAlt(dish, mealType) {
  if (!dish) return '';
  return `
    <div class="menu-card-alt" data-dish-id="${dish.id}">
      <div class="menu-card-img-wrap-alt">
        <img src="${dish.img || 'assets/img/food1.jpg'}" alt="${dish.title}" class="menu-card-img">
        <div class="gallery-card-icons-alt">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" class="gallery-heart-alt icon-heart">
            <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41 0.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
          </svg>
        </div>
        <span class="menu-card-plus active">−</span>
      </div>
      <div class="menu-card-content-alt">
        <div class="menu-card-title-alt">${mealType}</div>
        <div class="menu-card-macros-alt">Б: ${dish.p} г, Ж: ${dish.f} г, В: ${dish.c} г</div>
        <div class="menu-card-desc-alt">${dish.title}</div>
      </div>
    </div>
  `;
}

function renderPersonalMenu(menuArr, dishes, day) {
  const menuSlider = document.getElementById('dietCards');
  const menuTotal = document.querySelector('.menu-total-alt');
  menuSlider.innerHTML = '';
  let totalP = 0, totalF = 0, totalC = 0;
  const menuObj = getMenuForDay(menuArr, day);
  if (!menuObj) {
    menuSlider.innerHTML = '<div style="padding:2rem">Немає меню для цього дня.</div>';
    if (menuTotal) menuTotal.textContent = 'Б: 0 г, Ж: 0 г, В: 0 г';
    return;
  }
  let cardsHTML = '';
  mealMap.forEach(meal => {
    if (menuObj[meal.key]) {
      const dish = getDishById(dishes, menuObj[meal.key]);
      if (dish) {
        totalP += Number(dish.p) || 0;
        totalF += Number(dish.f) || 0;
        totalC += Number(dish.c) || 0;
      }
      cardsHTML += createMenuCardAlt(dish, meal.name);
    }
  });
  menuSlider.innerHTML = cardsHTML;
  if (menuTotal) menuTotal.textContent = `Б: ${totalP} г, Ж: ${totalF} г, В: ${totalC} г`;
  // Интерактивность (сердечки обрабатываются универсальным HeartsManager)
  if (window.heartsManager) {
    window.heartsManager.refresh();
  }
  document.querySelectorAll('.menu-card-plus').forEach(function(plus) {
    plus.addEventListener('click', function() {
      // Переключаем состояние
      const isCurrentlyActive = this.classList.contains('active');
      
      if (isCurrentlyActive) {
        // Если активно (красный минус), то убираем из меню
        this.classList.remove('active');
        this.textContent = '+';
      } else {
        // Если неактивно (зеленый плюс), то добавляем в меню
        this.classList.add('active');
        this.textContent = '−';
      }
    });
  });
}

// --- Модификация обработчика submit ---
document.getElementById('calculator-form').addEventListener('submit', async function(e) {
  e.preventDefault();
  // Simple validation for last step
  const goalRadios = document.querySelectorAll('input[name="goal"]');
  let valid = false;
  for (let input of goalRadios) {
    if (input.checked) {
      valid = true;
      break;
    }
  }
  if (!valid) {
    alert('Будь ласка, оберіть мету!');
    return;
  }
  // Collect data
  const data = new FormData(this);
  const gender = data.get('gender');
  const age = Number(data.get('age'));
  const weight = Number(data.get('weight'));
  const height = Number(data.get('height'));
  const activity = data.get('activity');
  const goal = data.get('goal');
  // Расчёт калорий
  const calories = calculateCalories({ gender, age, weight, height, activity, goal });
  let goalText = '';
  if (goal === 'lose') goalText = 'для схуднення';
  else if (goal === 'gain') goalText = 'для набору ваги';
  else goalText = 'для підтримки форми';
  document.getElementById('result').style.display = 'block';
  document.getElementById('result').innerText = `Ваша приблизна добова норма калорій ${goalText}: ${calories} ккал`;
  this.style.display = 'none';

  // --- Динамическое меню ---
  const menuType = getClosestMenuType(calories);
  const { menuData, dishesData } = await loadMenuData();
  let currentDay = 'Mon';
  const dayMap = {
    'monday': 'Mon',
    'tuesday': 'Tue',
    'wednesday': 'Wed',
    'thursday': 'Thu',
    'friday': 'Fri',
    'saturday': 'Sat',
    'sunday': 'Sun'
  };
  // Кнопки дней недели
  document.querySelectorAll('.menu-day-alt').forEach(function(btn) {
    btn.onclick = function() {
      document.querySelectorAll('.menu-day-alt').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      currentDay = dayMap[btn.getAttribute('data-day')] || 'Mon';
      renderPersonalMenu(menuData[menuType], dishesData, currentDay);
    };
  });
  // Первичный рендер
  renderPersonalMenu(menuData[menuType], dishesData, currentDay);
  // Показать секцию
  var dietSection = document.getElementById('personal-diet-section');
  if (dietSection) {
    dietSection.style.display = 'block';
    setTimeout(function() {
      dietSection.style.opacity = 1;
      dietSection.style.transform = 'translateY(0)';
    }, 50);
  }
});

// Initial step
showStep(currentStep);

// --- Анимация и меню-карусель для блока с рационом ---
document.addEventListener('DOMContentLoaded', function() {
  // Анимация появления блока с рационом
  var dietSection = document.getElementById('personal-diet-section');
  if (dietSection) {
    dietSection.style.opacity = 0;
    dietSection.style.transform = 'translateY(40px)';
    dietSection.style.transition = 'opacity 0.7s cubic-bezier(.4,0,.2,1), transform 0.7s cubic-bezier(.4,0,.2,1)';
  }

  var form = document.getElementById('calculator-form');
  var result = document.getElementById('result');
  if (form) {
    form.addEventListener('submit', function(e) {
      setTimeout(function() {
        if (result && result.style.display === 'block' && dietSection) {
          dietSection.style.display = 'block';
          setTimeout(function() {
            dietSection.style.opacity = 1;
            dietSection.style.transform = 'translateY(0)';
          }, 50);
        }
      }, 100);
    });
  }

  // --- Карусель и дни недели ---
  const menuSlider = document.getElementById('dietCards');
  const leftBtn = document.getElementById('dietLeft');
  const rightBtn = document.getElementById('dietRight');
  if (menuSlider && leftBtn && rightBtn) {
    const scrollStep = 320;
    leftBtn.addEventListener('click', function() {
      menuSlider.scrollBy({ left: -scrollStep, behavior: 'smooth' });
    });
    rightBtn.addEventListener('click', function() {
      menuSlider.scrollBy({ left: scrollStep, behavior: 'smooth' });
    });
  }

  // --- Дни недели (заглушка: просто активный класс, без фильтрации карточек) ---
  const dayButtons = document.querySelectorAll('#personal-diet-section .menu-day');
  dayButtons.forEach(btn => {
    btn.addEventListener('click', function() {
      dayButtons.forEach(b => b.classList.remove('active'));
      this.classList.add('active');
      // Здесь можно добавить фильтрацию карточек по дню, если потребуется
    });
  });

  // --- Сердечки (обрабатываются универсальным HeartsManager) ---
  if (window.heartsManager) {
    window.heartsManager.refresh();
  }

  // --- Плюсики ---
  document.querySelectorAll('#personal-diet-section .menu-card-plus').forEach(function(plus) {
    plus.addEventListener('click', function() {
      // Переключаем состояние
      const isCurrentlyActive = this.classList.contains('active');
      
      if (isCurrentlyActive) {
        // Если активно (красный минус), то убираем из меню
        this.classList.remove('active');
        this.textContent = '+';
      } else {
        // Если неактивно (зеленый плюс), то добавляем в меню
        this.classList.add('active');
        this.textContent = '−';
      }
    });
  });

  // Функция для получения выбранных блюд из калькулятора
  function getSelectedDishesFromCalculator() {
    const selectedDishes = [];
    const dayMap = {
      'monday': 'Пн',
      'tuesday': 'Вт', 
      'wednesday': 'Ср',
      'thursday': 'Чт',
      'friday': 'Пт',
      'saturday': 'Сб'
    };

    // Получаем активный день
    const activeDayBtn = document.querySelector('#personal-diet-section .menu-day-alt.active');
    const currentDay = activeDayBtn ? activeDayBtn.getAttribute('data-day') : 'monday';

    // Получаем все активные карточки (с красным минусом)
    const activeCards = document.querySelectorAll('#personal-diet-section .menu-card-plus.active');
    
    activeCards.forEach(plus => {
      const card = plus.closest('.menu-card-alt');
      const dishId = card.getAttribute('data-dish-id');
      const dish = dishesData.find(d => d.id === parseInt(dishId));
      
      if (dish) {
        selectedDishes.push({
          ...dish,
          day: currentDay,
          dayName: dayMap[currentDay],
          quantity: 1
        });
      }
    });

    return selectedDishes;
  }

  // Функция для сохранения шаблона в корзину
  function saveCalculatorTemplateToCart() {
    const selectedDishes = getSelectedDishesFromCalculator();
    
    if (selectedDishes.length === 0) {
      alert('Будь ласка, залиште хоча б одну страву в меню');
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
    
    // Перенаправляем в корзину
    window.location.href = 'cart.html';
  }

  // Обработчик для кнопки "Замовити це меню"
  const orderBtn = document.querySelector('.menu-choose-btn-alt');
  if (orderBtn) {
    orderBtn.addEventListener('click', saveCalculatorTemplateToCart);
  }
}); 