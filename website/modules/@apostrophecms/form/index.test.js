// Mock the GoogleSheetsService class
jest.mock('./lib/googleSheetsService', () => {
  // Create a mock constructor function
  return jest.fn().mockImplementation(() => {
    return {
      sendFormDataToGoogleSheets: jest.fn().mockResolvedValue(true),
    };
  });
});

describe('@apostrophecms/form module', () => {
  let self = {};
  let formModule = {};
  let originalSubmitFormMock = null;
  let googleSheetsServiceMock = null;

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

    // Get a reference to the googleSheetsService mock
    googleSheetsServiceMock = self.googleSheetsService;
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

      // Let the async operation complete
      await new Promise((resolve) => {
        setTimeout(resolve, 50);
      });

      // GoogleSheetsService instance method should be called
      expect(
        googleSheetsServiceMock.sendFormDataToGoogleSheets,
      ).toHaveBeenCalled();
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

      // Let the async operation complete
      await new Promise((resolve) => {
        setTimeout(resolve, 50);
      });

      // Should still call the original submitForm
      expect(originalSubmitFormMock).toHaveBeenCalled();

      // Should log an error with the actual error message format
      expect(self.apos.util.error).toHaveBeenCalledWith(
        expect.stringContaining('Error sending form data to Google Sheets:'),
        expect.any(Error),
      );
    });

    it('should handle errors from Google Sheets service gracefully', async () => {
      // Mock the sendFormDataToGoogleSheets method to reject
      googleSheetsServiceMock.sendFormDataToGoogleSheets = jest
        .fn()
        .mockRejectedValue(new Error('Google Sheets API error'));

      const req = { body: { data: JSON.stringify({ field1: 'value1' }) } };
      const data = { field1: 'value1' };
      const options = {};

      await self.submitForm(req, data, options);

      // Let the async operation complete
      await new Promise((resolve) => {
        setTimeout(resolve, 50);
      });

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
        googleSheetsServiceMock.sendFormDataToGoogleSheets,
      ).toHaveBeenCalledWith(formData);
    });
  });
});
