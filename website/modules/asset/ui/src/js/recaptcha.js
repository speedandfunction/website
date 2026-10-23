let recaptchaScriptPromise = null;
let recaptchaObserver = null;

const getRecaptchaWidgets = (container) => {
  const widgets = Array.from(container.querySelectorAll('.g-recaptcha'));
  if (container.matches?.('.g-recaptcha')) {
    widgets.unshift(container);
  }
  return widgets;
};

const waitForGrecaptchaReady = () => {
  return new Promise((resolve, reject) => {
    if (!window.grecaptcha) {
      reject(new Error('grecaptcha missing'));
      return;
    }
    if (typeof window.grecaptcha.ready === 'function') {
      window.grecaptcha.ready(resolve);
      return;
    }
    resolve();
  });
};

const renderRecaptchaWidgets = (container) => {
  if (!window.grecaptcha?.render) {
    return;
  }

  getRecaptchaWidgets(container).forEach((widget) => {
    if (widget.dataset.recaptchaRendered || widget.querySelector('iframe')) {
      widget.dataset.recaptchaRendered = 'true';
      return;
    }
    if (!widget.dataset.sitekey) {
      return;
    }

    try {
      window.grecaptcha.render(widget, {
        sitekey: widget.dataset.sitekey,
        size: widget.dataset.size || 'normal',
      });
      widget.dataset.recaptchaRendered = 'true';
    } catch {
      /*
       * Google throws if the widget was already rendered; leave the node
       * unmarked only when no iframe was produced so a later pass can retry.
       */
      if (widget.querySelector('iframe')) {
        widget.dataset.recaptchaRendered = 'true';
      }
    }
  });
};

const loadRecaptchaScript = () => {
  if (window.grecaptcha?.render) {
    return waitForGrecaptchaReady();
  }
  if (recaptchaScriptPromise) {
    return recaptchaScriptPromise;
  }

  recaptchaScriptPromise = new Promise((resolve, reject) => {
    const existing = document.querySelector(
      'script[src*="google.com/recaptcha/api.js"]',
    );
    if (existing && window.grecaptcha?.render) {
      waitForGrecaptchaReady().then(resolve).catch(reject);
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://www.google.com/recaptcha/api.js?render=explicit';
    script.async = true;
    script.defer = true;
    script.onload = () => {
      waitForGrecaptchaReady().then(resolve).catch(reject);
    };
    script.onerror = () => {
      reject(new Error('Failed to load reCAPTCHA'));
    };
    document.head.appendChild(script);
  });

  recaptchaScriptPromise = recaptchaScriptPromise.catch((error) => {
    recaptchaScriptPromise = null;
    throw error;
  });

  return recaptchaScriptPromise;
};

const initRecaptcha = (container = document) => {
  const widgets = getRecaptchaWidgets(container);
  if (!widgets.length) {
    return;
  }

  loadRecaptchaScript()
    .then(() => {
      renderRecaptchaWidgets(container);
    })
    .catch(() => {
      recaptchaScriptPromise = null;
    });
};

const observeRecaptcha = () => {
  if (recaptchaObserver || !document.body) {
    return;
  }

  recaptchaObserver = new MutationObserver((mutations) => {
    mutations.forEach(({ addedNodes }) => {
      addedNodes.forEach((node) => {
        if (node.nodeType === Node.ELEMENT_NODE) {
          initRecaptcha(node);
        }
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
