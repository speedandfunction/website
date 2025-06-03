const GoogleSheetsAuthProvider = require('./GoogleSheetsAuthProvider');

jest.mock('googleapis', () => ({
  google: {
    auth: {
      JWT: jest.fn(),
    },
  },
}));

jest.mock('../../../../utils/env', () => ({
  getEnv: jest.fn(),
}));

const { getEnv } = require('../../../../utils/env');
const { google } = require('googleapis');

describe('GoogleSheetsAuthProvider', () => {
  const mockEnvValues = {
    SPREADSHEET_ID: 'test-spreadsheet-id',
    SERVICE_ACCOUNT_EMAIL: 'test-email@example.com',
    SERVICE_ACCOUNT_PRIVATE_KEY: 'test-private-key\\nwith-newlines',
  };

  beforeEach(() => {
    jest.clearAllMocks();
    getEnv.mockImplementation((key) => mockEnvValues[key]);
    
    // Mock the JWT constructor
    google.auth.JWT.mockImplementation(() => ({}));
  });

  describe('getConfigFromEnv', () => {
    test('reads configuration from environment variables', () => {
      const config = GoogleSheetsAuthProvider.getConfigFromEnv();

      expect(config).toEqual({
        spreadsheetId: 'test-spreadsheet-id',
        serviceAccountEmail: 'test-email@example.com',
        serviceAccountPrivateKey: 'test-private-key\\nwith-newlines',
      });
      
      expect(getEnv).toHaveBeenCalledWith('SPREADSHEET_ID');
      expect(getEnv).toHaveBeenCalledWith('SERVICE_ACCOUNT_EMAIL');
      expect(getEnv).toHaveBeenCalledWith('SERVICE_ACCOUNT_PRIVATE_KEY');
    });
  });

  describe('createAuth', () => {
    test('creates JWT auth with correct configuration', () => {
      const config = {
        serviceAccountEmail: 'test@example.com',
        serviceAccountPrivateKey: 'test-key\\nwith-newlines',
      };

      const auth = GoogleSheetsAuthProvider.createAuth(config);

      expect(google.auth.JWT).toHaveBeenCalledWith({
        email: 'test@example.com',
        key: 'test-key\nwith-newlines',
        scopes: ['https://www.googleapis.com/auth/spreadsheets'],
      });
      expect(auth).toBeDefined();
    });
  });

  describe('getSheetsAuthConfig', () => {
    test('returns complete auth configuration', () => {
      const result = GoogleSheetsAuthProvider.getSheetsAuthConfig();

      expect(result).toHaveProperty('spreadsheetId', 'test-spreadsheet-id');
      expect(result).toHaveProperty('auth');
      expect(result.auth).toBeDefined();
    });
  });
}); 