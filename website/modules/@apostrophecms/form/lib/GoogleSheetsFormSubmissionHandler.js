const { retryOperation } = require('../../../../utils/retryOperation');

const DEFAULT_APPEND_RANGE = 'Sheet1!A1';
const DEFAULT_HEADER_CHECK_RANGE = 'Sheet1!A1:Z1';

class GoogleSheetsFormSubmissionHandler {
  constructor(client, formatForSpreadsheet, errorHandler, getSheetsAuthConfig) {
    if (
      !client ||
      !formatForSpreadsheet ||
      !errorHandler ||
      !getSheetsAuthConfig
    ) {
      throw new Error(
        'Client, formatForSpreadsheet, errorHandler, and getSheetsAuthConfig are required parameters',
      );
    }

    if (!client.spreadsheetId) {
      throw new Error('Client must have a valid spreadsheetId');
    }

    this.client = client;
    this.formatForSpreadsheet = formatForSpreadsheet;
    this.errorHandler = errorHandler;
    this.getSheetsAuthConfig = getSheetsAuthConfig;
  }

  configureAuth() {
    const authConfig = this.getSheetsAuthConfig();
    this.client.sheets = authConfig.sheets;
  }

  async checkHeadersWithRetry() {
    try {
      return await retryOperation(
        () => this.client.checkIfEmpty(DEFAULT_HEADER_CHECK_RANGE),
        {
          self: this.errorHandler.logger,
          maxRetries: 3,
          delayMs: 1000,
        },
      );
    } catch (error) {
      this.errorHandler.logError(
        'Headers check failed after all attempts',
        error,
      );
      return null;
    }
  }

  async addHeadersIfNeeded(headers) {
    if (!Array.isArray(headers) || headers.length === 0) {
      this.errorHandler.logError('Invalid headers format', { headers });
      return false;
    }

    const needHeaders = await this.checkHeadersWithRetry();

    if (needHeaders === null) {
      return false;
    }

    if (needHeaders) {
      try {
        await this.client.appendValues(DEFAULT_APPEND_RANGE, [headers]);
      } catch (error) {
        this.errorHandler.logError('Failed to add headers', error);
        return false;
      }
    }

    return true;
  }

  async handle(formSubmission) {
    if (!formSubmission) {
      this.errorHandler.logError('Invalid form submission', { formSubmission });
      return false;
    }

    try {
      this.configureAuth();

      const { headers, rowData } = this.formatForSpreadsheet(formSubmission);

      if (!Array.isArray(headers) || !Array.isArray(rowData)) {
        this.errorHandler.logError('Invalid formatter output', {
          headers,
          rowData,
        });
        return false;
      }

      const headersAdded = await this.addHeadersIfNeeded(headers);
      if (!headersAdded) {
        return false;
      }

      await this.client.appendValues(DEFAULT_APPEND_RANGE, [rowData]);
      return true;
    } catch (error) {
      this.errorHandler.logError('Unexpected error', error);
      return false;
    }
  }
}

module.exports = GoogleSheetsFormSubmissionHandler;
