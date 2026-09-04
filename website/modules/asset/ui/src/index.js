/* eslint-disable sort-imports */
import barba from '@barba/core';
import { enhanceBarbaWithFilterHandling } from './enhanceBarbaWithFilterHandling';
import { gsap } from 'gsap';
import { initAllSwipers } from './swipers';
import { initCaseStudiesFilterHandler } from './initCaseStudiesFilterHandler';
import { initFormValidation } from './js/formValidation';
import { initPhoneFormatting } from './js/phoneFormat';
import { initSmoothCounters } from './smoothCounters';
import { initFontChanger } from './initFontChanger';
import { initImageLozad } from './initImageLozad';
import { setupTagSearchForInput } from './searchInputHandler';
import { initClientSideFiltering } from './clientSideFiltering';
import {
  saveScrollPosition,
  getSavedScrollPosition,
  clearSavedScrollPosition,
} from './scrollMemory';

function revealLoaded() {
  document
    .querySelectorAll(
      '.breadcrumb.loading, .sf-container.loading, .page-main_content.loading',
    )
    .forEach((el) => {
      el.classList.remove('loading');
      el.classList.add('loaded');
      if (el.hasAttribute('aria-busy')) {
        el.setAttribute('aria-busy', 'false');
      }
    });
}

function initConfiguration() {
  window.DEFAULT_VISIBLE_TAGS_COUNT = 5;
  const container = document.querySelector('.cs_container');
  if (container) {
    const defaultVisibleTags = container.getAttribute(
      'data-default-visible-tags',
    );
    if (defaultVisibleTags) {
      const parsed = parseInt(defaultVisibleTags, 10);
      if (!isNaN(parsed) && parsed > 0) {
        window.DEFAULT_VISIBLE_TAGS_COUNT = parsed;
      }
    }
  }
}

function initCaseStudiesTagFilter({
  inputSelector = '.tag-search',
  containerSelector = '.filter-section',
  tagSelector = '.tag-item',
  getTagLabel = (tagItem) => tagItem.dataset.label?.toLowerCase() || '',
} = {}) {
  const searchInputs = document.querySelectorAll(inputSelector);
  searchInputs.forEach((input) =>
    setupTagSearchForInput(input, {
      containerSelector,
      tagSelector,
      getTagLabel,
    }),
  );
}

function initializeAllComponents() {
  initImageLozad();
  initAllSwipers();
  initSmoothCounters();
  initFontChanger();
  initFormValidation();
  initPhoneFormatting();
  initCaseStudiesTagFilter();
  initCaseStudiesFilterHandler();
  initClientSideFiltering();
}

