const GoogleSheetsFormSubmissionHandler = require('./GoogleSheetsFormSubmissionHandler');

// Mock all dependencies
jest.mock('./GoogleSheetsAuthProvider');
jest.mock('./FormDataFormatter');
jest.mock('./GoogleSheetsClient');
jest.mock('./GoogleSheetsErrorHandler');
jest.mock('../../../../utils/retryOperation');

const GoogleSheetsAuthProvider = require('./GoogleSheetsAuthProvider');
const FormDataFormatter = require('./FormDataFormatter');
const GoogleSheetsClient = require('./GoogleSheetsClient');
const GoogleSheetsErrorHandler = require('./GoogleSheetsErrorHandler');
const { retryOperation } = require('../../../../utils/retryOperation');

describe('GoogleSheetsFormSubmissionHandler', () => {
  let mockSelf;
  let mockClient;
  let mockFormatter;
  let mockErrorHandler;
  let mockAuthProvider;

  beforeEach(() => {
    jest.clearAllMocks();

    mockSelf = {
      apos: {
        util: {
          error: jest.fn(),
        },
      },
    };

    mockClient = {
      spreadsheetId: 'test-spreadsheet-id',
      checkIfEmpty: jest.fn(),
      appendValues: jest.fn(),
    };

    mockFormatter = {
      formatForSpreadsheet: jest.fn(),
    };

    mockErrorHandler = {
      logError: jest.fn(),
      formatError: jest.fn(),
      logger: mockSelf,
    };

    mockAuthProvider = {
      getSheetsAuthConfig: jest.fn(),
    };

    GoogleSheetsClient.mockImplementation(() => mockClient);
    GoogleSheetsAuthProvider.getSheetsAuthConfig.mockReturnValue({
      spreadsheetId: 'test-spreadsheet-id',
      auth: 'mock-auth',
    });
  });

  describe('constructor with dependency injection', () => {
    test('uses injected dependencies when provided', () => {
      const handler = new GoogleSheetsFormSubmissionHandler(
        mockClient,
        mockFormatter,
        mockErrorHandler,
        mockAuthProvider
      );

      expect(handler.client).toBe(mockClient);
      expect(handler.formatter).toBe(mockFormatter);
      expect(handler.errorHandler).toBe(mockErrorHandler);
    });

    test('throws error when required dependencies are missing', () => {
      expect(() => {
        new GoogleSheetsFormSubmissionHandler(null, mockFormatter, mockErrorHandler);
      }).toThrow('Client, formatter, and errorHandler are required parameters');

      expect(() => {
        new GoogleSheetsFormSubmissionHandler(mockClient, null, mockErrorHandler);
      }).toThrow('Client, formatter, and errorHandler are required parameters');

      expect(() => {
        new GoogleSheetsFormSubmissionHandler(mockClient, mockFormatter, null);
      }).toThrow('Client, formatter, and errorHandler are required parameters');
    });

    test('throws error when client has no spreadsheetId', () => {
      const clientWithoutId = { ...mockClient };
      delete clientWithoutId.spreadsheetId;

      expect(() => {
        new GoogleSheetsFormSubmissionHandler(
          clientWithoutId,
          mockFormatter,
          mockErrorHandler
        );
      }).toThrow('Client must have a valid spreadsheetId');
    });
  });

  describe('handle', () => {
    let handler;

    beforeEach(() => {
      handler = new GoogleSheetsFormSubmissionHandler(
        mockClient,
        mockFormatter,
        mockErrorHandler,
        mockAuthProvider
      );
    });

    test('successfully handles form submission', async () => {
      const formData = { name: 'John', email: 'john@example.com' };
      const formattedData = {
        headers: ['ID', 'Timestamp', 'Name', 'Email'],
        rowData: ['123', '2023-01-01', 'John', 'john@example.com'],
      };

      mockFormatter.formatForSpreadsheet.mockReturnValue(formattedData);
      retryOperation.mockResolvedValue(true); // needs headers
      mockClient.appendValues.mockResolvedValue({ success: true });

      const result = await handler.handle(formData);

      expect(result).toBe(true);
      expect(mockFormatter.formatForSpreadsheet).toHaveBeenCalledWith(formData);
      expect(mockClient.appendValues).toHaveBeenCalledTimes(2); // once for headers, once for data
      expect(mockClient.appendValues).toHaveBeenCalledWith('Sheet1!A1', [formattedData.headers]);
      expect(mockClient.appendValues).toHaveBeenCalledWith('Sheet1!A1', [formattedData.rowData]);
    });

    test('returns false when headers check fails', async () => {
      const formData = { name: 'John' };
      mockFormatter.formatForSpreadsheet.mockReturnValue({
        headers: ['ID', 'Name'],
        rowData: ['123', 'John'],
      });
      retryOperation.mockResolvedValue(null); // headers check failed

      const result = await handler.handle(formData);

      expect(result).toBe(false);
    });

    test('handles unexpected errors', async () => {
      const formData = { name: 'John' };
      const error = new Error('Unexpected error');
      mockFormatter.formatForSpreadsheet.mockImplementation(() => {
        throw error;
      });

      const result = await handler.handle(formData);

      expect(result).toBe(false);
      expect(mockErrorHandler.logError).toHaveBeenCalledWith(
        'Unexpected error',
        error
      );
    });
  });

  describe('checkHeadersWithRetry', () => {
    test('successfully checks headers with retry', async () => {
      const handler = new GoogleSheetsFormSubmissionHandler(
        mockClient,
        mockFormatter,
        mockErrorHandler,
        mockAuthProvider
      );

      retryOperation.mockResolvedValue(true);

      const result = await handler.checkHeadersWithRetry();

      expect(result).toBe(true);
      expect(retryOperation).toHaveBeenCalledWith(
        expect.any(Function),
        {
          self: mockErrorHandler.logger,
          maxRetries: 3,
          delayMs: 1000,
        }
      );
    });

    test('handles retry failure', async () => {
      const handler = new GoogleSheetsFormSubmissionHandler(
        mockClient,
        mockFormatter,
        mockErrorHandler,
        mockAuthProvider
      );

      const error = new Error('Retry failed');
      retryOperation.mockRejectedValue(error);

      const result = await handler.checkHeadersWithRetry();

      expect(result).toBe(null);
      expect(mockErrorHandler.logError).toHaveBeenCalledWith(
        'Headers check failed after all attempts',
        error
      );
    });
  });

  describe('backward compatibility methods', () => {
    let handler;

    beforeEach(() => {
      handler = new GoogleSheetsFormSubmissionHandler(
        mockClient,
        mockFormatter,
        mockErrorHandler,
        mockAuthProvider
      );
    });

    test('sendFormDataToGoogleSheets delegates to handle', async () => {
      const formData = { name: 'John' };
      handler.handle = jest.fn().mockResolvedValue(true);

      const result = await handler.sendFormDataToGoogleSheets(formData);

      expect(result).toBe(true);
      expect(handler.handle).toHaveBeenCalledWith(formData);
    });

    test('formatFormData delegates to formatter', () => {
      const formData = { name: 'John' };
      const formatted = { headers: ['Name'], rowData: ['John'] };
      mockFormatter.formatForSpreadsheet.mockReturnValue(formatted);

      const result = handler.formatFormData(formData);

      expect(result).toBe(formatted);
      expect(mockFormatter.formatForSpreadsheet).toHaveBeenCalledWith(formData);
    });
  });
}); 