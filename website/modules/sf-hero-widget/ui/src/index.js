import { ScrollTrigger } from 'gsap/ScrollTrigger';
// eslint-disable-next-line import/no-named-as-default
import gsap from 'gsap';

gsap.registerPlugin(ScrollTrigger);

const isEditMode = (widget) => {
  return (
    Boolean(window.apos?.adminBar) ||
    document.body.classList.contains('apos-is-admin') ||
    document.body.classList.contains('apos-has-admin-bar') ||
    Boolean(widget?.closest?.('[data-apos-widget]')) ||
    Boolean(widget?.closest?.('[data-apos-refreshable]'))
  );
};

const makeWidgetVisible = (widget) => {
  /* eslint-disable id-length */
  gsap.set(widget, { opacity: 1, y: 0, clearProps: 'transform,opacity' });
  const animElements = widget.querySelectorAll(
    '.sf-hero-section__heading-pre, .sf-hero-section__heading-main, .sf-hero-section__cta, .sf-hero-section__right',
  );
  if (animElements.length) {
    gsap.set(animElements, {
      opacity: 1,
      y: 0,
      clearProps: 'transform,opacity',
    });
  }
  /* eslint-enable id-length */
};

const animateHeading = (widget) => {
  const headingPre = widget.querySelector('.sf-hero-section__heading-pre');
  const headingMain = widget.querySelector('.sf-hero-section__heading-main');
  const lines = [headingPre, headingMain].filter(Boolean);

  if (lines.length) {
    gsap.from(lines, {
      scrollTrigger: {
        trigger: widget,
        start: 'top 80%',
      },
      opacity: 0,
      // eslint-disable-next-line id-length
      y: 30,
      duration: 0.8,
      stagger: 0.15,
      ease: 'power2.out',
    });
  }
};

const animateCta = (widget) => {
  const cta = widget.querySelector('.sf-hero-section__cta');
  if (cta) {
    gsap.from(cta, {
      scrollTrigger: {
        trigger: widget,
        start: 'top 80%',
      },
      opacity: 0,
      // eslint-disable-next-line id-length
      y: 20,
      duration: 0.8,
      delay: 0.4,
      ease: 'power2.out',
    });

    cta.addEventListener('mouseenter', () => {
      gsap.to(cta, {
        scale: 1.03,
        duration: 0.3,
        ease: 'power2.out',
      });
    });

    cta.addEventListener('mouseleave', () => {
      gsap.to(cta, {
        scale: 1,
        duration: 0.3,
        ease: 'power2.out',
      });
    });
  }
};

const animateBody = (widget) => {
  const body = widget.querySelector('.sf-hero-section__right');
  if (body) {
    gsap.from(body, {
      scrollTrigger: {
        trigger: widget,
        start: 'top 80%',
      },
      opacity: 0,
      // eslint-disable-next-line id-length
      y: 20,
      duration: 0.8,
      delay: 0.5,
      ease: 'power2.out',
    });
  }
};

const initSingleWidget = (widget) => {
  if (isEditMode(widget)) {
    makeWidgetVisible(widget);
    return;
  }

  animateHeading(widget);
  animateCta(widget);
  animateBody(widget);
};

const initSfHeroWidget = () => {
  const widgets = document.querySelectorAll('.sf-hero-section');
  widgets.forEach((widget) => {
    initSingleWidget(widget);
  });
};

// Default export function required by ApostropheCMS
export default () => {
  if (window.apos?.util?.widgetPlayers) {
    window.apos.util.widgetPlayers['sf-hero-section'] = {
      selector: '[data-sf-hero-widget]',
      player: function (el) {
        initSingleWidget(el);
      },
    };
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initSfHeroWidget);
  } else {
    initSfHeroWidget();
  }
};
