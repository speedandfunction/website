const { sleep } = require('./sleep');

const retryOperation = async (operation, options = {}) => {
  const {
    self = { apos: { util: { error: () => null } } },
    maxRetries = 3,
    delayMs = 1000,
    label = 'Operation',
  } = options;

  let attempt = 0;

  const tryOperation = async () => {
    try {
      return await operation();
    } catch (error) {
      attempt += 1;
      const retriesLeft = maxRetries - attempt;

      self.apos.util.error(
        `[RETRY] ${label} failed, retries left: ${retriesLeft}`,
        error,
      );

      if (retriesLeft <= 0) {
        throw error;
      }

      await sleep(delayMs);
      return tryOperation();
    }
  };

  return await tryOperation();
};

module.exports = { retryOperation };
