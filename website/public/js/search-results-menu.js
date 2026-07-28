document.addEventListener('DOMContentLoaded', function() {
  const menuButton = document.getElementById('nav-icon');
  const menu = document.querySelector('[data-menu]');

  if (!menuButton || !menu) return;

  menuButton.addEventListener('click', () => {
    menu.classList.toggle('open');
    menuButton.classList.toggle('open');
  });

  const menuLinks = menu.querySelectorAll('a');
  menuLinks.forEach((link) => {
    link.addEventListener('click', () => {
      menu.classList.remove('open');
      menuButton.classList.remove('open');
    });
  });

  // Close menu when clicking outside
  document.addEventListener('click', (event) => {
    if (!menu.contains(event.target) && !menuButton.contains(event.target)) {
      menu.classList.remove('open');
      menuButton.classList.remove('open');
    }
  });
});
