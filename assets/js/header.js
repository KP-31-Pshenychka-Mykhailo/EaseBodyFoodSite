console.log('[header.js] Скрипт загружен');

let registerModalHTML = null;
let loginModalHTML = null;

// Добавим загрузку настроек
let SERVER_BASE_URL = '';
fetch('assets/data/settings.json')
  .then(r => r.json())
  .then(settings => {
    SERVER_BASE_URL = settings.SERVER_BASE_URL;
  });

// Функция для обрезки никнейма до 8 символов
function truncateUsername(username) {
  if (!username) return '';
  return username.length > 8 ? username.substring(0, 8) + '...' : username;
}

function setupLoginBtn() {
  const userName = localStorage.getItem('userName');
  const loginBtn = document.getElementById('loginBtn');
  console.log('[header.js] loginBtn:', loginBtn);
  if (!loginBtn) {
    console.error('[header.js] Не найден элемент с id="loginBtn"');
    return;
  }
  
  if (userName) {
    const truncatedUserName = truncateUsername(userName);
    loginBtn.innerHTML = `<svg class="icon-img user-svg" width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="12" cy="8" r="4" stroke="#fff" stroke-width="2"/><path d="M4 20C4 16.6863 7.13401 14 12 14C16.866 14 20 16.6863 20 20" stroke="#fff" stroke-width="2"/></svg>${truncatedUserName}`;
    loginBtn.href = "#";
  }
  
  loginBtn.addEventListener('click', function(e) {
    e.preventDefault();
    if (localStorage.getItem('userName')) {
      window.location.href = 'profile.html';
    } else {
      showRegisterModal();
    }
  });
  
  console.log('[header.js] setupLoginBtn завершён');
}

function showRegisterModal() {
  if (document.getElementById('registerModalOverlay')) return;
  const overlay = document.createElement('div');
  overlay.id = 'registerModalOverlay';
  overlay.style.position = 'fixed';
  overlay.style.top = 0;
  overlay.style.left = 0;
  overlay.style.width = '100vw';
  overlay.style.height = '100vh';
  overlay.style.background = 'rgba(0,0,0,0.3)';
  overlay.style.zIndex = 10000;
  overlay.style.display = 'flex';
  overlay.style.justifyContent = 'center';
  overlay.style.alignItems = 'center';
  overlay.style.backdropFilter = 'blur(6px)';
  overlay.innerHTML = registerModalHTML || '';
  document.body.appendChild(overlay);
  document.body.style.overflow = 'hidden';
  overlay.addEventListener('click', function(e) {
    if (e.target.classList.contains('auth-modal__close') || e.target === overlay) {
      overlay.remove();
      document.body.style.overflow = '';
    }
  });
  const modal = overlay.querySelector('.auth-modal');
  if (modal) {
    modal.addEventListener('click', function(e) { e.stopPropagation(); });
  }
  // Переключение на модалку входа
  const loginLink = overlay.querySelector('.auth-modal__switch a#openLoginModal');
  if (loginLink) {
    loginLink.addEventListener('click', function(e) {
      e.preventDefault();
      overlay.remove();
      document.body.style.overflow = '';
      showLoginModal();
    });
  }
  const form = overlay.querySelector('#registerForm');
  if (form) {
    form.addEventListener('submit', async function(e) {
      e.preventDefault();
      const data = {
        FirstName: form.FirstName.value,
        SecondName: form.SecondName.value,
        Email: form.Email.value,
        PhoneNumber: form.PhoneNumber.value,
        Password: form.Password.value
      };
      if (form.Password.value !== form.ConfirmPassword.value) {
        alert('Паролі не співпадають!');
        return;
      }
      try {
        const response = await fetch(SERVER_BASE_URL + '/user/registration', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data)
        });
        let result, errorText = '';
        try { result = await response.clone().json(); } catch (e) { errorText = await response.text(); }
        console.log('Ответ сервера:', result, 'userId:', result && result.userId, 'Message:', result && (result.message || result.Message));
        if (!response.ok) {
          let errorMsg = errorText ||
            (typeof result === 'string' ? result : (result?.message || result?.Message)) ||
            'Неизвестная ошибка';
          alert('Ошибка регистрации: ' + errorMsg);
          return;
        }
        if (result && (result.userId !== undefined && result.userId !== null)) {
          localStorage.setItem('userId', result.userId);
          const email = form.Email.value;
          const userName = email.split('@')[0];
          localStorage.setItem('userName', userName);
          // Обновляем header без перезагрузки
          const loginBtn = document.getElementById('loginBtn');
          if (loginBtn && userName) {
            const truncatedUserName = truncateUsername(userName);
            loginBtn.innerHTML = `<svg class="icon-img user-svg" width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="12" cy="8" r="4" stroke="#fff" stroke-width="2"/><path d="M4 20C4 16.6863 7.13401 14 12 14C16.866 14 20 16.6863 20 20" stroke="#fff" stroke-width="2"/></svg>${truncatedUserName}`;
            loginBtn.href = "#";
          }
          overlay.remove();
          document.body.style.overflow = '';
        } else {
          let errorMsg = errorText ||
            (typeof result === 'string' ? result : (result?.message || result?.Message)) ||
            'Некорректный ответ сервера';
          alert('Ошибка регистрации: ' + errorMsg);
        }
      } catch (err) {
        alert('Ошибка регистрации: ' + err.message);
      }
    });
  }
  // Крестик закрытия
  const closeBtn = overlay.querySelector('.auth-modal__close');
  if (closeBtn) {
    closeBtn.addEventListener('click', function(e) {
      overlay.remove();
      document.body.style.overflow = '';
    });
  }
  console.log('[header.js] showRegisterModal завершён');
}

