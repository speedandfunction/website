const ERROR_MESSAGES = {
  401: 'Unauthorized: Invalid credentials or misconfigured service account',
  403: 'Permission denied: Check if the service account has access to the spreadsheet',
  404: 'Spreadsheet not found',
};

class GoogleSheetsErrorHandler {
  constructor(logger) {
    this.logger = logger;
  }

  static getErrorMessage(errorCode) {
    return ERROR_MESSAGES[errorCode] || null;
  }

  static formatError(error, context, spreadsheetId = null) {
    const predefinedMessage = this.getErrorMessage(error.code);
    const baseMessage = predefinedMessage || error.message || 'Unknown error occurred';
    let fullMessage = `${baseMessage}`;
    
    if (spreadsheetId) {
      fullMessage += `: ${spreadsheetId}`;
    }

    return new Error(fullMessage);
  }

  logError(context, error) {
    if (this.logger && this.logger.apos && this.logger.apos.util && this.logger.apos.util.error) {
      this.logger.apos.util.error(
        `[SHEETS] ${context}: ${error?.message || error}`,
      );
    }
  }
}

module.exports = GoogleSheetsErrorHandler; 