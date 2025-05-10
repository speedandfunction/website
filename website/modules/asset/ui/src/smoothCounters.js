const initSmoothCounters = function initSmoothCounters() {
  const counters = document.querySelectorAll('.sf-counter__num');
  if (counters.length > 0) {
    apos.util.onReady(() => {
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              const counter = entry.target;
              const target = Number(counter.getAttribute('data-target'));
              // Duration of the animation in milliseconds
              const duration = 2000;
              const startTime = performance.now();

              const updateCounter = function updateCounter(currentTime) {
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
};

export { initSmoothCounters };
export default initSmoothCounters;