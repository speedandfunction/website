const { google } = require('googleapis');
const { getEnv } = require('../../../../utils/env');
const { retryOperation } = require('../../../../utils/retryOperation');
const { formatHeaderName } = require('../../../../utils/formatHeaderName');

const APPEND_RANGE = 'Sheet1!A1';

const ERROR_MESSAGES = {
  401: 'Unauthorized: Invalid credentials or misconfigured service account',
  403: 'Permission denied: Check if the service account has access to the spreadsheet',
  404: 'Spreadsheet not found',
};

class GoogleSheetsService {
  constructor(self, options = {}) {
    this.self = self;

    if (options.spreadsheetId && options.sheets) {
      this.spreadsheetId = options.spreadsheetId;
      this.auth = options.auth || 'test-auth';
      this.sheets = options.sheets;
    } else {
      const { spreadsheetId, auth } = GoogleSheetsService.getSheetsAuthConfig();
      this.spreadsheetId = spreadsheetId;
      this.auth = auth;
      this.sheets = google.sheets({ version: 'v4', auth });
    }
  }

  logError(context, error) {
    this.self.apos.util.error(
      `[SHEETS] ${context}: ${error?.message || error}`,
    );
  }

  static getSheetsAuthConfig() {
    const spreadsheetId = getEnv('SPREADSHEET_ID');
    const serviceAccountEmail = getEnv('SERVICE_ACCOUNT_EMAIL');
    const serviceAccountPrivateKey = getEnv('SERVICE_ACCOUNT_PRIVATE_KEY');

    const privateKey = serviceAccountPrivateKey.replace(/\\n/gu, '\n');
    const auth = new google.auth.JWT({
      email: serviceAccountEmail,
      key: privateKey,
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });

    return { spreadsheetId, auth };
  }

  handleSheetsError(err, contextMessage) {
    const baseMessage = ERROR_MESSAGES[err.code] || err.message;
    let fullMessage = `${baseMessage}`;
    if (this.spreadsheetId) {
      fullMessage += `: ${this.spreadsheetId}`;
    }

    throw new Error(fullMessage);
  }

  async checkNeedHeaders() {
    try {
      const checkResponse = await this.sheets.spreadsheets.values.get({
        spreadsheetId: this.spreadsheetId,
        range: 'Sheet1!A1:Z1',
      });

      return !checkResponse.data?.values?.length;
    } catch (err) {
      this.handleSheetsError(err, 'Headers check error');
      return false;
    }
  }

  static formatFormData(formData) {
    const id = Date.now().toString();
    const timestamp = new Date().toISOString();

    const headers = ['ID', 'Timestamp'];
    const rowData = [id, timestamp];

    const { _id, ...formFields } = formData;

    for (const [key, value] of Object.entries(formFields)) {
      headers.push(formatHeaderName(key));
      if (Array.isArray(value)) {
        rowData.push(value.join(', '));
      } else {
        rowData.push(value);
      }
    }

    return { headers, rowData };
  }

  async appendToSheet(values) {
    try {
      return await this.sheets.spreadsheets.values.append({
        spreadsheetId: this.spreadsheetId,
        range: APPEND_RANGE,
        valueInputOption: 'RAW',
        resource: { values },
      });
    } catch (err) {
      this.logError('Append error', err);
      throw err;
    }
  }

  async checkHeadersWithRetry() {
    try {
      return await retryOperation(() => this.checkNeedHeaders(), {
        self: this.self,
        maxRetries: 3,
        delayMs: 1000,
      });
    } catch (error) {
      this.logError('Headers check failed after all attempts', error);
      return null;
    }
  }

  async addHeadersIfNeeded(headers) {
    const needHeaders = await this.checkHeadersWithRetry();

    if (needHeaders === null) {
      return false;
    }

    if (needHeaders) {
      try {
        await this.appendToSheet([headers]);
      } catch (error) {
        this.logError('Failed to add headers', error);
        return false;
      }
    }

    return true;
  }

  async sendFormDataToGoogleSheets(formData) {
    try {
      if (!this.spreadsheetId || !this.auth) {
        this.self.apos.util.error(
          '[SHEETS] Missing Google Sheets configuration',
        );
        return false;
      }

      const { headers, rowData } = this.formatFormData(formData);

      const headersAdded = await this.addHeadersIfNeeded(headers);
      if (!headersAdded) {
        return false;
      }

      await this.appendToSheet([rowData]);
      return true;
    } catch (error) {
      this.logError('Unexpected error', error);
      return false;
    }
  }

  formatFormData(formData) {
    return this.constructor.formatFormData(formData);
  }
}

module.exports = GoogleSheetsService;
