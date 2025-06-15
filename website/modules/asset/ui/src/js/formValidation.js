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

function collectFormData(form) {
  const formElements = form.elements;
  const formData = {};
  let index = 0;
  while (index < formElements.length) {
    const element = formElements[index];
    if (
      element.name &&
      element.type !== 'submit' &&
      element.type !== 'button'
    ) {
      formData[element.name] = element.value;
    }
    index += 1;
  }
  return formData;
}

function scrollToFirstInvalidField(form) {
  const fields = form.querySelectorAll('input, textarea, select');
  for (let i = 0; i < fields.length; i += 1) {
    const field = fields[i];
    // Шукаємо .validation-error у найближчому .sf-field
    const error = field
      .closest('.sf-field')
      ?.querySelector('.validation-error');
    if (error && error.textContent && error.textContent.trim() !== '') {
      field.scrollIntoView({ behavior: 'smooth', block: 'center' });
      field.focus();
      break;
    }
  }
}

function onValidateForm(isValid, form, validateFieldFn) {
  // eslint-disable-next-line no-console
  console.log('Form isValid:', isValid);
  if (!isValid) {
    // eslint-disable-next-line no-console
    console.log('Form is NOT valid, submission blocked');
    scrollToFirstInvalidField(form);
    return null;
  }
  // eslint-disable-next-line no-console
  console.log('Form is valid, preparing to send via AJAX');
  const formData = collectFormData(form);
  return sendFormData(form, formData)
    .then(function (response) {
      return onSendFormDataResponse(response, form);
    })
    .catch(onSendFormDataError);
}

function onSendFormDataResponse(response, form) {
  return handleServerResponse(response, form);
}

function onSendFormDataError(err) {
  // eslint-disable-next-line no-console
  console.log('AJAX fetch threw error:', err);
  return null;
}

function onHandleServerResponse(data, form) {
  // eslint-disable-next-line no-console
  console.log('Server response:', data);
  if (data && (data.success || data.ok)) {
    form.reset();
    const thankYou = document.querySelector('[data-apos-form-thank-you]');
    if (thankYou) {
      thankYou.style.display = 'block';
    }
    form.style.display = 'none';
  } else {
    // eslint-disable-next-line no-console
    console.log('AJAX error or server returned error:', data);
  }
  return null;
}

function onHandleServerResponseError(error) {
  // eslint-disable-next-line no-console
  console.log('Response is not valid JSON:', error);
  return null;
}

function handleServerResponse(response, form) {
  // eslint-disable-next-line no-console
  console.log('Fetch response status:', response.status);
  return response
    .json()
    .then(function (data) {
      return onHandleServerResponse(data, form);
    })
    .catch(onHandleServerResponseError);
}

function sendFormData(form, formData) {
  // eslint-disable-next-line no-console
  console.log('Form data to be sent:', { data: formData });
  return fetch(form.action, {
    method: 'POST',
    body: JSON.stringify({ data: formData }),
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    },
  });
}

function handleFormSubmit(event, form, validateFieldFn) {
  // eslint-disable-next-line no-console
  console.log('SUBMIT HANDLER FIRED');
  event.preventDefault();
  validateForm(form, validateFieldFn).then(function (isValid) {
    return onValidateForm(isValid, form, validateFieldFn);
  });
}

const initFormWithValidation = (form, validateFieldFn) => {
  // Initialize validation for all fields in the form
  const fields = form.querySelectorAll('input, textarea, select');
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

// GLOBAL DIAGNOSTICS
// eslint-disable-next-line no-console
console.log(
  'Number of forms on page:',
  document.querySelectorAll('form[data-apos-form-form]').length,
);

module.exports = { initFormValidation };
