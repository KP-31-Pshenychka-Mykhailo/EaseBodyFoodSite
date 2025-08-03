// Функции для управления корзиной
class CartManager {
    constructor() {
        this.cart = this.loadCart();
    }

    // Загрузка корзины из localStorage
    loadCart() {
        return JSON.parse(localStorage.getItem('cart') || '[]');
    }

    // Сохранение корзины в localStorage
    saveCart() {
        localStorage.setItem('cart', JSON.stringify(this.cart));
    }

    // Добавление товара в корзину
    addItem(item) {
        const existingItemIndex = this.cart.findIndex(cartItem => 
            cartItem.id === item.id && cartItem.day === item.day
        );

        if (existingItemIndex !== -1) {
            this.cart[existingItemIndex].quantity += item.quantity;
        } else {
            this.cart.push(item);
        }

        this.saveCart();
    }

    // Обновление количества товара
    updateQuantity(index, quantity) {
        if (this.cart[index]) {
            this.cart[index].quantity = Math.max(1, parseInt(quantity) || 1);
            this.saveCart();
        }
    }

    // Изменение количества товара
    changeQuantity(index, change) {
        if (this.cart[index]) {
            this.cart[index].quantity = Math.max(1, this.cart[index].quantity + change);
            this.saveCart();
        }
    }

    // Удаление товара из корзины
    removeItem(index) {
        this.cart.splice(index, 1);
        this.saveCart();
    }

    // Очистка корзины
    clearCart() {
        this.cart = [];
        this.saveCart();
    }

    // Получение общего количества товаров
    getTotalItems() {
        return this.cart.reduce((total, item) => total + item.quantity, 0);
    }

    // Получение общей стоимости (если есть цены)
    getTotalPrice() {
        return this.cart.reduce((total, item) => total + (item.price || 0) * item.quantity, 0);
    }

    // Получение общей калорийности
    getTotalCalories() {
        return this.cart.reduce((total, item) => {
            const calories = (item.p * 4) + (item.f * 9) + (item.c * 4);
            return total + (calories * item.quantity);
        }, 0);
    }

    // Получение общих макронутриентов
    getTotalMacros() {
        return this.cart.reduce((total, item) => ({
            protein: total.protein + (item.p * item.quantity),
            fat: total.fat + (item.f * item.quantity),
            carbs: total.carbs + (item.c * item.quantity)
        }), { protein: 0, fat: 0, carbs: 0 });
    }
}

// Глобальный экземпляр менеджера корзины
window.cartManager = new CartManager();

// Функции для работы с корзиной на странице
window.changeQuantity = function(index, change) {
    const cart = window.cartManager.loadCart();
    if (cart[index]) {
        const newQuantity = Math.max(1, cart[index].quantity + change);
        window.cartManager.updateQuantity(index, newQuantity);
        loadCart();
    }
};

window.updateQuantity = function(index, value) {
    const newQuantity = Math.max(1, parseInt(value) || 1);
    window.cartManager.updateQuantity(index, newQuantity);
    loadCart();
};

window.removeItem = function(index) {
    window.cartManager.removeItem(index);
    if (typeof loadCart === 'function') {
        loadCart();
    }
};

window.clearCart = function() {
    if (confirm('Ви впевнені, що хочете очистити кошик?')) {
        window.cartManager.clearCart();
        if (typeof loadCart === 'function') {
            loadCart();
        }
    }
};

window.proceedToCheckout = function() {
    // Открываем модальное окно с формой заказа
    const modal = document.getElementById('order-modal');
    if (modal) {
        // Загружаем содержимое order.html
        fetch('partials/order.html')
            .then(response => response.text())
            .then(html => {
                // Извлекаем содержимое main из order.html
                const mainMatch = html.match(/<main[\s\S]*?<\/main>/);
                if (mainMatch) {
                    document.getElementById('order-modal-body').innerHTML = mainMatch[0];
                    modal.style.display = 'flex';
                    
                    // После загрузки формы загружаем данные пользователя
                    loadUserDataToOrderForm();
                }
            })
            .catch(error => {
                console.error('Error loading order form:', error);
                alert('Помилка завантаження форми замовлення');
            });
    }
};

