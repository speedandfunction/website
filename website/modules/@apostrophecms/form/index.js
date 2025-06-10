const GoogleSheetsClient = require('./lib/GoogleSheetsClient');
const GoogleSheetsFormSubmissionHandler = require('./lib/GoogleSheetsFormSubmissionHandler');
const GoogleSheetsErrorHandler = require('./lib/GoogleSheetsErrorHandler');
const { formatForSpreadsheet } = require('./lib/formatForSpreadsheet');
const { getSheetsAuthConfig } = require('./lib/getSheetsAuthConfig');

const parseFormData = (req) => {
  const rawData = req?.body?.data;
  if (!rawData) {
    return null;
  }

  if (typeof rawData === 'string') {
    return JSON.parse(rawData);
  }

  return rawData;
};

const validateSubmissionSuccess = (result) => {
  if (!result) {
    throw new Error('Form submission failed');
  }
};

module.exports = {
  improve: '@apostrophecms/form',
  fields: {
    add: {
      instructions: {
        label: 'Instructions',
        type: 'string',
        required: false,
        textarea: true,
        def: 'For proper validation, place the name, email, and phone number fields at the beginning of the form, in this exact order. All three must have the text type. Add all other fields afterward.',
        readOnly: true,
      },
    },
    group: {
      basics: {
        label: 'Form',
        fields: ['title', 'instructions', 'contents'],
      },
    },
  },

  options: {
    label: 'Form',
  },

  init(self) {
    try {
      const config = getSheetsAuthConfig();
      const { spreadsheetId, sheets } = config;
      const googleSheetsClient = new GoogleSheetsClient(sheets, spreadsheetId);
      const errorHandler = new GoogleSheetsErrorHandler(self);

      const formSubmissionHandler = new GoogleSheetsFormSubmissionHandler(
        googleSheetsClient,
        formatForSpreadsheet,
        errorHandler,
        getSheetsAuthConfig,
      );

      const originalSubmitForm = self.submitForm;
      self.submitForm = async function (req, data, options) {
        const result = await originalSubmitForm.call(self, req, data, options);
        await this.handleFormSubmission(req);
        return result;
      };

      self.formSubmissionHandler = formSubmissionHandler;
    } catch (error) {
      self.apos.util.error(
        'Failed to initialize Google Sheets integration:',
        error,
      );
    }
  },

  methods(self) {
    return {
      async handleFormSubmission(req) {
        const formData = parseFormData(req);
        if (!formData) {
          return null;
        }

        const result = await self.formSubmissionHandler.handle(formData);
        validateSubmissionSuccess(result);
        return result;
      },
    };
  },
};
