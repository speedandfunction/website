import { closeNavSubmenus, initNavSubmenus } from './initNavSubmenus';

export const setMenuOpen = function (menu, menuButton, isOpen) {
  menu.classList.toggle('open', isOpen);
  menuButton.classList.toggle('open', isOpen);
  menuButton.setAttribute('aria-expanded', String(isOpen));
};

export const initMenuToggle = function () {
  apos.util.onReady(() => {
    const menuButton = document.getElementById('nav-icon');
    const menu = document.querySelector('[data-menu]');

    if (!menuButton || !menu) return;

    menuButton.addEventListener('click', () => {
      const isOpen = !menu.classList.contains('open');
      if (!isOpen) {
        closeNavSubmenus(menu);
      }
      setMenuOpen(menu, menuButton, isOpen);
    });

    initNavSubmenus(menu);

    document.addEventListener('keydown', (event) => {
      if (event.key !== 'Escape') {
        return;
      }

      if (closeNavSubmenus(menu, { focusToggle: true })) {
        return;
      }

      if (!menu.classList.contains('open')) {
        return;
      }

      setMenuOpen(menu, menuButton, false);
      menuButton.focus();
    });

    const menuLinks = menu.querySelectorAll('a');
    menuLinks.forEach((link) => {
      link.addEventListener('click', () => {
        if (apos.user) return;

        closeNavSubmenus(menu);
        setMenuOpen(menu, menuButton, false);
      });
    });
  });
};

export const initSkipLink = function () {
  const skipLink = document.querySelector('.sf-skip-link');
  const main = document.getElementById('main');
  if (!skipLink || !main) {
    return;
  }

  skipLink.addEventListener('click', () => {
    requestAnimationFrame(() => {
      main.focus({ preventScroll: false });
    });
  });
};
