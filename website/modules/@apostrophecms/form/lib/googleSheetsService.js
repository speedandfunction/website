const { google } = require('googleapis');
const { getEnv } = require('../../../../utils/env');

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

  async checkNeedHeaders(sheets, spreadsheetId) {
    try {
      const checkResponse = await sheets.spreadsheets.values.get({
        spreadsheetId,
        range: 'Sheet1!A1:Z1',
      });

      return !checkResponse.data?.values?.length;
    } catch (err) {
      if (err.code === 404) {
        throw new Error(`Spreadsheet not found: ${spreadsheetId}`);
      } else if (err.code === 403) {
        throw new Error(
          `Permission denied: Check if the service account has access to the spreadsheet`,
        );
      } else if (err.code === 401) {
        throw new Error(
          `Unauthorized: Invalid credentials or misconfigured service account`,
        );
      } else {
        throw new Error(`Headers check error: ${err.message}`);
      }
    }
  },

  formatFormData(formData) {
    const id = Date.now().toString();
    const timestamp = new Date().toISOString();

    const headers = ['ID', 'Timestamp'];
    const rowData = [id, timestamp];

    const { _id, ...formFields } = formData;

    Object.entries(formFields).forEach(([key, value]) => {
      const headerName = key
        .split('-')
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');

      headers.push(headerName);

      if (Array.isArray(value)) {
        rowData.push(value.join(', '));
      } else {
        rowData.push(value);
      }
    });

    return { headers, rowData };
  },

  async appendToSheet(sheets, spreadsheetId, values) {
    try {
      const response = await sheets.spreadsheets.values.append({
        spreadsheetId,
        range: 'Sheet1!A1',
        valueInputOption: 'RAW',
        resource: { values },
      });
      return response;
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error(`[SHEETS] Append error: ${err.message}`);
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

        // eslint-disable-next-line no-console
        console.error(`Operation failed, retries left: ${retriesLeft}`);

        if (retriesLeft <= 0) {
          break;
        }

        // eslint-disable-next-line no-await-in-loop
        await this.sleep(delayMs);
      }
    }

    throw lastError;
  },

  async checkHeadersWithRetry(sheets, spreadsheetId) {
    try {
      return await this.retryOperation(
        () => this.checkNeedHeaders(sheets, spreadsheetId),
        3,
        1000,
      );
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error(
        `[SHEETS] Headers check failed after all attempts: ${error.message}`,
      );
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
        // eslint-disable-next-line no-console
        console.error(`[SHEETS] Failed to add headers: ${error.message}`);
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
      if (!headersAdded) return false;

      try {
        await this.appendToSheet(sheets, spreadsheetId, [rowData]);
        return true;
      } catch (error) {
        // eslint-disable-next-line no-console
        console.error(`[SHEETS] Failed to send form data: ${error.message}`);
        return false;
      }
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error(`[SHEETS] Unexpected error: ${error.message}`);
      return false;
    }
  },
};

module.exports = googleSheetsService;
