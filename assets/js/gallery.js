document.addEventListener('DOMContentLoaded', function() {
  const gallery = document.querySelector('.gallery-cards');
  const left = document.querySelector('.gallery-arrow-left');
  const right = document.querySelector('.gallery-arrow-right');
  if (!gallery) return;

  // Загрузка и отображение 5 случайных блюд
  // Пробуем разные пути для dishes.json
  fetch('assets/data/dishes.json')
    .catch(() => fetch('../assets/data/dishes.json'))
    .then(response => response.json())
    .then(dishes => {
      // Фильтруем только блюда с картинками (если нужно)
      // const filtered = dishes.filter(d => d.img && d.img.trim() !== '');
      // Берём любые блюда:
      const shuffled = dishes.sort(() => 0.5 - Math.random());
      const selected = shuffled.slice(0, 5);
      // Создаем карточки
      window.cardsHTML = selected.map(dish => `
        <div class="gallery-card" data-dish-id="${dish.id}">
          <img src="${dish.img ? dish.img : 'assets/img/food1.jpg'}" alt="${dish.title}" class="gallery-img">
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
        const cardWidth = getCardWidth();
        gallery.scrollLeft = cardWidth * 10; // Начинаем с середины
        updateActiveCard(); // Устанавливаем активную карточку
      }, 100);
      
      // Добавляем обработчики для сердечек
      addHeartHandlers();
    });

  // Обработчики для кнопок (только на десктопе)
  if (left && right) {
    left.addEventListener('click', function() {
      const cardWidth = getCardWidth();
      gallery.scrollBy({ left: -cardWidth, behavior: 'smooth' });
      setTimeout(addMoreCards, 300);
      setTimeout(centerCards, 600);
    });
    right.addEventListener('click', function() {
      const cardWidth = getCardWidth();
      gallery.scrollBy({ left: cardWidth, behavior: 'smooth' });
      setTimeout(addMoreCards, 300);
      setTimeout(centerCards, 600);
    });
  }

  // Свайп-функциональность для мобильных устройств
  let startX = 0;
  let currentX = 0;
  let isDragging = false;
  let startScrollLeft = 0;
  let startTime = 0;

  // Функция для определения ширины карточки
  function getCardWidth() {
    const card = gallery.querySelector('.gallery-card');
    if (card) {
      if (window.innerWidth > 700) {
        return card.offsetWidth + 32; // 32px - десктопный gap
      } else {
        return card.offsetWidth + 16; // 16px - мобильный gap
      }
    }
    return window.innerWidth > 700 ? 377 : 280; // fallback (345 + 32 для десктопа, 220 + 60 для мобильных)
  }

  // Функция для добавления обработчиков сердечек (теперь использует универсальный HeartsManager)
  function addHeartHandlers() {
    if (window.heartsManager) {
      window.heartsManager.refresh();
    }
  }

  // Функция для центрирования карточек на десктопе
  function centerCards() {
    if (window.innerWidth > 700) {
      const cardWidth = getCardWidth();
      const currentScrollLeft = gallery.scrollLeft;
      const targetScrollLeft = Math.round(currentScrollLeft / cardWidth) * cardWidth;
      if (Math.abs(currentScrollLeft - targetScrollLeft) > 10) {
        gallery.scrollTo({ left: targetScrollLeft, behavior: 'smooth' });
      }
    }
  }

  // Функция для определения активной карточки на мобильных
  function updateActiveCard() {
    if (window.innerWidth <= 700) {
      const cards = gallery.querySelectorAll('.gallery-card');
      const cardWidth = getCardWidth();
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
  function addMoreCards() {
    const cardWidth = getCardWidth();
    const originalCardsCount = 5;
    const currentScrollLeft = gallery.scrollLeft;
    const totalWidth = gallery.scrollWidth;
    
    // Если приближаемся к концу, добавляем копии в конец
    if (currentScrollLeft + gallery.clientWidth >= totalWidth - cardWidth * 2) {
      gallery.insertAdjacentHTML('beforeend', window.cardsHTML);
      addHeartHandlers(); // Добавляем обработчики для новых сердечек
    }
    
    // Если приближаемся к началу, добавляем копии в начало
    if (currentScrollLeft <= cardWidth * 2) {
      gallery.insertAdjacentHTML('afterbegin', window.cardsHTML);
      gallery.scrollLeft += cardWidth * originalCardsCount;
      addHeartHandlers(); // Добавляем обработчики для новых сердечек
    }
  }



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
    scrollTimeout = setTimeout(addMoreCards, 100);
    
    // Обновляем активную карточку при скролле
    updateActiveCard();
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
    const cardWidth = getCardWidth();
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
      setTimeout(updateActiveCard, 300);
    } else {
      // Возвращаемся к текущей карточке
      gallery.scrollTo({ left: startScrollLeft, behavior: 'smooth' });
    }
  });

  // Mouse события для десктопа отключены - только кнопки навигации
  // gallery.addEventListener('mousedown', function(e) {
  //   if (window.innerWidth <= 700) return; // Только на десктопе
  //   startX = e.clientX;
  //   startScrollLeft = gallery.scrollLeft;
  //   startTime = Date.now();
  //   isDragging = true;
  //   gallery.style.cursor = 'grabbing';
  // });

  // gallery.addEventListener('mousemove', function(e) {
  //   if (!isDragging || window.innerWidth <= 700) return;
  //   e.preventDefault();
  //   currentX = e.clientX;
  //   const diff = startX - currentX;
  //   gallery.scrollLeft = startScrollLeft + diff;
  // });

  // gallery.addEventListener('mouseup', function(e) {
  //   if (!isDragging || window.innerWidth <= 700) return;
  //   isDragging = false;
  //   gallery.style.cursor = 'grab';
    
  //   const diff = startX - currentX;
  //   const cardWidth = getCardWidth();
  //   const threshold = cardWidth / 3;
    
  //   if (Math.abs(diff) > threshold) {
  //     if (diff > 0) {
  //       gallery.scrollBy({ left: cardWidth, behavior: 'smooth' });
  //     } else {
  //       gallery.scrollBy({ left: -cardWidth, behavior: 'smooth' });
  //     }
  //     setTimeout(centerCards, 600);
  //     setTimeout(updateActiveCard, 300);
  //   } else {
  //     gallery.scrollTo({ left: startScrollLeft, behavior: 'smooth' });
  //   }
  // });

  // gallery.addEventListener('mouseleave', function() {
  //   if (isDragging) {
  //     isDragging = false;
  //     gallery.style.cursor = 'grab';
  //   }
  // });

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
      console.log('Клик по карточке:', card);
      
      // Пример: показать название блюда
      const titleElement = card.querySelector('.gallery-card-title');
      if (titleElement) {
        const title = titleElement.textContent;
        alert('Выбрано блюдо: ' + title);
        // Здесь можно заменить alert на модальное окно или другую логику
      }
    }
  });
});

 