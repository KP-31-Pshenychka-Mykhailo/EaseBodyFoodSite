console.log('[header.js] Скрипт загружен');

let registerModalHTML = null;
let loginModalHTML = null;

function setupLoginBtn() {
  const userName = localStorage.getItem('userName');
  const loginBtn = document.getElementById('loginBtn');
  console.log('[header.js] loginBtn:', loginBtn);
  if (!loginBtn) {
    console.error('[header.js] Не найден элемент с id="loginBtn"');
    return;
  }
  if (userName) {
    loginBtn.innerHTML = `<svg class="icon-img user-svg" width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="12" cy="8" r="4" stroke="#fff" stroke-width="2"/><path d="M4 20C4 16.6863 7.13401 14 12 14C16.866 14 20 16.6863 20 20" stroke="#fff" stroke-width="2"/></svg>${userName}`;
    loginBtn.href = "#";
  }
  loginBtn.addEventListener('click', function(e) {
    e.preventDefault();
    if (localStorage.getItem('userName')) {
      window.location.href = '../EaseBodyFoodSite/profile.html';
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
  const loginLink = overlay.querySelector('.auth-modal__switch a[href], .auth-modal__switch a#openLoginModal');
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
        const res = await fetch('/api/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data)
        });
        if (res.ok) {
          const result = await res.json();
          if (result.id) {
            localStorage.setItem('userId', result.id);
          }
          const email = form.Email.value;
          const userName = email.split('@')[0];
          localStorage.setItem('userName', userName);
          alert('Реєстрація успішна!');
          overlay.remove();
          document.body.style.overflow = '';
          window.location.reload();
        } else {
          const err = await res.text();
          alert('Помилка: ' + err);
        }
      } catch (err) {
        alert('Помилка з’єднання з сервером');
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
  const regLink = overlay.querySelector('.auth-modal__switch a[href], .auth-modal__switch a#openRegisterModal');
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
      // Пример: просто сохраняем userName из email
      const email = form.Email.value;
      const userName = email.split('@')[0];
      localStorage.setItem('userName', userName);
      alert('Вхід успішний!');
      overlay.remove();
      document.body.style.overflow = '';
      window.location.reload();
      // Здесь можно добавить реальный запрос к API
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
Promise.all([
  fetch('/EaseBodyFoodSite/assets/partials/register-modal.html').then(r => { console.log('[header.js] register-modal.html статус:', r.status); return r.text(); }),
  fetch('/EaseBodyFoodSite/assets/partials/login-modal.html').then(r => { console.log('[header.js] login-modal.html статус:', r.status); return r.text(); })
]).then(([registerHtml, loginHtml]) => {
  registerModalHTML = registerHtml;
  loginModalHTML = loginHtml;
  setupLoginBtn();
}).catch(err => {
  console.error('[header.js] Ошибка загрузки модалок:', err);
});

window.showRegisterModalIfNotAuth = function() {
  if (!localStorage.getItem('userName')) {
    showRegisterModal();
    return true;
  }
  return false;
};

console.log('[header.js] init завершён'); 