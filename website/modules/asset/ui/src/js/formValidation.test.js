import { initFormValidation } from './formValidation';

if (!global.fetch) {
  global.fetch = jest.fn(() =>
    Promise.resolve({
      json: () => Promise.resolve({ success: true }),
    }),
  );
}

const createDelayedFetchPromise = () => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({ ok: true, json: () => Promise.resolve({ success: true }) });
    }, 50);
  });
};

describe('Form Validation', () => {
  let form = null;
  let fullNameInput = null;
  let errorMessage = null;
  let validateField = null;

  const createEventWithTarget = (eventType, target) => {
    let event = new Event(eventType);
    if (eventType === 'submit') {
      event = new SubmitEvent(eventType, { cancelable: true });
    }
    Object.defineProperty(event, 'target', { value: target, enumerable: true });
    return event;
  };

  const waitForDomUpdate = () => {
    return new Promise((resolve) => {
      setTimeout(resolve, 0);
    });
  };

  beforeEach(() => {
    document.body.innerHTML = `
      <form id="test-form">
        <div class="apos-form-input-wrapper">
          <input type="text" name="fullName" id="fullName" />
          <div class="error-message"></div>
        </div>
      </form>
    `;
    form = document.getElementById('test-form');
    fullNameInput = document.getElementById('fullName');
    errorMessage = form.querySelector('.error-message');
    validateField = jest.fn();
    initFormValidation(form, validateField);
  });

  afterEach(() => {
    document.body.innerHTML = '';
    jest.clearAllMocks();
  });

  test('validates field on blur', async () => {
    validateField.mockImplementation(() => Promise.resolve({ isValid: true }));

    fullNameInput.dispatchEvent(createEventWithTarget('blur', fullNameInput));
    await waitForDomUpdate();

    expect(validateField).toHaveBeenCalledWith(fullNameInput);
    expect(errorMessage.textContent).toBe('');
  }, 10000);

  test('shows validation error when field is invalid', async () => {
    const expectedErrorMessage = 'Invalid input';
    validateField.mockImplementation(() =>
      Promise.resolve({ isValid: false, message: expectedErrorMessage }),
    );

    fullNameInput.dispatchEvent(createEventWithTarget('blur', fullNameInput));
    await waitForDomUpdate();

    expect(validateField).toHaveBeenCalledWith(fullNameInput);
    expect(errorMessage.textContent).toBe(expectedErrorMessage);
  }, 10000);

  test('clears validation error on input', async () => {
    fullNameInput.dispatchEvent(createEventWithTarget('input', fullNameInput));
    await waitForDomUpdate();

    expect(errorMessage.textContent).toBe('');
  }, 10000);

  test('validates form on submit', async () => {
    validateField.mockImplementation(() => Promise.resolve({ isValid: true }));

    const submitEvent = createEventWithTarget('submit', form);
    form.dispatchEvent(submitEvent);
    await waitForDomUpdate();

    expect(validateField).toHaveBeenCalledWith(fullNameInput);
  }, 10000);

  test('prevents form submission when validation fails', async () => {
    validateField.mockImplementation(() =>
      Promise.resolve({ isValid: false, message: 'Error' }),
    );

    const submitEvent = createEventWithTarget('submit', form);
    form.dispatchEvent(submitEvent);
    await waitForDomUpdate();

    expect(validateField).toHaveBeenCalledWith(fullNameInput);
    expect(submitEvent.defaultPrevented).toBe(true);
  }, 10000);

  test('submit button is disabled during form submission and prevents multiple submits', async () => {
    const submitButton = document.createElement('button');
    submitButton.type = 'submit';
    submitButton.textContent = 'Send';
    form.appendChild(submitButton);

    validateField.mockImplementation(() => Promise.resolve({ isValid: true }));

    const fetchPromise = createDelayedFetchPromise();
    global.fetch = jest.fn(() => fetchPromise);

    const submitEvent1 = new SubmitEvent('submit', { cancelable: true });
    form.dispatchEvent(submitEvent1);
    expect(submitButton.disabled).toBe(true);

    const submitEvent2 = new SubmitEvent('submit', { cancelable: true });
    form.dispatchEvent(submitEvent2);
    expect(submitButton.disabled).toBe(true);

    await fetchPromise;
    await waitForDomUpdate();
    expect(submitButton.disabled).toBe(false);
  }, 10000);
});
