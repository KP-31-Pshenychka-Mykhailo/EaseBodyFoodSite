// Показ модального окна регистрации
function showRegisterModal() {
  const modal = document.getElementById('register-modal');
  if (modal) {
    modal.style.display = 'flex';
  } else {
    console.error('Элемент register-modal не найден');
  }
}

// Показ модального окна входа
function showLoginModal() {
  const modal = document.getElementById('login-modal');
  if (modal) {
    modal.style.display = 'flex';
  } else {
    console.error('Элемент login-modal не найден');
  }
}

// Закрытие модального окна
function closeModal(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) {
    modal.style.display = 'none';
  }
}

// Настройка обработчиков событий для модальных окон
function setupModalEvents() {
  // Обработчики для кнопок закрытия
  const closeButtons = document.querySelectorAll('.auth-modal__close');
  closeButtons.forEach(button => {
    button.addEventListener('click', function() {
      const modal = this.closest('.auth-modal-wrapper');
      if (modal) {
        modal.style.display = 'none';
      }
    });
  });

  // Обработчик для формы регистрации
  const registerForm = document.getElementById('registerForm');
  if (registerForm) {
    registerForm.addEventListener('submit', handleRegister);
  }

  // Обработчик для формы входа
  const loginForm = document.getElementById('loginForm');
  if (loginForm) {
    loginForm.addEventListener('submit', handleLogin);
  }

  // Обработчики для переключения между модальными окнами
  const openLoginLink = document.getElementById('openLoginModal');
  if (openLoginLink) {
    openLoginLink.addEventListener('click', function(e) {
      e.preventDefault();
      closeModal('register-modal');
      showLoginModal();
    });
  }

  const openRegisterLink = document.getElementById('openRegisterModal');
  if (openRegisterLink) {
    openRegisterLink.addEventListener('click', function(e) {
      e.preventDefault();
      closeModal('login-modal');
      showRegisterModal();
    });
  }

  // Закрытие по клику вне модального окна
  const modals = document.querySelectorAll('.auth-modal-wrapper');
  modals.forEach(modal => {
    modal.addEventListener('click', function(e) {
      if (e.target === this) {
        this.style.display = 'none';
      }
    });
  });
}

// Обработка регистрации
async function handleRegister(event) {
  event.preventDefault();
  
  const form = event.target;
  const formData = new FormData(form);
  
  const data = {
    FirstName: formData.get('FirstName'),
    SecondName: formData.get('SecondName'),
    Email: formData.get('Email'),
    PhoneNumber: formData.get('PhoneNumber'),
    Password: formData.get('Password'),
    ConfirmPassword: formData.get('ConfirmPassword')
  };
  
  try {
    const result = await window.registerUser(data);
    
    if (result.success) {
      // Закрываем модальное окно
      closeModal('register-modal');
      
      // Показываем уведомление об успехе
      alert('Регистрация прошла успешно!');
      
      // Обновляем интерфейс
      if (typeof window.updateAuthUI === 'function') {
        window.updateAuthUI();
      }
    } else {
      alert(result.message || 'Ошибка при регистрации');
    }
  } catch (err) {
    alert('Ошибка при регистрации');
  }
}

// Обработка входа
async function handleLogin(event) {
  event.preventDefault();
  
  const form = event.target;
  const formData = new FormData(form);
  
  const data = {
    Email: formData.get('Email'),
    Password: formData.get('Password')
  };
  
  try {
    const result = await window.loginUser(data);
    
    if (result.success) {
      // Закрываем модальное окно
      closeModal('login-modal');
      
      // Показываем уведомление об успехе
      alert('Вход выполнен успешно!');
      
      // Обновляем интерфейс
      if (typeof window.updateAuthUI === 'function') {
        window.updateAuthUI();
      }
    } else {
      alert(result.message || 'Ошибка при входе');
    }
  } catch (err) {
    alert('Ошибка при входе');
  }
}

// Загрузка модальных окон
async function loadModals() {
  try {
    // Определяем правильный путь к файлам
    const currentPath = window.location.pathname;
    let basePath = '';
    
    if (currentPath.includes('/pages/main/')) {
      basePath = '../../';
    } else if (currentPath.includes('/pages/partials/')) {
      basePath = '../';
    } else {
      basePath = './';
    }
    
    // Загружаем модальные окна
    const registerResponse = await fetch(basePath + 'pages/partials/register.html');
    const loginResponse = await fetch(basePath + 'pages/partials/login.html');
    
    if (registerResponse.ok && loginResponse.ok) {
      const registerHTML = await registerResponse.text();
      const loginHTML = await loginResponse.text();
      
      // Создаем обертки для модальных окон
      const registerModalWrapper = `
        <div id="register-modal" class="auth-modal-wrapper">
          <div class="auth-modal-container">
            ${registerHTML}
          </div>
        </div>
      `;
      
      const loginModalWrapper = `
        <div id="login-modal" class="auth-modal-wrapper">
          <div class="auth-modal-container">
            ${loginHTML}
          </div>
        </div>
      `;
      
      // Добавляем модальные окна в DOM
      document.body.insertAdjacentHTML('beforeend', registerModalWrapper);
      document.body.insertAdjacentHTML('beforeend', loginModalWrapper);
      
      // Добавляем обработчики событий
      setupModalEvents();
    } else {
      console.error('Один из файлов не загрузился:', {
        register: registerResponse.status,
        login: loginResponse.status
      });
      
      // Попробуем альтернативные пути
      try {
        const altRegisterResponse = await fetch('/pages/partials/register.html');
        const altLoginResponse = await fetch('/pages/partials/login.html');
        
        if (altRegisterResponse.ok && altLoginResponse.ok) {
          const registerHTML = await altRegisterResponse.text();
          const loginHTML = await altLoginResponse.text();
          
          // Создаем обертки для модальных окон
          const registerModalWrapper = `
            <div id="register-modal" class="auth-modal-wrapper">
              <div class="auth-modal-container">
                ${registerHTML}
              </div>
            </div>
          `;
          
          const loginModalWrapper = `
            <div id="login-modal" class="auth-modal-wrapper">
              <div class="auth-modal-container">
                ${loginHTML}
              </div>
            </div>
          `;
          
          // Добавляем модальные окна в DOM
          document.body.insertAdjacentHTML('beforeend', registerModalWrapper);
          document.body.insertAdjacentHTML('beforeend', loginModalWrapper);
          
          // Добавляем обработчики событий
          setupModalEvents();
        }
      } catch (altError) {
        console.error('Альтернативные пути тоже не работают:', altError);
      }
    }
  } catch (error) {
    console.error('Ошибка загрузки модальных окон:', error);
  }
}

// Инициализация при загрузке DOM
document.addEventListener('DOMContentLoaded', function() {
  loadModals();
});

// Экспортируем функции в глобальную область
window.showRegisterModal = showRegisterModal;
window.showLoginModal = showLoginModal;
window.closeModal = closeModal;
window.loadModals = loadModals;
