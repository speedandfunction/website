const { showValidationError, clearValidationError } = require('./domHelpers');

describe('DOM Helpers', () => {
  let field = null;
  let wrapper = null;
  let errorContainer = null;
  let dateHelp = null;

  beforeEach(() => {
    // Create test DOM structure
    field = document.createElement('input');
    field.type = 'text';
    field.name = 'test-field';

    wrapper = document.createElement('div');
    wrapper.className = 'apos-form-input-wrapper';

    wrapper.appendChild(field);
    document.body.appendChild(wrapper);
  });

  afterEach(() => {
    // Clean up
    document.body.innerHTML = '';
  });

  describe('showValidationError', () => {
    test('creates error element and shows message', () => {
      showValidationError(field, 'Test error message');

      const validationError = wrapper.querySelector('.validation-error');
      expect(validationError).toBeTruthy();
      expect(validationError.textContent).toBe('Test error message');
      expect(field.classList.contains('has-error')).toBe(true);
    });

    test('reuses existing error element', () => {
      // Create error element first
      const existingError = document.createElement('div');
      existingError.className = 'validation-error';
      wrapper.appendChild(existingError);

      showValidationError(field, 'Test error message');

      const errors = wrapper.querySelectorAll('.validation-error');
      expect(errors.length).toBe(1);
      expect(errors[0].textContent).toBe('Test error message');
    });

    test('inserts error element after date help if present', () => {
      // Create date help element
      const dateHelpParent = document.createElement('div');
      dateHelp = document.createElement('div');
      dateHelp.className = 'apos-form-help';
      dateHelpParent.appendChild(dateHelp);
      wrapper.appendChild(dateHelpParent);

      showValidationError(field, 'Test error message');

      const validationError = wrapper.querySelector('.validation-error');
      expect(validationError.previousElementSibling).toBe(dateHelpParent);
    });

    test('does nothing if wrapper is not found', () => {
      const unwrappedField = document.createElement('input');
      document.body.appendChild(unwrappedField);

      showValidationError(unwrappedField, 'Test error message');

      expect(document.querySelector('.validation-error')).toBeFalsy();
      expect(unwrappedField.classList.contains('has-error')).toBe(false);
    });
  });

  describe('clearValidationError', () => {
    beforeEach(() => {
      // Setup error state
      errorContainer = document.createElement('div');
      errorContainer.className = 'validation-error';
      errorContainer.textContent = 'Existing error';
      wrapper.appendChild(errorContainer);
      field.classList.add('has-error');
    });

    test('clears error message and removes error class', () => {
      clearValidationError(field);

      expect(errorContainer.textContent).toBe('');
      expect(field.classList.contains('has-error')).toBe(false);
    });

    test('handles missing error element gracefully', () => {
      errorContainer.remove();
      clearValidationError(field);

      expect(field.classList.contains('has-error')).toBe(false);
    });

    test('does nothing if wrapper is not found', () => {
      const unwrappedField = document.createElement('input');
      unwrappedField.classList.add('has-error');
      document.body.appendChild(unwrappedField);

      clearValidationError(unwrappedField);

      expect(unwrappedField.classList.contains('has-error')).toBe(true);
    });
  });
});
