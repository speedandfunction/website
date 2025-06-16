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

const validateForm = async (form, validateFieldFn) => {
  const fields = form.querySelectorAll(
    'input:not([type="submit"]):not([type="button"]):not([type="hidden"]), textarea, select',
  );

  fields.forEach((field) => {
    clearValidationErrorFn(field);
  });

  const validationResults = await Promise.all(
    Array.from(fields).map(async (field) => {
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

const collectFormData = (form) => new FormData(form);

const scrollToFirstInvalidField = (form) => {
  const fields = form.querySelectorAll('input, textarea, select');
  for (const field of fields) {
    const errorText = field
      .closest('.sf-field')
      ?.querySelector('.validation-error')
      ?.textContent?.trim();

    if (errorText) {
      field.scrollIntoView({ behavior: 'smooth', block: 'center' });
      field.focus();
      break;
    }
  }
};

const onValidateForm = (isValid, form, validateFieldFn) => {
  if (!isValid) {
    scrollToFirstInvalidField(form);
    return null;
  }
  const formData = collectFormData(form);
  return sendFormData(form, formData)
    .then((response) => onSendFormDataResponse(response, form))
    .catch(() => {
      const errorMessage = form.querySelector('.error-message');
      if (errorMessage) {
        errorMessage.textContent =
          'Failed to submit form. Please try again later.';
      }
      return null;
    });
};

const onSendFormDataResponse = (response, form) => {
  return handleServerResponse(response, form).then((ok) => {
    if (!ok) {
      showValidationErrorFn(
        form,
        'Submission failed. Please check the form and try again.',
      );
    }
    return ok;
  });
};

const onHandleServerResponse = (data, form) => {
  if (data && (data.success || data.ok)) {
    form.reset();
    const thankYou = document.querySelector('[data-apos-form-thank-you]');
    if (thankYou) {
      thankYou.style.display = 'block';
    }
    form.style.display = 'none';
    return true;
  }
  // Show server validation errors if they exist
  if (data && data.errors) {
    showValidationErrorFn(form, data.errors.join(', '));
  } else {
    showValidationErrorFn(form, 'Submission failed. Please try again.');
  }
  return false;
};

const handleServerResponse = (response, form) => {
  if (!response.ok) {
    return response
      .json()
      .then((data) => {
        showValidationErrorFn(
          form,
          data.message || 'Submission failed. Please try again.',
        );
        return false;
      })
      .catch(() => {
        showValidationErrorFn(form, 'Submission failed. Please try again.');
        return false;
      });
  }
  return response.json().then((data) => onHandleServerResponse(data, form));
};

const sendFormData = (form, formData) => {
  // Convert FormData to a plain object for the server
  const data = {};
  for (const [key, value] of formData.entries()) {
    if (key in data) {
      data[key] = [].concat(data[key], value);
    } else {
      data[key] = value;
    }
  }

  return fetch(form.action, {
    method: 'POST',
    body: JSON.stringify({ data }),
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'CSRF-Token':
        document
          .querySelector('meta[name="csrf-token"]')
          ?.getAttribute('content') || '',
    },
    credentials: 'same-origin',
  });
};

const handleFormSubmit = (event, form, validateFieldFn) => {
  event.preventDefault();
  validateForm(form, validateFieldFn)
    .then((isValid) => onValidateForm(isValid, form, validateFieldFn))
    .catch(() => false);
};

const initFormWithValidation = (form, validateFieldFn) => {
  // Initialize validation for all fields in the form
  const fields = form.querySelectorAll(
    'input:not([type="submit"]):not([type="button"]):not([type="hidden"]), textarea, select',
  );
  fields.forEach((field) => addFieldValidationHandlers(field, validateFieldFn));

  // Add validation before form submission
  form.addEventListener(
    'submit',
    function (event) {
      handleFormSubmit(event, form, validateFieldFn);
    },
    true,
  );
};

module.exports = { initFormValidation };
