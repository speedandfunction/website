module.exports = {
  improve: '@apostrophecms/form',

  options: {
    alias: 'formPresetNames',
  },

  handlers(self) {
    return {
      '@apostrophecms/form:beforeSave': {
        standardizeFieldNames(req, doc) {
          const items = doc.contents?.items;
          if (!Array.isArray(items) || items.length === 0) return;

          const standardNames = ['full-name', 'email-address', 'phone-number'];

          for (
            let i = 0;
            i < Math.min(standardNames.length, items.length);
            i += 1
          ) {
            const field = items[i];
            if (field.fieldName && !standardNames.includes(field.fieldName)) {
              field.fieldName = standardNames[i];
            }
          }
        },
      },
    };
  },
};
