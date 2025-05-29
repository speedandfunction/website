const { retryOperation } = require('./retryOperation');
const { sleep } = require('./sleep');

// Mock the sleep utility to avoid actual delays in tests
jest.mock('./sleep', () => ({
  sleep: jest.fn(() => Promise.resolve()),
}));

describe('retryOperation utility', () => {
  let mockOperation = jest.fn();
  let mockErrorLogger = jest.fn();

  beforeEach(() => {
    // Reset all mocks before each test
    jest.clearAllMocks();

    // Create a mock operation function
    mockOperation = jest.fn();

    // Create a mock error logger
    mockErrorLogger = jest.fn();
  });

  test('should execute operation successfully on first attempt', async () => {
    // Arrange
    mockOperation.mockResolvedValueOnce('success');

    // Act
    const result = await retryOperation(mockOperation);

    // Assert
    expect(result).toBe('success');
    expect(mockOperation).toHaveBeenCalledTimes(1);
    expect(sleep).not.toHaveBeenCalled();
  });

  test('should retry operation after failure and succeed', async () => {
    // Arrange
    const mockError = new Error('Operation failed');
    mockOperation
      .mockRejectedValueOnce(mockError)
      .mockResolvedValueOnce('success after retry');

    const options = {
      self: { apos: { util: { error: mockErrorLogger } } },
      maxRetries: 3,
      delayMs: 1000,
      label: 'Test Operation',
    };

    // Act
    const result = await retryOperation(mockOperation, options);

    // Assert
    expect(result).toBe('success after retry');
    expect(mockOperation).toHaveBeenCalledTimes(2);
    expect(sleep).toHaveBeenCalledTimes(1);
    expect(sleep).toHaveBeenCalledWith(1000);
    expect(mockErrorLogger).toHaveBeenCalledTimes(1);
    expect(mockErrorLogger).toHaveBeenCalledWith(
      '[RETRY] Test Operation failed, retries left: 2',
      mockError,
    );
  });

  test('should throw error after exhausting all retry attempts', async () => {
    // Arrange
    const mockError = new Error('Operation failed');
    mockOperation.mockRejectedValue(mockError);

    const options = {
      self: { apos: { util: { error: mockErrorLogger } } },
      maxRetries: 2,
      delayMs: 500,
      label: 'Test Operation',
    };

    // Act & Assert
    await expect(retryOperation(mockOperation, options)).rejects.toThrow(
      'Operation failed',
    );

    // The operation should be called maxRetries times (2 in this case)
    expect(mockOperation).toHaveBeenCalledTimes(options.maxRetries);

    /*
     * The sleep function should be called maxRetries - 1 times (1 in this case)
     * because it's called between retries, not after the last one
     */
    expect(sleep).toHaveBeenCalledTimes(options.maxRetries - 1);

    expect(sleep).toHaveBeenCalledWith(500);
    expect(mockErrorLogger).toHaveBeenCalledTimes(options.maxRetries);
    expect(mockErrorLogger).toHaveBeenNthCalledWith(
      1,
      '[RETRY] Test Operation failed, retries left: 1',
      mockError,
    );
    expect(mockErrorLogger).toHaveBeenNthCalledWith(
      2,
      '[RETRY] Test Operation failed, retries left: 0',
      mockError,
    );
  });

  test('should use default options when none are provided', async () => {
    // Arrange
    const mockError = new Error('Operation failed');
    mockOperation
      .mockRejectedValueOnce(mockError)
      .mockResolvedValueOnce('success');

    // Act
    const result = await retryOperation(mockOperation);

    // Assert
    expect(result).toBe('success');
    expect(mockOperation).toHaveBeenCalledTimes(2);
    expect(sleep).toHaveBeenCalledTimes(1);
    expect(sleep).toHaveBeenCalledWith(1000);
  });
});
