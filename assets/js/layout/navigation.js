function setActiveNav() {
    const path = window.location.pathname.split('/').pop();
    
    const navLinks = document.querySelectorAll('.main-nav a');
    
    navLinks.forEach((link) => {
      const href = link.getAttribute('href');
     
      const hrefFileName = href.split('/').pop();
      
     
      let isActive = false;
      
    
      if (hrefFileName === 'index.html' && (path === '' || path === '/' || path === 'index.html')) {
        isActive = true;
      }
     
      else if (hrefFileName === path) {
        isActive = true;
      }
      
      if (isActive) {
        link.classList.add('active');
      } else {
        link.classList.remove('active');
      }
    });
  }

function setupBurgerMenu() {
    const burger = document.getElementById('burgerBtn');
    const nav = document.getElementById('mainNav');
    
    if (!burger || !nav) {
      console.log('⚠️ Burger menu элементы не найдены');
      return;
    }
    
    console.log('✅ Burger menu элементы найдены, настраиваем события');
    
    // Удаляем старые обработчики, если есть
    burger.removeEventListener('click', handleBurgerClick);
    
    // Добавляем обработчик клика по бургеру
    burger.addEventListener('click', handleBurgerClick);

    // Обработчик клика вне навигации (только для мобильных устройств)
    document.addEventListener('click', function(e) {
      if (window.innerWidth > 900) return;
      if (!nav.classList.contains('open')) return;
      if (!nav.contains(e.target) && e.target !== burger) {
        burger.classList.remove('active');
        nav.classList.remove('open');
      }
    });

    // Обработчик клавиши Escape
    document.addEventListener('keydown', function(e) {
      if (e.key === 'Escape') {
        burger.classList.remove('active');
        nav.classList.remove('open');
      }
    });

    // Обработчик изменения размера окна
    window.addEventListener('resize', function() {
      if (window.innerWidth >= 1000) {
        burger.classList.remove('active');
        nav.classList.remove('open');
      }
    });
  }

// Функция обработки клика по бургеру
function handleBurgerClick(e) {
  e.preventDefault();
  e.stopPropagation();
  
  const burger = document.getElementById('burgerBtn');
  const nav = document.getElementById('mainNav');
  
  if (burger && nav) {
    burger.classList.toggle('active');
    nav.classList.toggle('open');
    console.log('🔄 Burger clicked, nav state:', nav.classList.contains('open'));
  }
}

function initNavigation() {
  // Инициализируем навигацию после загрузки хедера
  setTimeout(() => {
    setActiveNav();
    setupBurgerMenu();
  }, 200);
}

// Поддержка обеих систем - старой и новой
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initNavigation);
} else {
  // DOM уже загружен, инициализируем сразу
  initNavigation();
}

// Экспорт функций для использования в main.js
window.setActiveNav = setActiveNav;
window.setupBurgerMenu = setupBurgerMenu;
window.handleBurgerClick = handleBurgerClick;
window.initNavigation = initNavigation;