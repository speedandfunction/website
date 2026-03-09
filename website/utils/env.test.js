const { getEnv, getOptionalEnv } = require('./env');

describe('getEnv utility', () => {
  const OLD_ENV = process.env;

  beforeEach(() => {
    jest.resetModules();
    process.env = { ...OLD_ENV };
  });

  afterAll(() => {
    process.env = OLD_ENV;
  });

  test('should return environment variable value when it exists', () => {
    // Arrange
    process.env.TEST_VAR = 'test-value';

    // Act
    const result = getEnv('TEST_VAR');

    // Assert
    expect(result).toBe('test-value');
  });

  test('should throw an error when environment variable does not exist', () => {
    // Act & Assert
    expect(() => {
      getEnv('NON_EXISTENT_VAR');
    }).toThrow('Environment variable "NON_EXISTENT_VAR" is not defined');
  });
});

describe('getOptionalEnv utility', () => {
  const OLD_ENV = process.env;

  beforeEach(() => {
    jest.resetModules();
    process.env = { ...OLD_ENV };
  });

  afterAll(() => {
    process.env = OLD_ENV;
  });

  test('should return environment variable value when it exists', () => {
    process.env.OPTIONAL_TEST_VAR = 'optional-test-value';

    const result = getOptionalEnv('OPTIONAL_TEST_VAR');

    expect(result).toBe('optional-test-value');
  });

  test('should return default value when environment variable does not exist', () => {
    const result = getOptionalEnv('NON_EXISTENT_OPTIONAL_VAR', 'default');

    expect(result).toBe('default');
  });
});
