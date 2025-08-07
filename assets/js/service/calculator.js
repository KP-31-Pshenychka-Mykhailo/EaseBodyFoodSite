let currentStep = 1;
const totalSteps = 4;

// Глобальные переменные для доступа к данным меню
let globalMenuData = {};
let globalDishesData = [];
let globalMenuType = 900;

// Функции для показа сообщений только при валидации формы
function showCalculatorWarning(message) {
  console.log('WARNING:', message); // Временно только логируем
  // Используем глобальные функции сообщений если доступны
  if (typeof window.showWarning === 'function') {
    window.showWarning(message);
  } else {
    // Fallback - простое уведомление
    showSimpleMessage(message, 'warning');
  }
}

function showCalculatorError(message) {
  console.log('ERROR:', message); // Временно только логируем
  // Используем глобальные функции сообщений если доступны
  if (typeof window.showError === 'function') {
    window.showError(message);
  } else {
    // Fallback - простое уведомление
    showSimpleMessage(message, 'error');
  }
}

// Fallback функция для показа простых сообщений
function showSimpleMessage(message, type) {
  // Создаем простое уведомление
  const notification = document.createElement('div');
  notification.style.cssText = `
    position: fixed;
    top: 20px;
    left: 50%;
    transform: translateX(-50%);
    z-index: 10000;
    padding: 12px 24px;
    border-radius: 8px;
    font-family: 'Montserrat', sans-serif;
    font-weight: 500;
    font-size: 14px;
    max-width: 400px;
    text-align: center;
    box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    ${type === 'error' ? 
      'background: #f8d7da; border: 1px solid #f5c6cb; color: #721c24;' : 
      'background: #fff3cd; border: 1px solid #ffeaa7; color: #856404;'
    }
  `;
  notification.textContent = message;
  
  document.body.appendChild(notification);
  
  // Убираем через 3 секунды
  setTimeout(() => {
    if (notification.parentNode) {
      notification.parentNode.removeChild(notification);
    }
  }, 3000);
}

function showStep(step) {
  for (let i = 1; i <= totalSteps; i++) {
    document.getElementById('form-step-' + i).style.display = (i === step) ? 'flex' : 'none';
    document.getElementById('step-' + i).classList.toggle('active', i === step);
  }
}

function nextStep() {
  console.log('🔍 nextStep() вызвана из:', new Error().stack);
  
  // Validate current step BEFORE moving to next
  const form = document.getElementById('calculator-form');
  const currentBox = document.getElementById('form-step-' + currentStep);
  
  let isValid = true; // Флаг валидности
  
  // Для радио кнопок (шаги 1, 2, 4) - проверяем что хотя бы одна выбрана
  if (currentStep === 1 || currentStep === 2 || currentStep === 4) {
    const radioGroups = {};
    const radioInputs = currentBox.querySelectorAll('input[type="radio"]');
    
    // Группируем радио кнопки по name
    radioInputs.forEach(input => {
      if (!radioGroups[input.name]) {
        radioGroups[input.name] = [];
      }
      radioGroups[input.name].push(input);
    });
    
    // Проверяем что в каждой группе есть выбранная опция
    for (let groupName in radioGroups) {
      let hasSelected = radioGroups[groupName].some(input => input.checked);
      if (!hasSelected) {
        showCalculatorWarning('Будь ласка, оберіть один з варіантів!');
        isValid = false;
        break;
      }
    }
  }
  
  // Для шага 3 (числовые поля) - проверяем что все поля заполнены и валидны
  if (currentStep === 3 && isValid) {
    const numberInputs = currentBox.querySelectorAll('input[type="number"]');
    
    for (let input of numberInputs) {
      const inputValue = input.value.toString().trim();
      
      // Проверяем что поле заполнено (более точная проверка)
      if (!inputValue || inputValue === '') {
        showCalculatorWarning('Будь ласка, заповніть всі поля!');
        isValid = false;
        break;
      }
      
      // Проверяем валидность значения
      const value = parseInt(inputValue);
      if (isNaN(value) || value < parseInt(input.min) || value > parseInt(input.max)) {
        const fieldName = input.name === 'age' ? 'вік' : 
                         input.name === 'weight' ? 'вага' : 'зріст';
        showCalculatorError(`Будь ласка, введіть правильне значення ${fieldName} (${input.min}-${input.max})`);
        isValid = false;
        break;
      }
    }
  }
  
  // Переходим к следующему шагу только если текущий валиден
  if (isValid && currentStep < totalSteps) {
    currentStep++;
    showStep(currentStep);
  }
}

