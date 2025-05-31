const {
  STANDARD_FORM_FIELD_NAMES,
} = require('../../../../shared-constants/ui/src/index');
const yup = require('yup');

const fieldSpecificSchemas = {
  [STANDARD_FORM_FIELD_NAMES.FULL_NAME]: yup
    .string()
    .trim()
    .required('Name is required')
    .min(2, 'Name must contain at least 2 characters')
    .max(50, 'Name cannot be longer than 50 characters'),

  [STANDARD_FORM_FIELD_NAMES.EMAIL_ADDRESS]: yup
    .string()
    .email('Enter a valid email address')
    .test('domain-check', 'Check the domain part of the email', (value) => {
      if (!value) return true;
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
        const cleanedValue = trimmedValue.replace(/(?!^\+)\D/gu, '');
        const digitsOnly = cleanedValue.replace(/\D/gu, '');

        if (digitsOnly.length < 7 || digitsOnly.length > 15) return false;
        if (cleanedValue.startsWith('+') && cleanedValue.length < 2)
          return false;
        if (!cleanedValue.startsWith('+') && !/^\d/u.test(cleanedValue))
          return false;

        let localPartLength = digitsOnly.length;
        if (cleanedValue.startsWith('+')) {
          localPartLength = digitsOnly.length - Math.min(3, digitsOnly.length);
        }

        return localPartLength >= 5;
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
