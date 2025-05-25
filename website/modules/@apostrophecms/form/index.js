const googleSheetsService = require('./lib/googleSheetsService');

module.exports = {
  options: {
    label: 'Form',
  },

  init(self) {
    const originalSubmitForm = self.submitForm;
    if (typeof originalSubmitForm === 'function') {
      self.submitForm = async function (req, data, options) {
        const result = await originalSubmitForm.call(self, req, data, options);

        let formData = data;
        if (req && req.body && req.body.data) {
          try {
            formData = JSON.parse(req.body.data);
          } catch (err) {
            // eslint-disable-next-line no-console
            console.error(`Error parsing form data: ${err.message}`);
          }
        }

        if (formData) {
          await self.sendToGoogleSheets(formData);
        }

        return result;
      };
    }
  },

  methods(self) {
    return {
      async sendToGoogleSheets(formData) {
        return await googleSheetsService.sendFormDataToGoogleSheets(formData);
      },
    };
  },

  handlers(self) {
    return {
      '@apostrophecms/doc:afterInsert': {
        async handleFormSubmission(req, doc) {
          if (doc.type !== '@apostrophecms/form-submission' || !doc.data) {
            return;
          }

          try {
            let formData = doc.data;
            if (typeof doc.data === 'string') {
              formData = JSON.parse(doc.data);
            }
            await self.sendToGoogleSheets(formData);
          } catch (err) {
            // eslint-disable-next-line no-console
            console.error(`Error processing form submission: ${err.message}`);
          }
        },
      },
    };
  },
};