// Функция для загрузки и заполнения данных пользователя в форме заказа
function loadUserDataToOrderForm() {
    const userId = localStorage.getItem('userId');
    
    // Проверяем, что форма заказа существует
    const orderForm = document.querySelector('.order-form');
    if (!orderForm) {
        return;
    }
    
    // Если пользователь не зарегистрирован, ничего не делаем
    if (!userId) {
        return;
    }
    
    fetch('assets/data/settings.json')
        .then(response => response.json())
        .then(settings => {
            const baseUrl = settings.SERVER_BASE_URL;
            const fullUrl = baseUrl + '/user/info/' + userId;
            
            console.log('Отправляем запрос на:', fullUrl);
            
            const xhr = new XMLHttpRequest();
            xhr.open('POST', fullUrl, true);
            xhr.setRequestHeader('Content-Type', 'application/json');
            xhr.onreadystatechange = function() {
                if (xhr.readyState === 4) {
                    if (xhr.status === 200) {
                        try {
                            const data = JSON.parse(xhr.responseText);
                            
                            // Функция для безопасного установки значения
                            const setValue = (id, value) => {
                                const el = document.getElementById(id);
                                if (el && value !== undefined && value !== null && value !== '') {
                                    el.value = value;
                                }
                            };
                            
                            // Заполняем поля формы данными пользователя
                            setValue('order-firstname', data.firstName);
                            setValue('order-lastname', data.lastName);
                            setValue('order-phone', data.number);
                            setValue('order-email', data.email);
                            
                            // Заполняем социальные сети (Telegram или Instagram)
                            if (data.telegram) {
                                setValue('order-social', data.telegram);
                            } else if (data.instagram) {
                                setValue('order-social', data.instagram);
                            }
                            
                            // Заполняем адрес доставки
                            setValue('order-street', data.street);
                            setValue('order-house', data.house);
                            setValue('order-apartment', data.apartment);
                            
                            // Для этажа используем entrance, если есть
                            if (data.entrance) {
                                setValue('order-floor', data.entrance);
                            }
                            
                            // Настраиваем валидацию полей формы
                            setupOrderFormValidation();
                            
                        } catch (e) {
                            console.error('Ошибка парсинга JSON:', e);
                        }
                    }
                }
            };
            xhr.send(JSON.stringify({ userId: userId }));
        })
        .catch(err => {
            console.error('Ошибка загрузки settings.json:', err);
        });
}

