const GoogleSheetsClient = require('./lib/GoogleSheetsClient');
const GoogleSheetsFormSubmissionHandler = require('./lib/GoogleSheetsFormSubmissionHandler');
const GoogleSheetsErrorHandler = require('./lib/GoogleSheetsErrorHandler');
const { formatForSpreadsheet } = require('./lib/formatForSpreadsheet');
const { getSheetsAuthConfig } = require('./lib/getSheetsAuthConfig');

const VALIDATION_INSTRUCTIONS =
  'For proper validation, place the name, email, and phone number fields at the beginning of the form, in this exact order. Use a text input for each. Add all other fields afterward.';

const parseFormData = (req) => {
  return req?.body?.data ?? null;
};

const validateSubmissionSuccess = (result) => {
  if (!result) {
    throw new Error('Form submission failed');
  }
};

module.exports = {
  improve: '@apostrophecms/form',
  parseFormData,
  fields: {
    add: {
      instructions: {
        label: 'Instructions',
        type: 'string',
        required: false,
        textarea: true,
        def: VALIDATION_INSTRUCTIONS,
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
    formWidgets: {
      '@apostrophecms/form-text-field': {},
      '@apostrophecms/form-textarea-field': {},
      '@apostrophecms/form-checkboxes-field': {},
      '@apostrophecms/rich-text': {
        toolbar: [
          'styles',
          'bold',
          'italic',
          'link',
          'orderedList',
          'bulletList',
        ],
      },
    },
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
        await self.handleFormSubmission(req);
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

  routes(self) {
    return {
      post: {
        submit: async (req, res) => {
          try {
            const formData = parseFormData(req);
            if (!formData) {
              return res.status(400).json({ error: 'Invalid form data' });
            }

            const result = await self.formSubmissionHandler.handle(formData);
            if (!result) {
              return res.status(500).json({ error: 'Form submission failed' });
            }

            return res.json({ success: true });
          } catch (error) {
            self.apos.util.error('Form submission error:', error);
            return res.status(500).json({ error: 'An error occurred' });
          }
        },
      },
    };
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
