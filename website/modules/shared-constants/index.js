module.exports = {
  options: {
    alias: 'sharedConstants',
  },

  init(self) {
    /*
     * SINGLE SOURCE OF TRUTH
     * These constants will be automatically exported to the client-side
     * by the generate-constants.js script
     */
    self.STANDARD_FORM_FIELD_NAMES = {
      FULL_NAME: 'full-name',
      EMAIL_ADDRESS: 'email-address',
      PHONE_NUMBER: 'phone-number',
    };
  },

  extendMethods(self) {
    return {
      // Make our constants available to the browser
      getBrowserData(req) {
        return {
          STANDARD_FORM_FIELD_NAMES: self.STANDARD_FORM_FIELD_NAMES,
        };
      },
    };
  },
};
