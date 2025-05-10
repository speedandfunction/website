/**
 * Animation context for counter
 * @typedef {Object} CounterContext
 * @property {Element} element - The counter element
 * @property {number} target - Target value to count to
 * @property {number} duration - Animation duration in milliseconds
 * @property {number} startTime - Animation start timestamp
 * @property {IntersectionObserver} observer - Observer instance
 */

/**
 * Updates the counter animation for a smooth counting effect
 * @param {CounterContext} context - The counter animation context
 * @param {number} currentTime - The current animation frame timestamp
 */
const updateCounter = function (context, currentTime) {
  const { element, target, duration, startTime, observer } = context;
  const elapsedTime = currentTime - startTime;
  const progress = Math.min(elapsedTime / duration, 1);
  const currentCount = Math.ceil(progress * target);
  element.innerText = currentCount;

  if (progress < 1) {
    requestAnimationFrame((newTime) => updateCounter(context, newTime));
  } else {
    element.innerText = target;
    if (observer) {
      observer.unobserve(element);
    }
  }
};

/**
 * Function to handle counter animation when it becomes visible
 * @param {IntersectionObserverEntry} entry - The intersection entry
 * @param {IntersectionObserver} observer - The observer instance
 */
const handleCounterVisible = function (entry, observer) {
  const counter = entry.target;
  const target = Number(counter.getAttribute('data-target'));
  const duration = 2000;
  const startTime = performance.now();

  const context = {
    element: counter,
    target,
    duration,
    startTime,
    observer,
  };

  requestAnimationFrame((currentTime) => updateCounter(context, currentTime));
};

/**
 * Initialize smooth counters on the page
 */
const initSmoothCounters = function () {
  const counters = document.querySelectorAll('.sf-counter__num');
  if (counters.length > 0) {
    apos.util.onReady(() => {
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              handleCounterVisible(entry, observer);
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
