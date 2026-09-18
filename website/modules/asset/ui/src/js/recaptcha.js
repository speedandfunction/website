let recaptchaScriptPromise = null;
let recaptchaObserver = null;

const getRecaptchaWidgets = (container) => {
  const widgets = Array.from(container.querySelectorAll('.g-recaptcha'));
  if (container.matches?.('.g-recaptcha')) widgets.unshift(container);
  return widgets;
};

const renderRecaptchaWidgets = (container) => {
  if (!window.grecaptcha?.render) return;

  getRecaptchaWidgets(container).forEach((widget) => {
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
  const widgets = getRecaptchaWidgets(container);
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

const observeRecaptcha = () => {
  if (recaptchaObserver || !document.body) return;

  recaptchaObserver = new MutationObserver((mutations) => {
    mutations.forEach(({ addedNodes }) => {
      addedNodes.forEach((node) => {
        if (node.nodeType === Node.ELEMENT_NODE) initRecaptcha(node);
      });
    });
  });
  recaptchaObserver.observe(document.body, { childList: true, subtree: true });
};

const startRecaptcha = () => {
  observeRecaptcha();
  initRecaptcha();
};

export { initRecaptcha, startRecaptcha };
