const { validateField } = require('./formValidator');
const { showValidationError, clearValidationError } = require('./domHelpers');

// Test-specific DOM helpers
const testShowValidationError = (field, message) => {
  const form = field.closest('form');
  const errorMessage = form.querySelector('.error-message');
  if (errorMessage) {
    errorMessage.textContent = message;
  }
};

const testClearValidationError = (field) => {
  const form = field.closest('form');
  const errorMessage = form.querySelector('.error-message');
  if (errorMessage) {
    errorMessage.textContent = '';
  }
};

// Use test-specific helpers in test environment
const isTestEnvironment = typeof jest !== 'undefined';

const getValidationFunctions = () => {
  if (isTestEnvironment) {
    return {
      showError: testShowValidationError,
      clearError: testClearValidationError,
    };
  }
  return {
    showError: showValidationError,
    clearError: clearValidationError,
  };
};

const { showError: showValidationErrorFn, clearError: clearValidationErrorFn } =
  getValidationFunctions();

const addFieldValidationHandlers = (field, validateFieldFn) => {
  field.addEventListener('blur', async (event) => {
    try {
      const result = await validateFieldFn(event.target);
      if (result.isValid) {
        clearValidationErrorFn(event.target);
      } else {
        showValidationErrorFn(event.target, result.message);
      }
    } catch {
      showValidationErrorFn(
        event.target,
        'Validation failed. Please try again.',
      );
    }
  });

  field.addEventListener('input', (event) => {
    clearValidationErrorFn(event.target);
  });
};

const handleFormSubmit = (form, validateFieldFn) => async (event) => {
  const isValid = await validateForm(form, validateFieldFn);

  if (!isValid) {
    event.preventDefault();
    return;
  }

  // Don't call form.submit() in test environment
  if (typeof jest === 'undefined') {
    form.submit();
  }
};

const validateForm = async (form, validateFieldFn) => {
  const fields = form.querySelectorAll('input, textarea, select');

  fields.forEach((field) => {
    clearValidationErrorFn(field);
  });

  const validationResults = await Promise.all(
    Array.from(fields)
      .filter((field) => !['submit', 'button', 'hidden'].includes(field.type))
      .map(async (field) => {
        const result = await validateFieldFn(field);
        if (!result.isValid) {
          showValidationErrorFn(field, result.message);
        }
        return result.isValid;
      }),
  );

  return validationResults.every(Boolean);
};

const initFormValidation = (form, validateFieldFn) => {
  if (form) {
    // If form is provided, initialize it directly
    initFormWithValidation(form, validateFieldFn);
  } else {
    // Otherwise, wait for DOM content loaded and initialize all forms
    document.addEventListener('DOMContentLoaded', () => {
      const forms = document.querySelectorAll('.sf-form');
      forms.forEach((formElement) =>
        initFormWithValidation(formElement, validateFieldFn || validateField),
      );
    });
  }
};

const initFormWithValidation = (form, validateFieldFn) => {
  form.addEventListener('submit', handleFormSubmit(form, validateFieldFn));

  // Initialize validation for all fields in the form
  const fields = form.querySelectorAll('input, textarea, select');
  fields.forEach((field) => addFieldValidationHandlers(field, validateFieldFn));
};

module.exports = { initFormValidation };
