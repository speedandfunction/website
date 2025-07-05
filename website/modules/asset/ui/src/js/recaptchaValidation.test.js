const { handleRecaptchaValueChange } = require('./recaptchaValidation');

describe('handleRecaptchaValueChange', () => {
  let form = null;
  let recaptchaTextarea = null;
  let errorMsg = null;
  let clearValidationErrorFn = null;

  beforeEach(() => {
    document.body.innerHTML = `
      <form id="test-form">
        <textarea id="g-recaptcha-response"></textarea>
        <p data-apos-form-recaptcha-error class="apos-form-captcha-error apos-form-hidden">Error</p>
      </form>
    `;
    form = document.getElementById('test-form');
    recaptchaTextarea = document.getElementById('g-recaptcha-response');
    errorMsg = form.querySelector('[data-apos-form-recaptcha-error]');
    clearValidationErrorFn = jest.fn();
  });

  afterEach(() => {
    jest.clearAllMocks();
    document.body.innerHTML = '';
  });

  it('calls clearValidationError and hides error if value is set', () => {
    errorMsg.classList.remove('apos-form-hidden');
    recaptchaTextarea.value = 'token';
    handleRecaptchaValueChange(recaptchaTextarea, form, clearValidationErrorFn);
    expect(clearValidationErrorFn).toHaveBeenCalledWith(recaptchaTextarea);
    expect(errorMsg.classList.contains('apos-form-hidden')).toBe(true);
  });

  it('does nothing if value is empty', () => {
    errorMsg.classList.remove('apos-form-hidden');
    recaptchaTextarea.value = '';
    handleRecaptchaValueChange(recaptchaTextarea, form, clearValidationErrorFn);
    expect(clearValidationErrorFn).not.toHaveBeenCalled();
    expect(errorMsg.classList.contains('apos-form-hidden')).toBe(false);
  });
});
