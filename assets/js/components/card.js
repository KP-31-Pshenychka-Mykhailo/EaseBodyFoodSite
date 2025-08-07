

// ===== УНИВЕРСАЛЬНЫЕ ФУНКЦИИ ДЛЯ КАРТОЧЕК =====

// SVG иконка сердечка
const heartIconSVG = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" class="gallery-heart icon-heart">
    <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41 0.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
</svg>`;

// ===== КАРТОЧКА ГАЛЕРЕИ =====
function createGalleryCard(dish) {
    return `
        <div class="gallery-card" data-dish-id="${dish.id}">
            <img src="${window.getDishImage(dish, window.FALLBACK_IMAGE)}" alt="${dish.title}" class="gallery-img">
            <div class="gallery-card-icons">
                ${heartIconSVG}
            </div>
            <div class="gallery-card-info">
                <div class="gallery-card-title">${dish.title}</div>
                <div class="gallery-card-desc">${dish.subtitle || ''}</div>
            </div>
        </div>
    `;
}

// ===== КАРТОЧКА МЕНЮ (КОНСТРУКТОР) =====
function createMenuCard(dish, options = {}) {
    const {
        isActive = false,
        showPlus = true,
        mealType = null,
        day = null
    } = options;
    
    const plusButton = showPlus ? `
        <span class="menu-card-plus${isActive ? ' active' : ''}" data-dish-id="${dish.id}">
            ${isActive ? '−' : '+'}
        </span>
    ` : '';
    
    const title = mealType || dish.title;
    const description = mealType ? dish.title : (dish.subtitle || '');
    
    return `
        <div class="menu-card" data-dish-id="${dish.id}">
            <div class="menu-card-img-wrap">
                <img src="${window.getDishImage(dish, window.FALLBACK_IMAGE)}" alt="${dish.title}" class="menu-card-img">
                <div class="gallery-card-icons">
                    ${heartIconSVG}
                </div>
                ${plusButton}
            </div>
            <div class="menu-card-content">
                <div class="menu-card-title">${title}</div>
                <div class="menu-card-macros">${window.formatMacros(dish)}</div>
                <div class="menu-card-desc">${description}</div>
            </div>
        </div>
    `;
}

// ===== КАРТОЧКА МЕНЮ АЛЬТЕРНАТИВНАЯ (КАЛЬКУЛЯТОР) =====
function createMenuCardAlt(dish, mealType) {
    if (!dish) {
    
        return '';
    }
    

    
    const imageSrc = window.getDishImage ? window.getDishImage(dish, window.FALLBACK_IMAGE) : (dish.img || window.FALLBACK_IMAGE || 'data/img/food1.jpg');
    const macros = window.formatMacros ? window.formatMacros(dish) : `Б: ${dish.p} г, Ж: ${dish.f} г, В: ${dish.c} г`;
    
    return `
        <div class="menu-card-alt" data-dish-id="${dish.id}">
            <div class="menu-card-img-wrap-alt">
                <img src="${imageSrc}" alt="${dish.title}" class="menu-card-img">
                <div class="gallery-card-icons-alt">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" class="gallery-heart-alt icon-heart">
                        <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41 0.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                    </svg>
                </div>
                <span class="menu-card-plus active">−</span>
            </div>
            <div class="menu-card-content-alt">
                <div class="menu-card-title-alt">${mealType}</div>
                <div class="menu-card-macros-alt">${macros}</div>
                <div class="menu-card-desc-alt">${dish.title}</div>
            </div>
        </div>
    `;
}

// ===== КАРТОЧКА МЕНЮ СТАНДАРТНАЯ =====
function createStandardMenuCard(dish, mealType) {
    if (!dish) return '';
    
    return `
        <div class="menu-card" data-dish-id="${dish.id}">
            <div class="menu-card-img-wrap">
                <img src="${window.getDishImage(dish, window.FALLBACK_IMAGE)}" alt="${dish.title}" class="menu-card-img">
                <div class="gallery-card-icons">
                    ${heartIconSVG}
                </div>
                <span class="menu-card-plus active">−</span>
            </div>
            <div class="menu-card-content">
                <div class="menu-card-title">${mealType}</div>
                <div class="menu-card-macros">${window.formatMacros(dish)}</div>
                <div class="menu-card-desc">${dish.title}</div>
            </div>
        </div>
    `;
}

// ===== УТИЛИТАРНЫЕ ФУНКЦИИ =====

/**
 * Привязка событий к карточкам
 */
function attachCardEvents(container, options = {}) {
    const {
        onHeartClick = null,
        onPlusClick = null,
        onCardClick = null
    } = options;
    
    if (!container) return;
    
    // Обработчики для сердечек
    if (onHeartClick) {
        const hearts = window.getElements('.gallery-heart, .gallery-heart-alt, .menu-card-heart, .menu-card-heart-alt', container);
        hearts.forEach(heart => {
            heart.addEventListener('click', (e) => {
                e.stopPropagation();
                onHeartClick(e, heart);
            });
        });
    }
    
    // Обработчики для кнопок "+"
    if (onPlusClick) {
        const plusButtons = window.getElements('.menu-card-plus', container);
        plusButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                e.stopPropagation();
                onPlusClick(e, button);
            });
        });
    }
    
    // Обработчики для клика по карточке
    if (onCardClick) {
        const cards = window.getElements('.gallery-card, .menu-card, .menu-card-alt', container);
        cards.forEach(card => {
            card.addEventListener('click', (e) => {
                onCardClick(e, card);
            });
        });
    }
    

}

/**
 * Создание карточек из массива блюд
 */
function createCardsFromDishes(dishes, cardType = 'gallery', options = {}) {
    if (!Array.isArray(dishes)) return '';
    
    return dishes.map(dish => {
        switch (cardType) {
            case 'gallery':
                return createGalleryCard(dish);
            case 'menu':
                return createMenuCard(dish, options);
            case 'menu-alt':
                return createMenuCardAlt(dish, options.mealType);
            case 'standard':
                return createStandardMenuCard(dish, options.mealType);
            default:
                return createGalleryCard(dish);
        }
    }).join('');
}

/**
 * Рендеринг карточек в контейнер
 */
function renderCards(container, dishes, cardType = 'gallery', options = {}) {
    if (!container) return;
    
    const cardsHTML = createCardsFromDishes(dishes, cardType, options);
    container.innerHTML = cardsHTML;
    
    // Привязываем события
    attachCardEvents(container, options);
    

}

/**
 * Получение выбранных блюд из карточек
 */
function getSelectedDishesFromCards(container, dishesData, dayMap = null) {
    if (!container || !dishesData) return [];
    
    const selectedCards = window.getElements('.menu-card-plus.active, .menu-card-alt', container);
    const selectedDishes = [];
    
    selectedCards.forEach(card => {
        const dishId = card.getAttribute('data-dish-id');
        const dish = dishesData.find(d => d.id == dishId);
        
        if (dish) {
            const selectedDish = { ...dish };
            
            // Добавляем информацию о дне, если есть dayMap
            if (dayMap) {
                const dayElement = card.closest('[data-day]');
                if (dayElement) {
                    selectedDish.day = dayMap[dayElement.getAttribute('data-day')];
                }
            }
            
            selectedDishes.push(selectedDish);
        }
    });
    
    return selectedDishes;
}

/**
 * Расчет макронутриентов из карточек
 */
function calculateMacrosFromCards(container, dishesData) {
    const selectedDishes = getSelectedDishesFromCards(container, dishesData);
    
    return selectedDishes.reduce((total, dish) => ({
        protein: total.protein + (dish.p || 0),
        fat: total.fat + (dish.f || 0),
        carbs: total.carbs + (dish.c || 0)
    }), { protein: 0, fat: 0, carbs: 0 });
}

/**
 * Обновление состояния карточки
 */
function updateCardState(card, isActive) {
    if (!card) return;
    
    const plusButton = card.querySelector('.menu-card-plus');
    if (plusButton) {
        plusButton.classList.toggle('active', isActive);
        plusButton.textContent = isActive ? '−' : '+';
    }
}

/**
 * Создание карточки меню с состоянием
 */
function createMenuCardWithState(dish, cardState, currentDay) {
    if (!dish) return '';
    
    const isActive = cardState && cardState[dish.id] && cardState[dish.id].includes(currentDay);
    
    return createMenuCard(dish, {
        isActive,
        showPlus: true,
        mealType: null
    });
}

// ===== ЭКСПОРТ ФУНКЦИЙ =====

// Экспортируем все функции в глобальную область
window.createGalleryCard = createGalleryCard;
window.createMenuCard = createMenuCard;
window.createMenuCardAlt = createMenuCardAlt;
window.createStandardMenuCard = createStandardMenuCard;
window.attachCardEvents = attachCardEvents;
window.createCardsFromDishes = createCardsFromDishes;
window.renderCards = renderCards;
window.getSelectedDishesFromCards = getSelectedDishesFromCards;
window.calculateMacrosFromCards = calculateMacrosFromCards;
window.updateCardState = updateCardState;
window.createMenuCardWithState = createMenuCardWithState;


