const { expect, describe, test, beforeEach, afterEach } = require('@jest/globals');

const mockConnectRedisFn = jest.fn();
const mockApostropheFn = jest.fn();

jest.mock('apostrophe', () => mockApostropheFn);
jest.mock('connect-redis', () => mockConnectRedisFn);

describe('app.js', () => {
  let originalEnv;

  beforeEach(() => {
    originalEnv = { ...process.env };
    jest.clearAllMocks();
    jest.resetModules();
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  test('should initialize apostrophe with correct configuration', () => {
    require('./app.js');

    expect(mockApostropheFn).toHaveBeenCalled();

    const [config] = mockApostropheFn.mock.calls[0];

    expect(config.shortName).toBe('apostrophe-site');
    expect(config.baseUrl).toBe('http://localhost:3000');
  });

  test('should use environment variables when available', () => {
    process.env.BASE_URL = 'http://test.com';
    process.env.SESSION_SECRET = 'test-secret';
    process.env.REDIS_URI = 'redis://test:6379';

    require('./app.js');

    const [config] = mockApostropheFn.mock.calls[0];

    expect(config.baseUrl).toBe('http://test.com');
    expect(config.modules['@apostrophecms/express'].options.session.secret).toBe('test-secret');
    expect(config.modules['@apostrophecms/express'].options.session.store).toEqual({
      connect: mockConnectRedisFn,
      options: {
        url: 'redis://test:6379'
      }
    });
  });

  test('should use default values when environment variables are not set', () => {
    delete process.env.BASE_URL;
    delete process.env.SESSION_SECRET;
    delete process.env.REDIS_URI;

    require('./app.js');

    const [config] = mockApostropheFn.mock.calls[0];

    expect(config.baseUrl).toBe('http://localhost:3000');
    expect(config.modules['@apostrophecms/express'].options.session.secret).toBe('changeme');
    expect(config.modules['@apostrophecms/express'].options.session.store).toEqual({
      connect: mockConnectRedisFn,
      options: {
        url: 'redis://localhost:6379'
      }
    });
  });

  test('should configure all required modules', () => {
    require('./app.js');

    const [config] = mockApostropheFn.mock.calls[0];

    expect(config.modules['@apostrophecms/express']).toBeDefined();
    expect(config.modules['@apostrophecms/form']).toBeDefined();
    expect(config.modules['@apostrophecms/form-widget']).toBeDefined();
    expect(config.modules.asset).toBeDefined();
    expect(config.modules['default-page']).toBeDefined();
  });
}); 