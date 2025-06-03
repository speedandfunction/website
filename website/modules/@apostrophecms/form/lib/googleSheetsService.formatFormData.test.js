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

const GoogleSheetsService = require('./googleSheetsService');

describe('GoogleSheetsService.formatFormData', () => {
  afterAll(() => {
    global.Date = RealDate;
  });

  it('should format form data correctly', () => {
    const formData = {
      '_id': 'form-id-123',
      'first-name': 'John',
      'last-name': 'Doe',
      'email-address': 'john@example.com',
      'multiple-choice': ['Option 1', 'Option 2'],
    };

    const result = GoogleSheetsService.formatFormData(formData);

    expect(result).toHaveProperty('headers');
    expect(result).toHaveProperty('rowData');
    const expectedHeaders = [
      'ID',
      'Timestamp',
      'First Name',
      'Last Name',
      'Email Address',
      'Multiple Choice',
    ];
    expect(result.headers).toEqual(expectedHeaders);

    expect(result.rowData).toHaveLength(result.headers.length);

    expect(result.rowData[0]).toBe(mockTimestamp.toString());
    expect(result.rowData[1]).toBe(mockISOString);
    expect(result.rowData[2]).toBe('John');
    expect(result.rowData[3]).toBe('Doe');
    expect(result.rowData[4]).toBe('john@example.com');
    expect(result.rowData[5]).toBe('Option 1, Option 2');
  });
});
