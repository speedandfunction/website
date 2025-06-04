const { google } = require('googleapis');
const getEnv = require('../../../../utils/env');
const { getSheetsAuthConfig } = require('./getSheetsAuthConfig');

jest.mock('../../../../utils/env', () => jest.fn());

jest.mock('googleapis', () => ({
  google: {
    auth: {
      JWT: jest.fn(),
    },
  },
}));

describe('getSheetsAuthConfig', () => {
  const mockConfig = {
    SPREADSHEET_ID: 'test-spreadsheet-id',
    SERVICE_ACCOUNT_EMAIL: 'test@example.com',
    SERVICE_ACCOUNT_PRIVATE_KEY: 'test-private-key',
  };

  const mockJWT = google.auth.JWT;

  beforeEach(() => {
    jest.clearAllMocks();
    getEnv.mockImplementation((key) => mockConfig[key]);
  });

  test('returns complete auth configuration', () => {
    const result = getSheetsAuthConfig();

    expect(result).toEqual({
      spreadsheetId: 'test-spreadsheet-id',
      auth: expect.any(Object),
    });

    expect(mockJWT).toHaveBeenCalledWith({
      email: 'test@example.com',
      key: 'test-private-key',
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });
  });

  test('handles private key with multiple newlines', () => {
    const keyWithNewlines = 'test\\nprivate\\nkey';
    getEnv.mockImplementation((key) => {
      if (key === 'SERVICE_ACCOUNT_PRIVATE_KEY') {
        return keyWithNewlines;
      }
      return mockConfig[key];
    });

    getSheetsAuthConfig();

    expect(mockJWT).toHaveBeenCalledWith({
      email: 'test@example.com',
      key: 'test\nprivate\nkey',
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });
  });

  test('throws error for missing private key', () => {
    getEnv.mockImplementation((key) => {
      if (key === 'SERVICE_ACCOUNT_PRIVATE_KEY') {
        return undefined;
      }
      return mockConfig[key];
    });

    expect(() => {
      getSheetsAuthConfig();
    }).toThrow('Invalid service account private key format');
  });

  test('throws error for non-string private key', () => {
    getEnv.mockImplementation((key) => {
      if (key === 'SERVICE_ACCOUNT_PRIVATE_KEY') {
        // Using a non-string value to test type validation
        return 123;
      }
      return mockConfig[key];
    });

    expect(() => {
      getSheetsAuthConfig();
    }).toThrow('Invalid service account private key format');
  });

  test('throws error for JWT creation failure', () => {
    mockJWT.mockImplementation(() => {
      throw new Error('Invalid key format');
    });

    expect(() => {
      getSheetsAuthConfig();
    }).toThrow('Failed to create JWT authentication: Invalid key format');
  });
});
