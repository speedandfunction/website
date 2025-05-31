const standardizeFieldNames = (doc) => {
  if (!doc) return;

  const items = doc.contents?.items;
  if (!Array.isArray(items) || items.length === 0) return;

  const standardNames = ['full-name', 'email-address', 'phone-number'];
  const limit = Math.min(standardNames.length, items.length);

  for (let i = 0; i < limit; i += 1) {
    const field = items[i];
    const desiredName = standardNames[i];

    if (field?.fieldName && field.fieldName !== desiredName) {
      field.fieldName = desiredName;
    }
  }
};

module.exports = { standardizeFieldNames };
