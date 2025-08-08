const { formatPhoneNumber } = require('./phoneFormat');
const {
  STANDARD_FORM_FIELD_NAMES,
} = require('../../../../@apostrophecms/shared-constants/ui/src/index');
const yup = require('yup');

const fieldSpecificSchemas = {
  [STANDARD_FORM_FIELD_NAMES.FULL_NAME]: yup
    .string()
    .trim()
    .required('Name is required')
    .min(2, 'Name must contain at least 2 characters')
    .max(50, 'Name cannot be longer than 50 characters')
    .matches(
      /^[\s'A-Za-zÀ-ÿ-]+$/u,
      'Enter a valid full name (letters, spaces, apostrophes, or hyphens only)',
    ),

  [STANDARD_FORM_FIELD_NAMES.EMAIL_ADDRESS]: yup
    .string()
    .trim()
    .required('Email is required')
    .max(254, 'Email cannot be longer than 254 characters')
    .email('Enter a valid email address')
    .test('domain-check', 'Check the domain part of the email', (value) => {
      if (!value) return true;
      const parts = value.split('@');
      return (
        parts.length === 2 &&
        parts[1].includes('.') &&
        parts[1].split('.').pop().length >= 2
      );
    }),

  [STANDARD_FORM_FIELD_NAMES.PHONE_NUMBER]: yup
    .string()
    .required('Phone number is required')
    .min(10, 'Phone number is too short')
    .max(19, 'Phone number is too long')
    .test('phone-format', 'Enter a valid phone number', (value) => {
      if (!value) return false;
      if (/[A-Za-z]/u.test(value)) return false;

      const formatted = formatPhoneNumber(value);
      return Boolean(formatted);
    }),

  'g-recaptcha-response': yup
    .string()
    .required('Please complete the reCAPTCHA')
    .min(70, 'Invalid reCAPTCHA token'),
};

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

  checkbox: yup
    .boolean()
    .test(
      'required-checkbox',
      'Please select at least one option',
      (value, context) => {
        // If the field is not required, always return true
        if (!context.options?.context?.isRequired) {
          return true;
        }

        // If the value is true (checkbox is checked), return true
        if (value === true) {
          return true;
        }

        // If we get here, the field is required but not checked
        return context.createError({
          path: context.path,
          message: 'Please select at least one option',
        });
      },
    ),
};

module.exports = {
  fieldSpecificSchemas,
  fallbackSchemas,
};