function initBarbaPageTransitions() {
  if (!document.querySelector('[data-barba="container"]')) return;

  apos.util.onReady(() => {
    initCaseStudiesFilterHandler();

    const originalEnterCallback = function (data, hasFilterAnchor) {
      if (!hasFilterAnchor) {
        const nextUrl = data.next.url.href;
        const savedScroll = getSavedScrollPosition(nextUrl);
        if (savedScroll === null) {
          window.scrollTo(0, 0);
        } else {
          // Restore the scroll position when returning to the cases listing.
          window.scrollTo(0, savedScroll);
        }
      }

      const menuButton = document.getElementById('nav-icon');
      const menu = document.querySelector('[data-menu]');
      if (menuButton && menu) {
        menu.classList.remove('open');
        menuButton.classList.remove('open');
      }

      const video = data.next.container.querySelector('video');
      if (video) {
        video.play();
      }

      initializeAllComponents();

      // Initialize Apostrophe forms before removing old content
      const initializeApostropheForm = (container) => {
        const form = container.querySelector('form[data-apos-form-form]');
        if (!form) {
          // No form to wire up, so the SPA transition is already sufficient.
          return true;
        }

        if (typeof window?.apos?.aposForm?.enableAll !== 'function') {
          // The form runtime only self-registers on a full page load.
          return false;
        }

        window.apos.aposForm.enableAll();
        return true;
      };

      // Initialize Apostrophe forms (already inside apos.util.onReady)
      const willReload = !initializeApostropheForm(data.next.container);

      if (willReload) {
        /*
         * A full reload is about to happen. Do NOT clear the saved scroll
         * position here; the load-time restore relies on it surviving the reload.
         */
        window.location.reload();
        return;
      }

      /*
       * SPA transition: the saved scroll position (if any) has been applied
       * above, so it is safe to clear now.
       */
      clearSavedScrollPosition();

      // Remove the previous page container to avoid blinking
      data.current.container.remove();

      return gsap.from(data.next.container, {
        opacity: 0,
      });
    };

    barba.init({
      prefetchIgnore: false,
      cacheIgnore: false,
      preventRunning: true,
      timeout: 10000,
      transitions: [
        {
          sync: false,
          name: 'opacity-transition',
          leave(data) {
            return gsap.to(data.current.container, {
              opacity: 0,
            });
          },
          enter: enhanceBarbaWithFilterHandling(originalEnterCallback),
        },
      ],
    });

    barba.hooks.beforeLeave((data) => {
      // Remember scroll position of the cases listing before navigating away.
      saveScrollPosition(data.current.url.href);
    });

    barba.hooks.after(() => {
      // Update menu active state
      const currentPath = window.location.pathname;
      const menuLinks = document.querySelectorAll('.sf-nav__list a');
      menuLinks.forEach((link) => link.classList.remove('active'));
      menuLinks.forEach((link) => {
        const href = link.getAttribute('href');
        const hrefPath = new URL(href, window.location.origin).pathname;
        if (hrefPath === currentPath) {
          link.classList.add('active');
        }
      });

      revealLoaded();
    });
  });
}

function initAnchorNavigation() {
  const anchors = document.querySelectorAll('a[href^="#"]');
  if (!anchors.length) return;

  apos.util.onReady(() => {
    anchors.forEach((anchor) => {
      anchor.addEventListener('click', function (event) {
        event.preventDefault();
        const target = document.querySelector(anchor.getAttribute('href'));
        target.scrollIntoView({
          behavior: 'smooth',
        });
      });
    });
  });
}

function initMenuToggle() {
  apos.util.onReady(() => {
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
        if (apos.user) return;

        menu.classList.remove('open');
        menuButton.classList.remove('open');
      });
    });
  });
}

export default () => {
  initConfiguration();

  initializeAllComponents();

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', revealLoaded);
  } else {
    revealLoaded();
  }

  apos.util.onReady(() => {
    initCaseStudiesFilterHandler();
  });

  initBarbaPageTransitions();
  initAnchorNavigation();
  initMenuToggle();

  /*
   * Restore scroll position when returning to the /cases listing after a full
   * page reload (Barba reloads pages without an Apostrophe form).
   */
  const restoredScroll = getSavedScrollPosition(window.location.href);
  if (restoredScroll !== null) {
    clearSavedScrollPosition();
    /*
     * Reassert the position over a short window to counter layout shifts from
     * lazily loaded images/content.
     */
    const reapply = (attempts) => {
      window.scrollTo(0, restoredScroll);
      if (attempts > 0) {
        setTimeout(() => reapply(attempts - 1), 100);
      }
    };
    reapply(5);
  }

  setTimeout(() => {
    // Do not hijack scroll if we are restoring a saved listing position.
    if (restoredScroll !== null) return;

    const { pathname, search, hash } = window.location;
    if (
      pathname.includes('/cases') &&
      (search.includes('industry') ||
        search.includes('stack') ||
        search.includes('caseStudyType') ||
        hash.includes('filter'))
    ) {
      const filterAnchor = document.getElementById('filter');
      if (filterAnchor) filterAnchor.scrollIntoView({ behavior: 'smooth' });
    }
  }, 300);

  if (apos.adminBar) initSmoothCounters();
};
