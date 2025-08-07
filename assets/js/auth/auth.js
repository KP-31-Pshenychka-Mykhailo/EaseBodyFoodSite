// Инициализация настроек сервера
window.loadServerSettings().catch(error => {
  // Ошибка загрузки настроек
});

function setupLoginBtn() {
  const userName = window.getUserName();
  const loginBtn = window.getElement('#loginBtn');
  
  if (!loginBtn) {
    return;
  }
  
  if (userName) {
    const truncatedUserName = window.truncateUsername(userName);
    loginBtn.innerHTML = `<svg class="icon-img user-svg" width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="12" cy="8" r="4" stroke="#fff" stroke-width="2"/><path d="M4 20C4 16.6863 7.13401 14 12 14C16.866 14 20 16.6863 20 20" stroke="#fff" stroke-width="2"/></svg>${truncatedUserName}`;
    loginBtn.href = "#";
  }
  
  window.addEventListenerSafe('#loginBtn', 'click', function(e) {
    e.preventDefault();
    if (window.isUserAuthenticated()) {
      window.location.href = '/pages/main/profile.html';
    } else {
      // Используем функцию из modal.js
      if (window.showRegisterModal) {
        window.showRegisterModal();
      }
    }
  });
}

function initAuth() {
  // Ждем загрузки модалок из modal.js
  setTimeout(() => {
    setupLoginBtn();
  }, 100);
}

// Поддержка обеих систем - старой и новой
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initAuth);
} else {
  // DOM уже загружен, инициализируем сразу
  initAuth();
}

// Экспорт функций для использования в main.js
window.setupLoginBtn = setupLoginBtn;
window.initAuth = initAuth;

// Глобальная функция для проверки авторизации
window.showRegisterModalIfNotAuth = function() {
  if (!window.isUserAuthenticated()) {
    if (window.showRegisterModal) {
      window.showRegisterModal();
    }
    return true;
  }
  return false;
}; 