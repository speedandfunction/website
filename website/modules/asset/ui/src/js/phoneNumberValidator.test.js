const { validateField } = require('./formValidator');
const {
  STANDARD_FORM_FIELD_NAMES,
} = require('../../../../@apostrophecms/shared-constants/ui/src/index');

describe('Phone Number Validator', () => {
  let phoneInput = null;
  const ERROR_MESSAGE = 'Enter a valid phone number (e.g., +1 (234) 567-8900)';

  beforeEach(() => {
    phoneInput = document.createElement('input');
    phoneInput.type = 'tel';
    phoneInput.name = STANDARD_FORM_FIELD_NAMES.PHONE_NUMBER;
  });

  const expectInvalidPhone = async (phoneNumber) => {
    phoneInput.value = phoneNumber;
    const result = await validateField(phoneInput);
    expect(result).toEqual({
      isValid: false,
      message: ERROR_MESSAGE,
    });
  };

  const expectValidPhone = async (phoneNumber) => {
    phoneInput.value = phoneNumber;
    const result = await validateField(phoneInput);
    expect(result).toEqual({ isValid: true });
  };

  it('rejects too short phone number', async () => {
    await expectInvalidPhone('123');
  });

  it('rejects invalid international format', async () => {
    await expectInvalidPhone('+123456789');
  });

  it('rejects phone number with letters', async () => {
    await expectInvalidPhone('+1 (234) ABC-1234');
  });

  it('accepts valid phone number with country code', async () => {
    await expectValidPhone('+1 (234) 567-8900');
  });

  it('accepts valid phone number without country code', async () => {
    await expectValidPhone('(234) 567-8900');
  });

  it('accepts valid phone number with spaces', async () => {
    await expectValidPhone('+1 234 567 8900');
  });

  it('accepts valid phone number with dots', async () => {
    await expectValidPhone('+1.234.567.8900');
  });
});
