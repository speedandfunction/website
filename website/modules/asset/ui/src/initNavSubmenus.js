/*
 * Header nav submenus.
 *
 * Desktop: the dropdown opens on hover/focus via CSS only. In the Figma
 * design the panel spans from the parent item's left edge to the right edge
 * of the following nav item, and CSS alone cannot reach into the sibling,
 * so the width is measured here. The mobile menu keeps its own full-width
 * inline panel, toggled by the chevron button.
 */
export const initNavSubmenus = (menu) => {
  const sizeSubmenus = () => {
    const isDesktop = window.matchMedia('(min-width: 1200px)').matches;
    menu.querySelectorAll('.sf-nav__item--has-sub').forEach((item) => {
      const submenu = item.querySelector('.sf-nav__submenu');
      if (!submenu) return;
      const next = item.nextElementSibling;
      if (isDesktop && next) {
        submenu.style.width = `${next.offsetLeft + next.offsetWidth - item.offsetLeft}px`;
      } else {
        submenu.style.width = '';
      }
    });
  };
  sizeSubmenus();
  window.addEventListener('resize', sizeSubmenus);
  // Re-measure once webfonts load, as fallback fonts change item widths
  if (document.fonts && document.fonts.addEventListener) {
    document.fonts.addEventListener('loadingdone', sizeSubmenus);
  }

  menu.querySelectorAll('.sf-nav__sub-toggle').forEach((toggle) => {
    toggle.addEventListener('click', () => {
      const item = toggle.closest('.sf-nav__item--has-sub');
      if (!item) return;

      const isOpen = item.classList.toggle('open');
      toggle.setAttribute('aria-expanded', String(isOpen));
    });
  });
};
