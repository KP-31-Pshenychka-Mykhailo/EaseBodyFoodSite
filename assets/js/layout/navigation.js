document.addEventListener('DOMContentLoaded', function() {
  // Инициализируем навигацию после загрузки хедера
  setTimeout(() => {
    setActiveNav();
    setupBurgerMenu();
  }, 200);

  function setActiveNav() {
    const path = window.location.pathname.split('/').pop();
    
    const navLinks = document.querySelectorAll('.main-nav a');
    
    navLinks.forEach((link) => {
      const href = link.getAttribute('href');
     
      const hrefFileName = href.split('/').pop();
      
     
      let isActive = false;
      
    
      if (hrefFileName === 'index.html' && (path === '' || path === '/' || path === 'index.html')) {
        isActive = true;
      }
     
      else if (hrefFileName === path) {
        isActive = true;
      }
      
      if (isActive) {
        link.classList.add('active');
      } else {
        link.classList.remove('active');
      }
    });
  }

  function setupBurgerMenu() {
    const burger = document.getElementById('burgerBtn');
    const nav = document.getElementById('mainNav');
    
    if (!burger || !nav) {
      return;
    }
    
    burger.addEventListener('click', function(e) {
      burger.classList.toggle('active');
      nav.classList.toggle('open');
    });

    document.addEventListener('click', function(e) {
      if (window.innerWidth > 900) return;
      if (!nav.classList.contains('open')) return;
      if (!nav.contains(e.target) && e.target !== burger) {
        burger.classList.remove('active');
        nav.classList.remove('open');
      }
    });

    document.addEventListener('keydown', function(e) {
      if (e.key === 'Escape') {
        burger.classList.remove('active');
        nav.classList.remove('open');
      }
    });

    window.addEventListener('resize', function() {
      if (window.innerWidth >= 1000) {
        burger.classList.remove('active');
        nav.classList.remove('open');
      }
    });
  }
}); 