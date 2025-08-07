

// Загрузка хедера
function loadHeader() {
  const headerElement = document.getElementById('header');
  if (headerElement && headerElement.innerHTML.trim() === '') {
  
    // Используем абсолютный путь от корня сайта
    fetch('/pages/partials/header.html')
      .then(res => {
        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }
        return res.text();
      })
      .then(html => {
        document.getElementById('header').innerHTML = html;
        setTimeout(() => {
          // Принудительно применяем стили
          const headerElement = document.querySelector('.main-header');
          if (headerElement) {
            headerElement.style.display = 'flex';
            headerElement.style.alignItems = 'center';
            headerElement.style.justifyContent = 'space-between';
            headerElement.style.padding = '0 16px';
            headerElement.style.height = '64px';
          }
        }, 100);
      })
      .catch(error => {
        console.error('Не удалось загрузить header с абсолютным путем:', error);
        // Fallback: пробуем относительные пути
        const currentPath = window.location.pathname;
        let headerPath = 'pages/partials/header.html';
        
        if (currentPath.includes('/pages/main/')) {
          headerPath = '../pages/partials/header.html';
        }
        
        fetch(headerPath)
          .then(res => {
            if (!res.ok) {
              throw new Error(`HTTP error! status: ${res.status}`);
            }
            return res.text();
          })
          .then(html => {
            document.getElementById('header').innerHTML = html;
            setTimeout(() => {
              // Принудительно применяем стили
              const headerElement = document.querySelector('.main-header');
              if (headerElement) {
                headerElement.style.display = 'flex';
                headerElement.style.alignItems = 'center';
                headerElement.style.justifyContent = 'space-between';
                headerElement.style.padding = '0 16px';
                headerElement.style.height = '64px';
              }
            }, 100);
          })
          .catch(error => {
            console.error('Не удалось загрузить header с относительным путем:', error);
            insertHeaderDirectly();
          });
      });
  }
}

function insertHeaderDirectly() {
  const headerHTML = `
    <header class="main-header">
        <a href="/index.html" class="logo-link">
            <img src="/data/img/logo.png" alt="Logo" class="logo">
        </a>
        <nav class="main-nav" id="mainNav">
            <a href="/index.html">Головна</a>
            <a href="/pages/main/constructor.html">Конструктор меню</a>
            <a href="/pages/main/calculator.html">Калькулятор раціону</a>
            <a href="/pages/main/standart.html">Стандартне меню</a>
        </nav>
        <div class="header-actions">
            <a href="/pages/main/cart.html" class="icon-button basket-big">
                <svg class="icon-img basket-svg" width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M6 6H21L20 14H7L6 6Z" stroke="#4CAF50" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    <circle cx="9" cy="20" r="1" stroke="#4CAF50" stroke-width="2"/>
                    <circle cx="18" cy="20" r="1" stroke="#4CAF50" stroke-width="2"/>
                    <path d="M9 6V4C9 2.89543 9.89543 2 11 2H16C17.1046 2 18 2.89543 18 4V6" stroke="#4CAF50" stroke-width="2" stroke-linecap="round"/>
                </svg>
                0 <span class="currency">₴</span>
            </a>
            <a href="#" class="icon-button icon-button--wide" id="loginBtn">
                <svg class="icon-img user-svg" width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <circle cx="12" cy="8" r="4" stroke="#fff" stroke-width="2"/>
                    <path d="M4 20C4 16.6863 7.13401 14 12 14C16.866 14 20 16.6863 20 20" stroke="#fff" stroke-width="2"/>
                </svg>
                Вхід
            </a>
        </div>
        <button class="burger" id="burgerBtn" aria-label="Открыть меню">
          <span></span><span></span><span></span>
        </button>
    </header>
  `;
  document.getElementById('header').innerHTML = headerHTML;
}

// Инициализация при загрузке DOM или немедленно если DOM уже готов
function initHeader() {
  loadHeader();
}

// Поддержка обеих систем - старой и новой
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initHeader);
} else {
  // DOM уже загружен, инициализируем сразу
  initHeader();
}

// Экспорт функций для использования в main.js
window.loadHeader = loadHeader;
window.initHeader = initHeader;

 