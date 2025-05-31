const {
  STANDARD_FORM_FIELD_NAMES,
} = require('../../../../shared-constants/ui/src/index');
const { validateField } = require('./formValidator');
const { showValidationError, clearValidationError } = require('./domHelpers');

const addFieldValidationHandlers = (field) => {
  field.addEventListener('blur', async (event) => {
    const result = await validateField(event.target, event.target.value);
    if (result.isValid) {
      clearValidationError(event.target);
    } else {
      showValidationError(event.target, result.message);
    }
  });

  field.addEventListener('input', (event) => {
    clearValidationError(event.target);
  });
};

const handleFormSubmit = (form) => async (event) => {
  event.preventDefault();

  const isValid = await validateForm(form);

  if (isValid) {
    form.submit();
  }
};

const validateForm = async (form) => {
  const fields = form.querySelectorAll('input, textarea, select');
  let isFormValid = true;

  fields.forEach((field) => {
    clearValidationError(field);
  });

  const validationPromises = Array.from(fields)
    .filter((field) => !['submit', 'button', 'hidden'].includes(field.type))
    .map(async (field) => {
      const result = await validateField(field, field.value);
      if (!result.isValid) {
        showValidationError(field, result.message);
        isFormValid = false;
      }
    });

  await Promise.all(validationPromises);

  return isFormValid;
};

const initFormWithValidation = (form) => {
  form.addEventListener('submit', handleFormSubmit(form));

  const fieldNames = Object.values(STANDARD_FORM_FIELD_NAMES);

  const selector = fieldNames.map((name) => `input[name="${name}"]`).join(', ');

  const fields = form.querySelectorAll(selector);

  fields.forEach(addFieldValidationHandlers);
};

const initFormValidation = () => {
  document.addEventListener('DOMContentLoaded', () => {
    const forms = document.querySelectorAll('.sf-form');
    forms.forEach(initFormWithValidation);
  });
};

module.exports = { initFormValidation };
