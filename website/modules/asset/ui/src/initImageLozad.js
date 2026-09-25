import lozad from 'lozad';

const initImageLozad = function () {
  document.querySelectorAll('[data-object-position]').forEach((image) => {
    image.style.objectPosition = image.dataset.objectPosition;
  });

  const observer = lozad('.lozad', { rootMargin: '200px 0px' });
  observer.observe();
};

export { initImageLozad };
