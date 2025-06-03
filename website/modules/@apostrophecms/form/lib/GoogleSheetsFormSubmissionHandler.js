const { google } = require('googleapis');
const { retryOperation } = require('../../../../utils/retryOperation');
const GoogleSheetsAuthProvider = require('./GoogleSheetsAuthProvider');
const FormDataFormatter = require('./FormDataFormatter');
const GoogleSheetsClient = require('./GoogleSheetsClient');
const GoogleSheetsErrorHandler = require('./GoogleSheetsErrorHandler');

const DEFAULT_SHEET_RANGE = 'Sheet1!A1';

class GoogleSheetsFormSubmissionHandler {
  constructor(client, formatter, errorHandler, authProvider) {
    if (!client || !formatter || !errorHandler) {
      throw new Error('Client, formatter, and errorHandler are required parameters');
    }
    
    if (!client.spreadsheetId) {
      throw new Error('Client must have a valid spreadsheetId');
    }
    
    this.client = client;
    this.formatter = formatter;
    this.errorHandler = errorHandler;
    this.authProvider = authProvider;
  }

  async checkHeadersWithRetry() {
    try {
      return await retryOperation(() => this.client.checkIfEmpty(), {
        self: this.errorHandler.logger,
        maxRetries: 3,
        delayMs: 1000,
      });
    } catch (error) {
      this.errorHandler.logError('Headers check failed after all attempts', error);
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
        await this.client.appendValues(DEFAULT_SHEET_RANGE, [headers]);
      } catch (error) {
        this.errorHandler.logError('Failed to add headers', error);
        return false;
      }
    }

    return true;
  }

  async handle(formSubmission) {
    try {
      const { headers, rowData } = this.formatter.formatForSpreadsheet(formSubmission);

      const headersAdded = await this.addHeadersIfNeeded(headers);
      if (!headersAdded) {
        return false;
      }

      await this.client.appendValues(DEFAULT_SHEET_RANGE, [rowData]);
      return true;
    } catch (error) {
      this.errorHandler.logError('Unexpected error', error);
      return false;
    }
  }

  // Backward compatibility methods
  async sendFormDataToGoogleSheets(formData) {
    return this.handle(formData);
  }

  formatFormData(formData) {
    return this.formatter.formatForSpreadsheet(formData);
  }

  async checkNeedHeaders() {
    try {
      return await this.client.checkIfEmpty();
    } catch (err) {
      this.errorHandler.logError('Headers check error', err);
      return false;
    }
  }

  async appendToSheet(values) {
    try {
      return await this.client.appendValues(DEFAULT_SHEET_RANGE, values);
    } catch (err) {
      this.errorHandler.logError('Append error', err);
      throw err;
    }
  }

  handleSheetsError(err) {
    const formattedError = this.errorHandler.formatError(err, 'Sheets operation', this.client.spreadsheetId);
    throw formattedError;
  }

  static getSheetsAuthConfig() {
    return GoogleSheetsAuthProvider.getSheetsAuthConfig();
  }

  static formatFormData(formData) {
    return FormDataFormatter.formatForSpreadsheet(formData);
  }
}

module.exports = GoogleSheetsFormSubmissionHandler; 