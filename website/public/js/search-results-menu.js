document.addEventListener('DOMContentLoaded', function() {
  const menuButton = document.getElementById('nav-icon');
  const menu = document.querySelector('[data-menu]');

  if (!menuButton || !menu) return;

  menuButton.addEventListener('click', () => {
    const isOpen = menu.classList.toggle('open');
    menuButton.classList.toggle('open');
    menuButton.setAttribute('aria-expanded', isOpen);
  });

  const menuLinks = menu.querySelectorAll('a');
  menuLinks.forEach((link) => {
    link.addEventListener('click', () => {
      menu.classList.remove('open');
      menuButton.classList.remove('open');
      menuButton.setAttribute('aria-expanded', 'false');
    });
  });

  // Close menu when clicking outside
  document.addEventListener('click', (event) => {
    if (!menu.contains(event.target) && !menuButton.contains(event.target)) {
      menu.classList.remove('open');
      menuButton.classList.remove('open');
      menuButton.setAttribute('aria-expanded', 'false');
    }
  });
});