function showLoginModal() {
  if (document.getElementById('registerModalOverlay')) return;
  const overlay = document.createElement('div');
  overlay.id = 'registerModalOverlay';
  overlay.style.position = 'fixed';
  overlay.style.top = 0;
  overlay.style.left = 0;
  overlay.style.width = '100vw';
  overlay.style.height = '100vh';
  overlay.style.background = 'rgba(0,0,0,0.3)';
  overlay.style.zIndex = 10000;
  overlay.style.display = 'flex';
  overlay.style.justifyContent = 'center';
  overlay.style.alignItems = 'center';
  overlay.style.backdropFilter = 'blur(6px)';
  overlay.innerHTML = loginModalHTML || '';
  document.body.appendChild(overlay);
  document.body.style.overflow = 'hidden';
  overlay.addEventListener('click', function(e) {
    if (e.target.classList.contains('auth-modal__close') || e.target === overlay) {
      overlay.remove();
      document.body.style.overflow = '';
    }
  });
  const modal = overlay.querySelector('.auth-modal');
  if (modal) {
    modal.addEventListener('click', function(e) { e.stopPropagation(); });
  }
  // Переключение на модалку регистрации
  const regLink = overlay.querySelector('.auth-modal__switch a#openRegisterModal');
  if (regLink) {
    regLink.addEventListener('click', function(e) {
      e.preventDefault();
      overlay.remove();
      document.body.style.overflow = '';
      showRegisterModal();
    });
  }
  const form = overlay.querySelector('#loginForm');
  if (form) {
    form.addEventListener('submit', async function(e) {
      e.preventDefault();
      const data = {
        Email: form.Email.value,
        Password: form.Password.value
      };
      try {
        const response = await fetch(SERVER_BASE_URL + '/user/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data)
        });
        let result, errorText = '';
        try { 
          result = await response.clone().json(); 
        } catch (e) { 
          errorText = await response.text(); 
        }
        console.log('Ответ сервера:', result, 'userId:', result && result.userId, 'Message:', result && (result.message || result.Message));
        if (!response.ok) {
          let errorMsg = errorText ||
            (typeof result === 'string' ? result : (result?.message || result?.Message)) ||
            'Неизвестная ошибка';
          alert('Ошибка входа: ' + errorMsg);
          return;
        }
        if (result && (result.userId !== undefined && result.userId !== null)) {
          localStorage.setItem('userId', result.userId);
          const email = form.Email.value;
          const userName = email.split('@')[0];
          localStorage.setItem('userName', userName);
          // Обновляем header без перезагрузки
          const loginBtn = document.getElementById('loginBtn');
          if (loginBtn && userName) {
            const truncatedUserName = truncateUsername(userName);
            loginBtn.innerHTML = `<svg class="icon-img user-svg" width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="12" cy="8" r="4" stroke="#fff" stroke-width="2"/><path d="M4 20C4 16.6863 7.13401 14 12 14C16.866 14 20 16.6863 20 20" stroke="#fff" stroke-width="2"/></svg>${truncatedUserName}`;
            loginBtn.href = "#";
          }
          overlay.remove();
          document.body.style.overflow = '';
        } else {
          let errorMsg = errorText ||
            (typeof result === 'string' ? result : (result?.message || result?.Message)) ||
            'Некорректный ответ сервера';
          alert('Ошибка входа: ' + errorMsg);
        }
      } catch (err) {
        alert('Ошибка входа: ' + err.message);
      }
    });
  }
  // Крестик закрытия
  const closeBtn2 = overlay.querySelector('.auth-modal__close');
  if (closeBtn2) {
    closeBtn2.addEventListener('click', function(e) {
      overlay.remove();
      document.body.style.overflow = '';
    });
  }
  console.log('[header.js] showLoginModal завершён');
}

// Загружаем HTML модалок (один раз)
function loadModals() {
  const paths = [
    'partials/register.html',
    'partials/login.html',
    '../partials/register.html',
    '../partials/login.html'
  ];
  
  // Пробуем разные пути
  Promise.all([
    fetch(paths[0]).then(r => r.ok ? r.text() : Promise.reject('not found')),
    fetch(paths[1]).then(r => r.ok ? r.text() : Promise.reject('not found'))
  ]).then(([registerHtml, loginHtml]) => {
    registerModalHTML = registerHtml;
    loginModalHTML = loginHtml;
    setupLoginBtn();
  }).catch(() => {
    // Если не получилось, пробуем с ../partials/
    Promise.all([
      fetch(paths[2]).then(r => r.ok ? r.text() : Promise.reject('not found')),
      fetch(paths[3]).then(r => r.ok ? r.text() : Promise.reject('not found'))
    ]).then(([registerHtml, loginHtml]) => {
      registerModalHTML = registerHtml;
      loginModalHTML = loginHtml;
      setupLoginBtn();
    }).catch(err => {
      console.error('[header.js] Ошибка загрузки модалок:', err);
    });
  });
}

loadModals();

window.showRegisterModalIfNotAuth = function() {
  if (!localStorage.getItem('userName')) {
    showRegisterModal();
    return true;
  }
  return false;
};

console.log('[header.js] init завершён'); 