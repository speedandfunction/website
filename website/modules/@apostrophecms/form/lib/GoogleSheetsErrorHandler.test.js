const GoogleSheetsErrorHandler = require('./GoogleSheetsErrorHandler');

describe('GoogleSheetsErrorHandler', () => {
  describe('getErrorMessage', () => {
    test('returns predefined message for known error codes', () => {
      expect(GoogleSheetsErrorHandler.getErrorMessage(401))
        .toBe('Unauthorized: Invalid credentials or misconfigured service account');
      
      expect(GoogleSheetsErrorHandler.getErrorMessage(403))
        .toBe('Permission denied: Check if the service account has access to the spreadsheet');
      
      expect(GoogleSheetsErrorHandler.getErrorMessage(404))
        .toBe('Spreadsheet not found');
    });

    test('returns null for unknown error codes', () => {
      expect(GoogleSheetsErrorHandler.getErrorMessage(500))
        .toBe(null);
      
      expect(GoogleSheetsErrorHandler.getErrorMessage(null))
        .toBe(null);
    });
  });

  describe('formatError', () => {
    test('formats error with known error code', () => {
      const error = { code: 401, message: 'Original message' };
      const formattedError = GoogleSheetsErrorHandler.formatError(error, 'test context');

      expect(formattedError).toBeInstanceOf(Error);
      expect(formattedError.message)
        .toBe('Unauthorized: Invalid credentials or misconfigured service account');
    });

    test('formats error with spreadsheet ID', () => {
      const error = { code: 403, message: 'Original message' };
      const formattedError = GoogleSheetsErrorHandler.formatError(
        error, 
        'test context', 
        'test-spreadsheet-id'
      );

      expect(formattedError.message)
        .toBe('Permission denied: Check if the service account has access to the spreadsheet: test-spreadsheet-id');
    });

    test('uses original error message when no predefined message exists', () => {
      const error = { code: 500, message: 'Internal server error' };
      const formattedError = GoogleSheetsErrorHandler.formatError(error, 'test context');

      expect(formattedError.message).toBe('Internal server error');
    });

    test('handles error without code', () => {
      const error = { message: 'Generic error' };
      const formattedError = GoogleSheetsErrorHandler.formatError(error, 'test context');

      expect(formattedError.message).toBe('Generic error');
    });

    test('uses default message when no error message or code', () => {
      const error = {};
      const formattedError = GoogleSheetsErrorHandler.formatError(error, 'test context');

      expect(formattedError.message).toBe('Unknown error occurred');
    });
  });

  describe('logError', () => {
    test('logs error using provided logger', () => {
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
        '[SHEETS] Test context: Test error'
      );
    });

    test('handles error object instead of Error instance', () => {
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
        '[SHEETS] Test context: Test error object'
      );
    });

    test('handles missing logger gracefully', () => {
      const errorHandler = new GoogleSheetsErrorHandler(null);
      const error = new Error('Test error');
      
      // Should not throw
      expect(() => {
        errorHandler.logError('Test context', error);
      }).not.toThrow();
    });

    test('handles incomplete logger object gracefully', () => {
      const incompleteLogger = { apos: {} };
      const errorHandler = new GoogleSheetsErrorHandler(incompleteLogger);
      const error = new Error('Test error');
      
      // Should not throw
      expect(() => {
        errorHandler.logError('Test context', error);
      }).not.toThrow();
    });
  });
}); 