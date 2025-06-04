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
  let mockSheets = createMockSheets();
  let client = new GoogleSheetsClient(mockSheets, 'test-spreadsheet-id');

  beforeEach(() => {
    mockSheets = createMockSheets();
    client = new GoogleSheetsClient(mockSheets, 'test-spreadsheet-id');
    jest.clearAllMocks();
  });

  test('sets sheets and spreadsheetId properties', () => {
    expect(client.sheets).toBe(mockSheets);
    expect(client.spreadsheetId).toBe('test-spreadsheet-id');
  });

  test('throws error when sheets service is not provided', () => {
    expect(() => new GoogleSheetsClient(null, 'test-spreadsheet-id')).toThrow(
      'Sheets service is required',
    );
  });

  test('throws error when spreadsheetId is not provided', () => {
    expect(() => new GoogleSheetsClient(mockSheets, null)).toThrow(
      'Spreadsheet ID is required',
    );
  });

  test('checkIfEmpty returns true when no values exist', async () => {
    mockSheets.spreadsheets.values.get.mockResolvedValue({
      data: { values: [] },
    });

    const result = await client.checkIfEmpty('Sheet1!A1:Z1');

    expect(result).toBe(true);
    expect(mockSheets.spreadsheets.values.get).toHaveBeenCalledWith({
      spreadsheetId: 'test-spreadsheet-id',
      range: 'Sheet1!A1:Z1',
    });
  });

  test('checkIfEmpty returns false when values exist', async () => {
    mockSheets.spreadsheets.values.get.mockResolvedValue({
      data: { values: [['Header1', 'Header2']] },
    });

    const result = await client.checkIfEmpty('Sheet1!A1:Z1');

    expect(result).toBe(false);
  });

  test('checkIfEmpty throws error when range is not provided', async () => {
    await expect(client.checkIfEmpty()).rejects.toThrow('Range is required');
  });

  test('checkIfEmpty throws error when API call fails', async () => {
    const apiError = new Error('API Error');
    mockSheets.spreadsheets.values.get.mockRejectedValue(apiError);

    await expect(client.checkIfEmpty('Sheet1!A1:Z1')).rejects.toThrow(
      'API Error',
    );
  });

  test('appendValues appends values to the spreadsheet', async () => {
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

  test('appendValues throws error when range is not provided', async () => {
    const values = [['Value1', 'Value2']];
    await expect(client.appendValues(null, values)).rejects.toThrow(
      'Range is required',
    );
  });

  test('appendValues throws error when values is not an array', async () => {
    await expect(
      client.appendValues('Sheet1!A1', 'not-an-array'),
    ).rejects.toThrow('Values must be an array');
  });

  test('appendValues throws error when values is null', async () => {
    await expect(client.appendValues('Sheet1!A1', null)).rejects.toThrow(
      'Values must be an array',
    );
  });

  test('appendValues throws error when append fails', async () => {
    const apiError = new Error('Append failed');
    mockSheets.spreadsheets.values.append.mockRejectedValue(apiError);

    const values = [['Value1', 'Value2']];

    await expect(client.appendValues('Sheet1!A1', values)).rejects.toThrow(
      'Append failed',
    );
  });
});
