const mockTimestamp = 1234567890;
const mockISOString = '2023-01-01T00:00:00.000Z';

const RealDate = Date;

global.Date = class MockDate {
  constructor() {
    this.toISOString = () => mockISOString;
  }

  static now() {
    return mockTimestamp;
  }
};

const FormDataFormatter = require('./FormDataFormatter');

describe('FormDataFormatter', () => {
  afterAll(() => {
    global.Date = RealDate;
  });

  describe('generateHeaders', () => {
    test('generates headers correctly from form data with standard fields', () => {
      const formData = {
        '_id': 'form-id-123',
        'first-name': 'John',
        'last-name': 'Doe',
        'email-address': 'john@example.com',
      };

      const headers = FormDataFormatter.generateHeaders(formData);

      expect(headers).toEqual([
        'ID',
        'Timestamp',
        'First Name',
        'Last Name',
        'Email Address',
      ]);
    });

    test('excludes _id field from headers', () => {
      const formData = {
        _id: 'form-id-123',
        name: 'John',
      };

      const headers = FormDataFormatter.generateHeaders(formData);

      expect(headers).toEqual(['ID', 'Timestamp', 'Name']);
      expect(headers).not.toContain('Id');
    });

    test('handles empty form data correctly', () => {
      const formData = {};

      const headers = FormDataFormatter.generateHeaders(formData);

      expect(headers).toEqual(['ID', 'Timestamp']);
    });
  });

  describe('generateRowData', () => {
    test('generates row data with ID and timestamp first', () => {
      const formData = {
        _id: 'form-id-123',
        name: 'John',
        email: 'john@example.com',
      };

      const rowData = FormDataFormatter.generateRowData(formData);

      expect(rowData[0]).toBe(mockTimestamp.toString());
      expect(rowData[1]).toBe(mockISOString);
      expect(rowData[2]).toBe('John');
      expect(rowData[3]).toBe('john@example.com');
    });

    test('handles array values by joining with comma and space', () => {
      const formData = {
        choices: ['Option 1', 'Option 2', 'Option 3'],
      };

      const rowData = FormDataFormatter.generateRowData(formData);

      expect(rowData[2]).toBe('Option 1, Option 2, Option 3');
    });

    test('handles empty array values', () => {
      const formData = {
        choices: [],
      };

      const rowData = FormDataFormatter.generateRowData(formData);

      expect(rowData[2]).toBe('');
    });

    test('handles null and undefined values', () => {
      const formData = {
        name: null,
        email: undefined,
      };

      const rowData = FormDataFormatter.generateRowData(formData);

      expect(rowData[2]).toBe(null);
      expect(rowData[3]).toBe(undefined);
    });

    test('excludes _id field from row data', () => {
      const formData = {
        _id: 'form-id-123',
        name: 'John',
      };

      const rowData = FormDataFormatter.generateRowData(formData);

      expect(rowData).toHaveLength(3);
      expect(rowData).not.toContain('form-id-123');
    });

    test('handles empty form data correctly', () => {
      const formData = {};

      const rowData = FormDataFormatter.generateRowData(formData);

      expect(rowData).toHaveLength(2);
      expect(rowData[0]).toBe(mockTimestamp.toString());
      expect(rowData[1]).toBe(mockISOString);
    });
  });

  describe('formatForSpreadsheet', () => {
    test('returns both headers and row data in correct format', () => {
      const formData = {
        '_id': 'form-id-123',
        'first-name': 'John',
        'last-name': 'Doe',
        'multiple-choice': ['Option 1', 'Option 2'],
      };

      const result = FormDataFormatter.formatForSpreadsheet(formData);

      expect(result).toHaveProperty('headers');
      expect(result).toHaveProperty('rowData');
      expect(result.headers).toHaveLength(5);
      expect(result.rowData).toHaveLength(5);
      expect(result.rowData[4]).toBe('Option 1, Option 2');
    });

    test('handles empty form data correctly', () => {
      const formData = {};

      const result = FormDataFormatter.formatForSpreadsheet(formData);

      expect(result.headers).toEqual(['ID', 'Timestamp']);
      expect(result.rowData).toHaveLength(2);
      expect(result.rowData[0]).toBe(mockTimestamp.toString());
      expect(result.rowData[1]).toBe(mockISOString);
    });
  });
});
