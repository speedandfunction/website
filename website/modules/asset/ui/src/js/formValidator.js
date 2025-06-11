const {
  fieldSpecificSchemas,
  fallbackSchemas,
} = require('./validationSchemas');

const validateField = async (field, value) => {
  if (!field || typeof field.getAttribute !== 'function') {
    return { isValid: false, message: 'Invalid field parameter' };
  }

  let fieldValue = '';
  if (value !== null && value !== undefined) {
    fieldValue = value;
  } else if (field.value !== undefined) {
    fieldValue = field.value;
  }

  try {
    const name = field.getAttribute('name');
    let schema = fieldSpecificSchemas[name];

    if (!schema) {
      const tag = field.tagName.toLowerCase();
      let type = 'text';
      if (tag === 'textarea') {
        type = 'textarea';
      }
      schema = fallbackSchemas[type];
    }

    if (!schema) {
      return { isValid: false, message: 'No validation schema found' };
    }

    await schema.validate(fieldValue);
    return { isValid: true };
  } catch (error) {
    return { isValid: false, message: error.message };
  }
};

module.exports = { validateField };
