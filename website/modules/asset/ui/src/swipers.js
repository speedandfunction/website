import { Navigation } from 'swiper/modules';
import Swiper from 'swiper';

// Array of swiper configurations
const swiperConfigs = [
  {
    selector: '.swiper-counter',
    config: {
      direction: 'vertical',
      loop: true,
      autoplay: {
        delay: 5000,
      },
    },
  },
  {
    selector: '.sf-projects-swiper',
    config: {
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
    },
  },
  {
    selector: '.sf-person-swiper',
    config: {
      init: false,
      navigation: {
        el: '.swiper-nav',
        nextEl: '.swiper-button-next',
        prevEl: '.swiper-button-prev',
      },
      modules: [Navigation],
      slidesPerView: 1,
      spaceBetween: 0,
      breakpoints: {
        768: {
          slidesPerView: 2,
        },
        1200: {
          slidesPerView: 3,
        },
      },
    },
  },
  {
    selector: '.sf-trusted-leaders-swiper',
    config: {
      init: false,
      loop: true,
      navigation: {
        el: '.sf-trusted-leaders__controls',
        nextEl: '.sf-trusted-leaders__next',
        prevEl: '.sf-trusted-leaders__prev',
      },
      modules: [Navigation],
      slidesPerView: 1,
      spaceBetween: 0,
    },
  },
];

// Initialize all swipers with a single function
const initAllSwipers = function () {
  swiperConfigs.forEach(({ selector, config }) => {
    if (document.querySelector(selector)) {
      const elements = document.querySelectorAll(selector);

      elements.forEach(function (element) {
        const swiperConfig = { ...config };
        const swiper = new Swiper(element, swiperConfig);
        swiper.init();

        // Keyboard activation for custom navigation controls (role="button").
        const nav = element.querySelector(config.navigation.el);
        if (nav) {
          nav.addEventListener('keydown', function (event) {
            if (event.key !== 'Enter' && event.key !== ' ') {
              return;
            }
            const target = event.target.closest(
              '.sf-trusted-leaders__prev, .sf-trusted-leaders__next',
            );
            if (!target) {
              return;
            }
            event.preventDefault();
            if (target.classList.contains('sf-trusted-leaders__prev')) {
              swiper.slidePrev();
            } else {
              swiper.slideNext();
            }
          });
        }
      });
    }
  });
};

export { initAllSwipers };
