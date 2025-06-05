const GoogleSheetsFormSubmissionHandler = require('./GoogleSheetsFormSubmissionHandler');

jest.mock('./getSheetsAuthConfig');
jest.mock('./formatForSpreadsheet');
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
  };

  const mockFormatForSpreadsheet = jest.fn();

  const mockErrorHandler = {
    logError: jest.fn(),
    formatError: jest.fn(),
    logger: mockSelf,
  };

  const mockSheets = {
    appendValues: jest.fn(),
    checkIfEmpty: jest.fn(),
  };

  const mockGetSheetsAuthConfig = jest
    .fn()
    .mockReturnValue({ sheets: mockSheets });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  const expectConstructorToThrow = (constructor, message) => {
    expect(() => {
      constructor();
    }).toThrow(message);
  };

  describe('constructor with dependency injection', () => {
    test('uses injected dependencies when provided', () => {
      const handler = new GoogleSheetsFormSubmissionHandler(
        mockClient,
        mockFormatForSpreadsheet,
        mockErrorHandler,
        mockGetSheetsAuthConfig,
      );

      expect(handler.client).toBe(mockClient);
      expect(handler.formatForSpreadsheet).toBe(mockFormatForSpreadsheet);
      expect(handler.errorHandler).toBe(mockErrorHandler);
      expect(handler.getSheetsAuthConfig).toBe(mockGetSheetsAuthConfig);
    });

    test('throws error when client is missing', () => {
      expectConstructorToThrow(
        () =>
          new GoogleSheetsFormSubmissionHandler(
            undefined,
            mockFormatForSpreadsheet,
            mockErrorHandler,
            mockGetSheetsAuthConfig,
          ),
        'Client, formatForSpreadsheet, errorHandler, and getSheetsAuthConfig are required parameters',
      );
    });

    test('throws error when formatForSpreadsheet is missing', () => {
      expectConstructorToThrow(
        () =>
          new GoogleSheetsFormSubmissionHandler(
            mockClient,
            undefined,
            mockErrorHandler,
            mockGetSheetsAuthConfig,
          ),
        'Client, formatForSpreadsheet, errorHandler, and getSheetsAuthConfig are required parameters',
      );
    });

    test('throws error when errorHandler is missing', () => {
      expectConstructorToThrow(
        () =>
          new GoogleSheetsFormSubmissionHandler(
            mockClient,
            mockFormatForSpreadsheet,
            undefined,
            mockGetSheetsAuthConfig,
          ),
        'Client, formatForSpreadsheet, errorHandler, and getSheetsAuthConfig are required parameters',
      );
    });

    test('throws error when getSheetsAuthConfig is missing', () => {
      expectConstructorToThrow(
        () =>
          new GoogleSheetsFormSubmissionHandler(
            mockClient,
            mockFormatForSpreadsheet,
            mockErrorHandler,
            undefined,
          ),
        'Client, formatForSpreadsheet, errorHandler, and getSheetsAuthConfig are required parameters',
      );
    });

    test('throws error when client has no spreadsheetId', () => {
      const clientWithoutId = { ...mockClient };
      delete clientWithoutId.spreadsheetId;

      expectConstructorToThrow(
        () =>
          new GoogleSheetsFormSubmissionHandler(
            clientWithoutId,
            mockFormatForSpreadsheet,
            mockErrorHandler,
            mockGetSheetsAuthConfig,
          ),
        'Client must have a valid spreadsheetId',
      );
    });
  });

  describe('configureAuth', () => {
    test('configures auth using getSheetsAuthConfig', () => {
      const handler = new GoogleSheetsFormSubmissionHandler(
        mockClient,
        mockFormatForSpreadsheet,
        mockErrorHandler,
        mockGetSheetsAuthConfig,
      );

      handler.configureAuth();

      expect(mockGetSheetsAuthConfig).toHaveBeenCalled();
      expect(mockClient.sheets).toBe(mockSheets);
    });
  });

  describe('handle', () => {
    const handler = new GoogleSheetsFormSubmissionHandler(
      mockClient,
      mockFormatForSpreadsheet,
      mockErrorHandler,
      mockGetSheetsAuthConfig,
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

      mockFormatForSpreadsheet.mockReturnValue(formattedData);
      retryOperation.mockResolvedValue(true);
      mockClient.appendValues.mockResolvedValue({ success: true });

      const result = await handler.handle(formData);

      expect(result).toBe(true);
      expect(mockGetSheetsAuthConfig).toHaveBeenCalled();
      expect(mockClient.sheets).toBe(mockSheets);
      expect(mockFormatForSpreadsheet).toHaveBeenCalledWith(formData);

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
      mockFormatForSpreadsheet.mockReturnValue({
        headers: ['ID', 'Name'],
        rowData: ['123', 'John'],
      });

      retryOperation.mockResolvedValue(null);

      const result = await handler.handle(formData);

      expect(result).toBe(false);
      expect(mockGetSheetsAuthConfig).toHaveBeenCalled();
      expect(mockClient.sheets).toBe(mockSheets);
    });

    test('handles unexpected errors', async () => {
      const formData = { name: 'John' };
      const error = new Error('Unexpected error');
      mockFormatForSpreadsheet.mockImplementation(() => {
        throw error;
      });

      const result = await handler.handle(formData);

      expect(result).toBe(false);
      expect(mockErrorHandler.logError).toHaveBeenCalledWith(
        'Unexpected error',
        error,
      );
      expect(mockGetSheetsAuthConfig).toHaveBeenCalled();
      expect(mockClient.sheets).toBe(mockSheets);
    });
  });

  describe('checkHeadersWithRetry', () => {
    const handler = new GoogleSheetsFormSubmissionHandler(
      mockClient,
      mockFormatForSpreadsheet,
      mockErrorHandler,
      mockGetSheetsAuthConfig,
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
      retryOperation.mockResolvedValue(false);

      const result = await handler.checkHeadersWithRetry();

      expect(result).toBe(false);
      expect(retryOperation).toHaveBeenCalledWith(expect.any(Function), {
        self: mockErrorHandler.logger,
        maxRetries: 3,
        delayMs: 1000,
      });
    });
  });
});
