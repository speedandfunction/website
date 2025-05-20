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
      });
    }
  });
};

export { initAllSwipers };
