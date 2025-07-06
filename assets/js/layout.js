console.log('Layout.js loaded!');

document.addEventListener('DOMContentLoaded', function() {
  // Проверяем, есть ли уже header в DOM
  const headerElement = document.getElementById('header');
  if (headerElement && headerElement.innerHTML.trim() === '') {
    // Вставка header
    fetch('partials/header.html')
      .then(res => {
        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }
        return res.text();
      })
      .then(html => {
        document.getElementById('header').innerHTML = html;
        // Небольшая задержка для гарантии что DOM обновился
        setTimeout(() => {
          setActiveNav();
        }, 100);
      })
      .catch(error => {
        // Если fetch не работает, попробуем вставить header напрямую
        insertHeaderDirectly();
      });
  } else {
    setActiveNav();
  }
    
  // Вставка footer
  fetch('partials/footer.html')
    .then(res => {
      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }
      return res.text();
    })
    .then(html => {
      document.getElementById('footer').innerHTML = html;
    })
    .catch(error => {
      // Игнорируем ошибки загрузки footer
    });

  function insertHeaderDirectly() {
    const headerHTML = `
      <link rel="stylesheet" href="assets/css/style.css">
      <header>
          <img src="assets/img/logo.png" alt="Logo" class="logo">
          <nav>
              <a href="index.html">Головна</a>
              <a href="constructor.html">Конструктор меню</a>
              <a href="calculator.html">Калькулятор раціону</a>
              <a href="star-menu.html">Зіркове меню</a>
              <a href="standart-menu.html">Стандартне меню</a>
              <a href="cart.html" class="icon-button basket-big"><svg class="icon-img basket-svg" width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M6 6H21L20 14H7L6 6Z" stroke="#4CAF50" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><circle cx="9" cy="20" r="1" stroke="#4CAF50" stroke-width="2"/><circle cx="18" cy="20" r="1" stroke="#4CAF50" stroke-width="2"/><path d="M9 6V4C9 2.89543 9.89543 2 11 2H16C17.1046 2 18 2.89543 18 4V6" stroke="#4CAF50" stroke-width="2" stroke-linecap="round"/></svg> 0 <span class="currency">₴</span></a>
              <a href="login.html" class="icon-button icon-button--wide"><svg class="icon-img user-svg" width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="12" cy="8" r="4" stroke="#fff" stroke-width="2"/><path d="M4 20C4 16.6863 7.13401 14 12 14C16.866 14 20 16.6863 20 20" stroke="#fff" stroke-width="2"/></svg>Вхід</a>
          </nav>
      </header>
    `;
    document.getElementById('header').innerHTML = headerHTML;
    setTimeout(() => {
      setActiveNav();
    }, 100);
  }

  function setActiveNav() {
    const path = window.location.pathname.split('/').pop();
    
    const navLinks = document.querySelectorAll('nav a');
    
    navLinks.forEach((link) => {
      const href = link.getAttribute('href');
      // Извлекаем имя файла из href, убирая относительный путь
      const hrefFileName = href.split('/').pop();
      
      // Проверяем различные случаи
      let isActive = false;
      
      // Для главной страницы
      if (hrefFileName === 'index.html' && (path === '' || path === '/' || path === 'index.html')) {
        isActive = true;
      }
      // Для остальных страниц
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
}); 