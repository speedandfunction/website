import * as yup from 'yup';
// Import constants directly
import { STANDARD_FORM_FIELD_NAMES } from '../../../../shared-constants/ui/src/index';

// Specific validation for particular fields
const fieldSpecificSchemas = {
  // Field validations using imported constants
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

        // Remove all spaces for initial analysis
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

// Function to validate a specific field
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

// Function to show validation error
const showValidationError = (field, message) => {
  // Find the parent element of the field
  const wrapper = field.closest('.apos-form-input-wrapper');
  if (!wrapper) return;

  // Check if error element already exists
  let errorElement = wrapper.querySelector('.validation-error');

  // If error element doesn't exist, create it
  if (!errorElement) {
    errorElement = document.createElement('div');
    errorElement.className = 'validation-error';

    // Find the date help text if it exists, or append at the end
    const dateHelp = wrapper.querySelector('.apos-form-help');
    if (dateHelp && dateHelp.parentElement) {
      wrapper.insertBefore(errorElement, dateHelp.parentElement.nextSibling);
    } else {
      // Simply append to the end of the wrapper
      wrapper.appendChild(errorElement);
    }
  }

  // Set error text
  errorElement.textContent = message;

  // Add error class to the field
  field.classList.add('has-error');
};

// Function to clear validation errors
const clearValidationError = (field) => {
  // Find the parent element of the field
  const wrapper = field.closest('.apos-form-input-wrapper');
  if (!wrapper) return;

  // Find and remove error element
  const errorElement = wrapper.querySelector('.validation-error');
  if (errorElement) {
    errorElement.textContent = '';
  }

  // Remove error class from the field
  field.classList.remove('has-error');
};

// Adding event handlers for a single field
const addFieldValidationHandlers = (field) => {
  // Skip buttons and hidden fields
  if (
    field.type === 'submit' ||
    field.type === 'button' ||
    field.type === 'hidden'
  ) {
    return;
  }

  // Validation on blur
  field.addEventListener('blur', async (event) => {
    const result = await validateField(event.target, event.target.value);
    if (result.isValid) {
      clearValidationError(event.target);
    } else {
      showValidationError(event.target, result.message);
    }
  });

  // Clear error on input
  field.addEventListener('input', (event) => {
    clearValidationError(event.target);
  });
};

// Submit event handler for the form
const handleFormSubmit = (form) => async (event) => {
  // Prevent standard form submission
  event.preventDefault();

  // Validate the form
  const isValid = await validateForm(form);

  if (isValid) {
    // If validation passes successfully, submit the form
    form.submit();
  }
};

// Function to validate entire form
const validateForm = async (form) => {
  const fields = form.querySelectorAll('input, textarea, select');
  let isFormValid = true;

  // Clear all previous errors
  fields.forEach((field) => {
    clearValidationError(field);
  });

  // Check each field
  for (const field of fields) {
    // Skip buttons and hidden fields
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

// Initialize form with validation
const initFormWithValidation = (form) => {
  // Add submit event handler
  form.addEventListener('submit', handleFormSubmit(form));

  // Add validation to each field
  const fields = form.querySelectorAll('input, textarea, select');
  fields.forEach(addFieldValidationHandlers);
};

// Initialize validation for all forms
const initFormValidation = () => {
  document.addEventListener('DOMContentLoaded', () => {
    // Find all forms with sf-form class
    const forms = document.querySelectorAll('.sf-form');
    forms.forEach(initFormWithValidation);
  });
};

// Export initialization function
export { initFormValidation };
