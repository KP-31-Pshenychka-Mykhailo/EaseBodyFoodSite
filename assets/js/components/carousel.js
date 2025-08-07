

// ===== КАРУСЕЛЬ ОТЗЫВОВ =====
// Данные для карусели отзывов
const reviewsData = [
    {
        type: "mixed", // 2 обычных + 1 видео
        reviews: [
            {
                name: "Анна Левицька",
                location: "Київ, 35 років",
                avatar: "data/img/review1.jpg",
                text: "Було страшно, що буде дорого, але коли я підрахувала, скільки грошей я витрачала на перекуси — EasyBody вийшов навіть дешевше. І ще смачніше. Дякую!"
            },
            {
                name: "Ярослав Демчук",
                location: "Львів, 26 років",
                avatar: "data/img/review3.jpg",
                text: "В мене 3 роботи, я взагалі не готую. А тут — відкрив контейнер, з'їв, пішов. Смачно, сито, і мозок не болить. Люблю"
            },
            {
                name: "Ігор Павленко",
                location: "Харків, 28 років",
                avatar: "data/img/review2.jpg",
                hasVideo: true
            }
        ]
    },
    {
        type: "text", // 4 обычных отзыва
        reviews: [
            {
                name: "Марія Коваль",
                location: "Житомир, 24 роки",
                avatar: "data/img/review4.jpg",
                text: "У мене були дуже складні стосунки із їжею — то переїдаю, то забуваю поїсти. EasyBody дав мені не просто раціон, а відчуття, ніби хтось нарешті подбав про мене. Навіть мій психотерапевт схвалив :)"
            },
            {
                name: "Анна Левицька",
                location: "Київ, 35 років",
                avatar: "data/img/review1.jpg",
                text: "Було страшно, що буде дорого, але коли я підрахувала, скільки грошей я витрачала на перекуси — EasyBody вийшов навіть дешевше. І ще смачніше. Дякую!"
            },
            {
                name: "Ярослав Демчук",
                location: "Львів, 26 років",
                avatar: "data/img/review3.jpg",
                text: "В мене 3 роботи, я взагалі не готую. А тут — відкрив контейнер, з'їв, пішов. Смачно, сито, і мозок не болить. Люблю"
            },
            {
                name: "Ігор Павленко",
                location: "Харків, 28 років",
                avatar: "data/img/review2.jpg",
                text: "Я айтішник. Харчування — завжди було хаосом. Тепер відкриваю Telegram, обираю раціон, і все. За мене все пораховано, все доставлено. Це сервіс, якому я довіряю."
            }
        ]
    },
    {
        type: "mixed", // 2 обычных + 1 видео
        reviews: [
            {
                name: "Ярослав Демчук",
                location: "Львів, 26 років",
                avatar: "data/img/review3.jpg",
                text: "В мене 3 роботи, я взагалі не готую. А тут — відкрив контейнер, з'їв, пішов. Смачно, сито, і мозок не болить. Люблю"
            },
            {
                name: "Марія Коваль",
                location: "Житомир, 24 роки",
                avatar: "data/img/review4.jpg",
                text: "У мене були дуже складні стосунки із їжею — то переїдаю, то забуваю поїсти. EasyBody дав мені не просто раціон, а відчуття, ніби хтось нарешті подбав про мене. Навіть мій психотерапевт схвалив :)"
            },
            {
                name: "Ігор Павленко",
                location: "Харків, 28 років",
                avatar: "data/img/review2.jpg",
                hasVideo: true
            }
        ]
    }
];

let currentReviewIndex = 0;

