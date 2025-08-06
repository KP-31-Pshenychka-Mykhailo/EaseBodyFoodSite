document.addEventListener('DOMContentLoaded', function() {
  // Загрузка футера
  loadFooter();
  
  // Обработка событий футера
  setupFooterEvents();
});

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
        })
        .catch(error => {
          console.error('Не удалось загрузить footer:', error);
        });
    });
}

function setupFooterEvents() {
  // Обработка событий для toggle contact
  document.addEventListener('click', function(e) {
    const toggleBtn = document.getElementById('footerToggleBtn');
    const popup = document.getElementById('footerPopupSocials');
    if (!toggleBtn || !popup) return;
    if (toggleBtn.contains(e.target)) {
      popup.classList.toggle('open');
      toggleBtn.classList.toggle('active');
    } else if (!popup.contains(e.target)) {
      popup.classList.remove('open');
      toggleBtn.classList.remove('active');
    }
  });
  
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