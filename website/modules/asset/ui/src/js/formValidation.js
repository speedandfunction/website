import * as yup from 'yup';
import { STANDARD_FORM_FIELD_NAMES } from '../../../../shared-constants/ui/src/index';

const fieldSpecificSchemas = {
  [STANDARD_FORM_FIELD_NAMES.FULL_NAME]: yup
    .string()
    .trim()
    .min(2, 'Name must contain at least 2 characters')
    .max(50, 'Name cannot be longer than 50 characters')
    .required('Name is required'),

  [STANDARD_FORM_FIELD_NAMES.EMAIL_ADDRESS]: yup
    .string()
    .email('Enter a valid email address')
    .test('domain-check', 'Check the domain part of the email', (value) => {
      if (!value) return true;
      // Domain check (minimum 2 characters after the dot)
      const parts = value.split('@');
      return (
        parts.length === 2 &&
        parts[1].includes('.') &&
        parts[1].split('.').pop().length >= 2
      );
    })
    .required('Email is required'),

  [STANDARD_FORM_FIELD_NAMES.PHONE_NUMBER]: yup
    .string()
    .test(
      'is-valid-international-phone',
      'Enter a valid phone number',
      (value) => {
        if (!value) return false;

        const trimmedValue = value.trim();

        // Remove all non-digit characters, except "+" at the beginning
        const cleanedValue = trimmedValue.replace(/(?!^\+)\D/gu, '');

        // Get only digits to check length
        const digitsOnly = cleanedValue.replace(/\D/gu, '');

        // Basic checks for international number:

        // 1. Check for minimum and maximum length (for international standards)
        if (digitsOnly.length < 7 || digitsOnly.length > 15) return false;

        // 2. If the number starts with "+", there must be at least one digit after it
        if (cleanedValue.startsWith('+') && cleanedValue.length < 2)
          return false;

        // 3. If the number doesn't start with "+", it must start with a digit
        if (!cleanedValue.startsWith('+') && !/^\d/u.test(cleanedValue))
          return false;

        /*
         * 4. Check that the number contains enough digits after the country code
         * (assuming the country code is at most 3 digits)
         */
        let localPartLength = digitsOnly.length;

        if (cleanedValue.startsWith('+')) {
          localPartLength = digitsOnly.length - Math.min(3, digitsOnly.length);
        }

        // Local part must be of sufficient length
        return localPartLength >= 5;
      },
    ),
};

// General schemas for optional fields
const fallbackSchemas = {
  text: yup
    .string()
    .trim()
    .max(50, 'Maximum 50 characters')
    .test(
      'min-if-filled',
      'Minimum 2 characters',
      (value) => !value || value.length >= 2,
    ),

  textarea: yup.string().trim().max(200, 'Maximum 200 characters'),
};

const validateField = async (field, value) => {
  try {
    const name = field.getAttribute('name');
    let schema = fieldSpecificSchemas[name];

    if (!schema) {
      const tag = field.tagName.toLowerCase();
      let type = 'text';
      if (tag === 'textarea') {
        type = 'textarea';
      }
      schema = fallbackSchemas[type];
    }

    await schema.validate(value);
    return { isValid: true };
  } catch (error) {
    return { isValid: false, message: error.message };
  }
};

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

  for (const field of fields) {
    if (
      field.type === 'submit' ||
      field.type === 'button' ||
      field.type === 'hidden'
    ) {
      // eslint-disable-next-line no-continue
      continue;
    }

    // eslint-disable-next-line no-await-in-loop
    const result = await validateField(field, field.value);
    if (!result.isValid) {
      showValidationError(field, result.message);
      isFormValid = false;
    }
  }

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

export { initFormValidation };
