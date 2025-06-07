const { createAposConfig } = require('./app');
const mockConnectRedis = jest.fn();
jest.mock('connect-redis', () => mockConnectRedis);
jest.mock('apostrophe', () => jest.fn());

describe('createAposConfig', () => {
  let originalEnv = null;

  beforeEach(() => {
    originalEnv = { ...process.env };
    // Set default environment variables
    process.env.BASE_URL = 'http://localhost:3000';
    process.env.SESSION_SECRET = 'changeme';
    process.env.REDIS_URI = 'redis://localhost:6379';
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  test.each([
    [
      'default config',
      {
        baseUrl: 'http://localhost:3000',
        sessionSecret: 'changeme',
        redisUri: 'redis://localhost:6379',
      },
    ],
    [
      'custom config',
      {
        baseUrl: 'http://test.com',
        sessionSecret: 'topsecret',
        redisUri: 'redis://remote',
      },
    ],
  ])('returns correct %s', (_, envVars) => {
    // Set environment variables for this test case
    if (envVars.baseUrl !== 'http://localhost:3000') {
      process.env.BASE_URL = envVars.baseUrl;
      process.env.SESSION_SECRET = envVars.sessionSecret;
      process.env.REDIS_URI = envVars.redisUri;
    }

    const config = createAposConfig();

    // Verify config
    expect(config.baseUrl).toBe(envVars.baseUrl);
    expect(
      config.modules['@apostrophecms/express'].options.session.secret,
    ).toBe(envVars.sessionSecret);
    expect(
      config.modules['@apostrophecms/express'].options.session.store,
    ).toEqual({
      connect: mockConnectRedis,
      options: { url: envVars.redisUri },
    });
  });

  // Define module categories for verification - moved outside the test
  const moduleCategories = [
    {
      name: 'Core modules',
      modules: [
        '@apostrophecms/express',
        '@apostrophecms/template',
        'global-data',
      ],
    },
    {
      name: 'Widget types',
      modules: [
        '@apostrophecms/rich-text-widget',
        '@apostrophecms/image-widget',
        '@apostrophecms/video-widget',
      ],
    },
    {
      name: 'Custom widgets',
      modules: [
        'home-hero-widget',
        'default-hero-widget',
        'buttons-widget',
        'flex-cards-widget',
        'links-buttons-widget',
        'team-carousel-widget',
        'testimonials-carousel-widget',
        'about-widget',
        'map-widget',
        'simple-cards-widget',
        'insights-carousel-widget',
        'contact-widget',
        'page-intro-widget',
        'whitespace-widget',
      ],
    },
    {
      name: 'Form modules',
      modules: [
        '@apostrophecms/form',
        '@apostrophecms/form-widget',
        '@apostrophecms/form-text-field-widget',
        '@apostrophecms/form-textarea-field-widget',
        '@apostrophecms/form-checkboxes-field-widget',
      ],
    },
    {
      name: 'Custom pieces and pages',
      modules: [
        'team-members',
        'testimonials',
        'asset',
        'default-page',
        '@apostrophecms/import-export',
        'cases-tags',
        'case-studies',
        'case-studies-page',
        'categories',
        'case-studies-carousel-widget',
        'container-widget',
      ],
    },
  ];

  // Create a test for checking if config has all required modules
  test('creates config with required modules', () => {
    const config = createAposConfig();

    // Verify that config has modules property
    expect(config.modules).toBeDefined();
    expect(typeof config.modules).toBe('object');
  });

  // Use describe.each to create a separate describe block for each category
  describe.each(moduleCategories)(
    'Required Module Category: $name',
    (category) => {
      // Within each category describe block, test each module
      test.each(category.modules)('%s is defined', (moduleName) => {
        const config = createAposConfig();
        expect(config.modules[moduleName]).toBeDefined();
      });
    },
  );

  test.each([
    ['@apostrophecms/image-widget', 'bp-image-widget'],
    ['@apostrophecms/video-widget', 'bp-video-widget'],
  ])(
    'configures %s with proper class name',
    (widgetName, expectedClassName) => {
      const config = createAposConfig();
      expect(config.modules[widgetName].options.className).toBe(
        expectedClassName,
      );
    },
  );

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
    expect(apostropheMock).not.toHaveBeenCalled();
  });
});
