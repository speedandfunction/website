import barba from '@barba/core';
import { gsap } from 'gsap';
import { initAllSwipers } from './swipers';
import { initSmoothCounters } from './smoothCounters';
import lozad from 'lozad';

// Lazy loading
function initImageLozad() {
  // Lazy loads elements with default selector as '.lozad'
  const observer = lozad();
  observer.observe();
}

// Change fonts for the hero FUTURE word
function initFontChanger() {
  const heroContent = document.querySelector('.sf-hero-content strong');
  if (!heroContent) return;

  const fonts = [
    'Poppins',
    'Philosopher',
    'Pinyon Script',
    'Racing Sans One',
    'Poiret One',
    'Redacted Script',
    'Redressed',
    'Rock 3D',
    'Rubik Glitch Pop',
    'Yesteryear',
    'Roboto Mono',
    'Pixelify Sans',
  ];
  let currentFontIndex = 0;

  setInterval(() => {
    currentFontIndex = (currentFontIndex + 1) % fonts.length;
    // Use Array.prototype.at() for safer array access
    const currentFont = fonts.at(currentFontIndex);
    heroContent.style.fontFamily = currentFont;
  }, 500);
}

// Tag search filter for case studies page
function bindTagSearch() {
  const searchInputs = document.querySelectorAll('.tag-search');
  searchInputs.forEach((input) => {
    if (input.tagSearchHandler) {
      input.removeEventListener('input', input.tagSearchHandler);
    }
    const handler = () => {
      const filterValue = input.value.trim().toLowerCase();
      const tagList = input
        .closest('.filter-section')
        .querySelectorAll('.tag-item');
      tagList.forEach((tagItem) => {
        const tagLabel = tagItem.dataset.label;
        if (tagLabel.includes(filterValue)) {
          tagItem.style.display = '';
        } else {
          tagItem.style.display = 'none';
        }
      });
    };
    input.tagSearchHandler = handler;
    input.addEventListener('input', handler);
  });
}

// Wrapper function
function initializeAllComponents() {
  initImageLozad();
  initAllSwipers();
  initSmoothCounters();
  initFontChanger();
  bindTagSearch();
}

// Barba pages
function initBarbaPageTransitions() {
  if (!document.querySelector('[data-barba="container"]')) return;

  apos.util.onReady(() => {
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
          enter(data) {
            // Scroll to the top after page transition
            window.scrollTo(0, 0);

            // Close menu if it's open
            const menuButton = document.getElementById('nav-icon');
            const menu = document.querySelector('[data-menu]');

            if (menuButton && menu) {
              menu.classList.remove('open');
              menuButton.classList.remove('open');
            }

            // Trigger video play after transition
            const video = data.next.container.querySelector('video');
            if (video) {
              video.play();
            }

            // Call the wrapper function to initialize all components
            initializeAllComponents();

            // Remove the previous page container to avoid blinking
            data.current.container.remove();

            return gsap.from(data.next.container, {
              opacity: 0,
            });
          },
        },
      ],
    });

    // Add after hook for updating menu state
    barba.hooks.after(() => {
      // Update menu active state
      const currentPath = window.location.pathname;
      const menuLinks = document.querySelectorAll('.sf-nav__list a');

      // First, remove active class from all menu items
      menuLinks.forEach((link) => link.classList.remove('active'));

      // Then, add active class to the current menu item
      menuLinks.forEach((link) => {
        const href = link.getAttribute('href');
        const hrefPath = new URL(href, window.location.origin).pathname;
        if (hrefPath === currentPath) {
          link.classList.add('active');
        }
      });
    });
  });
}

// Anchor Navigation
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
    // Menu Open
    const menuButton = document.getElementById('nav-icon');
    const menu = document.querySelector('[data-menu]');

    if (!menuButton || !menu) return;

    menuButton.addEventListener('click', () => {
      menu.classList.toggle('open');
      menuButton.classList.toggle('open');
    });

    // Close menu when clicking on menu items for non-logged users
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
  // Init all scripts after first visiting the page
  initializeAllComponents();

  initBarbaPageTransitions();
  initAnchorNavigation();
  initMenuToggle();

  // Check if in edit mode
  if (apos.adminBar) {
    initSmoothCounters();
  }
};
