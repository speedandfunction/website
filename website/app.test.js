const { createAposConfig } = require('./app');
const mockConnectRedis = jest.fn();
jest.mock('connect-redis', () => mockConnectRedis);
describe('createAposConfig', () => {
  let originalEnv;
  beforeEach(() => {
    originalEnv = { ...process.env };
  });
  afterEach(() => {
    process.env = originalEnv;
  });
  test('returns correct default config', () => {
    delete process.env.BASE_URL;
    delete process.env.SESSION_SECRET;
    delete process.env.REDIS_URI;
    const config = createAposConfig();
    expect(config.baseUrl).toBe('http://localhost:3000');
    expect(
      config.modules['@apostrophecms/express'].options.session.secret,
    ).toBe('changeme');
    expect(
      config.modules['@apostrophecms/express'].options.session.store,
    ).toEqual({
      connect: mockConnectRedis,
      options: { url: 'redis://localhost:6379' },
    });
  });
  test('uses environment variables', () => {
    process.env.BASE_URL = 'http://test.com';
    process.env.SESSION_SECRET = 'topsecret';
    process.env.REDIS_URI = 'redis://remote';
    const config = createAposConfig();
    expect(config.baseUrl).toBe('http://test.com');
    expect(
      config.modules['@apostrophecms/express'].options.session.secret,
    ).toBe('topsecret');
    expect(
      config.modules['@apostrophecms/express'].options.session.store,
    ).toEqual({
      connect: mockConnectRedis,
      options: { url: 'redis://remote' },
    });
  });
});