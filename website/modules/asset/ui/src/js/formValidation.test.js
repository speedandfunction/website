const { initFormValidation } = require('./formValidation');

jest.mock('./formValidator');
jest.mock('./domHelpers');
jest.mock('../../../../shared-constants/ui/src/index', () => ({
  STANDARD_FORM_FIELD_NAMES: {
    FULL_NAME: 'full-name',
    EMAIL_ADDRESS: 'email-address',
    PHONE_NUMBER: 'phone-number',
  },
}));

const { validateField } = require('./formValidator');
const { showValidationError, clearValidationError } = require('./domHelpers');
const {
  STANDARD_FORM_FIELD_NAMES,
} = require('../../../../shared-constants/ui/src/index');

describe('Form Validation', () => {
  let form = document.createElement('form');
  let fullNameInput = document.createElement('input');
  let emailInput = document.createElement('input');

  const createEventWithTarget = (eventType, target) => {
    const event = new Event(eventType);
    Object.defineProperty(event, 'target', { value: target, enumerable: true });
    return event;
  };

  const waitForDomUpdate = () => {
    return new Promise((resolve) => {
      setTimeout(resolve, 100);
    });
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    validateField.mockReset();

    initFormValidation();

    form = document.createElement('form');
    form.className = 'sf-form';

    fullNameInput = document.createElement('input');
    fullNameInput.type = 'text';
    fullNameInput.name = STANDARD_FORM_FIELD_NAMES.FULL_NAME;

    emailInput = document.createElement('input');
    emailInput.type = 'email';
    emailInput.name = STANDARD_FORM_FIELD_NAMES.EMAIL_ADDRESS;

    form.appendChild(fullNameInput);
    form.appendChild(emailInput);

    document.body.appendChild(form);

    document.dispatchEvent(new Event('DOMContentLoaded'));
    await waitForDomUpdate();
  });

  afterEach(() => {
    document.body.innerHTML = '';
    jest.resetModules();
  });

  test('validates field on blur', async () => {
    validateField.mockImplementation(() => Promise.resolve({ isValid: true }));

    fullNameInput.dispatchEvent(createEventWithTarget('blur', fullNameInput));

    await waitForDomUpdate();

    expect(validateField).toHaveBeenCalledWith(fullNameInput, '');
    expect(clearValidationError).toHaveBeenCalledWith(fullNameInput);
  });

  test('shows validation error when field is invalid', async () => {
    const errorMessage = 'Invalid input';
    validateField.mockImplementation(() =>
      Promise.resolve({
        isValid: false,
        message: errorMessage,
      }),
    );

    fullNameInput.dispatchEvent(createEventWithTarget('blur', fullNameInput));

    await waitForDomUpdate();

    expect(showValidationError).toHaveBeenCalledWith(
      fullNameInput,
      errorMessage,
    );
  });

  test('clears validation error on input', async () => {
    fullNameInput.dispatchEvent(createEventWithTarget('input', fullNameInput));

    await waitForDomUpdate();

    expect(clearValidationError).toHaveBeenCalledWith(fullNameInput);
  });

  test('validates form on submit', async () => {
    validateField.mockImplementation(() => Promise.resolve({ isValid: true }));

    const submitEvent = createEventWithTarget('submit', form);
    submitEvent.preventDefault = jest.fn();
    form.submit = jest.fn();

    form.dispatchEvent(submitEvent);

    await waitForDomUpdate();

    expect(submitEvent.preventDefault).toHaveBeenCalled();
    expect(validateField).toHaveBeenCalled();
    expect(form.submit).toHaveBeenCalled();
  });
});
