const GoogleSheetsService = require('./googleSheetsService');

jest.mock('googleapis', () => ({
  google: {
    auth: {
      JWT: jest.fn().mockImplementation(() => 'mocked-auth'),
    },
  },
}));

jest.mock('../../../../utils/env', () => ({
  getEnv: jest.fn(),
}));

const { getEnv } = require('../../../../utils/env');
const { google } = require('googleapis');

describe('GoogleSheetsService.getSheetsAuthConfig', () => {
  const mockEnvValues = {
    SPREADSHEET_ID: 'test-spreadsheet-id',
    SERVICE_ACCOUNT_EMAIL: 'test-email@example.com',
    SERVICE_ACCOUNT_PRIVATE_KEY: 'test-private-key\\nwith-newlines',
  };

  beforeEach(() => {
    jest.clearAllMocks();
    getEnv.mockImplementation((key) => mockEnvValues[key]);
  });

  test('returns spreadsheetId and auth object', () => {
    const result = GoogleSheetsService.getSheetsAuthConfig();

    expect(result).toHaveProperty('spreadsheetId', 'test-spreadsheet-id');
    expect(result).toHaveProperty('auth');
    expect(google.auth.JWT).toHaveBeenCalledWith({
      email: 'test-email@example.com',
      key: 'test-private-key\nwith-newlines',
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });
  });
});
