const GoogleSheetsClient = require('./GoogleSheetsClient');

const createMockSheets = () => ({
  spreadsheets: {
    values: {
      get: jest.fn(),
      append: jest.fn(),
    },
  },
});

describe('GoogleSheetsClient', () => {
  let mockSheets;
  let client;

  beforeEach(() => {
    mockSheets = createMockSheets();
    client = new GoogleSheetsClient(mockSheets, 'test-spreadsheet-id');
    jest.clearAllMocks();
  });

  describe('constructor', () => {
    test('sets sheets and spreadsheetId properties', () => {
      expect(client.sheets).toBe(mockSheets);
      expect(client.spreadsheetId).toBe('test-spreadsheet-id');
    });
  });

  describe('checkIfEmpty', () => {
    test('returns true when no values exist', async () => {
      mockSheets.spreadsheets.values.get.mockResolvedValue({
        data: { values: [] },
      });

      const result = await client.checkIfEmpty();

      expect(result).toBe(true);
      expect(mockSheets.spreadsheets.values.get).toHaveBeenCalledWith({
        spreadsheetId: 'test-spreadsheet-id',
        range: 'Sheet1!A1:Z1',
      });
    });

    test('returns false when values exist', async () => {
      mockSheets.spreadsheets.values.get.mockResolvedValue({
        data: { values: [['Header1', 'Header2']] },
      });

      const result = await client.checkIfEmpty();

      expect(result).toBe(false);
    });

    test('uses custom range when provided', async () => {
      mockSheets.spreadsheets.values.get.mockResolvedValue({
        data: { values: [] },
      });

      await client.checkIfEmpty('Sheet1!A1:C1');

      expect(mockSheets.spreadsheets.values.get).toHaveBeenCalledWith({
        spreadsheetId: 'test-spreadsheet-id',
        range: 'Sheet1!A1:C1',
      });
    });

    test('throws error when API call fails', async () => {
      const apiError = new Error('API Error');
      mockSheets.spreadsheets.values.get.mockRejectedValue(apiError);

      await expect(client.checkIfEmpty()).rejects.toThrow('API Error');
    });
  });

  describe('appendValues', () => {
    test('appends values to the spreadsheet', async () => {
      const mockResponse = { status: 200 };
      mockSheets.spreadsheets.values.append.mockResolvedValue(mockResponse);

      const values = [['Value1', 'Value2']];
      const result = await client.appendValues('Sheet1!A1', values);

      expect(result).toBe(mockResponse);
      expect(mockSheets.spreadsheets.values.append).toHaveBeenCalledWith({
        spreadsheetId: 'test-spreadsheet-id',
        range: 'Sheet1!A1',
        valueInputOption: 'RAW',
        resource: { values },
      });
    });

    test('uses default range when not provided', async () => {
      const mockResponse = { status: 200 };
      mockSheets.spreadsheets.values.append.mockResolvedValue(mockResponse);

      const values = [['Value1', 'Value2']];
      await client.appendValues(undefined, values);

      expect(mockSheets.spreadsheets.values.append).toHaveBeenCalledWith({
        spreadsheetId: 'test-spreadsheet-id',
        range: 'Sheet1!A1',
        valueInputOption: 'RAW',
        resource: { values },
      });
    });

    test('throws error when append fails', async () => {
      const apiError = new Error('Append failed');
      mockSheets.spreadsheets.values.append.mockRejectedValue(apiError);

      const values = [['Value1', 'Value2']];

      await expect(client.appendValues('Sheet1!A1', values)).rejects.toThrow('Append failed');
    });
  });
}); 