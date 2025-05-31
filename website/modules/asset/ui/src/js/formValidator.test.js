const { validateField } = require('./formValidator');

const STANDARD_FORM_FIELD_NAMES = {
  FULL_NAME: 'full-name',
  EMAIL_ADDRESS: 'email-address',
  PHONE_NUMBER: 'phone-number',
};

const createField = (name, tag = 'input') => ({
  getAttribute: jest.fn().mockReturnValue(name),
  tagName: tag.toUpperCase(),
});

const testFullName = () => {
  const field = createField(STANDARD_FORM_FIELD_NAMES.FULL_NAME);

  test('accepts valid full name', async () => {
    const result = await validateField(field, 'John Doe');
    expect(result).toEqual({ isValid: true });
  });

  test('rejects empty name', async () => {
    const result = await validateField(field, '');
    expect(result).toEqual({
      isValid: false,
      message: 'Name is required',
    });
  });

  test('rejects too short name', async () => {
    const result = await validateField(field, 'J');
    expect(result).toEqual({
      isValid: false,
      message: 'Name must contain at least 2 characters',
    });
  });

  test('rejects too long name', async () => {
    const longName = 'a'.repeat(51);
    const result = await validateField(field, longName);
    expect(result).toEqual({
      isValid: false,
      message: 'Name cannot be longer than 50 characters',
    });
  });
};

const testEmail = () => {
  const field = createField(STANDARD_FORM_FIELD_NAMES.EMAIL_ADDRESS);

  test('accepts valid email', async () => {
    const result = await validateField(field, 'test@example.com');
    expect(result).toEqual({ isValid: true });
  });

  test('rejects empty email', async () => {
    const result = await validateField(field, '');
    expect(result).toEqual({
      isValid: false,
      message: 'Email is required',
    });
  });

  test('rejects invalid email format', async () => {
    const result = await validateField(field, 'invalid-email');
    expect(result).toEqual({
      isValid: false,
      message: 'Enter a valid email address',
    });
  });

  test('rejects email with invalid domain', async () => {
    const result = await validateField(field, 'test@invalid');
    expect(result).toEqual({
      isValid: false,
      message: 'Check the domain part of the email',
    });
  });
};

const testPhoneNumber = () => {
  const field = createField(STANDARD_FORM_FIELD_NAMES.PHONE_NUMBER);

  test('accepts valid international phone number', async () => {
    const result = await validateField(field, '+1 212 555 1234');
    expect(result).toEqual({ isValid: true });
  });

  test('accepts valid local phone number', async () => {
    const result = await validateField(field, '212 555 1234');
    expect(result).toEqual({ isValid: true });
  });

  test('rejects empty phone number', async () => {
    const result = await validateField(field, '');
    expect(result).toEqual({
      isValid: false,
      message: 'Enter a valid phone number',
    });
  });

  test('rejects too short phone number', async () => {
    const result = await validateField(field, '123456');
    expect(result).toEqual({
      isValid: false,
      message: 'Enter a valid phone number',
    });
  });

  test('rejects invalid international format', async () => {
    const result = await validateField(field, '+');
    expect(result).toEqual({
      isValid: false,
      message: 'Enter a valid phone number',
    });
  });
};

const testTextInput = () => {
  const field = createField('custom-field');

  test('accepts valid text input', async () => {
    const result = await validateField(field, 'Valid text');
    expect(result).toEqual({ isValid: true });
  });

  test('accepts empty text input', async () => {
    const result = await validateField(field, '');
    expect(result).toEqual({ isValid: true });
  });

  test('rejects too long text input', async () => {
    const longText = 'a'.repeat(51);
    const result = await validateField(field, longText);
    expect(result).toEqual({
      isValid: false,
      message: 'Maximum 50 characters',
    });
  });

  test('rejects too short non-empty text input', async () => {
    const result = await validateField(field, 'a');
    expect(result).toEqual({
      isValid: false,
      message: 'Minimum 2 characters',
    });
  });
};

const testTextarea = () => {
  const field = createField('custom-textarea', 'textarea');

  test('accepts valid textarea input', async () => {
    const result = await validateField(field, 'Valid textarea content');
    expect(result).toEqual({ isValid: true });
  });

  test('accepts empty textarea', async () => {
    const result = await validateField(field, '');
    expect(result).toEqual({ isValid: true });
  });

  test('rejects too long textarea input', async () => {
    const longText = 'a'.repeat(201);
    const result = await validateField(field, longText);
    expect(result).toEqual({
      isValid: false,
      message: 'Maximum 200 characters',
    });
  });
};

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
