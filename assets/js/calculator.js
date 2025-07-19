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

document.getElementById('calculator-form').addEventListener('submit', function(e) {
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

  // --- Сердечки ---
  document.querySelectorAll('#personal-diet-section .gallery-heart').forEach(function(heart) {
    heart.addEventListener('click', function() {
      heart.classList.toggle('active');
    });
  });

  // --- Плюсики ---
  document.querySelectorAll('#personal-diet-section .menu-card-plus').forEach(function(plus) {
    plus.addEventListener('click', function() {
      plus.classList.toggle('active');
      plus.textContent = plus.classList.contains('active') ? '−' : '+';
    });
  });
}); 