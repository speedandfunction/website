const { clearValidationError } = require('./domHelpers');

const handleRecaptchaValueChange = function (
  recaptchaResponse,
  form,
  clearValidationErrorFn = clearValidationError,
) {
  if (recaptchaResponse.value) {
    clearValidationErrorFn(recaptchaResponse);
    const recaptchaError = form.querySelector(
      '[data-apos-form-recaptcha-error]',
    );
    if (recaptchaError) {
      recaptchaError.classList.add('apos-form-hidden');
    }
  }
};

const observeRecaptcha = function (form, cleanupRef, pollIntervalRef) {
  const recaptchaResponse = form.querySelector('#g-recaptcha-response');
  if (recaptchaResponse) {
    const handleInput = () => {
      handleRecaptchaValueChange(recaptchaResponse, form);
    };
    recaptchaResponse.addEventListener('input', handleInput);
    let lastValue = recaptchaResponse.value;
    pollIntervalRef.current = setInterval(() => {
      if (!document.body.contains(recaptchaResponse)) {
        clearInterval(pollIntervalRef.current);
        recaptchaResponse.removeEventListener('input', handleInput);
        return;
      }
      if (recaptchaResponse.value && recaptchaResponse.value !== lastValue) {
        lastValue = recaptchaResponse.value;
        handleRecaptchaValueChange(recaptchaResponse, form);
      }
    }, 500);
    cleanupRef.current = () => {
      if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
      recaptchaResponse.removeEventListener('input', handleInput);
    };
  }
};

const pollForRecaptcha = function (
  form,
  observeFn,
  pollForRecaptchaTimeoutRef,
  cleanupRef,
) {
  let pollCount = 0;
  const poll = function () {
    if (form.querySelector('#g-recaptcha-response')) {
      observeFn();
    } else if (pollCount < 20) {
      pollCount += 1;
      pollForRecaptchaTimeoutRef.current = setTimeout(poll, 100);
    }
  };
  poll();
};

const addRecaptchaValidationHandlers = function (form) {
  const pollIntervalRef = { current: null };
  const pollForRecaptchaTimeoutRef = { current: null };
  const cleanupRef = { current: null };

  const observeFn = () => observeRecaptcha(form, cleanupRef, pollIntervalRef);
  pollForRecaptcha(form, observeFn, pollForRecaptchaTimeoutRef, cleanupRef);

  return () => {
    if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
    if (pollForRecaptchaTimeoutRef.current)
      clearTimeout(pollForRecaptchaTimeoutRef.current);
    if (cleanupRef.current) cleanupRef.current();
  };
};

module.exports = { addRecaptchaValidationHandlers, handleRecaptchaValueChange };