function calculateCaloriesLocal({ gender, age, weight, height, activity, goal }) {
  let bmr;
  if (gender === 'male') {
    bmr = 88.36 + (13.4 * weight) + (4.8 * height) - (5.7 * age);
  } else {
    bmr = 447.6 + (9.2 * weight) + (3.1 * height) - (4.3 * age);
  }
  
  const activityFactors = {
    '1': 1.2,    // Очень низкая
    '2': 1.375,  // Низкая
    '3': 1.55,   // Средняя
    '4': 1.725,  // Высокая
    '5': 1.9     // Очень высокая
  };
  
  let calories = bmr * (activityFactors[activity] || 1.2);
  
  if (goal === 'lose') {
    calories -= 300;
  } else if (goal === 'gain') {
    calories += 300;
  }
  
  return Math.round(calories);
}

function getClosestMenuTypeLocal(calories) {
  const types = [900, 1200, 1600, 1800, 2500, 3000, 3500];
  return types.reduce((prev, curr) => Math.abs(curr - calories) < Math.abs(prev - calories) ? curr : prev);
}

async function loadCalculatorData() {
  try {
    // Загружаем данные меню
            const menuResponse = await fetch('data/datafiles/menu.json');
    const menuData = await menuResponse.json();
    
    // Загружаем данные блюд
            const dishesResponse = await fetch('data/datafiles/dishes.json');
    const dishesData = await dishesResponse.json();
    
    return { menuData, dishesData };
  } catch (error) {
    return { menuData: {}, dishesData: [] };
  }
}

function getMenuForDayLocal(menuArr, day) {
  // Маппинг дней недели
  const dayMap = {
    'monday': 'Mon',
    'tuesday': 'Tue',
    'wednesday': 'Wed',
    'thursday': 'Thu',
    'friday': 'Fri',
    'saturday': 'Sat',
    'sunday': 'Sun'
  };
  
  const targetDay = dayMap[day];
  const result = menuArr.find(item => item.dayOfWeek === targetDay) || null;
  return result;
}