// Функция для обновления отзывов
function updateReviews(index) {
    const reviewData = reviewsData[index];
    const reviewsGrid = document.querySelector('.reviews-grid');
    
    // Проверяем, не мобильное ли устройство
    const isMobile = window.innerWidth <= 900;
    
    if (isMobile) {
        // На мобильных устройствах не обновляем отзывы - оставляем как есть
        return;
    }
    
    // Очищаем контейнер
    reviewsGrid.innerHTML = '';
    
    if (reviewData.type === "mixed") {
        // Создаем левую колонку с 2 отзывами
        const reviewsLeft = document.createElement('div');
        reviewsLeft.className = 'reviews-left';
        
        // Добавляем первые 2 отзыва в левую колонку
        for (let i = 0; i < 2; i++) {
            const review = reviewData.reviews[i];
            const reviewCard = document.createElement('div');
            reviewCard.className = 'review-card review-card-small';
            reviewCard.innerHTML = `
                <div class="review-header">
                    <img src="${review.avatar}" alt="${review.name}" class="review-avatar">
                    <div>
                        <h4 class="white">${review.name}</h4>
                        <div class="review-info">${review.location}</div>
                    </div>
                </div>
                <div class="review-text">
                    ${review.text}
                </div>
            `;
            reviewsLeft.appendChild(reviewCard);
        }
        
        // Создаем правую колонку с видео
        const reviewCardLarge = document.createElement('div');
        reviewCardLarge.className = 'review-card review-card-large';
        const videoReview = reviewData.reviews[2];
        reviewCardLarge.innerHTML = `
            <div class="review-header">
                <img src="${videoReview.avatar}" alt="${videoReview.name}" class="review-avatar">
                <div>
                    <h4 class="white">${videoReview.name}</h4>
                    <div class="review-info">${videoReview.location}</div>
                </div>
            </div>
            <div class="review-video-container">
                <video class="review-video" controls>
                    <source src="data/video/testimonial.mp4" type="video/mp4">
                    Ваш браузер не підтримує відео.
                </video>
            </div>
        `;
        
        reviewsGrid.appendChild(reviewsLeft);
        reviewsGrid.appendChild(reviewCardLarge);
        
    } else if (reviewData.type === "text") {
        // Создаем сетку 2x2 для 4 текстовых отзывов
        const reviewsLeft = document.createElement('div');
        reviewsLeft.className = 'reviews-left';
        
        // Добавляем первые 2 отзыва в левую колонку
        for (let i = 0; i < 2; i++) {
            const review = reviewData.reviews[i];
            const reviewCard = document.createElement('div');
            reviewCard.className = 'review-card review-card-small';
            reviewCard.innerHTML = `
                <div class="review-header">
                    <img src="${review.avatar}" alt="${review.name}" class="review-avatar">
                    <div>
                        <h4 class="white">${review.name}</h4>
                        <div class="review-info">${review.location}</div>
                    </div>
                </div>
                <div class="review-text">
                    ${review.text}
                </div>
            `;
            reviewsLeft.appendChild(reviewCard);
        }
        
        // Создаем правую колонку с 2 отзывами
        const reviewsRight = document.createElement('div');
        reviewsRight.className = 'reviews-right';
        
        // Добавляем последние 2 отзыва в правую колонку
        for (let i = 2; i < 4; i++) {
            const review = reviewData.reviews[i];
            const reviewCard = document.createElement('div');
            reviewCard.className = 'review-card review-card-small';
            reviewCard.innerHTML = `
                <div class="review-header">
                    <img src="${review.avatar}" alt="${review.name}" class="review-avatar">
                    <div>
                        <h4 class="white">${review.name}</h4>
                        <div class="review-info">${review.location}</div>
                    </div>
                </div>
                <div class="review-text">
                    ${review.text}
                </div>
            `;
            reviewsRight.appendChild(reviewCard);
        }
        
        reviewsGrid.appendChild(reviewsLeft);
        reviewsGrid.appendChild(reviewsRight);
    }
    
    // Обновляем точки
    updateDots(index);
}

// Функция для обновления точек
function updateDots(activeIndex) {
    const dotsContainer = document.getElementById('reviewDots');
    if (!dotsContainer) return;
    
    dotsContainer.innerHTML = '';
    
    reviewsData.forEach((_, index) => {
        const dot = document.createElement('div');
        dot.className = `review-dot ${index === activeIndex ? 'active' : ''}`;
        dot.addEventListener('click', () => {
            currentReviewIndex = index;
            updateReviews(index);
        });
        dotsContainer.appendChild(dot);
    });
}

// Функция для следующего отзыва
function nextReview() {
    currentReviewIndex = (currentReviewIndex + 1) % reviewsData.length;
    updateReviews(currentReviewIndex);
}

// Функция для предыдущего отзыва
function prevReview() {
    currentReviewIndex = (currentReviewIndex - 1 + reviewsData.length) % reviewsData.length;
    updateReviews(currentReviewIndex);
}

// ===== КАРУСЕЛЬ ГАЛЕРЕИ =====
// Функция для определения ширины карточки
function getCardWidth(gallery) {
    const card = gallery.querySelector('.gallery-card');
    if (card) {
        if (window.innerWidth > 700) {
            return card.offsetWidth + 32; // 32px - десктопный gap
        } else {
            return card.offsetWidth + 16; // 16px - мобильный gap
        }
    }
    return window.innerWidth > 700 ? 377 : 280; // fallback
}

// Функция для центрирования карточек на десктопе
function centerCards(gallery) {
    if (window.innerWidth > 700) {
        const cardWidth = getCardWidth(gallery);
        const currentScrollLeft = gallery.scrollLeft;
        const targetScrollLeft = Math.round(currentScrollLeft / cardWidth) * cardWidth;
        if (Math.abs(currentScrollLeft - targetScrollLeft) > 10) {
            gallery.scrollTo({ left: targetScrollLeft, behavior: 'smooth' });
        }
    }
}

