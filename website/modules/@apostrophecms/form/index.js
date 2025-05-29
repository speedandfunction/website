const googleSheetsService = require('./lib/googleSheetsService');

module.exports = {
  options: {
    label: 'Form',
  },

  init(self) {
    const originalSubmitForm = self.submitForm;
    if (typeof originalSubmitForm !== 'function') {
      return;
    }

    self.submitForm = async function (req, data, options) {
      self.apos.util.log('SUBMITTING...');
      const result = await originalSubmitForm.call(self, req, data, options);
      sendFormDataToGoogleSheets(req).catch((err) => {
        self.apos.util.error('Error sending form data to Google Sheets:', err);
      });
      return result;
    };

    const sendFormDataToGoogleSheets = async (req) => {
      const rawData = req?.body?.data;
      if (!rawData) return;

      let formData = rawData;
      if (typeof rawData === 'string') {
        formData = JSON.parse(rawData);
      }
      await self.sendToGoogleSheets(formData);
    };
  },

  methods(self) {
    return {
      async sendToGoogleSheets(formData) {
        return await googleSheetsService.sendFormDataToGoogleSheets(formData);
      },
    };
  },
};
