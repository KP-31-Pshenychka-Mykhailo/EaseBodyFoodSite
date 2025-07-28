document.addEventListener('DOMContentLoaded', function() {
  const gallery = document.querySelector('.gallery-cards');
  const left = document.querySelector('.gallery-arrow-left');
  const right = document.querySelector('.gallery-arrow-right');
  if (!gallery || !left || !right) return;

  // Загрузка данных о блюдах
  fetch('EaseBodyFoodSite/assets/data/dishes.json')
    .catch(() => fetch('assets/data/dishes.json'))
    .then(response => response.json())
    .then(dishes => {
        const galleryGrid = document.getElementById('galleryGrid');
        if (!galleryGrid) return;

        dishes.forEach(dish => {
            const dishCard = document.createElement('div');
            dishCard.className = 'dish-card';
            dishCard.innerHTML = `
                <img src="${dish.img ? dish.img : 'EaseBodyFoodSite/assets/img/food1.jpg'}" alt="${dish.name}" class="dish-image">
                <div class="dish-info">
                    <h3>${dish.name}</h3>
                    <p>${dish.description}</p>
                    <div class="dish-meta">
                        <span class="calories">${dish.calories} ккал</span>
                        <span class="protein">${dish.protein}г білків</span>
                    </div>
                </div>
            `;
            galleryGrid.appendChild(dishCard);
        });
    })
    .catch(error => {
        console.error('Ошибка загрузки данных о блюдах:', error);
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