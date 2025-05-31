const showValidationError = (field, message) => {
  const wrapper = field.closest('.apos-form-input-wrapper');
  if (!wrapper) return;

  let errorElement = wrapper.querySelector('.validation-error');

  if (!errorElement) {
    errorElement = document.createElement('div');
    errorElement.className = 'validation-error';

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

  const errorElement = wrapper.querySelector('.validation-error');
  if (errorElement) {
    errorElement.textContent = '';
  }

  field.classList.remove('has-error');
};

module.exports = { showValidationError, clearValidationError };
