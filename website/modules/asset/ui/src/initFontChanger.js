const initFontChanger = function () {
  const heroContent = document.querySelector('.sf-hero-content strong');
  if (!heroContent) return;

  const fonts = [
    'Poppins',
    'Philosopher',
    'Pinyon Script',
    'Racing Sans One',
    'Poiret One',
    'Redacted Script',
    'Redressed',
    'Rock 3D',
    'Rubik Glitch Pop',
    'Yesteryear',
    'Roboto Mono',
    'Pixelify Sans',
  ];
  let currentFontIndex = 0;

  setInterval(() => {
    currentFontIndex = (currentFontIndex + 1) % fonts.length;
    const currentFont = fonts.at(currentFontIndex);
    heroContent.style.fontFamily = currentFont;
  }, 500);
};

export { initFontChanger };
