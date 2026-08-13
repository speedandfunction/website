import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

function initBigBlockWidget() {
  const widgets = document.querySelectorAll('.sf-big-block-widget');

  widgets.forEach((widget) => {
    // Animate the main widget container on scroll
    gsap.to(widget, {
      scrollTrigger: {
        trigger: widget,
        start: 'top 80%',
        end: 'top 20%',
        toggleActions: 'play none none reverse',
      },
      opacity: 1,
      y: 0,
      duration: 0.8,
      ease: 'power2.out',
    });

    // Animate hero section lines with stagger
    const heroLines = widget.querySelectorAll('.sf-big-block-widget__hero-line');
    if (heroLines.length) {
      gsap.from(heroLines, {
        scrollTrigger: {
          trigger: widget,
          start: 'top 80%',
        },
        opacity: 0,
        y: 20,
        duration: 0.7,
        stagger: 0.15,
        ease: 'power2.out',
      });
    }

    // Animate CTA button
    const cta = widget.querySelector('.sf-big-block-widget__cta');
    if (cta) {
      gsap.from(cta, {
        scrollTrigger: {
          trigger: widget,
          start: 'top 80%',
        },
        opacity: 0,
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

    // Animate body text
    const introText = widget.querySelector('.sf-big-block-widget__intro');
    if (introText) {
      gsap.from(introText, {
        scrollTrigger: {
          trigger: widget,
          start: 'top 80%',
        },
        opacity: 0,
        y: 20,
        duration: 0.8,
        delay: 0.3,
        ease: 'power2.out',
      });
    }

    // Animate testimonials with stagger
    const testimonials = widget.querySelectorAll('.sf-big-block-widget__testimonial');
    if (testimonials.length) {
      gsap.from(testimonials, {
        scrollTrigger: {
          trigger: widget,
          start: 'top 60%',
        },
        opacity: 0,
        y: 30,
        duration: 0.8,
        stagger: 0.15,
        ease: 'power2.out',
      });
    }

    // Animate final CTA section
    const finalCta = widget.querySelector('.sf-big-block-widget__final-cta');
    if (finalCta) {
      gsap.from(finalCta, {
        scrollTrigger: {
          trigger: finalCta,
          start: 'top 80%',
        },
        opacity: 0,
        y: 30,
        duration: 0.8,
        ease: 'power2.out',
      });
    }
  });
}

// Default export function required by ApostropheCMS
export default function() {
  // Initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initBigBlockWidget);
  } else {
    initBigBlockWidget();
  }
}
