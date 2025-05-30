const GoogleSheetsService = require('./googleSheetsService');

jest.mock('googleapis', () => ({
  google: {
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

const createMockSelf = () => ({
  apos: {
    util: {
      log: jest.fn(),
      error: jest.fn(),
    },
  },
});

const createMockSheets = () => ({
  spreadsheets: {
    values: {
      get: jest.fn(),
      append: jest.fn(),
    },
  },
});

describe('GoogleSheetsService', () => {
  const mockSelf = createMockSelf();
  const mockSheets = createMockSheets();
  const googleSheetsService = new GoogleSheetsService(mockSelf, {
    spreadsheetId: 'test-id',
    sheets: mockSheets,
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('checkNeedHeaders', () => {
    test('returns true if no headers exist', async () => {
      mockSheets.spreadsheets.values.get.mockResolvedValue({
        data: { values: [] },
      });

      const result = await googleSheetsService.checkNeedHeaders();
      expect(result).toBe(true);
    });

    test('returns false if headers exist', async () => {
      mockSheets.spreadsheets.values.get.mockResolvedValue({
        data: { values: [['ID', 'Timestamp']] },
      });

      const result = await googleSheetsService.checkNeedHeaders();
      expect(result).toBe(false);
    });

    test('throws error when spreadsheet not found', async () => {
      mockSheets.spreadsheets.values.get.mockRejectedValue({ code: 404 });

      await expect(googleSheetsService.checkNeedHeaders()).rejects.toThrow(
        'Spreadsheet not found: test-id',
      );
    });

    test('throws error when permission denied', async () => {
      mockSheets.spreadsheets.values.get.mockRejectedValue({ code: 403 });

      await expect(googleSheetsService.checkNeedHeaders()).rejects.toThrow(
        'Permission denied: Check if the service account has access to the spreadsheet: test-id',
      );
    });
  });

  describe('appendToSheet', () => {
    test('appends values to the sheet', async () => {
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

    test('throws error when append fails', async () => {
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
});
