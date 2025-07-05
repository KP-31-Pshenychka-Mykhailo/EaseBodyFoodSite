document.addEventListener('DOMContentLoaded', function() {
  const gallery = document.querySelector('.gallery-cards');
  const left = document.querySelector('.gallery-arrow-left');
  const right = document.querySelector('.gallery-arrow-right');
  if (!gallery || !left || !right) return;

  const scrollStep = 320; // ширина карточки + gap

  left.addEventListener('click', function() {
    gallery.scrollBy({ left: -scrollStep, behavior: 'smooth' });
  });
  right.addEventListener('click', function() {
    gallery.scrollBy({ left: scrollStep, behavior: 'smooth' });
  });
}); 