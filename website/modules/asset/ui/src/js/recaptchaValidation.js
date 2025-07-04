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

const addRecaptchaValidationHandlers = (form) => {
  // Only observe the textarea#g-recaptcha-response (do NOT create any input)
  const observeRecaptcha = () => {
    const recaptchaResponse = form.querySelector('#g-recaptcha-response');
    if (recaptchaResponse) {
      // Listen for input events (covers user interaction)
      recaptchaResponse.addEventListener('input', () => {
        handleRecaptchaValueChange(recaptchaResponse, form);
      });
      // Poll for value changes (covers programmatic updates by reCAPTCHA)
      let lastValue = recaptchaResponse.value;
      setInterval(() => {
        if (recaptchaResponse.value && recaptchaResponse.value !== lastValue) {
          lastValue = recaptchaResponse.value;
          handleRecaptchaValueChange(recaptchaResponse, form);
        }
      }, 200);
    }
  };

  // ReCAPTCHA textarea may not exist immediately, so poll for it
  let pollCount = 0;
  const pollForRecaptcha = () => {
    if (form.querySelector('#g-recaptcha-response')) {
      observeRecaptcha();
    } else if (pollCount < 20) {
      // Try for up to 2 seconds
      pollCount += 1;
      setTimeout(pollForRecaptcha, 100);
    }
  };
  pollForRecaptcha();
};

module.exports = { addRecaptchaValidationHandlers, handleRecaptchaValueChange };
