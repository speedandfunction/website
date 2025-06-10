const { standardizeFieldNames } = require('../../utils/standardizeFieldNames');

module.exports = {
  improve: '@apostrophecms/form',

  options: {
    alias: 'formFieldStandardizer',
  },

  handlers(self) {
    return {
      '@apostrophecms/form:beforeSave': {
        standardizeFieldNames(req, doc) {
          standardizeFieldNames(doc);
        },
      },
    };
  },
};
