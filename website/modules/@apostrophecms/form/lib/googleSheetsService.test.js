/* eslint-disable max-lines, max-nested-callbacks, no-console */
const GoogleSheetsService = require('./googleSheetsService');

jest.mock('googleapis', () => ({
  google: {
    auth: {
      JWT: jest.fn().mockImplementation(() => 'mocked-auth'),
    },
    sheets: jest.fn().mockImplementation(() => ({
      spreadsheets: {
        values: {
          get: jest.fn(),
          append: jest.fn(),
        },
      },
    })),
  },
}));

jest.mock('../../../../utils/env', () => ({
  getEnv: jest.fn(),
}));

// Mock the sleep utility
jest.mock('../../../../utils/sleep', () => ({
  sleep: jest.fn().mockResolvedValue(),
}));

const { getEnv } = require('../../../../utils/env');
const { google } = require('googleapis');
// eslint-disable-next-line no-unused-vars
const { sleep } = require('../../../../utils/sleep');

describe('GoogleSheetsService', () => {
  let mockSelf = {};
  let mockSheets = null;
  let googleSheetsService = null;

  beforeEach(() => {
    jest.clearAllMocks();

    // Create a mock self object with apos.util methods
    mockSelf = {
      apos: {
        util: {
          log: jest.fn(),
          error: jest.fn(),
        },
      },
    };

    // Create mock sheets for testing
    mockSheets = {
      spreadsheets: {
        values: {
          get: jest.fn(),
          append: jest.fn(),
        },
      },
    };

    // Create a new instance with test options
    googleSheetsService = new GoogleSheetsService(mockSelf, {
      spreadsheetId: 'test-id',
      sheets: mockSheets,
    });
  });

  describe('getGoogleSheetsClient', () => {
    it('should return spreadsheetId and auth object', () => {
      getEnv.mockImplementation((key) => {
        if (key === 'SPREADSHEET_ID') return 'test-spreadsheet-id';
        if (key === 'SERVICE_ACCOUNT_EMAIL') return 'test-email@example.com';
        if (key === 'SERVICE_ACCOUNT_PRIVATE_KEY')
          return 'test-private-key\\nwith-newlines';
        return null;
      });

      // Mock the JWT constructor
      const result = GoogleSheetsService.getGoogleSheetsClient();

      expect(result).toHaveProperty('spreadsheetId', 'test-spreadsheet-id');
      expect(result).toHaveProperty('auth');
      expect(google.auth.JWT).toHaveBeenCalledWith({
        email: 'test-email@example.com',
        key: 'test-private-key\nwith-newlines',
        scopes: ['https://www.googleapis.com/auth/spreadsheets'],
      });
    });
  });

  describe('checkNeedHeaders', () => {
    it('should return true if no headers exist', async () => {
      mockSheets.spreadsheets.values.get.mockResolvedValue({
        data: { values: [] },
      });

      const result = await googleSheetsService.checkNeedHeaders();
      expect(result).toBe(true);
    });

    it('should return false if headers exist', async () => {
      mockSheets.spreadsheets.values.get.mockResolvedValue({
        data: { values: [['ID', 'Timestamp']] },
      });

      const result = await googleSheetsService.checkNeedHeaders();
      expect(result).toBe(false);
    });

    it('should throw error when spreadsheet not found', async () => {
      mockSheets.spreadsheets.values.get.mockRejectedValue({ code: 404 });

      await expect(googleSheetsService.checkNeedHeaders()).rejects.toThrow(
        'Spreadsheet not found: test-id',
      );
    });

    it('should throw error when permission denied', async () => {
      mockSheets.spreadsheets.values.get.mockRejectedValue({ code: 403 });

      await expect(googleSheetsService.checkNeedHeaders()).rejects.toThrow(
        'Permission denied: Check if the service account has access to the spreadsheet: test-id',
      );
    });
  });

  describe('formatFormData', () => {
    it('should format form data correctly', () => {
      const formData = {
        '_id': 'form-id-123',
        'first-name': 'John',
        'last-name': 'Doe',
        'email-address': 'john@example.com',
        'multiple-choice': ['Option 1', 'Option 2'],
      };

      // Mock Date.now and toISOString for consistent test results
      const originalNow = Date.now;
      Date.now = jest.fn(() => 1234567890);

      const originalToISOString = Date.prototype.toISOString;
      // eslint-disable-next-line no-extend-native
      Date.prototype.toISOString = jest.fn(() => '2023-01-01T00:00:00.000Z');

      try {
        const result = GoogleSheetsService.formatFormData(formData);

        expect(result).toHaveProperty('headers');
        expect(result).toHaveProperty('rowData');
        expect(result.headers).toContain('ID');
        expect(result.headers).toContain('Timestamp');
        expect(result.headers).toContain('First Name');
        expect(result.headers).toContain('Last Name');
        expect(result.headers).toContain('Email Address');
        expect(result.headers).toContain('Multiple Choice');

        expect(result.rowData).toHaveLength(result.headers.length);
        expect(result.rowData[0]).toBe('1234567890');
        expect(result.rowData[1]).toBe('2023-01-01T00:00:00.000Z');
      } finally {
        // Restore original methods
        Date.now = originalNow;
        // eslint-disable-next-line no-extend-native
        Date.prototype.toISOString = originalToISOString;
      }
    });
  });

  describe('appendToSheet', () => {
    it('should append values to the sheet', async () => {
      mockSheets.spreadsheets.values.append.mockResolvedValue({
        success: true,
      });

      const values = [['ID', 'Timestamp', 'Name']];
      const result = await googleSheetsService.appendToSheet(values);

      expect(mockSheets.spreadsheets.values.append).toHaveBeenCalledWith({
        spreadsheetId: 'test-id',
        range: 'Sheet1!A1',
        valueInputOption: 'RAW',
        resource: { values },
      });
      expect(result).toEqual({ success: true });
    });

    it('should throw an error when append fails', async () => {
      console.error = jest.fn();
      mockSheets.spreadsheets.values.append.mockRejectedValue(
        new Error('Append failed'),
      );

      await expect(googleSheetsService.appendToSheet([])).rejects.toThrow(
        'Append failed',
      );
      expect(mockSelf.apos.util.error).toHaveBeenCalledWith(
        '[SHEETS] Append error: Append failed',
      );
    });
  });

  describe('checkHeadersWithRetry and addHeadersIfNeeded', () => {
    it('should call checkNeedHeaders with retry', async () => {
      // Create a spy on the retryOperation function
      jest.spyOn(require('../../../../utils/retryOperation'), 'retryOperation');

      // Mock the checkNeedHeaders method
      const spy = jest.spyOn(googleSheetsService, 'checkNeedHeaders');
      spy.mockResolvedValue(true);

      await googleSheetsService.checkHeadersWithRetry();

      expect(spy).toHaveBeenCalled();
    });

    it('should add headers if needed', async () => {
      // Mock the checkHeadersWithRetry method
      const checkSpy = jest.spyOn(googleSheetsService, 'checkHeadersWithRetry');
      checkSpy.mockResolvedValue(true);

      // Mock the appendToSheet method
      const appendSpy = jest.spyOn(googleSheetsService, 'appendToSheet');
      appendSpy.mockResolvedValue({ success: true });

      const headers = ['ID', 'Timestamp', 'Name'];
      const result = await googleSheetsService.addHeadersIfNeeded(headers);

      expect(result).toBe(true);
      expect(appendSpy).toHaveBeenCalledWith([headers]);
    });

    it('should not add headers if not needed', async () => {
      // Mock the checkHeadersWithRetry method
      const checkSpy = jest.spyOn(googleSheetsService, 'checkHeadersWithRetry');
      checkSpy.mockResolvedValue(false);

      // Mock the appendToSheet method
      const appendSpy = jest.spyOn(googleSheetsService, 'appendToSheet');

      const headers = ['ID', 'Timestamp', 'Name'];
      const result = await googleSheetsService.addHeadersIfNeeded(headers);

      expect(result).toBe(true);
      expect(appendSpy).not.toHaveBeenCalled();
    });
  });

  describe('sendFormDataToGoogleSheets', () => {
    it('should successfully send form data to Google Sheets', async () => {
      // Set up spies on the instance methods
      const formatDataSpy = jest.spyOn(googleSheetsService, 'formatFormData');
      const addHeadersSpy = jest.spyOn(
        googleSheetsService,
        'addHeadersIfNeeded',
      );
      const appendSpy = jest.spyOn(googleSheetsService, 'appendToSheet');

      // Mock the return values
      formatDataSpy.mockReturnValue({
        headers: ['ID', 'Timestamp', 'Name'],
        rowData: ['123', '2023-01-01', 'John'],
      });

      addHeadersSpy.mockResolvedValue(true);
      appendSpy.mockResolvedValue({ success: true });

      const formData = { _id: 'form-id', name: 'John' };

      // Execute the method
      const result =
        await googleSheetsService.sendFormDataToGoogleSheets(formData);

      // Check the result
      expect(result).toBe(true);
      expect(formatDataSpy).toHaveBeenCalledWith(formData);
      expect(addHeadersSpy).toHaveBeenCalledWith(['ID', 'Timestamp', 'Name']);
      expect(appendSpy).toHaveBeenCalledWith([['123', '2023-01-01', 'John']]);

      // Clean up the spies
      formatDataSpy.mockRestore();
      addHeadersSpy.mockRestore();
      appendSpy.mockRestore();
    });

    it('should handle missing configuration gracefully', async () => {
      // Save original value
      const originalSpreadsheetId = googleSheetsService.spreadsheetId;

      try {
        // Set missing spreadsheetId
        googleSheetsService.spreadsheetId = null;

        const result = await googleSheetsService.sendFormDataToGoogleSheets({
          _id: 'form-id',
          name: 'John',
        });

        expect(result).toBe(false);
        expect(mockSelf.apos.util.error).toHaveBeenCalledWith(
          '[SHEETS] Missing Google Sheets configuration',
        );
      } finally {
        // Restore original value
        // eslint-disable-next-line require-atomic-updates
        googleSheetsService.spreadsheetId = originalSpreadsheetId;
      }
    });

    it('should return false when headers cannot be added', async () => {
      // Create a backup of the original method
      const originalMethod = GoogleSheetsService.formatFormData;

      try {
        // Mock formatFormData static method
        GoogleSheetsService.formatFormData = jest.fn().mockReturnValue({
          headers: ['ID', 'Timestamp', 'Name'],
          rowData: ['123', '2023-01-01', 'John'],
        });

        // Mock addHeadersIfNeeded to fail
        const addHeadersSpy = jest.spyOn(
          googleSheetsService,
          'addHeadersIfNeeded',
        );
        addHeadersSpy.mockResolvedValue(false);

        // Mock appendToSheet
        const appendSpy = jest.spyOn(googleSheetsService, 'appendToSheet');

        const result = await googleSheetsService.sendFormDataToGoogleSheets({
          _id: 'form-id',
          name: 'John',
        });

        expect(result).toBe(false);
        expect(appendSpy).not.toHaveBeenCalled();
      } finally {
        // Restore original method
        // eslint-disable-next-line require-atomic-updates
        GoogleSheetsService.formatFormData = originalMethod;
      }
    });

    it('should return false when append fails', async () => {
      // Create a backup of the original method
      const originalMethod = GoogleSheetsService.formatFormData;

      try {
        // Mock formatFormData static method
        GoogleSheetsService.formatFormData = jest.fn().mockReturnValue({
          headers: ['ID', 'Timestamp', 'Name'],
          rowData: ['123', '2023-01-01', 'John'],
        });

        // Mock instance methods
        const addHeadersSpy = jest.spyOn(
          googleSheetsService,
          'addHeadersIfNeeded',
        );
        const appendSpy = jest.spyOn(googleSheetsService, 'appendToSheet');

        addHeadersSpy.mockResolvedValue(true);
        appendSpy.mockRejectedValue(new Error('Append failed'));

        const result = await googleSheetsService.sendFormDataToGoogleSheets({
          _id: 'form-id',
          name: 'John',
        });

        expect(result).toBe(false);
        expect(mockSelf.apos.util.error).toHaveBeenCalled();
      } finally {
        // Restore original method
        // eslint-disable-next-line require-atomic-updates
        GoogleSheetsService.formatFormData = originalMethod;
      }
    });
  });
});
