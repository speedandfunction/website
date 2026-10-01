/*
 * Delegate instead of binding per anchor: pages swapped in by Barba after
 * init contain new `a[href^="#"]` elements that were never captured by a
 * one-time querySelectorAll.
 */
const initAnchorNavigation = function () {
  apos.util.onReady(() => {
    document.addEventListener('click', (event) => {
      if (
        event.button !== 0 ||
        event.metaKey ||
        event.ctrlKey ||
        event.shiftKey ||
        event.altKey
      ) {
        return;
      }

      const anchor = event.target?.closest?.('a[href^="#"]');
      if (!anchor) return;

      const hash = anchor.getAttribute('href');
      if (!hash || hash.length <= 1) return;

      const target = document.getElementById(hash.slice(1));
      if (!target) return;

      event.preventDefault();
      target.scrollIntoView({
        behavior: 'smooth',
      });
    });
  });
};

export { initAnchorNavigation };
