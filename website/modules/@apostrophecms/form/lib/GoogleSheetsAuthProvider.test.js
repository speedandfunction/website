const GoogleSheetsAuthProvider = require('./GoogleSheetsAuthProvider');
const { google } = require('googleapis');
const { getEnv } = require('../../../../utils/env');

jest.mock('googleapis');
jest.mock('../../../../utils/env');

describe('GoogleSheetsAuthProvider', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('getConfigFromEnv reads configuration from environment variables', () => {
    const mockConfig = {
      SPREADSHEET_ID: 'test-spreadsheet-id',
      SERVICE_ACCOUNT_EMAIL: 'test@example.com',
      SERVICE_ACCOUNT_PRIVATE_KEY: 'test-key',
    };

    getEnv.mockImplementation((key) => mockConfig[key]);

    const config = GoogleSheetsAuthProvider.getConfigFromEnv();

    expect(config).toEqual({
      spreadsheetId: 'test-spreadsheet-id',
      serviceAccountEmail: 'test@example.com',
      serviceAccountPrivateKey: 'test-key',
    });
  });

  test('getConfigFromEnv handles missing environment variables', () => {
    getEnv.mockImplementation(() => {
      throw new Error('Environment variable "SPREADSHEET_ID" is not defined');
    });

    expect(() => {
      GoogleSheetsAuthProvider.getConfigFromEnv();
    }).toThrow('Environment variable "SPREADSHEET_ID" is not defined');
  });

  test('createAuth creates JWT auth with correct configuration', () => {
    const mockJWT = jest.fn();
    google.auth.JWT = mockJWT;

    const config = {
      serviceAccountEmail: 'test@example.com',
      serviceAccountPrivateKey: 'test-key',
    };

    GoogleSheetsAuthProvider.createAuth(config);

    expect(mockJWT).toHaveBeenCalledWith({
      email: 'test@example.com',
      key: 'test-key',
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });
  });

  test('createAuth handles private key with multiple newlines', () => {
    const mockJWT = jest.fn();
    google.auth.JWT = mockJWT;

    const config = {
      serviceAccountEmail: 'test@example.com',
      serviceAccountPrivateKey: 'test\\nkey\\nwith\\nnewlines',
    };

    GoogleSheetsAuthProvider.createAuth(config);

    expect(mockJWT).toHaveBeenCalledWith({
      email: 'test@example.com',
      key: 'test\nkey\nwith\nnewlines',
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });
  });

  test('createAuth handles private key without newlines', () => {
    const mockJWT = jest.fn();
    google.auth.JWT = mockJWT;

    const config = {
      serviceAccountEmail: 'test@example.com',
      serviceAccountPrivateKey: 'test-key',
    };

    GoogleSheetsAuthProvider.createAuth(config);

    expect(mockJWT).toHaveBeenCalledWith({
      email: 'test@example.com',
      key: 'test-key',
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });
  });

  test('createAuth handles missing authentication parameters', () => {
    const config = {
      serviceAccountEmail: 'test@example.com',
    };

    expect(() => {
      GoogleSheetsAuthProvider.createAuth(config);
    }).toThrow("Cannot read properties of undefined (reading 'replace')");
  });

  test('getSheetsAuthConfig returns complete auth configuration', () => {
    const mockJWT = jest.fn();
    google.auth.JWT = mockJWT;

    const mockConfig = {
      SPREADSHEET_ID: 'test-spreadsheet-id',
      SERVICE_ACCOUNT_EMAIL: 'test@example.com',
      SERVICE_ACCOUNT_PRIVATE_KEY: 'test-key',
    };

    getEnv.mockImplementation((key) => mockConfig[key]);

    const result = GoogleSheetsAuthProvider.getSheetsAuthConfig();

    expect(result).toEqual({
      spreadsheetId: 'test-spreadsheet-id',
      auth: expect.any(Object),
    });
    expect(mockJWT).toHaveBeenCalled();
  });

  test('getSheetsAuthConfig handles missing environment variables', () => {
    getEnv.mockImplementation(() => undefined);

    expect(() => {
      GoogleSheetsAuthProvider.getSheetsAuthConfig();
    }).toThrow("Cannot read properties of undefined (reading 'replace')");
  });

  test('getSheetsAuthConfig handles JWT creation error', () => {
    const mockJWT = jest.fn().mockImplementation(() => {
      throw new Error('JWT creation failed');
    });
    google.auth.JWT = mockJWT;

    const mockConfig = {
      SPREADSHEET_ID: 'test-spreadsheet-id',
      SERVICE_ACCOUNT_EMAIL: 'test@example.com',
      SERVICE_ACCOUNT_PRIVATE_KEY: 'test-key',
    };

    getEnv.mockImplementation((key) => mockConfig[key]);

    expect(() => {
      GoogleSheetsAuthProvider.getSheetsAuthConfig();
    }).toThrow('JWT creation failed');
  });
});