// Функция для определения активной карточки на мобильных
function updateActiveCard(gallery) {
    if (window.innerWidth <= 700) {
        const cards = gallery.querySelectorAll('.gallery-card');
        const cardWidth = getCardWidth(gallery);
        const currentScrollLeft = gallery.scrollLeft;
        const centerPosition = currentScrollLeft + gallery.clientWidth / 2;
        
        cards.forEach((card, index) => {
            const cardLeft = index * cardWidth;
            const cardRight = cardLeft + cardWidth;
            
            if (centerPosition >= cardLeft && centerPosition < cardRight) {
                card.classList.add('active');
            } else {
                card.classList.remove('active');
            }
        });
    }
}

// Функция для добавления новых копий карточек
function addMoreCards(gallery, cardsHTML) {
    const cardWidth = getCardWidth(gallery);
    const originalCardsCount = 5;
    const currentScrollLeft = gallery.scrollLeft;
    const totalWidth = gallery.scrollWidth;
    
    // Если приближаемся к концу, добавляем копии в конец
    if (currentScrollLeft + gallery.clientWidth >= totalWidth - cardWidth * 2) {
        gallery.insertAdjacentHTML('beforeend', cardsHTML);
        if (window.heartsManager) {
            window.heartsManager.refresh();
        }
    }
    
    // Если приближаемся к началу, добавляем копии в начало
    if (currentScrollLeft <= cardWidth * 2) {
        gallery.insertAdjacentHTML('afterbegin', cardsHTML);
        gallery.scrollLeft += cardWidth * originalCardsCount;
        if (window.heartsManager) {
            window.heartsManager.refresh();
        }
    }
}

// ===== УНИВЕРСАЛЬНАЯ КАРУСЕЛЬ МЕНЮ =====
// Функция для создания карусели меню
function createMenuCarousel(containerSelector, leftBtnSelector, rightBtnSelector, scrollStep = 320) {
    const container = document.querySelector(containerSelector);
    const leftBtn = document.querySelector(leftBtnSelector);
    const rightBtn = document.querySelector(rightBtnSelector);
    
    if (!container || !leftBtn || !rightBtn) return;
    
    leftBtn.addEventListener('click', function() {
        container.scrollBy({ left: -scrollStep, behavior: 'smooth' });
    });
    
    rightBtn.addEventListener('click', function() {
        container.scrollBy({ left: scrollStep, behavior: 'smooth' });
    });
}

