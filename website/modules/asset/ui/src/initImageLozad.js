import lozad from 'lozad';

const initImageLozad = function () {
  document.querySelectorAll('[data-object-position]').forEach((image) => {
    image.style.objectPosition = image.dataset.objectPosition;
  });

  const observer = lozad();
  observer.observe();
};

export { initImageLozad };
