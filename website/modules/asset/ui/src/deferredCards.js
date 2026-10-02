/**
 * Deferred case study cards
 * The listing renders only the first batch of cards. The remaining cards are
 * fetched as an HTML fragment when the browser is idle (or immediately when
 * the user starts searching/filtering or returns to a saved scroll position),
 * then the filter UI is refreshed so search, counts and numbering cover every
 * card.
 */

import { getSavedScrollPosition } from './scrollMemory';
import { initImageLozad } from './initImageLozad';
import { refreshFilterUi } from './js/caseFilters/render';

const IDLE_TIMEOUT_MS = 2000;
const EAGER_EVENTS = ['focusin', 'pointerdown', 'keydown'];
const EAGER_SELECTOR = '.cs_search-bar-form, .tags-filter, .clear-all';

const scheduleIdle = (callback) => {
  if ('requestIdleCallback' in window) {
    window.requestIdleCallback(callback, { timeout: IDLE_TIMEOUT_MS });
    return;
  }
  setTimeout(callback, 200);
};

const fetchCards = async (url) => {
  const response = await fetch(url, { credentials: 'same-origin' });
  if (!response.ok) {
    throw new Error(`Deferred cards request failed: ${response.status}`);
  }
  const doc = new DOMParser().parseFromString(
    await response.text(),
    'text/html',
  );
  return Array.from(doc.querySelectorAll('.cs_card'));
};

const appendCards = (grid, cards) => {
  const fragment = document.createDocumentFragment();
  cards.forEach((card) =>
    fragment.appendChild(document.importNode(card, true)),
  );
  grid.appendChild(fragment);
  initImageLozad();
  refreshFilterUi();
};

const loadDeferredCards = async function (marker, grid, savedScroll) {
  try {
    appendCards(grid, await fetchCards(marker.dataset.url));
    marker.remove();
    if (savedScroll) {
      window.scrollTo(0, savedScroll);
    }
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Failed to load remaining case studies:', error);
  }
};

/*
 * Fetch the remaining cards once: when the browser is idle, or right away on
 * the first interaction with search/filters or when a scroll position must be
 * restored. A marker detached by navigation turns later triggers into no-ops.
 */
const initDeferredCards = function () {
  const marker = document.getElementById('cs-deferred-cards');
  const grid = document.getElementById('case-studies-grid');
  if (!marker || !grid) {
    return;
  }

  /*
   * Read before index.js clears it: a saved position means the user is
   * returning from a case study and the page must be tall enough to restore.
   */
  const savedScroll = getSavedScrollPosition(window.location.href);
  const listeners = {};
  let started = false;

  const load = () => {
    EAGER_EVENTS.forEach((name) => {
      document.removeEventListener(name, listeners.onEager, true);
    });
    if (started || !marker.isConnected) {
      return;
    }
    started = true;
    loadDeferredCards(marker, grid, savedScroll);
  };

  listeners.onEager = (event) => {
    if (event.target.closest && event.target.closest(EAGER_SELECTOR)) {
      load();
    }
  };
  EAGER_EVENTS.forEach((name) => {
    document.addEventListener(name, listeners.onEager, true);
  });

  if (savedScroll === null) {
    scheduleIdle(load);
    return;
  }
  load();
};

export { initDeferredCards };
