document.addEventListener('DOMContentLoaded', function() {
  // Вставка header
  fetch('partials/header.html')
    .then(res => res.text())
    .then(html => {
      document.getElementById('header').innerHTML = html;
      setActiveNav();
    });
  // Вставка footer
  fetch('partials/footer.html')
    .then(res => res.text())
    .then(html => {
      document.getElementById('footer').innerHTML = html;
    });

  function setActiveNav() {
    const path = window.location.pathname.split('/').pop();
    document.querySelectorAll('nav a').forEach(link => {
      const href = link.getAttribute('href');
      if (href === path || (href === 'index.html' && (path === '' || path === '/'))) {
        link.classList.add('active');
      } else {
        link.classList.remove('active');
      }
    });
  }
}); 