// ===== ИНИЦИАЛИЗАЦИЯ КАРУСЕЛЕЙ =====
function initCarousel() {
    // Инициализация карусели отзывов
    const prevBtn = document.getElementById('reviewPrev');
    const nextBtn = document.getElementById('reviewNext');
    
    // Проверяем, не мобильное ли устройство
    const isMobile = window.innerWidth <= 900;
    
    if (prevBtn && nextBtn && !isMobile) {
        prevBtn.addEventListener('click', prevReview);
        nextBtn.addEventListener('click', nextReview);
        
        // Инициализируем первую комбинацию
        updateReviews(0);
    }
    
    // Инициализация карусели галереи
    const gallery = document.querySelector('.gallery-cards');
    const left = document.querySelector('.gallery-arrow-left');
    const right = document.querySelector('.gallery-arrow-right');
    
    if (gallery && left && right) {
        // Загрузка и отображение 5 случайных блюд
        fetch('../../data/datafiles/dishes.json')
            .catch(() => fetch('data/datafiles/dishes.json'))
            .catch(() => fetch('../data/datafiles/dishes.json'))
            .then(response => response.json())
            .then(dishes => {
                const shuffled = dishes.sort(() => 0.5 - Math.random());
                const selected = shuffled.slice(0, 5);
                
                // Создаем карточки используя функции из card.js
                window.cardsHTML = selected.map(dish => window.createGalleryCard ? window.createGalleryCard(dish) : `
                    <div class="gallery-card" data-dish-id="${dish.id}">
                        <img src="${dish.img ? dish.img : '../../data/img/food1.jpg'}" alt="${dish.title}" class="gallery-img">
                        <div class="gallery-card-icons">
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" class="gallery-heart icon-heart">
                                <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41 0.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                            </svg>
                        </div>
                        <div class="gallery-card-info">
                            <div class="gallery-card-title">${dish.title}</div>
                            <div class="gallery-card-desc">${dish.subtitle || ''}</div>
                        </div>
                    </div>
                `).join('');
                
                // Создаем бесконечную карусель: клонируем карточки много раз
                gallery.innerHTML = window.cardsHTML + window.cardsHTML + window.cardsHTML + window.cardsHTML + window.cardsHTML;
                
                // Устанавливаем начальную позицию в середине
                setTimeout(() => {
                    const cardWidth = getCardWidth(gallery);
                    gallery.scrollLeft = cardWidth * 10; // Начинаем с середины
                    updateActiveCard(gallery); // Устанавливаем активную карточку
                }, 100);
                
                // Добавляем обработчики для сердечек
                if (window.heartsManager) {
                    window.heartsManager.refresh();
                }
            });
        
        // Обработчики для кнопок (только на десктопе)
        left.addEventListener('click', function() {
            const cardWidth = getCardWidth(gallery);
            gallery.scrollBy({ left: -cardWidth, behavior: 'smooth' });
            setTimeout(() => addMoreCards(gallery, window.cardsHTML), 300);
            setTimeout(() => centerCards(gallery), 600);
        });
        
        right.addEventListener('click', function() {
            const cardWidth = getCardWidth(gallery);
            gallery.scrollBy({ left: cardWidth, behavior: 'smooth' });
            setTimeout(() => addMoreCards(gallery, window.cardsHTML), 300);
            setTimeout(() => centerCards(gallery), 600);
        });
        
        // Свайп-функциональность для мобильных устройств
        let startX = 0;
        let currentX = 0;
        let isDragging = false;
        let startScrollLeft = 0;
        let startTime = 0;
        
        // Touch события
        gallery.addEventListener('touchstart', function(e) {
            startX = e.touches[0].clientX;
            startScrollLeft = gallery.scrollLeft;
            startTime = Date.now();
            isDragging = true;
            gallery.style.cursor = 'grabbing';
        });
        
        // Добавляем обработчик прокрутки для добавления новых карточек с throttling
        let scrollTimeout;
        gallery.addEventListener('scroll', function() {
            clearTimeout(scrollTimeout);
            scrollTimeout = setTimeout(() => addMoreCards(gallery, window.cardsHTML), 100);
            
            // Обновляем активную карточку при скролле
            updateActiveCard(gallery);
        });
        
        gallery.addEventListener('touchmove', function(e) {
            if (!isDragging) return;
            e.preventDefault();
            currentX = e.touches[0].clientX;
            const diff = startX - currentX;
            gallery.scrollLeft = startScrollLeft + diff;
        });
        
        gallery.addEventListener('touchend', function(e) {
            if (!isDragging) return;
            isDragging = false;
            gallery.style.cursor = 'grab';
            
            const diff = startX - currentX;
            const cardWidth = getCardWidth(gallery);
            const threshold = cardWidth / 3; // Порог для переключения карточки
            
            if (Math.abs(diff) > threshold) {
                if (diff > 0) {
                    // Свайп влево - следующая карточка
                    gallery.scrollBy({ left: cardWidth, behavior: 'smooth' });
                } else {
                    // Свайп вправо - предыдущая карточка
                    gallery.scrollBy({ left: -cardWidth, behavior: 'smooth' });
                }
                // Обновляем активную карточку после свайпа
                setTimeout(() => updateActiveCard(gallery), 300);
            } else {
                // Возвращаемся к текущей карточке
                gallery.scrollTo({ left: startScrollLeft, behavior: 'smooth' });
            }
        });
        
        // Единый обработчик кликов для всех устройств
        gallery.addEventListener('click', function(e) {
            // Проверяем, был ли это свайп или клик
            const timeDiff = Date.now() - startTime;
            const distanceDiff = Math.abs(startX - currentX);
            
            if (isDragging || distanceDiff > 10 || timeDiff < 200) {
                return; // Это был свайп, не обрабатываем клик
            }
            
            // Проверяем, не кликнули ли по сердечку
            if (e.target.closest('.gallery-heart')) {
                return; // Клик по сердечку обрабатывается отдельно
            }
            
            // Находим карточку, по которой кликнули
            const card = e.target.closest('.gallery-card');
            if (card) {
                // Здесь можно добавить логику для показа информации о карточке
        
                
                // Пример: показать название блюда
                const titleElement = card.querySelector('.gallery-card-title');
                if (titleElement) {
                    const title = titleElement.textContent;
                    showInfo('Выбрано блюдо: ' + title);
                    // Здесь можно заменить на модальное окно или другую логику
                }
            }
        });
    }
    
    // Инициализация каруселей меню
    createMenuCarousel('.menu-slider', '.menu-slider-arrow.left', '.menu-slider-arrow.right');
    createMenuCarousel('#dietCards', '#dietLeft', '#dietRight');
}

// Поддержка обеих систем - старой и новой
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initCarousel);
} else {
  // DOM уже загружен, инициализируем сразу
  initCarousel();
}

// Экспортируем функции в глобальную область видимости
window.updateReviews = updateReviews;
window.nextReview = nextReview;
window.prevReview = prevReview;
window.createMenuCarousel = createMenuCarousel;
window.getCardWidth = getCardWidth;
window.centerCards = centerCards;
window.updateActiveCard = updateActiveCard;
window.addMoreCards = addMoreCards;
window.initCarousel = initCarousel;


