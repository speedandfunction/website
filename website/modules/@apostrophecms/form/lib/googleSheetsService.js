const { google } = require('googleapis');
const { getEnv } = require('../../../../utils/env');

const APPEND_RANGE = 'Sheet1!A1';

const ERROR_MESSAGES = {
  401: 'Unauthorized: Invalid credentials or misconfigured service account',
  403: 'Permission denied: Check if the service account has access to the spreadsheet',
  404: 'Spreadsheet not found',
};

const formatHeaderName = (key) =>
  key
    .split('-')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');

const logError = (self, context, error) =>
  self.apos.util.error(`[SHEETS] ${context}: ${error?.message || error}`);

const googleSheetsService = {
  getGoogleSheetsClient() {
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
  },

  handleSheetsError(err, contextMessage, spreadsheetId = '') {
    const baseMessage = ERROR_MESSAGES[err.code] || err.message;
    let fullMessage = `${baseMessage}`;
    if (spreadsheetId) {
      fullMessage += `: ${spreadsheetId}`;
    }

    throw new Error(fullMessage);
  },

  async checkNeedHeaders(sheets, spreadsheetId) {
    try {
      const checkResponse = await sheets.spreadsheets.values.get({
        spreadsheetId,
        range: 'Sheet1!A1:Z1',
      });

      return !checkResponse.data?.values?.length;
    } catch (err) {
      this.handleSheetsError(err, 'Headers check error', spreadsheetId);
      return false;
    }
  },

  formatFormData(formData) {
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
  },

  async appendToSheet(self, sheets, spreadsheetId, values) {
    try {
      return await sheets.spreadsheets.values.append({
        spreadsheetId,
        range: APPEND_RANGE,
        valueInputOption: 'RAW',
        resource: { values },
      });
    } catch (err) {
      logError(self, 'Append error', err);
      throw err;
    }
  },

  sleep(ms) {
    return new Promise((resolve) => {
      setTimeout(resolve, ms);
    });
  },

  async retryOperation(operation, options = {}) {
    const { self, maxRetries = 3, delayMs = 1000 } = options;

    let attempt = 0;

    const tryOperation = async () => {
      try {
        return await operation();
      } catch (error) {
        attempt += 1;
        const retriesLeft = maxRetries - attempt;

        self.apos.util.error(
          `[SHEETS] Operation failed, retries left: ${retriesLeft}`,
          error,
        );

        if (retriesLeft <= 0) {
          throw error;
        }

        await this.sleep(delayMs);
        return tryOperation();
      }
    };

    return await tryOperation();
  },

  async checkHeadersWithRetry(self, sheets, spreadsheetId) {
    try {
      return await this.retryOperation(
        () => this.checkNeedHeaders(sheets, spreadsheetId),
        { self, maxRetries: 3, delayMs: 1000 },
      );
    } catch (error) {
      logError(self, 'Headers check failed after all attempts', error);
      return null;
    }
  },

  async addHeadersIfNeeded(self, sheets, spreadsheetId, headers) {
    const needHeaders = await this.checkHeadersWithRetry(
      self,
      sheets,
      spreadsheetId,
    );

    if (needHeaders === null) {
      return false;
    }

    if (needHeaders) {
      try {
        await this.appendToSheet(self, sheets, spreadsheetId, [headers]);
      } catch (error) {
        logError(self, 'Failed to add headers', error);
        return false;
      }
    }

    return true;
  },

  async sendFormDataToGoogleSheets(self, formData) {
    try {
      const { spreadsheetId, auth } = this.getGoogleSheetsClient();

      if (!spreadsheetId || !auth) {
        self.apos.util.error('[SHEETS] Missing Google Sheets configuration');
        return false;
      }

      const sheets = google.sheets({ version: 'v4', auth });
      const { headers, rowData } = this.formatFormData(formData);

      const headersAdded = await this.addHeadersIfNeeded(
        self,
        sheets,
        spreadsheetId,
        headers,
      );

      if (!headersAdded) {
        return false;
      }

      await this.appendToSheet(self, sheets, spreadsheetId, [rowData]);
      return true;
    } catch (error) {
      logError(self, 'Unexpected error', error);
      return false;
    }
  },
};

module.exports = googleSheetsService;