// Функция для настройки валидации формы заказа
function setupOrderFormValidation() {
    
    // Валидация обязательных полей
    const requiredFields = [
        {input: 'order-lastname', error: 'order-lastname-error'},
        {input: 'order-firstname', error: 'order-firstname-error'},
        {input: 'order-phone', error: 'order-phone-error'},
        {input: 'order-email', error: 'order-email-error'},
        {input: 'order-social', error: 'order-social-error'},
        {input: 'order-street', error: 'order-street-error'},
        {input: 'order-house', error: 'order-house-error'},
        {input: 'order-floor', error: 'order-floor-error'},
        {input: 'order-apartment', error: 'order-apartment-error'}
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
    
    // Обработчик отправки формы
    const orderForm = document.querySelector('.order-form');
    if (orderForm) {
        orderForm.addEventListener('submit', function(e) {
            let valid = true;
            requiredFields.forEach(({input, error}) => {
                const inputEl = document.getElementById(input);
                const errorEl = document.getElementById(error);
                if (inputEl && errorEl && !inputEl.value.trim()) {
                    errorEl.style.display = 'block';
                    valid = false;
                }
            });
            if (!valid) {
                e.preventDefault();
                alert('Будь ласка, заповніть всі обов\'язкові поля');
            } else {
                alert('Замовлення успішно оформлено!');
                // Здесь можно добавить логику отправки заказа на сервер
            }
        });
    }
}

// Функция для отображения корзины на странице cart.html
function loadCart() {
    const cartContent = document.getElementById('cart-content');
    if (!cartContent) {
        console.log('Cart content element not found in loadCart');
        return;
    }

    const cart = window.cartManager.loadCart();
    console.log('Cart loaded from localStorage:', cart);
    
    if (cart.length === 0) {
        console.log('Cart is empty, showing empty state');
        // Скрываем кнопку "Очистити кошик"
        const clearCartBtn = document.querySelector('.clear-cart-btn');
        if (clearCartBtn) {
            clearCartBtn.style.display = 'none';
        }
        
        cartContent.innerHTML = `
            <div class="profile-cart-empty">
                <div class="profile-cart-empty-title">Упс! Кошик порожній</div>
                <div class="profile-cart-empty-desc">Саме час для правильного харчування!</div>
                <div class="profile-cart-btns">
                    <a href="index.html" class="profile-cart-btn">Повернутися на головну</a>
                </div>
            </div>
        `;
        return;
    }
    
    // Показываем кнопку "Очистити кошик" если корзина не пуста
    const clearCartBtn = document.querySelector('.clear-cart-btn');
    if (clearCartBtn) {
        clearCartBtn.style.display = 'block';
    }
    
    let cartHTML = '<div class="cart-items">';
    const macros = window.cartManager.getTotalMacros();
    const totalCalories = window.cartManager.getTotalCalories();
    
    cart.forEach((item, index) => {
        const calories = (item.p * 4) + (item.f * 9) + (item.c * 4);
        
                            cartHTML += `
                        <div class="cart-item" data-index="${index}">
                            <img src="${item.img || 'assets/img/food1.jpg'}" alt="${item.title}" class="cart-item-img">
                            <div class="cart-item-content">
                                <div class="cart-item-day">${item.dayName}</div>
                                <div class="cart-item-title">${item.title}</div>
                                <div class="cart-item-macros">Б: ${item.p}г Ж: ${item.f}г В: ${item.c}г, ${calories} ккал</div>
                                <div class="cart-item-description">${item.subtitle || ''}</div>
                            </div>
                            <div class="cart-item-controls">
                                <div class="quantity-controls">
                                    <span class="quantity-label">Кількість:</span>
                                    <button class="quantity-btn" onclick="changeQuantity(${index}, -1)">−</button>
                                    <input type="number" class="quantity-input" value="${item.quantity}" min="1" onchange="updateQuantity(${index}, this.value)" oninput="updateQuantity(${index}, this.value)">
                                    <button class="quantity-btn" onclick="changeQuantity(${index}, 1)">+</button>
                                </div>
                                <div class="cart-item-actions">
                                    <button class="delete-btn" onclick="removeItem(${index})">Видалити</button>
                                </div>
                            </div>
                        </div>
                    `;
    });
    
    cartHTML += '</div>';
    
                    cartHTML += `
                    <div class="cart-summary">
                        <div class="cart-total">Загалом у замовленні: ${macros.protein} Білки ${macros.fat} Жири ${macros.carbs} Вуглеводи, ${totalCalories} ккал.</div>
                        <div class="cart-actions">
                            <button class="checkout-btn" onclick="proceedToCheckout()">Оформити замовлення</button>
                            <a href="index.html" class="continue-shopping-btn">Повернутися на головну</a>
                        </div>
                    </div>
                `;
    
    cartContent.innerHTML = cartHTML;
}

// Инициализация корзины при загрузке страницы
document.addEventListener('DOMContentLoaded', function() {
    if (document.getElementById('cart-content')) {
        loadCart();
    }
}); 