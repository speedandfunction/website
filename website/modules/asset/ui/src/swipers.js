import Swiper from 'swiper/bundle';
import { Navigation } from 'swiper/modules';

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
    }
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
    }
  },
  {
    selector: '.sf-person-swiper',
    config: {
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
    }
  }
];

// Initialize all swipers with a single function
export function initAllSwipers() {
  swiperConfigs.forEach(({ selector, config }) => {
    if (document.querySelector(selector)) {
      apos.util.onReady(() => new Swiper(selector, config));
    }
  });
} 