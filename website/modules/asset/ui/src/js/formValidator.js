const {
  fieldSpecificSchemas,
  fallbackSchemas,
} = require('./validationSchemas');

const validateField = async (field, value) => {
  try {
    const name = field.getAttribute('name');
    let fieldValue = '';

    if (value !== undefined) {
      fieldValue = value;
    } else if (field.value !== undefined) {
      fieldValue = field.value;
    }

    let schema = fieldSpecificSchemas[name];

    if (!schema) {
      const tag = field.tagName.toLowerCase();
      let type = 'text';
      if (tag === 'textarea') {
        type = 'textarea';
      }
      schema = fallbackSchemas[type];
    }

    await schema.validate(fieldValue);
    return { isValid: true };
  } catch (error) {
    return { isValid: false, message: error.message };
  }
};

module.exports = { validateField };
