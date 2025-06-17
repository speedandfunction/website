const {
  fieldSpecificSchemas,
  fallbackSchemas,
} = require('./validationSchemas');

const getFieldValue = (field, value) => {
  if (value !== null && value !== undefined) {
    return value;
  }
  if (field.type === 'checkbox') {
    const form = field.form || field.closest('form');
    const scope = form ?? field.closest('.apos-form-input-wrapper') ?? document;
    const checkboxes = scope.querySelectorAll(
      `input[type="checkbox"][name="${CSS.escape(field.getAttribute('name'))}"]`,
    );
    return Array.from(checkboxes).some((cb) => cb.checked);
  }
  if (field.value !== undefined) {
    return field.value;
  }
  return '';
};

const getValidationSchema = (field, name) => {
  let schema = fieldSpecificSchemas[name];
  if (!schema) {
    const tag = field.tagName.toLowerCase();
    let type = 'text';
    if (tag === 'textarea') {
      type = 'textarea';
    } else if (field.type === 'checkbox') {
      type = 'checkbox';
    }
    schema = fallbackSchemas[type];
  }
  return schema;
};

const validateField = async (field, value) => {
  if (!field || typeof field.getAttribute !== 'function') {
    return { isValid: false, message: 'Invalid field parameter' };
  }

  try {
    const name = field.getAttribute('name');
    let isRequired = false;
    if (field.type === 'checkbox') {
      isRequired = field.closest('[data-required]') !== null;
    } else {
      isRequired = field.hasAttribute('required');
    }

    const schema = getValidationSchema(field, name);
    if (!schema) {
      return { isValid: false, message: 'No validation schema found' };
    }

    const fieldValue = getFieldValue(field, value);
    let validationSchema = schema;
    if (isRequired) {
      validationSchema = schema.required('This field is required');
    }

    if (field.type === 'checkbox') {
      await validationSchema.validate(fieldValue, { context: { isRequired } });
    } else {
      await validationSchema.validate(fieldValue);
    }

    return { isValid: true };
  } catch (error) {
    return { isValid: false, message: error.message };
  }
};

module.exports = { validateField };
