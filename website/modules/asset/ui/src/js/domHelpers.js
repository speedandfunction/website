const showValidationError = (field, message) => {
  const wrapper = field.closest('.apos-form-input-wrapper');
  if (!wrapper) return;

  let errorClass = 'validation-error';
  if (field.type === 'checkbox') {
    errorClass = 'apos-form-error';
  }
  let errorElement = wrapper.querySelector(`.${errorClass}`);

  if (!errorElement) {
    errorElement = document.createElement('div');
    errorElement.className = errorClass;

    const dateHelp = wrapper.querySelector('.apos-form-help');
    if (dateHelp?.parentElement) {
      wrapper.insertBefore(errorElement, dateHelp.parentElement.nextSibling);
    } else {
      wrapper.appendChild(errorElement);
    }
  }

  errorElement.textContent = message;

  field.classList.add('has-error');
};

const clearValidationError = (field) => {
  const wrapper = field.closest('.apos-form-input-wrapper');
  if (!wrapper) return;

  let errorClass = 'validation-error';
  if (field.type === 'checkbox') {
    errorClass = 'apos-form-error';
  }
  const errorElement = wrapper.querySelector(`.${errorClass}`);
  if (errorElement) {
    errorElement.textContent = '';
  }

  field.classList.remove('has-error');
};

const showError = (field, message) => {
  const form = field.closest('form');
  if (!form) return;
  const errorMessage = form.querySelector('.error-message');
  if (errorMessage) {
    errorMessage.textContent = message;
  }
};

const clearError = (field) => {
  const form = field.closest('form');
  if (!form) return;
  const errorMessage = form.querySelector('.error-message');
  if (errorMessage) {
    errorMessage.textContent = '';
  }
};

module.exports = {
  showValidationError,
  clearValidationError,
  showError,
  clearError,
};
