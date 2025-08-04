// Переключение вкладок профиля
document.addEventListener('DOMContentLoaded', function() {
    // Инициализация переключения вкладок
    initProfileTabs();
    
    // Инициализация валидации полей
    initFieldValidation();
    
    // Инициализация обработчиков кнопок
    initButtonHandlers();
    
    // Загрузка данных профиля
    loadProfileData();
    
    // Инициализация модального окна
    initModalHandlers();
    
    // Загружаем корзину при загрузке страницы, если активна вкладка корзины
    if (document.querySelector('.profile-tab.active').getAttribute('data-tab') === 'cart') {
        loadCart();
    }
});

function initProfileTabs() {
    document.querySelectorAll('.profile-tab').forEach(function(tabBtn) {
        tabBtn.addEventListener('click', function() {
            document.querySelectorAll('.profile-tab').forEach(function(btn){btn.classList.remove('active');});
            tabBtn.classList.add('active');
            var tab = tabBtn.getAttribute('data-tab');
            document.querySelectorAll('.profile-tab-content').forEach(function(content){
                content.style.display = 'none';
            });
            document.getElementById('tab-' + tab).style.display = 'block';
            
            // Если открыта вкладка корзины, загружаем корзину
            if (tab === 'cart') {
                loadCart();
            }
            // Если открыта вкладка избранных, обновляем избранные
            if (tab === 'favorites') {
                // Вызываем функцию renderFavorites из profile-favorites.js
                if (typeof renderFavorites === 'function') {
                    renderFavorites();
                }
            }
        });
    });
}

function initFieldValidation() {
    // Валидация всех обязательных полей
    const requiredFields = [
        {input: 'firstname-input', error: 'firstname-error'},
        {input: 'lastname-input', error: 'lastname-error'},
        {input: 'phone-input', error: 'phone-error'},
        {input: 'email-input', error: 'email-error'},
        {input: 'gender-input', error: 'gender-error'},
        {input: 'telegram-input', error: 'telegram-error'},
        {input: 'instagram-input', error: 'instagram-error'},
        {input: 'street-input', error: 'street-error'},
        {input: 'house-input', error: 'house-error'},
        {input: 'entrance-input', error: 'entrance-error'},
        {input: 'apartment-input', error: 'apartment-error'}
    ];
    
    requiredFields.forEach(({input, error}) => {
        const inputEl = document.getElementById(input);
        const errorEl = document.getElementById(error);
        if (!inputEl || !errorEl) return;
        
        inputEl.addEventListener('blur', function() {
            if (!inputEl.value.trim()) {
                errorEl.style.display = 'block';
            } else {
                errorEl.style.display = 'none';
            }
        });
        
        inputEl.addEventListener('input', function() {
            if (inputEl.value.trim()) {
                errorEl.style.display = 'none';
            }
        });
    });
}

function initButtonHandlers() {
    // Обработчик для кнопки выхода
    document.getElementById('logout-btn').addEventListener('click', function() {
        localStorage.clear();
        sessionStorage.clear();
        window.location.href = 'index.html';
    });

    // Обработчик для кнопки "Змінити" - сохранение профиля
    document.getElementById('save-profile-btn').addEventListener('click', function() {
        saveProfileData();
    });
}

function saveProfileData() {
    const userId = localStorage.getItem('userId');
    
    // Собираем данные из формы
    const profileData = {
        firstName: document.getElementById('firstname-input').value,
        lastName: document.getElementById('lastname-input').value,
        number: document.getElementById('phone-input').value,
        email: document.getElementById('email-input').value,
        gender: document.getElementById('gender-input').value === 'male' ? 'Мужской' : 'Женский',
        allergies: document.getElementById('allergens-input').value
    };
    
    const addressData = {};
    const street = document.getElementById('street-input').value;
    const house = document.getElementById('house-input').value;
    const apartment = document.getElementById('apartment-input').value;
    const entrance = document.getElementById('entrance-input').value;
    
    if (street) addressData.Street = street;
    if (house) addressData.House = house ? parseInt(house) : undefined;
    if (apartment) addressData.Apartment = apartment;
    
    // Добавляем город
    const city = document.getElementById('city-input').value;
    if (city) addressData.Sity = city;
    
    if (entrance) {
        addressData.Entrance = parseInt(entrance);
    }

    const socialsData = {
        telegram: document.getElementById('telegram-input').value,
        instagram: document.getElementById('instagram-input').value
    };

    console.log('Отправляем данные профиля:', profileData);
    console.log('Отправляем данные адреса:', addressData);
    console.log('Отправляем данные соцсетей:', socialsData);
    console.log('JSON для адреса:', JSON.stringify(addressData));

    // Отправляем три запроса
    fetch('assets/data/settings.json')
        .then(response => response.json())
        .then(settings => {
            const baseUrl = settings.SERVER_BASE_URL;
            
            // Основная информация
            const infoPromise = fetch(baseUrl + '/user/addinfo?userId=' + userId, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
                body: JSON.stringify(profileData)
            });
            
            // Адрес
            const addressPromise = fetch(baseUrl + '/user/address?userId=' + userId, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
                body: JSON.stringify(addressData)
            }).then(response => {
                console.log('Ответ сервера для адреса:', response.status, response.statusText);
                if (!response.ok) {
                    return response.text().then(text => {
                        console.error('Ошибка адреса - ответ сервера:', text);
                        throw new Error('Ошибка адреса: ' + text);
                    });
                }
                return response;
            });
            
            // Соцсети
            const socialsPromise = fetch(baseUrl + '/user/social?userId=' + userId, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
                body: JSON.stringify(socialsData)
            });
            
            return Promise.all([infoPromise, addressPromise, socialsPromise]);
        })
        .then(([infoRes, addressRes, socialsRes]) => {
            if (infoRes.ok && addressRes.ok && socialsRes.ok) {
                alert('Профіль, адресу і соцмережі успішно оновлено!');
            } else {
                let errorMsg = 'Помилка оновлення:';
                if (!infoRes.ok) errorMsg += ' профілю;';
                if (!addressRes.ok) errorMsg += ' адреси;';
                if (!socialsRes.ok) errorMsg += ' соцмереж;';
                throw new Error(errorMsg);
            }
        })
        .catch(error => {
            console.error('Ошибка:', error);
            alert('Помилка при оновленні: ' + error.message);
        });
}

