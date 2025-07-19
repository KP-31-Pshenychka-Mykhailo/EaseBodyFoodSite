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
  let currentType = 'breakfast';

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
      dayButtons.forEach(btn => btn.classList.remove('active'));
      this.classList.add('active');
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
      typeTabs.forEach(t => t.classList.remove('active'));
      this.classList.add('active');
      const typeText = this.textContent.toLowerCase();
      const typeMap = {
        'сніданок': 'breakfast',
        'полуденок': 'lunch',
        'обід': 'dinner',
        'вечеря': 'supper'
      };
      currentType = typeMap[typeText] || 'breakfast';
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
        this.textContent = '−';
      } else {
        this.textContent = '+';
      }
    });
  });

  // Показываем карточки для понедельника и завтрака по умолчанию
  showCards('monday', 'breakfast');
}); 