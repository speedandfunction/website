const { getEnv } = require('./env');

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