function clearProfileFields() {
    const ids = [
        'firstname-input', 'lastname-input', 'phone-input', 'email-input',
        'telegram-input', 'instagram-input', 'street-input', 'house-input',
        'entrance-input', 'apartment-input', 'gender-input', 'allergens-input', 'city-input'
    ];
    ids.forEach(id => {
        const el = document.getElementById(id);
        if (el) el.value = '';
    });
}

function loadProfileData() {
    // Сначала очищаем все поля профиля
    clearProfileFields();
    
    fetch('assets/data/settings.json')
        .then(response => response.json())
        .then(settings => {
            const baseUrl = settings.SERVER_BASE_URL;
            console.log('Base URL:', baseUrl);
            
            // Здесь можно получить userID из localStorage/sessionStorage/cookie, если нужно
            const userId = localStorage.getItem('userId');
            console.log('UserID from localStorage:', userId);
            
            // Проверяем, что userId существует
            if (!userId) {
                console.error('userId не найден в localStorage');
                alert('Помилка: користувач не авторизований. Будь ласка, увійдіть в систему.');
                return;
            }
            
            const fullUrl = baseUrl + '/user/info/' + userId;
            console.log('Отправляем GET запрос на:', fullUrl);
            
            // Для примера просто делаем POST на /user/profile (так как GET не работает с ngrok)
            const xhr = new XMLHttpRequest();
            xhr.open('POST', fullUrl, true);
            xhr.setRequestHeader('Content-Type', 'application/json');
            xhr.onreadystatechange = function() {
                if (xhr.readyState === 4) {
                    console.log('Получен ответ от сервера:', xhr.status, xhr.statusText);
                    if (xhr.status === 200) {
                        try {
                            const data = JSON.parse(xhr.responseText);
                            console.log('Данные профиля получены:', data);
                            
                            // Заполняем поля формы только если значение есть, иначе оставляем пустым
                            const setValue = (id, value) => {
                                const el = document.getElementById(id);
                                if (el) el.value = (value !== undefined && value !== null) ? value : '';
                            };
                            
                            setValue('firstname-input', data.firstName);
                            setValue('lastname-input', data.lastName);
                            setValue('phone-input', data.number);
                            setValue('email-input', data.email);
                            setValue('telegram-input', data.telegram);
                            setValue('instagram-input', data.instagram);
                            setValue('street-input', data.street);
                            setValue('house-input', data.house);
                            setValue('apartment-input', data.apartment);
                            
                            // Для пола (gender)
                            if (data.userSex === 'Мужской' || data.userSex === 'Чоловіча') {
                                setValue('gender-input', 'male');
                            } else if (data.userSex === 'Женский' || data.userSex === 'Жіноча') {
                                setValue('gender-input', 'female');
                            } else {
                                setValue('gender-input', '');
                            }
                            
                            setValue('allergens-input', data.userAllergens);
                            // Для города
                            setValue('city-input', data.city);
                            // Для этажа (floor-input) — если entrance есть, иначе пусто
                            setValue('entrance-input', data.entrance ? data.entrance : '');
                        } catch (e) {
                            console.error('Ошибка парсинга JSON:', e);
                            console.error('Полный ответ сервера:', xhr.responseText);
                        }
                    } else {
                        console.error('Ошибка загрузки профиля:', xhr.status, xhr.statusText);
                    }
                }
            };
            xhr.send(JSON.stringify({ userId: userId }));
        })
        .catch(err => {
            console.error('Ошибка загрузки settings.json:', err);
        });
}

function initModalHandlers() {
    var closeBtn = document.getElementById('order-modal-close');
    
    document.getElementById('order-modal').addEventListener('click', function(e) {
        if(e.target === this) {
            this.style.display = 'none';
        }
    });
    
    if(closeBtn) {
        closeBtn.addEventListener('click', function() {
            document.getElementById('order-modal').style.display = 'none';
        });
    }
} 