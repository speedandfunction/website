const GoogleSheetsFormSubmissionHandler = require('./GoogleSheetsFormSubmissionHandler');

jest.mock('./GoogleSheetsAuthProvider');
jest.mock('./FormDataFormatter');
jest.mock('./GoogleSheetsClient');
jest.mock('./GoogleSheetsErrorHandler');
jest.mock('../../../../utils/retryOperation');

const { retryOperation } = require('../../../../utils/retryOperation');

describe('GoogleSheetsFormSubmission Handler', () => {
  const mockSelf = {
    apos: {
      util: {
        error: jest.fn(),
      },
    },
  };

  const mockClient = {
    spreadsheetId: 'test-spreadsheet-id',
    checkIfEmpty: jest.fn(),
    appendValues: jest.fn(),
    sheets: {
      withAuth: jest.fn().mockReturnThis(),
    },
  };

  const mockFormatter = {
    formatForSpreadsheet: jest.fn(),
  };

  const mockErrorHandler = {
    logError: jest.fn(),
    formatError: jest.fn(),
    logger: mockSelf,
  };

  const mockAuthProvider = {
    getSheetsAuthConfig: jest.fn().mockReturnValue({
      auth: 'mock-auth',
    }),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('constructor with dependency injection', () => {
    const expectConstructorToThrow = (
      client,
      formatter,
      errorHandler,
      authProvider,
      message,
    ) => {
      const constructor = () =>
        new GoogleSheetsFormSubmissionHandler(
          client,
          formatter,
          errorHandler,
          authProvider,
        );
      expect(constructor).toThrow(message);
    };

    test('uses injected dependencies when provided', () => {
      const handler = new GoogleSheetsFormSubmissionHandler(
        mockClient,
        mockFormatter,
        mockErrorHandler,
        mockAuthProvider,
      );

      expect(handler.client).toBe(mockClient);
      expect(handler.formatter).toBe(mockFormatter);
      expect(handler.errorHandler).toBe(mockErrorHandler);
      expect(handler.authProvider).toBe(mockAuthProvider);
    });

    test('throws error when client is missing', () => {
      expectConstructorToThrow(
        null,
        mockFormatter,
        mockErrorHandler,
        mockAuthProvider,
        'Client, formatter, errorHandler, and authProvider are required parameters',
      );
    });

    test('throws error when formatter is missing', () => {
      expectConstructorToThrow(
        mockClient,
        null,
        mockErrorHandler,
        mockAuthProvider,
        'Client, formatter, errorHandler, and authProvider are required parameters',
      );
    });

    test('throws error when errorHandler is missing', () => {
      expectConstructorToThrow(
        mockClient,
        mockFormatter,
        null,
        mockAuthProvider,
        'Client, formatter, errorHandler, and authProvider are required parameters',
      );
    });

    test('throws error when authProvider is missing', () => {
      expectConstructorToThrow(
        mockClient,
        mockFormatter,
        mockErrorHandler,
        null,
        'Client, formatter, errorHandler, and authProvider are required parameters',
      );
    });

    test('throws error when client has no spreadsheetId', () => {
      const clientWithoutId = { ...mockClient };
      delete clientWithoutId.spreadsheetId;

      expectConstructorToThrow(
        clientWithoutId,
        mockFormatter,
        mockErrorHandler,
        mockAuthProvider,
        'Client must have a valid spreadsheetId',
      );
    });
  });

  describe('configureAuth', () => {
    test('configures auth using authProvider', () => {
      const handler = new GoogleSheetsFormSubmissionHandler(
        mockClient,
        mockFormatter,
        mockErrorHandler,
        mockAuthProvider,
      );

      handler.configureAuth();

      expect(mockAuthProvider.getSheetsAuthConfig).toHaveBeenCalled();
      expect(mockClient.sheets.withAuth).toHaveBeenCalledWith('mock-auth');
    });
  });

  describe('handle', () => {
    const handler = new GoogleSheetsFormSubmissionHandler(
      mockClient,
      mockFormatter,
      mockErrorHandler,
      mockAuthProvider,
    );

    beforeEach(() => {
      jest.clearAllMocks();
    });

    test('successfully handles form submission', async () => {
      const formData = { name: 'John', email: 'john@example.com' };
      const formattedData = {
        headers: ['ID', 'Timestamp', 'Name', 'Email'],
        rowData: ['123', '2023-01-01', 'John', 'john@example.com'],
      };

      mockFormatter.formatForSpreadsheet.mockReturnValue(formattedData);

      retryOperation.mockResolvedValue(true);
      mockClient.appendValues.mockResolvedValue({ success: true });

      const result = await handler.handle(formData);

      expect(result).toBe(true);
      expect(mockAuthProvider.getSheetsAuthConfig).toHaveBeenCalled();
      expect(mockClient.sheets.withAuth).toHaveBeenCalledWith('mock-auth');
      expect(mockFormatter.formatForSpreadsheet).toHaveBeenCalledWith(formData);

      expect(mockClient.appendValues).toHaveBeenCalledTimes(2);
      expect(mockClient.appendValues).toHaveBeenCalledWith('Sheet1!A1', [
        formattedData.headers,
      ]);
      expect(mockClient.appendValues).toHaveBeenCalledWith('Sheet1!A1', [
        formattedData.rowData,
      ]);
    });

    test('returns false when headers check fails', async () => {
      const formData = { name: 'John' };
      mockFormatter.formatForSpreadsheet.mockReturnValue({
        headers: ['ID', 'Name'],
        rowData: ['123', 'John'],
      });

      retryOperation.mockResolvedValue(null);

      const result = await handler.handle(formData);

      expect(result).toBe(false);
      expect(mockAuthProvider.getSheetsAuthConfig).toHaveBeenCalled();
      expect(mockClient.sheets.withAuth).toHaveBeenCalledWith('mock-auth');
    });

    test('handles unexpected errors', async () => {
      const formData = { name: 'John' };
      const error = new Error('Unexpected error');
      const throwError = () => {
        throw error;
      };
      mockFormatter.formatForSpreadsheet.mockImplementation(throwError);

      const result = await handler.handle(formData);

      expect(result).toBe(false);
      expect(mockErrorHandler.logError).toHaveBeenCalledWith(
        'Unexpected error',
        error,
      );
      expect(mockAuthProvider.getSheetsAuthConfig).toHaveBeenCalled();
      expect(mockClient.sheets.withAuth).toHaveBeenCalledWith('mock-auth');
    });
  });

  describe('checkHeadersWithRetry', () => {
    const handler = new GoogleSheetsFormSubmissionHandler(
      mockClient,
      mockFormatter,
      mockErrorHandler,
      mockAuthProvider,
    );

    beforeEach(() => {
      jest.clearAllMocks();
    });

    test('successfully checks headers with retry', async () => {
      retryOperation.mockResolvedValue(true);

      const result = await handler.checkHeadersWithRetry();

      expect(result).toBe(true);
      expect(retryOperation).toHaveBeenCalledWith(expect.any(Function), {
        self: mockErrorHandler.logger,
        maxRetries: 3,
        delayMs: 1000,
      });
    });

    test('handles retry failure', async () => {
      const error = new Error('Retry failed');
      retryOperation.mockRejectedValue(error);

      const result = await handler.checkHeadersWithRetry();

      expect(result).toBe(null);
      expect(mockErrorHandler.logError).toHaveBeenCalledWith(
        'Headers check failed after all attempts',
        error,
      );
    });
  });
});
