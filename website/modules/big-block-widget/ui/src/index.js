import { ScrollTrigger } from 'gsap/ScrollTrigger';
// eslint-disable-next-line import/no-named-as-default
import gsap from 'gsap';

gsap.registerPlugin(ScrollTrigger);

const animateWidget = (widget) => {
  // Animate the main widget container on scroll
  gsap.to(widget, {
    scrollTrigger: {
      trigger: widget,
      start: 'top 80%',
      end: 'top 20%',
      toggleActions: 'play none none reverse',
    },
    opacity: 1,
    // eslint-disable-next-line id-length
    y: 0,
    duration: 0.8,
    ease: 'power2.out',
  });
};

const animateHeroLines = (widget) => {
  const heroLines = widget.querySelectorAll('.sf-big-block-widget__hero-line');
  if (heroLines.length) {
    gsap.from(heroLines, {
      scrollTrigger: {
        trigger: widget,
        start: 'top 80%',
      },
      opacity: 0,
      // eslint-disable-next-line id-length
      y: 20,
      duration: 0.7,
      stagger: 0.15,
      ease: 'power2.out',
    });
  }
};

const animateCta = (widget) => {
  const cta = widget.querySelector('.sf-big-block-widget__cta');
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
      delay: 0.2,
      ease: 'power2.out',
    });

    // Add hover animation to CTA
    cta.addEventListener('mouseenter', () => {
      gsap.to(cta, {
        scale: 1.05,
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

const animateBodyText = (widget) => {
  const introText = widget.querySelector('.sf-big-block-widget__intro');
  if (introText) {
    gsap.from(introText, {
      scrollTrigger: {
        trigger: widget,
        start: 'top 80%',
      },
      opacity: 0,
      // eslint-disable-next-line id-length
      y: 20,
      duration: 0.8,
      delay: 0.3,
      ease: 'power2.out',
    });
  }
};

const animateTestimonials = (widget) => {
  const testimonials = widget.querySelectorAll(
    '.sf-big-block-widget__testimonial',
  );
  if (testimonials.length) {
    gsap.from(testimonials, {
      scrollTrigger: {
        trigger: widget,
        start: 'top 60%',
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

const animateFinalCta = (widget) => {
  const finalCta = widget.querySelector('.sf-big-block-widget__final-cta');
  if (finalCta) {
    gsap.from(finalCta, {
      scrollTrigger: {
        trigger: finalCta,
        start: 'top 80%',
      },
      opacity: 0,
      // eslint-disable-next-line id-length
      y: 30,
      duration: 0.8,
      ease: 'power2.out',
    });
  }
};

const initBigBlockWidget = () => {
  const widgets = document.querySelectorAll('.sf-big-block-widget');

  widgets.forEach((widget) => {
    animateWidget(widget);
    animateHeroLines(widget);
    animateCta(widget);
    animateBodyText(widget);
    animateTestimonials(widget);
    animateFinalCta(widget);
  });
};

// Default export function required by ApostropheCMS
export default () => {
  // Initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initBigBlockWidget);
  } else {
    initBigBlockWidget();
  }
};
