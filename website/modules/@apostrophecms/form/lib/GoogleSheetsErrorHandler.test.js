const GoogleSheetsErrorHandler = require('./GoogleSheetsErrorHandler');

describe('GoogleSheetsErrorHandler', () => {
  test('getErrorMessage returns predefined message for known error codes', () => {
    expect(GoogleSheetsErrorHandler.getErrorMessage(401)).toBe(
      'Unauthorized: Invalid credentials or misconfigured service account',
    );

    expect(GoogleSheetsErrorHandler.getErrorMessage(403)).toBe(
      'Permission denied: Check if the service account has access to the spreadsheet',
    );

    expect(GoogleSheetsErrorHandler.getErrorMessage(404)).toBe(
      'Spreadsheet not found',
    );
  });

  test('getErrorMessage returns null for unknown error codes', () => {
    expect(GoogleSheetsErrorHandler.getErrorMessage(999)).toBe(null);
    expect(GoogleSheetsErrorHandler.getErrorMessage(null)).toBe(null);
  });

  test('formatError formats error with known error code', () => {
    const error = { code: 401, message: 'Original message' };
    const formattedError = GoogleSheetsErrorHandler.formatError(
      error,
      'test context',
    );

    expect(formattedError).toBeInstanceOf(Error);
    expect(formattedError.message).toBe(
      'Unauthorized: Invalid credentials or misconfigured service account',
    );
  });

  test('formatError formats error with spreadsheet ID', () => {
    const error = { code: 403, message: 'Original message' };
    const formattedError = GoogleSheetsErrorHandler.formatError(
      error,
      'test context',
      'test-spreadsheet-id',
    );

    expect(formattedError.message).toBe(
      'Permission denied: Check if the service account has access to the spreadsheet: test-spreadsheet-id',
    );
  });

  test('formatError uses predefined message for 500 error', () => {
    const error = { code: 500, message: 'Original message' };
    const formattedError = GoogleSheetsErrorHandler.formatError(
      error,
      'test context',
    );

    expect(formattedError.message).toBe(
      'Internal Server Error: Google Sheets API error',
    );
  });

  test('formatError handles error without code', () => {
    const error = { message: 'Custom error message' };
    const formattedError = GoogleSheetsErrorHandler.formatError(
      error,
      'test context',
    );

    expect(formattedError.message).toBe('Custom error message');
  });

  test('formatError uses default message when no error message or code', () => {
    const error = {};
    const formattedError = GoogleSheetsErrorHandler.formatError(
      error,
      'test context',
    );

    expect(formattedError.message).toBe('Unknown error occurred');
  });

  test('formatError handles string error message', () => {
    const error = 'String error message';
    const formattedError = GoogleSheetsErrorHandler.formatError(
      error,
      'test context',
    );

    expect(formattedError.message).toBe('Unknown error occurred');
  });

  test('logError logs error using provided logger', () => {
    const mockLogger = {
      apos: {
        util: {
          error: jest.fn(),
        },
      },
    };

    const errorHandler = new GoogleSheetsErrorHandler(mockLogger);
    const error = new Error('Test error');
    errorHandler.logError('Test context', error);

    expect(mockLogger.apos.util.error).toHaveBeenCalledWith(
      '[SHEETS] Test context: Test error',
    );
  });

  test('logError handles error object instead of Error instance', () => {
    const mockLogger = {
      apos: {
        util: {
          error: jest.fn(),
        },
      },
    };

    const errorHandler = new GoogleSheetsErrorHandler(mockLogger);
    const error = { message: 'Test error object' };
    errorHandler.logError('Test context', error);

    expect(mockLogger.apos.util.error).toHaveBeenCalledWith(
      '[SHEETS] Test context: Test error object',
    );
  });

  test('logError handles string error message', () => {
    const mockLogger = {
      apos: {
        util: {
          error: jest.fn(),
        },
      },
    };

    const errorHandler = new GoogleSheetsErrorHandler(mockLogger);
    errorHandler.logError('Test context', 'String error message');

    expect(mockLogger.apos.util.error).toHaveBeenCalledWith(
      '[SHEETS] Test context: String error message',
    );
  });

  test('logError handles missing logger gracefully', () => {
    const errorHandler = new GoogleSheetsErrorHandler(null);
    const error = new Error('Test error');

    expect(() => {
      errorHandler.logError('Test context', error);
    }).not.toThrow();
  });

  test('logError handles incomplete logger object gracefully', () => {
    const incompleteLogger = { apos: {} };
    const errorHandler = new GoogleSheetsErrorHandler(incompleteLogger);
    const error = new Error('Test error');

    expect(() => {
      errorHandler.logError('Test context', error);
    }).not.toThrow();
  });
});
