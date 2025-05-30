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
    const sleepTime = 1000;

    const sleepPromise = sleep(sleepTime);

    expect(setTimeout).toHaveBeenCalledTimes(1);
    expect(setTimeout).toHaveBeenLastCalledWith(
      expect.any(Function),
      sleepTime,
    );

    jest.advanceTimersByTime(sleepTime);
    const result = await sleepPromise;

    expect(result).toBeUndefined();
  });

  test('should respect different sleep durations', async () => {
    const shortSleepTime = 100;
    const longSleepTime = 2000;

    const shortSleepPromise = sleep(shortSleepTime);

    expect(setTimeout).toHaveBeenCalledTimes(1);
    expect(setTimeout).toHaveBeenLastCalledWith(
      expect.any(Function),
      shortSleepTime,
    );

    jest.advanceTimersByTime(shortSleepTime);
    await shortSleepPromise;

    const longSleepPromise = sleep(longSleepTime);

    expect(setTimeout).toHaveBeenCalledTimes(2);
    expect(setTimeout).toHaveBeenLastCalledWith(
      expect.any(Function),
      longSleepTime,
    );

    jest.advanceTimersByTime(longSleepTime);
    await longSleepPromise;
  });

  test('should handle zero milliseconds sleep', async () => {
    const sleepTime = 0;

    const sleepPromise = sleep(sleepTime);

    expect(setTimeout).toHaveBeenCalledTimes(1);
    expect(setTimeout).toHaveBeenLastCalledWith(
      expect.any(Function),
      sleepTime,
    );

    jest.advanceTimersByTime(sleepTime);
    await sleepPromise;
  });
});
