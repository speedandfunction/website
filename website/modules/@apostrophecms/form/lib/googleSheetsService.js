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

const logError = (context, error) =>
  // eslint-disable-next-line no-console
  console.error(`[SHEETS] ${context}: ${error?.message || error}`);

const googleSheetsService = {
  getGoogleSheetsClient() {
    const spreadsheetId = getEnv('SPREADSHEET_ID');
    const serviceAccountEmail = getEnv('SERVICE_ACCOUNT_EMAIL');
    const serviceAccountPrivateKey = getEnv('SERVICE_ACCOUNT_PRIVATE_KEY');

    if (!spreadsheetId || !serviceAccountEmail || !serviceAccountPrivateKey) {
      throw new Error('Missing required Google Sheets environment variables');
    }

    const privateKey = serviceAccountPrivateKey.replace(/\\n/gu, '\n');
    const auth = new google.auth.JWT({
      email: serviceAccountEmail,
      key: privateKey,
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });

    return { spreadsheetId, auth };
  },

  handleSheetsError(err, contextMessage, spreadsheetId = '') {
    let baseMessage = '';
    if (ERROR_MESSAGES[err.code]) {
      baseMessage = ERROR_MESSAGES[err.code];
    } else {
      baseMessage = err.message;
    }

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
      throw err;
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

  async appendToSheet(sheets, spreadsheetId, values) {
    try {
      return await sheets.spreadsheets.values.append({
        spreadsheetId,
        range: APPEND_RANGE,
        valueInputOption: 'RAW',
        resource: { values },
      });
    } catch (err) {
      logError('Append error', err);
      throw err;
    }
  },

  sleep(ms) {
    return new Promise((resolve) => {
      setTimeout(resolve, ms);
    });
  },

  async retryOperation(operation, maxRetries = 3, delayMs = 1000) {
    let lastError = null;

    for (let attempt = 0; attempt < maxRetries; attempt += 1) {
      try {
        // eslint-disable-next-line no-await-in-loop
        return await operation();
      } catch (error) {
        lastError = error;
        const retriesLeft = maxRetries - attempt - 1;
        logError(`Operation failed, retries left: ${retriesLeft}`, error);
        if (retriesLeft <= 0) {
          break;
        }
        // eslint-disable-next-line no-await-in-loop
        await this.sleep(delayMs);
      }
    }

    throw lastError || new Error('Operation failed');
  },

  async checkHeadersWithRetry(sheets, spreadsheetId) {
    try {
      return await this.retryOperation(
        () => this.checkNeedHeaders(sheets, spreadsheetId),
        3,
        1000,
      );
    } catch (error) {
      logError('Headers check failed after all attempts', error);
      return null;
    }
  },

  async addHeadersIfNeeded(sheets, spreadsheetId, headers) {
    const needHeaders = await this.checkHeadersWithRetry(sheets, spreadsheetId);

    if (needHeaders === null) {
      return false;
    }

    if (needHeaders) {
      try {
        await this.appendToSheet(sheets, spreadsheetId, [headers]);
      } catch (error) {
        logError('Failed to add headers', error);
        return false;
      }
    }

    return true;
  },

  async sendFormDataToGoogleSheets(formData) {
    try {
      const { spreadsheetId, auth } = this.getGoogleSheetsClient();

      if (!spreadsheetId || !auth) {
        // eslint-disable-next-line no-console
        console.error('[SHEETS] Missing Google Sheets configuration');
        return false;
      }

      const sheets = google.sheets({ version: 'v4', auth });
      const { headers, rowData } = this.formatFormData(formData);

      const headersAdded = await this.addHeadersIfNeeded(
        sheets,
        spreadsheetId,
        headers,
      );

      if (!headersAdded) {
        return false;
      }

      await this.appendToSheet(sheets, spreadsheetId, [rowData]);
      return true;
    } catch (error) {
      if (error.message === 'Append failed') {
        // eslint-disable-next-line no-console
        console.error('[SHEETS] Failed to send form data: Append failed');
      } else {
        logError('Unexpected error', error);
      }
      return false;
    }
  },
};

module.exports = googleSheetsService;
