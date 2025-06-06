const { google } = require('googleapis');
const { getEnv } = require('../../../../utils/env');

const SCOPES = ['https://www.googleapis.com/auth/spreadsheets'];

const getConfigFromEnv = () => {
  const spreadsheetId = getEnv('SPREADSHEET_ID');
  const serviceAccountEmail = getEnv('SERVICE_ACCOUNT_EMAIL');
  const serviceAccountPrivateKey = getEnv('SERVICE_ACCOUNT_PRIVATE_KEY');

  return {
    spreadsheetId,
    serviceAccountEmail,
    serviceAccountPrivateKey,
  };
};

const createAuth = (config) => {
  const { serviceAccountEmail, serviceAccountPrivateKey } = config;

  if (
    !serviceAccountPrivateKey ||
    typeof serviceAccountPrivateKey !== 'string'
  ) {
    throw new Error('Invalid service account private key format');
  }

  const privateKey = serviceAccountPrivateKey.replace(/\\n/gu, '\n');

  try {
    return new google.auth.JWT({
      email: serviceAccountEmail,
      key: privateKey,
      scopes: SCOPES,
    });
  } catch (error) {
    throw new Error(`Failed to create JWT authentication: ${error.message}`);
  }
};

const getSheetsAuthConfig = () => {
  const config = getConfigFromEnv();
  const auth = createAuth(config);
  const sheets = google.sheets({ version: 'v4', auth });

  return {
    spreadsheetId: config.spreadsheetId,
    auth,
    sheets,
  };
};

module.exports = {
  getSheetsAuthConfig,
};
