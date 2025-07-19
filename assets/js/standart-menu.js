document.addEventListener('DOMContentLoaded', function() {
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

  // Функциональность для переключения дней и типов меню
  const dayButtons = document.querySelectorAll('.menu-day');
  const typeTabs = document.querySelectorAll('.menu-type-tab');
  const menuCards = document.querySelectorAll('.menu-card');

  let currentDay = 'monday';
  let currentType = 'standard';

  // Функция для показа карточек
  function showCards(day, type) {
    menuCards.forEach(card => {
      const cardDay = card.getAttribute('data-day');
      const cardType = card.getAttribute('data-type');
      
      if (cardDay === day && cardType === type) {
        card.style.display = 'block';
      } else {
        card.style.display = 'none';
      }
    });
  }

  // Обработчики для дней недели
  dayButtons.forEach(button => {
    button.addEventListener('click', function() {
      // Убираем активный класс со всех кнопок
      dayButtons.forEach(btn => btn.classList.remove('active'));
      // Добавляем активный класс к нажатой кнопке
      this.classList.add('active');
      
      // Определяем выбранный день
      const dayText = this.textContent.toLowerCase();
      const dayMap = {
        'пн': 'monday',
        'вт': 'tuesday',
        'ср': 'wednesday',
        'чт': 'thursday',
        'пт': 'friday',
        'сб': 'saturday',
        'нд': 'sunday'
      };
      
      currentDay = dayMap[dayText] || 'monday';
      showCards(currentDay, currentType);
    });
  });

  // Обработчики для типов меню
  typeTabs.forEach(tab => {
    tab.addEventListener('click', function() {
      // Убираем активный класс со всех табов
      typeTabs.forEach(t => t.classList.remove('active'));
      // Добавляем активный класс к нажатому табу
      this.classList.add('active');
      
      // Определяем выбранный тип
      const typeText = this.textContent.toLowerCase();
      const typeMap = {
        'стандартне': 'standard',
        'низькокалорійне': 'low-calorie',
        'веганське': 'vegan',
        'спортивне': 'sport'
      };
      
      currentType = typeMap[typeText] || 'standard';
      showCards(currentDay, currentType);
    });
  });

  // Функциональность для сердечек
  const hearts = document.querySelectorAll('.gallery-heart');
  
  hearts.forEach(heart => {
    heart.addEventListener('click', function() {
      this.classList.toggle('active');
    });
  });

  // Функциональность для плюсиков
  const plusIcons = document.querySelectorAll('.menu-card-plus');
  
  plusIcons.forEach(plus => {
    plus.addEventListener('click', function() {
      this.classList.toggle('active');
      if (this.classList.contains('active')) {
        this.textContent = '−'; // минус
      } else {
        this.textContent = '+'; // плюс
      }
    });
  });

  // Показываем карточки для понедельника и стандартного меню по умолчанию
  showCards('monday', 'standard');
}); 