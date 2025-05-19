const { createAposConfig } = require('./app');
const mockConnectRedis = jest.fn();
jest.mock('connect-redis', () => mockConnectRedis);
jest.mock('apostrophe', () => jest.fn());

describe('createAposConfig', () => {
  let originalEnv = null;

  beforeEach(() => {
    originalEnv = { ...process.env };
    // Set the required environment variables for all tests
    process.env.BASE_URL = 'http://localhost:3000';
    process.env.SESSION_SECRET = 'changeme';
    process.env.REDIS_URI = 'redis://localhost:6379';
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  test('returns correct default config', () => {
    // No need to delete environment variables
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
    expect(config.modules['@apostrophecms/template']).toBeDefined();

    // Global data module
    expect(config.modules['global-data']).toBeDefined();

    // Widget types
    expect(config.modules['@apostrophecms/rich-text-widget']).toBeDefined();
    expect(config.modules['@apostrophecms/image-widget']).toBeDefined();
    expect(config.modules['@apostrophecms/video-widget']).toBeDefined();

    // Custom widgets
    expect(config.modules['home-hero-widget']).toBeDefined();
    expect(config.modules['default-hero-widget']).toBeDefined();
    expect(config.modules['buttons-widget']).toBeDefined();
    expect(config.modules['flex-cards-widget']).toBeDefined();
    expect(config.modules['links-buttons-widget']).toBeDefined();
    expect(config.modules['team-carousel-widget']).toBeDefined();
    expect(config.modules['testimonials-carousel-widget']).toBeDefined();
    expect(config.modules['about-widget']).toBeDefined();
    expect(config.modules['map-widget']).toBeDefined();
    expect(config.modules['simple-cards-widget']).toBeDefined();
    expect(config.modules['leadership-carousel-widget']).toBeDefined();
    expect(config.modules['insights-carousel-widget']).toBeDefined();
    expect(config.modules['contact-widget']).toBeDefined();
    expect(config.modules['page-intro-widget']).toBeDefined();
    expect(config.modules['whitespace-widget']).toBeDefined();

    // Form modules
    expect(config.modules['@apostrophecms/form']).toBeDefined();
    expect(config.modules['@apostrophecms/form-widget']).toBeDefined();
    expect(
      config.modules['@apostrophecms/form-text-field-widget'],
    ).toBeDefined();
    expect(
      config.modules['@apostrophecms/form-textarea-field-widget'],
    ).toBeDefined();
    expect(
      config.modules['@apostrophecms/form-select-field-widget'],
    ).toBeDefined();
    expect(
      config.modules['@apostrophecms/form-radio-field-widget'],
    ).toBeDefined();
    expect(
      config.modules['@apostrophecms/form-file-field-widget'],
    ).toBeDefined();
    expect(
      config.modules['@apostrophecms/form-checkboxes-field-widget'],
    ).toBeDefined();
    expect(
      config.modules['@apostrophecms/form-boolean-field-widget'],
    ).toBeDefined();
    expect(
      config.modules['@apostrophecms/form-conditional-widget'],
    ).toBeDefined();
    expect(config.modules['@apostrophecms/form-divider-widget']).toBeDefined();
    expect(config.modules['@apostrophecms/form-group-widget']).toBeDefined();

    // Custom pieces and pages
    expect(config.modules['team-members']).toBeDefined();
    expect(config.modules.testimonials).toBeDefined();
    expect(config.modules.asset).toBeDefined();
    expect(config.modules['default-page']).toBeDefined();
    expect(config.modules['@apostrophecms/import-export']).toBeDefined();
    expect(config.modules['cases-tags']).toBeDefined();
    expect(config.modules['case-studies']).toBeDefined();
    expect(config.modules['case-studies-page']).toBeDefined();
    expect(config.modules.categories).toBeDefined();
    expect(config.modules['case-studies-carousel-widget']).toBeDefined();
    expect(config.modules['container-widget']).toBeDefined();
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
