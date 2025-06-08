const {
  STANDARD_FORM_FIELD_NAMES,
} = require('../modules/shared-constants/ui/src/index');

const standardizeFieldNames = (doc) => {
  if (!doc) return;
  const fieldNames = Object.values(STANDARD_FORM_FIELD_NAMES);

  const items = doc.contents?.items;
  if (!Array.isArray(items) || items.length === 0) return;

  const limit = Math.min(fieldNames.length, items.length);

  for (let i = 0; i < limit; i += 1) {
    const field = items[i];
    const desiredName = fieldNames[i];

    if (field?.fieldName && field.fieldName !== desiredName) {
      field.fieldName = desiredName;
    }
  }
};

module.exports = { standardizeFieldNames };
