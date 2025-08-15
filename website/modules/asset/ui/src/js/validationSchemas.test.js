const {
  fieldSpecificSchemas,
  fallbackSchemas,
} = require('./validationSchemas');

const {
  STANDARD_FORM_FIELD_NAMES,
} = require('../../../../@apostrophecms/shared-constants/ui/src/index');

describe('Full Name Schema', () => {
  const schema = fieldSpecificSchemas[STANDARD_FORM_FIELD_NAMES.FULL_NAME];

  test('accepts valid full name', async () => {
    await expect(schema.validate('John Doe')).resolves.toBe('John Doe');
  });

  test('accepts name with minimum length', async () => {
    await expect(schema.validate('Jo')).resolves.toBe('Jo');
  });

  test('rejects empty name', async () => {
    await expect(schema.validate('')).rejects.toThrow('Name is required');
  });

  test('rejects too short name', async () => {
    await expect(schema.validate('J')).rejects.toThrow(
      'Name must contain at least 2 characters',
    );
  });

  test('rejects too long name', async () => {
    const longName = 'a'.repeat(51);
    await expect(schema.validate(longName)).rejects.toThrow(
      'Name cannot be longer than 50 characters',
    );
  });

  test('trims whitespace', async () => {
    await expect(schema.validate('  John Doe  ')).resolves.toBe('John Doe');
  });
});

describe('Email Schema', () => {
  const schema = fieldSpecificSchemas[STANDARD_FORM_FIELD_NAMES.EMAIL_ADDRESS];

  test('accepts valid email', async () => {
    await expect(schema.validate('test@example.com')).resolves.toBe(
      'test@example.com',
    );
  });

  test('rejects empty email', async () => {
    await expect(schema.validate('')).rejects.toThrow('Email is required');
  });

  test('rejects invalid email format', async () => {
    await expect(schema.validate('invalid-email')).rejects.toThrow(
      'Enter a valid email address',
    );
  });

  test('rejects email without domain', async () => {
    await expect(schema.validate('test@')).rejects.toThrow(
      'Enter a valid email address',
    );
  });

  test('rejects email with invalid domain', async () => {
    await expect(schema.validate('test@invalid')).rejects.toThrow(
      'Check the domain part of the email',
    );
  });

  test('rejects email with short TLD', async () => {
    await expect(schema.validate('test@example.a')).rejects.toThrow(
      'Check the domain part of the email',
    );
  });
});

describe('Phone Number Schema', () => {
  const schema = fieldSpecificSchemas[STANDARD_FORM_FIELD_NAMES.PHONE_NUMBER];

  test('accepts valid phone number with country code', async () => {
    await expect(schema.validate('+1 (234) 567-8900')).resolves.toBe(
      '+1 (234) 567-8900',
    );
  });

  test('accepts valid phone number without country code', async () => {
    await expect(schema.validate('(234) 567-8900')).resolves.toBe(
      '(234) 567-8900',
    );
  });

  test('accepts valid phone number with spaces', async () => {
    await expect(schema.validate('234 567 8900')).resolves.toBe('234 567 8900');
  });

  test('accepts valid phone number with dots', async () => {
    await expect(schema.validate('234.567.8900')).resolves.toBe('234.567.8900');
  });

  test('rejects empty phone number', async () => {
    await expect(schema.validate('')).rejects.toThrow(
      'Phone number is required',
    );
  });

  test('rejects too short phone number', async () => {
    await expect(schema.validate('123')).rejects.toThrow(
      'Phone number is too short',
    );
  });

  test('rejects too long phone number', async () => {
    const longNumber = '1'.repeat(21);
    await expect(schema.validate(longNumber)).rejects.toThrow(
      'Phone number is too long',
    );
  });

  test('rejects phone number with only letters', async () => {
    await expect(schema.validate('abc')).rejects.toThrow(
      'Enter a valid phone number',
    );
  });

  test('rejects phone number with letters', async () => {
    await expect(schema.validate('123-ABC-4567')).rejects.toThrow(
      'Enter a valid phone number',
    );
  });
});

describe('Text Schema', () => {
  const schema = fallbackSchemas.text;

  test('accepts valid text', async () => {
    await expect(schema.validate('Valid text')).resolves.toBe('Valid text');
  });

  test('accepts empty text', async () => {
    await expect(schema.validate('')).resolves.toBe('');
  });

  test('rejects too long text', async () => {
    const longText = 'a'.repeat(51);
    await expect(schema.validate(longText)).rejects.toThrow(
      'Maximum 50 characters',
    );
  });

  test('rejects too short non-empty text', async () => {
    await expect(schema.validate('a')).rejects.toThrow('Minimum 2 characters');
  });

  test('trims whitespace', async () => {
    await expect(schema.validate('  text  ')).resolves.toBe('text');
  });
});

describe('Textarea Schema', () => {
  const schema = fallbackSchemas.textarea;

  test('accepts valid text', async () => {
    await expect(schema.validate('Valid text')).resolves.toBe('Valid text');
  });

  test('accepts empty text', async () => {
    await expect(schema.validate('')).resolves.toBe('');
  });

  test('rejects too long text', async () => {
    const longText = 'a'.repeat(201);
    await expect(schema.validate(longText)).rejects.toThrow(
      'Maximum 200 characters',
    );
  });

  test('trims whitespace', async () => {
    await expect(schema.validate('  text  ')).resolves.toBe('text');
  });
});
