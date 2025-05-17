const { createAposConfig } = require('./app');
const mockConnectRedis = jest.fn();
jest.mock('connect-redis', () => mockConnectRedis);
jest.mock('apostrophe', () => jest.fn());

describe('createAposConfig', () => {
  let originalEnv = null;

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

  test('includes all required modules', () => {
    const config = createAposConfig();

    // Core modules
    expect(config.modules['@apostrophecms/express']).toBeDefined();
    expect(config.modules['@apostrophecms/attachment']).toBeDefined();

    // Page types and widgets
    expect(config.modules['@apostrophecms/rich-text-widget']).toBeDefined();
    expect(config.modules['@apostrophecms/image-widget']).toBeDefined();
    expect(config.modules['@apostrophecms/video-widget']).toBeDefined();

    // Custom widgets
    expect(config.modules['home-hero-widget']).toBeDefined();
    expect(config.modules['default-hero-widget']).toBeDefined();
    expect(config.modules['buttons-widget']).toBeDefined();

    // Form modules
    expect(config.modules['@apostrophecms/form']).toBeDefined();
    expect(config.modules['@apostrophecms/form-widget']).toBeDefined();

    // Custom pieces
    expect(config.modules['team-members']).toBeDefined();
    expect(config.modules.testimonials).toBeDefined();
    expect(config.modules['case-studies']).toBeDefined();
    expect(config.modules.categories).toBeDefined();
  });

  test('configures image and video widgets with proper class names', () => {
    const config = createAposConfig();

    expect(
      config.modules['@apostrophecms/image-widget'].options.className,
    ).toBe('bp-image-widget');
    expect(
      config.modules['@apostrophecms/video-widget'].options.className,
    ).toBe('bp-video-widget');
  });

  test('attachment module contains URL hook handler', () => {
    const config = createAposConfig();
    const attachmentModule = config.modules['@apostrophecms/attachment'];

    expect(attachmentModule).toBeDefined();
    expect(typeof attachmentModule.handlers).toBe('function');

    const handlers = attachmentModule.handlers({});
    expect(handlers['apostrophe:modulesRegistered']).toBeDefined();
    expect(
      typeof handlers['apostrophe:modulesRegistered'].fixLocalstackUrl,
    ).toBe('function');
  });

  test('URL hook replaces localstack with localhost in URLs', () => {
    const config = createAposConfig();
    const attachmentModule = config.modules['@apostrophecms/attachment'];

    // Original URL method that will be replaced
    const mockOriginalUrl = jest.fn().mockImplementation(function () {
      return 'https://localstack:4566/bucket/file.jpg';
    });

    // Mock self object to simulate the module context
    const mockSelf = {
      url: mockOriginalUrl,
    };

    // Get handlers and execute the hook
    const handlers = attachmentModule.handlers(mockSelf);
    const fixLocalstackUrlHandler =
      handlers['apostrophe:modulesRegistered'].fixLocalstackUrl;
    fixLocalstackUrlHandler();

    // Now mockSelf.url should be the new method, test it
    const result = mockSelf.url({}, {});
    expect(result).toBe('https://localhost:4566/bucket/file.jpg');
    expect(mockOriginalUrl).toHaveBeenCalled();
  });

  test('URL hook handles undefined URLs properly', () => {
    const config = createAposConfig();
    const attachmentModule = config.modules['@apostrophecms/attachment'];

    // Original URL method that will be replaced
    const mockOriginalUrl = jest.fn().mockReturnValue(undefined);

    // Mock self object to simulate the module context
    const mockSelf = {
      url: mockOriginalUrl,
    };

    // Get handlers and execute the hook
    const handlers = attachmentModule.handlers(mockSelf);
    const fixLocalstackUrlHandler =
      handlers['apostrophe:modulesRegistered'].fixLocalstackUrl;
    fixLocalstackUrlHandler();

    // Now mockSelf.url should be the new method, test it
    const result = mockSelf.url({}, {});
    expect(result).toBeUndefined();
    expect(mockOriginalUrl).toHaveBeenCalled();
  });

  test('URL hook logs a success message', () => {
    const config = createAposConfig();
    const attachmentModule = config.modules['@apostrophecms/attachment'];

    // Spy on console.log
    const consoleSpy = jest.spyOn(console, 'log').mockImplementation();

    // Mock self object to simulate the module context
    const mockSelf = {
      url: jest.fn(),
    };

    // Get handlers and execute the hook
    const handlers = attachmentModule.handlers(mockSelf);
    const fixLocalstackUrlHandler =
      handlers['apostrophe:modulesRegistered'].fixLocalstackUrl;
    fixLocalstackUrlHandler();

    // Verify the console.log message
    expect(consoleSpy).toHaveBeenCalledWith(
      'Attachment URL hook installed successfully',
    );

    // Clean up
    consoleSpy.mockRestore();
  });

  test('shortName is set correctly', () => {
    const config = createAposConfig();
    expect(config.shortName).toBe('apostrophe-site');
  });
});

describe('module.exports', () => {
  test('exports createAposConfig function', () => {
    const appExports = require('./app');
    expect(appExports).toBeDefined();
    expect(appExports.createAposConfig).toBeDefined();
    expect(typeof appExports.createAposConfig).toBe('function');
  });
});

describe('main module execution', () => {
  const apostropheMock = require('apostrophe');

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('apostrophe is not called when required as a module', () => {
    /*
     * This test relies on the fact that when we require('./app')
     * in this test file, it's not the main module
     */
    expect(apostropheMock).not.toHaveBeenCalled();
  });
});
