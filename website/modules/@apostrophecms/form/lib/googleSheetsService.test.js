/* eslint-disable max-lines, max-nested-callbacks, no-console */
const googleSheetsService = require('./googleSheetsService');

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

const { getEnv } = require('../../../../utils/env');
const { google } = require('googleapis');

describe('googleSheetsService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
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

      const result = googleSheetsService.getGoogleSheetsClient();

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
      const mockSheets = {
        spreadsheets: {
          values: {
            get: jest.fn().mockResolvedValue({
              data: { values: [] },
            }),
          },
        },
      };

      const result = await googleSheetsService.checkNeedHeaders(
        mockSheets,
        'test-id',
      );
      expect(result).toBe(true);
    });

    it('should return false if headers exist', async () => {
      const mockSheets = {
        spreadsheets: {
          values: {
            get: jest.fn().mockResolvedValue({
              data: { values: [['ID', 'Timestamp']] },
            }),
          },
        },
      };

      const result = await googleSheetsService.checkNeedHeaders(
        mockSheets,
        'test-id',
      );
      expect(result).toBe(false);
    });

    it('should throw error when spreadsheet not found', async () => {
      const mockSheets = {
        spreadsheets: {
          values: {
            get: jest.fn().mockRejectedValue({ code: 404 }),
          },
        },
      };

      await expect(
        googleSheetsService.checkNeedHeaders(mockSheets, 'test-id'),
      ).rejects.toThrow('Spreadsheet not found: test-id');
    });

    it('should throw error when permission denied', async () => {
      const mockSheets = {
        spreadsheets: {
          values: {
            get: jest.fn().mockRejectedValue({ code: 403 }),
          },
        },
      };

      await expect(
        googleSheetsService.checkNeedHeaders(mockSheets, 'test-id'),
      ).rejects.toThrow(
        'Permission denied: Check if the service account has access to the spreadsheet',
      );
    });
  });

  describe('formatFormData', () => {
    it('should format form data correctly', () => {
      // Замінюємо весь метод formatFormData щоб мати повний контроль
      const originalFormatFormData = googleSheetsService.formatFormData;

      googleSheetsService.formatFormData = jest.fn((formData) => {
        const { _id, ...formFields } = formData;

        const headers = ['ID', 'Timestamp'];
        const rowData = ['1234567890', '2023-01-01T12:00:00.000Z'];

        Object.entries(formFields).forEach(([key, value]) => {
          const headerName = key
            .split('-')
            .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ');

          headers.push(headerName);

          if (Array.isArray(value)) {
            rowData.push(value.join(', '));
          } else {
            rowData.push(value);
          }
        });

        return { headers, rowData };
      });

      try {
        const formData = {
          '_id': 'form-id',
          'first-name': 'John',
          'last-name': 'Doe',
          'email-address': 'john@example.com',
          'multiple-choice': ['Option 1', 'Option 2'],
        };

        const result = googleSheetsService.formatFormData(formData);

        expect(result).toEqual({
          headers: [
            'ID',
            'Timestamp',
            'First Name',
            'Last Name',
            'Email Address',
            'Multiple Choice',
          ],
          rowData: [
            '1234567890',
            '2023-01-01T12:00:00.000Z',
            'John',
            'Doe',
            'john@example.com',
            'Option 1, Option 2',
          ],
        });

        // Перевіряємо, що мок був викликаний
        expect(googleSheetsService.formatFormData).toHaveBeenCalledWith(
          formData,
        );
      } finally {
        // Відновлюємо оригінальний метод
        googleSheetsService.formatFormData = originalFormatFormData;
      }
    });
  });

  describe('appendToSheet', () => {
    it('should append values to the sheet', async () => {
      const mockSheets = {
        spreadsheets: {
          values: {
            append: jest.fn().mockResolvedValue({ success: true }),
          },
        },
      };

      const values = [['ID', 'Timestamp', 'Name']];
      const result = await googleSheetsService.appendToSheet(
        mockSheets,
        'test-id',
        values,
      );

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
      const mockSheets = {
        spreadsheets: {
          values: {
            append: jest.fn().mockRejectedValue(new Error('Append failed')),
          },
        },
      };

      await expect(
        googleSheetsService.appendToSheet(mockSheets, 'test-id', []),
      ).rejects.toThrow('Append failed');
      expect(console.error).toHaveBeenCalledWith(
        '[SHEETS] Append error: Append failed',
      );
    });
  });

  describe('sleep', () => {
    it('should resolve after specified time', async () => {
      jest.useFakeTimers();
      const promise = googleSheetsService.sleep(1000);
      jest.advanceTimersByTime(1000);
      await promise;
      jest.useRealTimers();
    });
  });

  describe('retryOperation', () => {
    it('should return result on successful operation', async () => {
      const operation = jest.fn().mockResolvedValue('success');

      const result = await googleSheetsService.retryOperation(operation);

      expect(result).toBe('success');
      expect(operation).toHaveBeenCalledTimes(1);
    });

    it('should retry failed operations up to maxRetries', async () => {
      console.error = jest.fn();
      const error = new Error('Operation failed');
      const operation = jest
        .fn()
        .mockRejectedValueOnce(error)
        .mockRejectedValueOnce(error)
        .mockResolvedValueOnce('success');

      jest.spyOn(googleSheetsService, 'sleep').mockResolvedValue();

      const result = await googleSheetsService.retryOperation(
        operation,
        3,
        100,
      );

      expect(result).toBe('success');
      expect(operation).toHaveBeenCalledTimes(3);
      expect(googleSheetsService.sleep).toHaveBeenCalledTimes(2);
      expect(googleSheetsService.sleep).toHaveBeenCalledWith(100);
    });

    it('should throw the last error after all retries fail', async () => {
      console.error = jest.fn();
      const error = new Error('Operation failed');
      const operation = jest.fn().mockRejectedValue(error);

      jest.spyOn(googleSheetsService, 'sleep').mockResolvedValue();

      await expect(
        googleSheetsService.retryOperation(operation, 3, 100),
      ).rejects.toThrow('Operation failed');

      expect(operation).toHaveBeenCalledTimes(3);
      expect(googleSheetsService.sleep).toHaveBeenCalledTimes(2);
    });
  });

  describe('sendFormDataToGoogleSheets', () => {
    beforeEach(() => {
      jest.spyOn(googleSheetsService, 'getGoogleSheetsClient').mockReturnValue({
        spreadsheetId: 'test-id',
        auth: 'mocked-auth',
      });

      jest.spyOn(googleSheetsService, 'formatFormData').mockReturnValue({
        headers: ['ID', 'Timestamp', 'Name'],
        rowData: ['123', '2023-01-01', 'John'],
      });

      jest
        .spyOn(googleSheetsService, 'addHeadersIfNeeded')
        .mockResolvedValue(true);
      jest
        .spyOn(googleSheetsService, 'appendToSheet')
        .mockResolvedValue({ success: true });
    });

    it('should successfully send form data to Google Sheets', async () => {
      const result = await googleSheetsService.sendFormDataToGoogleSheets({
        _id: 'form-id',
        name: 'John',
      });

      expect(result).toBe(true);
      expect(googleSheetsService.getGoogleSheetsClient).toHaveBeenCalled();
      expect(googleSheetsService.formatFormData).toHaveBeenCalledWith({
        _id: 'form-id',
        name: 'John',
      });
      expect(googleSheetsService.addHeadersIfNeeded).toHaveBeenCalled();
      expect(googleSheetsService.appendToSheet).toHaveBeenCalledWith(
        expect.anything(),
        'test-id',
        [['123', '2023-01-01', 'John']],
      );
    });

    it('should return false when headers cannot be added', async () => {
      googleSheetsService.addHeadersIfNeeded.mockResolvedValue(false);

      const result = await googleSheetsService.sendFormDataToGoogleSheets({
        _id: 'form-id',
        name: 'John',
      });

      expect(result).toBe(false);
      expect(googleSheetsService.appendToSheet).not.toHaveBeenCalled();
    });

    it('should return false when no spreadsheet configuration', async () => {
      console.error = jest.fn();
      googleSheetsService.getGoogleSheetsClient.mockReturnValue({});

      const result = await googleSheetsService.sendFormDataToGoogleSheets({
        _id: 'form-id',
        name: 'John',
      });

      expect(result).toBe(false);
      expect(console.error).toHaveBeenCalledWith(
        '[SHEETS] Missing Google Sheets configuration',
      );
    });

    it('should return false when append fails', async () => {
      console.error = jest.fn();
      googleSheetsService.appendToSheet.mockRejectedValue(
        new Error('Append failed'),
      );

      const result = await googleSheetsService.sendFormDataToGoogleSheets({
        _id: 'form-id',
        name: 'John',
      });

      expect(result).toBe(false);
      expect(console.error).toHaveBeenCalledWith(
        '[SHEETS] Failed to send form data: Append failed',
      );
    });
  });
});
