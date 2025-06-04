const { formatForSpreadsheet } = require('./FormDataFormatter');

describe('FormDataFormatter', () => {
  const mockTimestamp = 1234567890;
  const mockISOString = '2023-01-01T00:00:00.000Z';

  beforeEach(() => {
    jest.spyOn(Date, 'now').mockReturnValue(mockTimestamp);
    jest.spyOn(Date.prototype, 'toISOString').mockReturnValue(mockISOString);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('formatForSpreadsheet', () => {
    test('formats form data with standard fields correctly', () => {
      const formData = {
        name: 'John Doe',
        email: 'john@example.com',
        message: 'Hello world',
      };

      const result = formatForSpreadsheet(formData);

      expect(result).toEqual({
        headers: ['ID', 'Timestamp', 'Name', 'Email', 'Message'],
        rowData: [
          mockTimestamp.toString(),
          mockISOString,
          'John Doe',
          'john@example.com',
          'Hello world',
        ],
      });
    });

    test('excludes _id field from output', () => {
      const formData = {
        _id: 'form-id-123',
        name: 'John Doe',
      };

      const result = formatForSpreadsheet(formData);

      expect(result.headers).toEqual(['ID', 'Timestamp', 'Name']);
      expect(result.rowData).toEqual([
        mockTimestamp.toString(),
        mockISOString,
        'John Doe',
      ]);
    });

    test('handles array values by joining with comma and space', () => {
      const formData = {
        options: ['Option 1', 'Option 2', 'Option 3'],
      };

      const result = formatForSpreadsheet(formData);

      expect(result.headers).toEqual(['ID', 'Timestamp', 'Options']);
      expect(result.rowData).toEqual([
        mockTimestamp.toString(),
        mockISOString,
        'Option 1, Option 2, Option 3',
      ]);
    });

    test('handles empty array values', () => {
      const formData = {
        options: [],
      };

      const result = formatForSpreadsheet(formData);

      expect(result.headers).toEqual(['ID', 'Timestamp', 'Options']);
      expect(result.rowData).toEqual([
        mockTimestamp.toString(),
        mockISOString,
        '',
      ]);
    });

    test('handles null and undefined values', () => {
      const formData = {
        nullValue: null,
        undefinedValue: undefined,
      };

      const result = formatForSpreadsheet(formData);

      expect(result.headers).toEqual([
        'ID',
        'Timestamp',
        'Nullvalue',
        'Undefinedvalue',
      ]);
      expect(result.rowData).toEqual([
        mockTimestamp.toString(),
        mockISOString,
        null,
        undefined,
      ]);
    });

    test('handles empty form data correctly', () => {
      const formData = {};

      const result = formatForSpreadsheet(formData);

      expect(result).toEqual({
        headers: ['ID', 'Timestamp'],
        rowData: [mockTimestamp.toString(), mockISOString],
      });
    });
  });
});
