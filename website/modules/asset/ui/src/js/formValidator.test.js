const { validateField } = require('./formValidator');

const {
  STANDARD_FORM_FIELD_NAMES,
} = require('../../../../@apostrophecms/shared-constants/ui/src/index');

// Test Constants
const TEST_CONSTANTS = {
  MESSAGES: {
    NAME_REQUIRED: 'Name is required',
    NAME_TOO_SHORT: 'Name must contain at least 2 characters',
    NAME_TOO_LONG: 'Name cannot be longer than 50 characters',
    EMAIL_REQUIRED: 'Email is required',
    EMAIL_INVALID: 'Enter a valid email address',
    EMAIL_DOMAIN_INVALID: 'Check the domain part of the email',
    PHONE_REQUIRED: 'Phone number is required',
    PHONE_INVALID: 'Enter a valid phone number',
    TEXT_TOO_LONG: 'Maximum 50 characters',
    TEXT_TOO_SHORT: 'Minimum 2 characters',
    TEXTAREA_TOO_LONG: 'Maximum 200 characters',
  },
  LIMITS: {
    NAME_MAX: 50,
    NAME_MIN: 2,
    TEXT_MAX: 50,
    TEXT_MIN: 2,
    TEXTAREA_MAX: 200,
  },
  VALID_SAMPLES: {
    FULL_NAME: 'John Doe',
    EMAIL: 'test@example.com',
    PHONE_INTERNATIONAL: '+1 212 555 1234',
    PHONE_LOCAL: '212 555 1234',
    TEXT: 'Valid text',
    TEXTAREA: 'Valid textarea content',
  },
  INVALID_SAMPLES: {
    EMAIL_FORMAT: 'invalid-email',
    EMAIL_DOMAIN: 'test@invalid',
    PHONE_SHORT: '123456',
    PHONE_INVALID: '+',
  },
};

// Test Utilities
const createField = (name, tag = 'input') => ({
  getAttribute: jest.fn().mockReturnValue(name),
  tagName: tag.toUpperCase(),
});

const runCommonEmptyTests = async (field, errorMessage) => {
  const result = await validateField(field, '');
  expect(result).toEqual({
    isValid: !errorMessage,
    ...(errorMessage && { message: errorMessage }),
  });
};

const runCommonLengthTests = async (
  field,
  { min, max, tooShortMsg, tooLongMsg },
) => {
  if (min) {
    const result = await validateField(field, 'a');
    expect(result).toEqual({
      isValid: false,
      message: tooShortMsg,
    });
  }

  if (max) {
    const longText = 'a'.repeat(max + 1);
    const result = await validateField(field, longText);
    expect(result).toEqual({
      isValid: false,
      message: tooLongMsg,
    });
  }
};

const runValidInputTest = async (field, value) => {
  const result = await validateField(field, value);
  expect(result).toEqual({ isValid: true });
};

const runInvalidInputTest = async (field, value, message) => {
  const result = await validateField(field, value);
  expect(result).toEqual({
    isValid: false,
    message,
  });
};

const createTestSuite = ({
  name,
  fieldName,
  tag = 'input',
  validTests = [],
  emptyTest = null,
  lengthTest = null,
  additionalTests = [],
}) => {
  describe(name, () => {
    const field = createField(fieldName, tag);

    validTests.forEach(({ description, value }) => {
      test(description, () => runValidInputTest(field, value));
    });

    if (emptyTest) {
      test('handles empty input', () =>
        runCommonEmptyTests(field, emptyTest.errorMessage));
    }

    if (lengthTest) {
      test('validates length constraints', () =>
        runCommonLengthTests(field, lengthTest));
    }

    additionalTests.forEach(({ description, value, message }) => {
      test(description, () => runInvalidInputTest(field, value, message));
    });
  });
};

