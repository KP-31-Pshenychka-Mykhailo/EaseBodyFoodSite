function initFooter() {
  // Загрузка футера
  loadFooter();
  
  // Обработка событий футера
  setupFooterEvents();
}

// Поддержка обеих систем - старой и новой
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initFooter);
} else {
  // DOM уже загружен, инициализируем сразу
  initFooter();
}

// Экспорт функций для использования в main.js
window.loadFooter = loadFooter;
window.setupFooterEvents = setupFooterEvents;
window.setupFooterToggleEvents = setupFooterToggleEvents;
window.initFooter = initFooter;

function loadFooter() {
  // Используем абсолютный путь от корня сайта для footer
  fetch('/pages/partials/footer.html')
    .then(res => {
      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }
      return res.text();
    })
    .then(html => {
      document.getElementById('footer').innerHTML = html;
      // Настраиваем события после загрузки футера
      setupFooterToggleEvents();
    })
    .catch(error => {
      console.error('Не удалось загрузить footer с абсолютным путем:', error);
      // Fallback: пробуем относительные пути
      const currentPath = window.location.pathname;
      let footerPath = 'pages/partials/footer.html';
      
      if (currentPath.includes('/pages/main/')) {
        footerPath = '../pages/partials/footer.html';
      }
      
      fetch(footerPath)
        .then(res => {
          if (!res.ok) {
            throw new Error(`HTTP error! status: ${res.status}`);
          }
          return res.text();
        })
        .then(html => {
          document.getElementById('footer').innerHTML = html;
          // Настраиваем события после загрузки футера
          setupFooterToggleEvents();
        })
        .catch(error => {
          console.error('Не удалось загрузить footer:', error);
        });
    });
}

function setupFooterEvents() {
  // Глобальные обработчики событий
  document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
      const popup = document.getElementById('footerPopupSocials');
      const toggleBtn = document.getElementById('footerToggleBtn');
      if (popup && toggleBtn) {
        popup.classList.remove('open');
        toggleBtn.classList.remove('active');
      }
    }
  });
}

// Отдельная функция для настройки toggle кнопки
function setupFooterToggleEvents() {
  const toggleBtn = document.getElementById('footerToggleBtn');
  const popup = document.getElementById('footerPopupSocials');
  
  if (!toggleBtn || !popup) {
    console.log('⚠️ Footer toggle элементы не найдены');
    return;
  }
  
  console.log('✅ Footer toggle элементы найдены, настраиваем события');
  
  // Удаляем старые обработчики, если есть
  toggleBtn.removeEventListener('click', handleToggleClick);
  
  // Добавляем новый обработчик
  toggleBtn.addEventListener('click', handleToggleClick);
  
  // Обработчик клика вне попапа (только если попап открыт)
  const handleClickOutside = function(e) {
    if (popup.classList.contains('open') && !toggleBtn.contains(e.target) && !popup.contains(e.target)) {
      popup.classList.remove('open');
      toggleBtn.classList.remove('active');
    }
  };
  
  // Удаляем старый обработчик, если есть
  document.removeEventListener('click', handleClickOutside);
  
  // Добавляем новый обработчик
  document.addEventListener('click', handleClickOutside);
}

// Функция обработки клика по toggle кнопке
function handleToggleClick(e) {
  e.preventDefault();
  e.stopPropagation();
  
  const toggleBtn = document.getElementById('footerToggleBtn');
  const popup = document.getElementById('footerPopupSocials');
  
  if (toggleBtn && popup) {
    popup.classList.toggle('open');
    toggleBtn.classList.toggle('active');
    console.log('🔄 Footer toggle clicked, popup state:', popup.classList.contains('open'));
  }
} 