function getDishById(dishes, id) {
  // Пробуем разные типы сравнения для совместимости
  const dish = dishes.find(d => d.id === id || d.id == id || String(d.id) === String(id));
  return dish;
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

// Логика создания карточек перенесена в card.js
function createMenuCardAltLocal(dish, mealType) {
  if (!dish) return '';
  
  return `
    <div class="menu-card-alt" data-dish-id="${dish.id}">
      <div class="menu-card-img-wrap-alt">
                        <img src="${dish.img || 'data/img/food1.jpg'}" alt="${dish.title}" class="menu-card-img">
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
  
  if (!menuSlider) {
    return;
  }
  
  menuSlider.innerHTML = '';
  const menuObj = getMenuForDayLocal(menuArr, day);
  
  if (!menuObj) {
    menuSlider.innerHTML = '<div style="padding:2rem">Немає меню для цього дня.</div>';
    if (menuTotal) menuTotal.textContent = 'Б: 0 г, Ж: 0 г, В: 0 г';
    return;
  }
  
  let cardsHTML = '';
  let selectedDishes = [];
  
  mealMap.forEach(meal => {
    if (menuObj[meal.key]) {
      const dish = getDishById(dishes, menuObj[meal.key]);
      if (dish) {
        selectedDishes.push(dish);
        cardsHTML += createMenuCardAltLocal(dish, meal.name);
      }
    }
  });
  
  menuSlider.innerHTML = cardsHTML;
  
  // Подсчёт макронутриентов и калорий
  let totalP = 0, totalF = 0, totalC = 0;
  selectedDishes.forEach(dish => {
    totalP += Number(dish.p) || 0;
    totalF += Number(dish.f) || 0;
    totalC += Number(dish.c) || 0;
  });
  const totalKcal = Math.round(totalP * 4 + totalF * 9 + totalC * 4);
  
  if (menuTotal) {
    menuTotal.textContent = `Б: ${totalP} г, Ж: ${totalF} г, В: ${totalC} г; ${totalKcal} ккал`;
  }
  
  // Интерактивность (сердечки обрабатываются универсальным HeartsManager)
  if (window.heartsManager) {
    window.heartsManager.refresh();
  }
  
  // Добавляем обработчики для плюсиков/минусов с небольшой задержкой
  setTimeout(() => {
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
  }, 10);
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
    showWarning('Будь ласка, оберіть мету!');
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
      const calories = calculateCaloriesLocal({ gender, age, weight, height, activity, goal });
  let goalText = '';
  if (goal === 'lose') goalText = 'для схуднення';
  else if (goal === 'gain') goalText = 'для набору ваги';
  else goalText = 'для підтримки форми';
  document.getElementById('result').style.display = 'block';
  document.getElementById('result').innerText = `Ваша приблизна добова норма калорій ${goalText}: ${calories} ккал`;
  this.style.display = 'none';

  // --- Динамическое меню ---
      globalMenuType = getClosestMenuTypeLocal(calories);
  
  const { menuData, dishesData } = await loadCalculatorData();
  globalMenuData = menuData;
  globalDishesData = dishesData;
  let currentDay = 'monday';
  
  // Проверяем, есть ли данные для выбранного типа меню
  if (!globalMenuData[globalMenuType]) {
    console.error('No menu data for type:', globalMenuType);
    console.log('Available menu types:', Object.keys(globalMenuData));
    return;
  }
  
  // Первичный рендер
  renderPersonalMenu(globalMenuData[globalMenuType], globalDishesData, currentDay);
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

// Функция для добавления галочки к полям ввода
function addCheckmarkToInput(input) {
  const inputField = input.closest('.input-field');
  if (!inputField) return;
  
  // Удаляем существующую галочку
  const existingCheckmark = inputField.querySelector('.input-checkmark');
  if (existingCheckmark) {
    existingCheckmark.remove();
  }
  
  // Добавляем галочку если поле заполнено
  if (input.value.trim() !== '') {
    const checkmark = document.createElement('div');
    checkmark.className = 'input-checkmark';
    checkmark.innerHTML = '✓';
    inputField.appendChild(checkmark);
  }
}

// Обработчики для полей ввода
function setupInputValidation() {
  const inputFields = document.querySelectorAll('.input-field input[type="number"]');
  
  inputFields.forEach(input => {
    // Проверяем при загрузке страницы
    addCheckmarkToInput(input);
    validateInput(input);
    
    // Проверяем при вводе
    input.addEventListener('input', function() {
      addCheckmarkToInput(this);
      validateInput(this);
    });
    
    // Проверяем при потере фокуса
    input.addEventListener('blur', function() {
      addCheckmarkToInput(this);
      validateInput(this);
    });
  });
}

// Функция валидации полей ввода
function validateInput(input) {
  const inputField = input.closest('.input-field');
  const errorElement = inputField?.querySelector('.error-message');
  const value = parseInt(input.value);
  
  // Убираем класс ошибки по умолчанию
  if (inputField) {
    inputField.classList.remove('error');
  }
  if (errorElement) {
    errorElement.textContent = '';
  }
  
  // Проверяем минимальные значения
  if (input.value !== '' && value < parseInt(input.min)) {
    if (inputField) {
      inputField.classList.add('error');
    }
    
    if (errorElement) {
      let errorText = '';
      if (input.name === 'age') {
        errorText = `Мінімальний вік: ${input.min} років`;
      } else if (input.name === 'weight') {
        errorText = `Мінімальна вага: ${input.min} кг`;
      } else if (input.name === 'height') {
        errorText = `Мінімальний зріст: ${input.min} см`;
      }
      
      errorElement.textContent = errorText;
    }
    return false;
  }
  
  // Проверяем максимальные значения
  if (input.value !== '' && value > parseInt(input.max)) {
    if (inputField) {
      inputField.classList.add('error');
    }
    
    if (errorElement) {
      let errorText = '';
      if (input.name === 'age') {
        errorText = `Максимальний вік: ${input.max} років`;
      } else if (input.name === 'weight') {
        errorText = `Максимальна вага: ${input.max} кг`;
      } else if (input.name === 'height') {
        errorText = `Максимальний зріст: ${input.max} см`;
      }
      
      errorElement.textContent = errorText;
    }
    return false;
  }
  
  return true;
}

// --- Анимация и меню-карусель для блока с рационом ---
function setupDietSectionAnimation() {
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
  // Логика карусели перенесена в carousel.js
  // Карусель будет инициализирована автоматически через createMenuCarousel

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

    // Проходим по всем дням недели
    const allDays = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    
    allDays.forEach(day => {
      // Получаем меню для этого дня
      const menuObj = getMenuForDayLocal(globalMenuData[globalMenuType], day);
      if (menuObj) {
        // Получаем все блюда для этого дня
        mealMap.forEach(meal => {
          if (menuObj[meal.key]) {
            const dish = getDishById(globalDishesData, menuObj[meal.key]);
            if (dish) {
              // Проверяем, есть ли карточка с этим блюдом на странице
              const cardElement = document.querySelector(`[data-dish-id="${dish.id}"]`);
              if (cardElement) {
                // Проверяем состояние плюсика/минуса
                const plusButton = cardElement.querySelector('.menu-card-plus');
                if (plusButton && plusButton.classList.contains('active')) {
                  // Если плюсик активен (минус), значит блюдо включено в меню
                  selectedDishes.push({
                    ...dish,
                    day: day,
                    dayName: dayMap[day],
                    quantity: 1
                  });
                }
              } else {
                // Если карточки нет на странице, добавляем блюдо по умолчанию
                selectedDishes.push({
                  ...dish,
                  day: day,
                  dayName: dayMap[day],
                  quantity: 1
                });
              }
            }
          }
        });
      }
    });

    return selectedDishes;
  }

  // Функция для сохранения шаблона в корзину
  function saveCalculatorTemplateToCart() {
    const selectedDishes = getSelectedDishesFromCalculator();
    
    if (selectedDishes.length === 0) {
      showWarning('Будь ласка, залиште хоча б одну страву в меню');
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
    
    // Перенаправляем в корзину с правильным путем
    const path = window.location.pathname;
    let cartPath;
    
    if (path.includes('/pages/main/')) {
      // Мы в подпапке pages/main/
      cartPath = 'cart.html';
    } else {
      // Мы в корне сайта
      cartPath = 'pages/main/cart.html';
    }
    
    window.location.href = cartPath;
  }

  // Обработчик для кнопки "Замовити це меню"
  const orderBtn = document.querySelector('.menu-choose-btn-alt');
  if (orderBtn) {
    orderBtn.addEventListener('click', saveCalculatorTemplateToCart);
  }

  // Переключение дней недели для персонального меню
  document.querySelectorAll('.menu-day-alt').forEach(function(btn) {
    btn.addEventListener('click', function() {
      // Снять active со всех кнопок
      document.querySelectorAll('.menu-day-alt').forEach(function(b) {
        b.classList.remove('active');
      });
      btn.classList.add('active');
      
      // Получить выбранный день
      const dayText = btn.textContent.trim();
      const dayMap = {
        'Пн': 'monday',
        'Вт': 'tuesday', 
        'Ср': 'wednesday',
        'Чт': 'thursday',
        'Пт': 'friday',
        'Сб': 'saturday'
      };
      const selectedDay = dayMap[dayText];
      
      if (selectedDay && globalMenuData && globalMenuType) {
        // Перерендерим меню для выбранного дня
        renderPersonalMenu(globalMenuData[globalMenuType], globalDishesData, selectedDay);
      }
    });
  });

  // Инициализация: загружаем данные при загрузке страницы
  async function initializeCalculator() {
    try {
      // Проверяем, что все необходимые функции загружены
      if (!window.loadAllData) {
        console.error('loadAllData не найдена');
        return;
      }
      
      const { menuData, dishesData } = await loadCalculatorData();
      globalMenuData = menuData;
      globalDishesData = dishesData;
      
      // Если есть данные, рендерим первое меню
      if (Object.keys(menuData).length > 0 && dishesData.length > 0) {
        const firstMenuType = Object.keys(menuData)[0];
        globalMenuType = parseInt(firstMenuType);
        renderPersonalMenu(menuData[firstMenuType], dishesData, 'monday');
      }
    } catch (error) {
      // Ошибка инициализации
    }
  }

}

// Основная функция инициализации калькулятора
function initCalculatorPage() {
  // Вызываем все функции инициализации
  setupInputValidation();
  setupDietSectionAnimation();
  setupNextStepButtons();
  
  // Вызываем основную инициализацию
  if (typeof initializeCalculator === 'function') {
    initializeCalculator();
  }
}

// Настройка кнопок "Далі"
function setupNextStepButtons() {
  const nextStepButtons = document.querySelectorAll('.next-step-btn');
  nextStepButtons.forEach(button => {
    button.addEventListener('click', function() {
      if (typeof nextStep === 'function') {
        nextStep();
      }
    });
  });
}

// Инициализация теперь происходит через main.js
// Убираем автоматическую инициализацию, чтобы избежать дублирования

// Экспорт функций для использования в main.js и HTML
window.nextStep = nextStep;
window.clearCart = clearCart;
window.initCalculatorPage = initCalculatorPage;