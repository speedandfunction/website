jest.mock('./lib/googleSheetsService', () => {
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
    jest.clearAllMocks();

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

    formModule = require('./index.js');

    if (formModule.init) {
      formModule.init(self);
    }

    if (formModule.methods) {
      Object.assign(self, formModule.methods(self));
    }

    googleSheetsServiceMock = self.googleSheetsService;
  });

  describe('init function', () => {
    it('should override the submitForm method', async () => {
      expect(self.submitForm).not.toBe(originalSubmitFormMock);

      const req = { body: { data: JSON.stringify({ field1: 'value1' }) } };
      const data = { field1: 'value1' };
      const options = { option1: 'value1' };

      await self.submitForm(req, data, options);

      expect(originalSubmitFormMock).toHaveBeenCalled();

      await new Promise((resolve) => {
        setTimeout(resolve, 50);
      });

      expect(
        googleSheetsServiceMock.sendFormDataToGoogleSheets,
      ).toHaveBeenCalled();
    });

    it('should handle parsing errors gracefully', async () => {
      const req = { body: { data: 'invalid-json' } };
      const data = { field1: 'value1' };
      const options = {};

      await self.submitForm(req, data, options);

      await new Promise((resolve) => {
        setTimeout(resolve, 50);
      });

      expect(originalSubmitFormMock).toHaveBeenCalled();

      expect(self.apos.util.error).toHaveBeenCalledWith(
        expect.stringContaining('Error sending form data to Google Sheets:'),
        expect.any(Error),
      );
    });

    it('should handle errors from Google Sheets service gracefully', async () => {
      googleSheetsServiceMock.sendFormDataToGoogleSheets = jest
        .fn()
        .mockRejectedValue(new Error('Google Sheets API error'));

      const req = { body: { data: JSON.stringify({ field1: 'value1' }) } };
      const data = { field1: 'value1' };
      const options = {};

      await self.submitForm(req, data, options);

      await new Promise((resolve) => {
        setTimeout(resolve, 50);
      });

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
