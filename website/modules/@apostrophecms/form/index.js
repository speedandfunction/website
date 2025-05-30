const GoogleSheetsService = require('./lib/googleSheetsService');

module.exports = {
  options: {
    label: 'Form',
  },

  init(self) {
    const googleSheetsService = new GoogleSheetsService(self);

    const originalSubmitForm = self.submitForm;

    self.submitForm = async function (req, data, options) {
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
        try {
          formData = JSON.parse(rawData);
        } catch (err) {
          throw new Error(`Failed to parse form data JSON: ${err.message}`);
        }
      }
      await self.sendToGoogleSheets(formData);
    };

    self.googleSheetsService = googleSheetsService;
  },

  methods(self) {
    return {
      async sendToGoogleSheets(formData) {
        return await self.googleSheetsService.sendFormDataToGoogleSheets(
          formData,
        );
      },
    };
  },
};
