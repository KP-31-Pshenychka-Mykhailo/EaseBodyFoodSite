// Данные для карусели отзывов
const reviewsData = [
    {
        type: "mixed", // 2 обычных + 1 видео
        reviews: [
            {
                name: "Анна Левицька",
                location: "Київ, 35 років",
                avatar: "assets/img/review1.jpg",
                text: "Було страшно, що буде дорого, але коли я підрахувала, скільки грошей я витрачала на перекуси — EasyBody вийшов навіть дешевше. І ще смачніше. Дякую!"
            },
            {
                name: "Ярослав Демчук",
                location: "Львів, 26 років",
                avatar: "assets/img/review3.jpg",
                text: "В мене 3 роботи, я взагалі не готую. А тут — відкрив контейнер, з'їв, пішов. Смачно, сито, і мозок не болить. Люблю"
            },
            {
                name: "Ігор Павленко",
                location: "Харків, 28 років",
                avatar: "assets/img/review2.jpg",
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
                avatar: "assets/img/review4.jpg",
                text: "У мене були дуже складні стосунки із їжею — то переїдаю, то забуваю поїсти. EasyBody дав мені не просто раціон, а відчуття, ніби хтось нарешті подбав про мене. Навіть мій психотерапевт схвалив :)"
            },
            {
                name: "Анна Левицька",
                location: "Київ, 35 років",
                avatar: "assets/img/review1.jpg",
                text: "Було страшно, що буде дорого, але коли я підрахувала, скільки грошей я витрачала на перекуси — EasyBody вийшов навіть дешевше. І ще смачніше. Дякую!"
            },
            {
                name: "Ярослав Демчук",
                location: "Львів, 26 років",
                avatar: "assets/img/review3.jpg",
                text: "В мене 3 роботи, я взагалі не готую. А тут — відкрив контейнер, з'їв, пішов. Смачно, сито, і мозок не болить. Люблю"
            },
            {
                name: "Ігор Павленко",
                location: "Харків, 28 років",
                avatar: "assets/img/review2.jpg",
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
                avatar: "assets/img/review3.jpg",
                text: "В мене 3 роботи, я взагалі не готую. А тут — відкрив контейнер, з'їв, пішов. Смачно, сито, і мозок не болить. Люблю"
            },
            {
                name: "Марія Коваль",
                location: "Житомир, 24 роки",
                avatar: "assets/img/review4.jpg",
                text: "У мене були дуже складні стосунки із їжею — то переїдаю, то забуваю поїсти. EasyBody дав мені не просто раціон, а відчуття, ніби хтось нарешті подбав про мене. Навіть мій психотерапевт схвалив :)"
            },
            {
                name: "Ігор Павленко",
                location: "Харків, 28 років",
                avatar: "assets/img/review2.jpg",
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
                    <source src="assets/video/testimonial.mp4" type="video/mp4">
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

// Инициализация карусели
document.addEventListener('DOMContentLoaded', function() {
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
}); 