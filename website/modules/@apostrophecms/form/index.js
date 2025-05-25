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
        if (req?.body?.data) {
          try {
            formData = JSON.parse(req.body.data);
          } catch (err) {
            // eslint-disable-next-line no-console
            console.error(`Error parsing form data: ${err.message}`);
          }
        }

        if (formData) {
          try {
            await self.sendToGoogleSheets(formData);
          } catch (err) {
            // eslint-disable-next-line no-console
            console.error(
              `Failed to send form data to Google Sheets: ${err.message}`,
            );
          }
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
};
