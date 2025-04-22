/* eslint-disable sonarjs/no-nested-functions */
import barba from '@barba/core';
import Swiper from 'swiper/bundle';
import { Navigation } from 'swiper/modules';
import gsap from 'gsap';
import lozad from 'lozad';

export default () => {
  // Init all scripts after first visiting the page
  initializeAllComponents();

  // Barba pages
  if (document.querySelector('[data-barba="container"]')) {
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

              // Trigger video play after transition
              const video = data.next.container.querySelector('video');
              if (video) {
                video.play();
              }

              // Call the wrapper function to initialize all components
              initializeAllComponents();

              /*
               * Toggle the menu state
               * document.querySelector('[data-header-menu]').classList.toggle('close');
               */

              // Remove the previou page container to avoid blinking
              data.current.container.remove();

              return gsap.from(data.next.container, {
                opacity: 0,
              });
            },
          },
        ],
      });
    });
  }

  // Anchor Navigation
  if (document.querySelector('a[href^="#"]')) {
    apos.util.onReady(() => {
      document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
        anchor.addEventListener('click', function (e) {
          e.preventDefault();
          const target = document.querySelector(this.getAttribute('href'));
          target.scrollIntoView({
            behavior: 'smooth',
          });
        });
      });
    });
  }

  // Lazy loading
  function initImageLozad() {
    const observer = lozad(); // Lazy loads elements with default selector as '.lozad'
    observer.observe();
  }

  // Counter vertical carousel
  function initCounterSwiper() {
    if (document.querySelector('.swiper-counter')) {
      apos.util.onReady(
        () =>
          new Swiper('.swiper-counter', {
            direction: 'vertical',
            loop: true,
            autoplay: {
              delay: 5000,
            },
          }),
      );
    }
  }

  // Projects carousel
  function initClientsSwiper() {
    if (document.querySelector('.sf-projects-swiper')) {
      apos.util.onReady(
        () =>
          new Swiper('.sf-projects-swiper', {
            mousewheel: {
              forceToAxis: true,
            },
            loop: true,
            navigation: {
              el: '.swiper-nav',
              nextEl: '.swiper-button-next',
              prevEl: '.swiper-button-prev',
            },
            modules: [Navigation],
            slidesPerView: 1,
          }),
      );
    }
  }

  // Persons carousel
  function initTeamSwiper() {
    if (document.querySelector('.sf-person-swiper')) {
      apos.util.onReady(
        () =>
          new Swiper('.sf-person-swiper', {
            loop: true,
            navigation: {
              el: '.swiper-nav',
              nextEl: '.swiper-button-next',
              prevEl: '.swiper-button-prev',
            },
            modules: [Navigation],
            slidesPerView: 1,
            breakpoints: {
              768: {
                slidesPerView: 3,
              },
            },
          }),
      );
    }
  }
  // Change fonts for the hero FUTURE word
  function initFontChanger() {
    const heroContent = document.querySelector('.sf-hero-content strong');
    if (heroContent) {
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
        heroContent.style.fontFamily = fonts[currentFontIndex];
      }, 500);
    }
  }

  // Counter smooth animation
  function initSmoothCounters() {
    const counters = document.querySelectorAll('.sf-counter__num');
    if (counters.length > 0) {
      apos.util.onReady(() => {
        const observer = new IntersectionObserver(
          (entries) => {
            entries.forEach((entry) => {
              if (entry.isIntersecting) {
                const counter = entry.target;
                const target = Number(counter.getAttribute('data-target'));
                const duration = 2000; // Duration of the animation in milliseconds
                const startTime = performance.now();
                // eslint-disable-next-line sonarjs/no-nested-functions
                const updateCounter = (currentTime) => {
                  const elapsedTime = currentTime - startTime;
                  const progress = Math.min(elapsedTime / duration, 1);
                  const currentCount = Math.ceil(progress * target);
                  counter.innerText = currentCount;
                  if (progress < 1) {
                    requestAnimationFrame(updateCounter);
                  } else {
                    counter.innerText = target;
                  }
                };
                requestAnimationFrame(updateCounter);
                observer.unobserve(counter);
              }
            });
          },
          { threshold: 0.1 },
        );
        counters.forEach((counter) => {
          observer.observe(counter);
        });
      });
    }
  }

  // Wrapper function
  function initializeAllComponents() {
    initImageLozad();
    initCounterSwiper();
    initClientsSwiper();
    initTeamSwiper();
    initSmoothCounters();
    initFontChanger();
  }

  apos.util.onReady(() => {
    // Menu Open
    const menuButton = document.querySelector('[data-menu-button]');
    const menu = document.querySelector('[data-menu]');

    if (menuButton && menu) {
      menuButton.addEventListener('click', () => {
        menu.classList.toggle('open');
        menuButton.classList.toggle('open');
      });
    }
  });

  // Check if in edit mode
  if (apos.adminBar) {
    initSmoothCounters();
  }
};
