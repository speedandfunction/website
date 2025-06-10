const { validateField } = require('./formValidator');
const {
  STANDARD_FORM_FIELD_NAMES,
} = require('../../../../@apostrophecms/shared-constants/ui/src/index');

describe('Phone Number Validator', () => {
  const phoneInput = document.createElement('input');
  phoneInput.type = 'tel';
  phoneInput.name = STANDARD_FORM_FIELD_NAMES.PHONE_NUMBER;

  it('rejects too short phone number', async () => {
    phoneInput.value = '123';
    const result = await validateField(phoneInput);
    expect(result).toEqual({
      isValid: false,
      message: 'Enter a valid phone number (e.g., +1 (234) 567-8900)',
    });
  });

  it('rejects invalid international format', async () => {
    phoneInput.value = '+123456789';
    const result = await validateField(phoneInput);
    expect(result).toEqual({
      isValid: false,
      message: 'Enter a valid phone number (e.g., +1 (234) 567-8900)',
    });
  });

  it('rejects phone number with letters', async () => {
    phoneInput.value = '+1 (234) ABC-1234';
    const result = await validateField(phoneInput);
    expect(result).toEqual({
      isValid: false,
      message: 'Enter a valid phone number (e.g., +1 (234) 567-8900)',
    });
  });

  it('accepts valid phone number with country code', async () => {
    phoneInput.value = '+1 (234) 567-8900';
    const result = await validateField(phoneInput);
    expect(result).toEqual({ isValid: true });
  });

  it('accepts valid phone number without country code', async () => {
    phoneInput.value = '(234) 567-8900';
    const result = await validateField(phoneInput);
    expect(result).toEqual({ isValid: true });
  });

  it('accepts valid phone number with spaces', async () => {
    phoneInput.value = '+1 234 567 8900';
    const result = await validateField(phoneInput);
    expect(result).toEqual({ isValid: true });
  });

  it('accepts valid phone number with dots', async () => {
    phoneInput.value = '+1.234.567.8900';
    const result = await validateField(phoneInput);
    expect(result).toEqual({ isValid: true });
  });
});
