/* eslint-disable sonarjs/no-nested-functions */

export function initSmoothCounters() {
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

export default initSmoothCounters; 