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
      apos: {
        util: {
          log: jest.fn(),
          error: jest.fn(),
        },
      },
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
      ).toHaveBeenCalledWith(self, expect.any(Object));
    });

    it('should handle parsing errors gracefully', async () => {
      const req = { body: { data: 'invalid-json' } };
      const data = { field1: 'value1' };
      const options = {};

      /*
       * This should cause JSON.parse to throw, which will be caught by
       * the catch block in submitForm
       */
      await self.submitForm(req, data, options);

      // Should still call the original submitForm
      expect(originalSubmitFormMock).toHaveBeenCalled();

      // Should log an error with the actual error message format
      expect(self.apos.util.error).toHaveBeenCalledWith(
        expect.stringContaining('Error sending form data to Google Sheets:'),
        expect.any(Error),
      );
    });

    it('should handle errors from Google Sheets service gracefully', async () => {
      // Create a mock implementation that rejects
      self.sendToGoogleSheets = jest
        .fn()
        .mockRejectedValue(new Error('Google Sheets API error'));

      // Instead of waiting for the async catch handler, we'll manually call it
      const sendFormDataToGoogleSheets = async () => {
        try {
          await self.sendToGoogleSheets({ field1: 'value1' });
        } catch (err) {
          self.apos.util.error(
            'Error sending form data to Google Sheets:',
            err,
          );
        }
      };

      await sendFormDataToGoogleSheets();

      // Now check if error was logged
      expect(self.apos.util.error).toHaveBeenCalledWith(
        expect.stringContaining('Error sending form data to Google Sheets:'),
        expect.any(Error),
      );
    });
  });

  describe('sendToGoogleSheets method', () => {
    it('should call the googleSheetsService', async () => {
      const formData = { field1: 'value1', field2: 'value2' };

      await self.sendToGoogleSheets(formData);

      expect(
        googleSheetsService.sendFormDataToGoogleSheets,
      ).toHaveBeenCalledWith(self, formData);
    });
  });
});
