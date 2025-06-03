const { google } = require('googleapis');
const { getEnv } = require('../../../../utils/env');

class GoogleSheetsAuthProvider {
  static getConfigFromEnv() {
    const spreadsheetId = getEnv('SPREADSHEET_ID');
    const serviceAccountEmail = getEnv('SERVICE_ACCOUNT_EMAIL');
    const serviceAccountPrivateKey = getEnv('SERVICE_ACCOUNT_PRIVATE_KEY');

    return {
      spreadsheetId,
      serviceAccountEmail,
      serviceAccountPrivateKey,
    };
  }

  static createAuth(config) {
    const { serviceAccountEmail, serviceAccountPrivateKey } = config;
    const privateKey = serviceAccountPrivateKey.replace(/\\n/gu, '\n');
    
    return new google.auth.JWT({
      email: serviceAccountEmail,
      key: privateKey,
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });
  }

  static getSheetsAuthConfig() {
    const config = this.getConfigFromEnv();
    const auth = this.createAuth(config);
    
    return {
      spreadsheetId: config.spreadsheetId,
      auth,
    };
  }
}

module.exports = GoogleSheetsAuthProvider; 