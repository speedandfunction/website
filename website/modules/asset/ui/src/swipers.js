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
      breakpoints: {
        768: {
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
        // Handle testimonials with 2 cards differently
        if (element.classList.contains('sf-testimonials')) {
          const testimonialCount = element.getAttribute(
            'data-testimonial-count',
          );
          const swiperConfig = { ...config };

          // For 2 testimonials, show both at desktop size
          if (testimonialCount === '2') {
            swiperConfig.breakpoints = {
              768: {
                slidesPerView: 2,
              },
            };
          }

          const swiper = new Swiper(element, swiperConfig);
          swiper.init();
        } else {
          apos.util.onReady(function () {
            const swiper = new Swiper(element, config);
            return swiper;
          });
        }
      });
    }
  });
};

export { initAllSwipers };
