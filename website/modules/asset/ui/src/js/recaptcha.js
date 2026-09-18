let recaptchaScriptPromise = null;

const renderRecaptchaWidgets = (container) => {
  if (!window.grecaptcha?.render) return;

  container.querySelectorAll('.g-recaptcha').forEach((widget) => {
    if (widget.dataset.recaptchaRendered || widget.querySelector('iframe')) {
      widget.dataset.recaptchaRendered = 'true';
      return;
    }

    try {
      window.grecaptcha.render(widget, {
        sitekey: widget.dataset.sitekey,
        size: widget.dataset.size || 'normal',
      });
      widget.dataset.recaptchaRendered = 'true';
    } catch {}
  });
};

const loadRecaptchaScript = () => {
  if (window.grecaptcha?.render) return Promise.resolve();
  if (recaptchaScriptPromise) return recaptchaScriptPromise;

  recaptchaScriptPromise = new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = 'https://www.google.com/recaptcha/api.js?render=explicit';
    script.async = true;
    script.defer = true;
    script.onload = resolve;
    script.onerror = reject;
    document.head.appendChild(script);
  });

  return recaptchaScriptPromise;
};

const initRecaptcha = (container = document) => {
  const widgets = container.querySelectorAll('.g-recaptcha');
  if (!widgets.length) return;

  if (window.grecaptcha?.render) {
    renderRecaptchaWidgets(container);
    return;
  }

  loadRecaptchaScript()
    .then(() => renderRecaptchaWidgets(container))
    .catch(() => {
      recaptchaScriptPromise = null;
    });
};

export { initRecaptcha };
