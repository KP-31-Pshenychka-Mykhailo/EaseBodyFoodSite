document.addEventListener('DOMContentLoaded', function() {
  const gallery = document.querySelector('.gallery-cards');
  const left = document.querySelector('.gallery-arrow-left');
  const right = document.querySelector('.gallery-arrow-right');
  if (!gallery || !left || !right) return;

  // Загрузка и отображение 5 случайных блюд
  fetch('../assets/data/dishes.json')
    .then(response => response.json())
    .then(dishes => {
      // Фильтруем только блюда с картинками (если нужно)
      // const filtered = dishes.filter(d => d.img && d.img.trim() !== '');
      // Берём любые блюда:
      const shuffled = dishes.sort(() => 0.5 - Math.random());
      const selected = shuffled.slice(0, 5);
      gallery.innerHTML = selected.map(dish => `
        <div class="gallery-card">
          <img src="${dish.img ? dish.img : '../assets/img/food1.jpg'}" alt="${dish.title}" class="gallery-img">
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
      // Добавляем обработчики для сердечек
      document.querySelectorAll('.gallery-heart').forEach(function(heart) {
        heart.addEventListener('click', function() {
          heart.classList.toggle('active');
        });
      });
    });

  const scrollStep = 320; 

  left.addEventListener('click', function() {
    gallery.scrollBy({ left: -scrollStep, behavior: 'smooth' });
  });
  right.addEventListener('click', function() {
    gallery.scrollBy({ left: scrollStep, behavior: 'smooth' });
  });
});

document.getElementById('galleryLeft').onclick = function() {
    document.getElementById('galleryCards').scrollBy({ left: -350, behavior: 'smooth' });
};
document.getElementById('galleryRight').onclick = function() {
    document.getElementById('galleryCards').scrollBy({ left: 350, behavior: 'smooth' });
}; 