// Test Suites Configuration
const testFullName = () =>
  createTestSuite({
    name: 'Full Name Field',
    fieldName: STANDARD_FORM_FIELD_NAMES.FULL_NAME,
    validTests: [
      {
        description: 'accepts valid full name',
        value: TEST_CONSTANTS.VALID_SAMPLES.FULL_NAME,
      },
    ],
    emptyTest: {
      errorMessage: TEST_CONSTANTS.MESSAGES.NAME_REQUIRED,
    },
    lengthTest: {
      min: TEST_CONSTANTS.LIMITS.NAME_MIN,
      max: TEST_CONSTANTS.LIMITS.NAME_MAX,
      tooShortMsg: TEST_CONSTANTS.MESSAGES.NAME_TOO_SHORT,
      tooLongMsg: TEST_CONSTANTS.MESSAGES.NAME_TOO_LONG,
    },
  });

const testEmail = () =>
  createTestSuite({
    name: 'Email Field',
    fieldName: STANDARD_FORM_FIELD_NAMES.EMAIL_ADDRESS,
    validTests: [
      {
        description: 'accepts valid email',
        value: TEST_CONSTANTS.VALID_SAMPLES.EMAIL,
      },
    ],
    emptyTest: {
      errorMessage: TEST_CONSTANTS.MESSAGES.EMAIL_REQUIRED,
    },
    additionalTests: [
      {
        description: 'rejects invalid email format',
        value: TEST_CONSTANTS.INVALID_SAMPLES.EMAIL_FORMAT,
        message: TEST_CONSTANTS.MESSAGES.EMAIL_INVALID,
      },
      {
        description: 'rejects email with invalid domain',
        value: TEST_CONSTANTS.INVALID_SAMPLES.EMAIL_DOMAIN,
        message: TEST_CONSTANTS.MESSAGES.EMAIL_DOMAIN_INVALID,
      },
    ],
  });

const testPhoneNumber = () =>
  createTestSuite({
    name: 'Phone Number Field',
    fieldName: STANDARD_FORM_FIELD_NAMES.PHONE_NUMBER,
    validTests: [
      {
        description: 'accepts valid international phone number',
        value: TEST_CONSTANTS.VALID_SAMPLES.PHONE_INTERNATIONAL,
      },
      {
        description: 'accepts valid local phone number',
        value: TEST_CONSTANTS.VALID_SAMPLES.PHONE_LOCAL,
      },
    ],
    emptyTest: {
      errorMessage: TEST_CONSTANTS.MESSAGES.PHONE_REQUIRED,
    },
    additionalTests: [
      {
        description: 'rejects too short phone number',
        value: TEST_CONSTANTS.INVALID_SAMPLES.PHONE_SHORT,
        message: TEST_CONSTANTS.MESSAGES.PHONE_INVALID,
      },
      {
        description: 'rejects invalid international format',
        value: TEST_CONSTANTS.INVALID_SAMPLES.PHONE_INVALID,
        message: TEST_CONSTANTS.MESSAGES.PHONE_INVALID,
      },
    ],
  });

const testTextInput = () =>
  createTestSuite({
    name: 'Text Input Field',
    fieldName: 'custom-field',
    validTests: [
      {
        description: 'accepts valid text input',
        value: TEST_CONSTANTS.VALID_SAMPLES.TEXT,
      },
    ],
    emptyTest: {},
    lengthTest: {
      min: TEST_CONSTANTS.LIMITS.TEXT_MIN,
      max: TEST_CONSTANTS.LIMITS.TEXT_MAX,
      tooShortMsg: TEST_CONSTANTS.MESSAGES.TEXT_TOO_SHORT,
      tooLongMsg: TEST_CONSTANTS.MESSAGES.TEXT_TOO_LONG,
    },
  });

const testTextarea = () =>
  createTestSuite({
    name: 'Textarea Field',
    fieldName: 'custom-textarea',
    tag: 'textarea',
    validTests: [
      {
        description: 'accepts valid textarea input',
        value: TEST_CONSTANTS.VALID_SAMPLES.TEXTAREA,
      },
    ],
    emptyTest: {},
    lengthTest: {
      max: TEST_CONSTANTS.LIMITS.TEXTAREA_MAX,
      tooLongMsg: TEST_CONSTANTS.MESSAGES.TEXTAREA_TOO_LONG,
    },
  });

describe('Form Validator', () => {
  describe('validateField', () => {
    describe('Field-specific validations', () => {
      testFullName();
      testEmail();
      testPhoneNumber();
    });

    describe('Fallback validations', () => {
      testTextInput();
      testTextarea();
    });
  });
});
