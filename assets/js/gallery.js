document.addEventListener('DOMContentLoaded', function() {
  const gallery = document.querySelector('.gallery-cards');
  const left = document.querySelector('.gallery-arrow-left');
  const right = document.querySelector('.gallery-arrow-right');
  if (!gallery || !left || !right) return;

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

document.querySelectorAll('.gallery-heart').forEach(function(heart) {
    heart.addEventListener('click', function() {
        heart.classList.toggle('active');
    });
}); 