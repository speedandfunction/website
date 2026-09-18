import { gsap } from 'gsap';

/*
 * The header lives outside the Barba container, so it persists across page
 * transitions. When navigating away from mid-page on overlay pages (where the
 * header is position: absolute and scrolls out of view), reset the scroll to
 * the top and slide the header in from the upper edge of the screen instead
 * of letting it pop in instantly.
 */
const scrollToTopAndRevealHeader = function () {
  const header = document.querySelector('.sf-header');
  const headerOutOfView = header && header.getBoundingClientRect().bottom <= 0;

  window.scrollTo(0, 0);

  if (headerOutOfView) {
    gsap.from(header, {
      yPercent: -100,
      duration: 0.6,
      ease: 'power3.out',
      clearProps: 'transform',
    });
  }
};

export { scrollToTopAndRevealHeader };
