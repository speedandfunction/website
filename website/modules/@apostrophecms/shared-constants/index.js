/*
 * SINGLE SOURCE OF TRUTH
 * These constants will be automatically exported to the client-side
 * by the generate-constants.js script
 */
const STANDARD_FORM_FIELD_NAMES = {
  FULL_NAME: 'full-name',
  EMAIL_ADDRESS: 'email-address',
  PHONE_NUMBER: 'phone-number',
};

module.exports = {
  options: {
    alias: 'sharedConstants',
  },

  init(self) {
    self.STANDARD_FORM_FIELD_NAMES = STANDARD_FORM_FIELD_NAMES;
  },

  extendMethods(self) {
    return {
      getBrowserData() {
        return { STANDARD_FORM_FIELD_NAMES };
      },
    };
  },
};
