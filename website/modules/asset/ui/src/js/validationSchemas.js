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
      /^[\s'A-Za-zЄІЇА-яєіїҐґ-]+$/u,
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
    .max(20, 'Phone number is too long')
    .test(
      'phone-format',
      'Enter a valid phone number (e.g., +1 (234) 567-8900)',
      (value) => {
        if (!value) return false;

        // First check for letters - reject immediately if found
        if (/[A-Za-z]/u.test(value)) return false;

        // Remove all non-digit characters except leading +
        const digits = value.replace(/\D/gu, '');

        // Check for minimum length (10 digits typical for phone numbers)
        if (digits.length < 10) return false;

        // International format: +1 (234) 567-8900 or +1 234 567 8900 or +1.234.567.8900
        const internationalPattern =
          /^\+?\d{1,3}[\s.-]?\(?\d{3}\)?[\s.-]?\d{3}[\s.-]?\d{4}$/u;
        // Local format: (234) 567-8900 or 234 567 8900
        const localPattern = /^\(?\d{3}\)?[\s.-]?\d{3}[\s.-]?\d{4}$/u;

        // If it starts with +, it must match international pattern
        if (value.startsWith('+')) {
          return internationalPattern.test(value);
        }

        // Otherwise check both patterns
        return internationalPattern.test(value) || localPattern.test(value);
      },
    ),
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
};

module.exports = {
  fieldSpecificSchemas,
  fallbackSchemas,
};
