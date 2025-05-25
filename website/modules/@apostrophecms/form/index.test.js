const googleSheetsService = require('./lib/googleSheetsService');

jest.mock('./lib/googleSheetsService', () => ({
  sendFormDataToGoogleSheets: jest.fn(),
}));

describe('@apostrophecms/form module', () => {
  let self = {};
  let formModule = {};
  let originalSubmitFormMock = null;

  beforeEach(() => {
    // Reset all mocks
    jest.clearAllMocks();

    // Create a mock self object with the required methods and properties
    originalSubmitFormMock = jest.fn().mockResolvedValue({ success: true });
    self = {
      submitForm: originalSubmitFormMock,
    };

    // Require the module under test
    formModule = require('./index.js');

    // Initialize the module with the mock self
    if (formModule.init) {
      formModule.init(self);
    }

    // Apply methods to self
    if (formModule.methods) {
      Object.assign(self, formModule.methods(self));
    }
  });

  describe('init function', () => {
    it('should override the submitForm method', async () => {
      expect(self.submitForm).not.toBe(originalSubmitFormMock);

      const req = { body: { data: JSON.stringify({ field1: 'value1' }) } };
      const data = { field1: 'value1' };
      const options = { option1: 'value1' };

      await self.submitForm(req, data, options);

      // Original submitForm should be called
      expect(originalSubmitFormMock).toHaveBeenCalled();

      // GoogleSheetsService should be called with the form data
      expect(
        googleSheetsService.sendFormDataToGoogleSheets,
      ).toHaveBeenCalledWith(expect.objectContaining({ field1: 'value1' }));
    });

    it('should handle parsing errors gracefully', async () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

      const req = { body: { data: 'invalid-json' } };
      const data = { field1: 'value1' };
      const options = {};

      await self.submitForm(req, data, options);

      // Should still call the original submitForm
      expect(originalSubmitFormMock).toHaveBeenCalled();

      // Should log an error about parsing
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('Error parsing form data'),
      );

      // Should still try to send the original data
      expect(
        googleSheetsService.sendFormDataToGoogleSheets,
      ).toHaveBeenCalledWith(data);

      consoleSpy.mockRestore();
    });

    it('should handle errors from Google Sheets service gracefully', async () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
      googleSheetsService.sendFormDataToGoogleSheets.mockRejectedValueOnce(
        new Error('Google Sheets API error'),
      );

      const req = { body: { data: JSON.stringify({ field1: 'value1' }) } };
      const data = { field1: 'value1' };

      await self.submitForm(req, data, {});

      // Should log an error about Google Sheets
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('Failed to send form data to Google Sheets'),
      );

      consoleSpy.mockRestore();
    });
  });

  describe('sendToGoogleSheets method', () => {
    it('should call the googleSheetsService', async () => {
      const formData = { field1: 'value1', field2: 'value2' };

      await self.sendToGoogleSheets(formData);

      expect(
        googleSheetsService.sendFormDataToGoogleSheets,
      ).toHaveBeenCalledWith(formData);
    });
  });
});
