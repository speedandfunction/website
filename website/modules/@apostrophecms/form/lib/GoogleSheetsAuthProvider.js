const { google } = require('googleapis');
const getEnv = require('../../../../utils/env');

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
  const privateKey = serviceAccountPrivateKey.replace(/\\n/gu, '\n');

  return new google.auth.JWT({
    email: serviceAccountEmail,
    key: privateKey,
    scopes: SCOPES,
  });
};

const getSheetsAuthConfig = () => {
  const config = getConfigFromEnv();
  const auth = createAuth(config);

  return {
    spreadsheetId: config.spreadsheetId,
    auth,
  };
};

module.exports = {
  getSheetsAuthConfig,
};
