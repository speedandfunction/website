const { sleep } = require('./sleep');

describe('sleep utility', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    jest.spyOn(global, 'setTimeout');
  });

  afterEach(() => {
    jest.useRealTimers();
    jest.restoreAllMocks();
  });

  test('should return a promise that resolves after the specified time', async () => {
    // Arrange
    const sleepTime = 1000;

    // Act
    const sleepPromise = sleep(sleepTime);

    // Assert - Before advancing timers
    expect(setTimeout).toHaveBeenCalledTimes(1);
    expect(setTimeout).toHaveBeenLastCalledWith(
      expect.any(Function),
      sleepTime,
    );

    // Advance timers and wait for promise to resolve
    jest.advanceTimersByTime(sleepTime);
    const result = await sleepPromise;

    // Assert - The sleep function doesn't return a value, so result should be undefined
    expect(result).toBeUndefined();
  });

  test('should respect different sleep durations', async () => {
    // Arrange
    const shortSleepTime = 100;
    const longSleepTime = 2000;

    // Act
    const shortSleepPromise = sleep(shortSleepTime);

    // Assert - Short sleep
    expect(setTimeout).toHaveBeenCalledTimes(1);
    expect(setTimeout).toHaveBeenLastCalledWith(
      expect.any(Function),
      shortSleepTime,
    );

    // Advance timers for short sleep
    jest.advanceTimersByTime(shortSleepTime);
    await shortSleepPromise;

    // Act - Long sleep
    const longSleepPromise = sleep(longSleepTime);

    // Assert - Long sleep
    expect(setTimeout).toHaveBeenCalledTimes(2);
    expect(setTimeout).toHaveBeenLastCalledWith(
      expect.any(Function),
      longSleepTime,
    );

    // Advance timers for long sleep
    jest.advanceTimersByTime(longSleepTime);
    await longSleepPromise;
  });

  test('should handle zero milliseconds sleep', async () => {
    // Arrange
    const sleepTime = 0;

    // Act
    const sleepPromise = sleep(sleepTime);

    // Assert
    expect(setTimeout).toHaveBeenCalledTimes(1);
    expect(setTimeout).toHaveBeenLastCalledWith(
      expect.any(Function),
      sleepTime,
    );

    // Advance timers
    jest.advanceTimersByTime(sleepTime);
    await sleepPromise;
  });
});
