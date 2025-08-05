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

  // Tests for specific code blocks (L6-L14: Environment and baseUrl logic)
  describe('Environment and baseUrl logic (L6-L14)', () => {
    beforeEach(() => {
      delete process.env.BASE_URL;
      delete process.env.NODE_ENV;
    });

    test('uses production baseUrl when NODE_ENV is production and BASE_URL is not set', () => {
      process.env.NODE_ENV = 'production';
      const config = createAposConfig();
      expect(config.baseUrl).toBe('https://speedandfunction.com');
    });

    test('uses localhost baseUrl when NODE_ENV is not production and BASE_URL is not set', () => {
      process.env.NODE_ENV = 'development';
      const config = createAposConfig();
      expect(config.baseUrl).toBe('http://localhost:3000');
    });

    test('uses localhost baseUrl when NODE_ENV is undefined and BASE_URL is not set', () => {
      delete process.env.NODE_ENV;
      const config = createAposConfig();
      expect(config.baseUrl).toBe('http://localhost:3000');
    });

    test('uses BASE_URL environment variable when set, regardless of NODE_ENV', () => {
      process.env.NODE_ENV = 'production';
      process.env.BASE_URL = 'https://custom-domain.com';
      const config = createAposConfig();
      expect(config.baseUrl).toBe('https://custom-domain.com');
    });

    test('uses BASE_URL environment variable in development', () => {
      process.env.NODE_ENV = 'development';
      process.env.BASE_URL = 'http://dev.example.com';
      const config = createAposConfig();
      expect(config.baseUrl).toBe('http://dev.example.com');
    });
  });

  // Tests for L25-L26: Trust proxy configuration
  describe('Trust proxy configuration (L25-L26)', () => {
    test('sets trustProxy to true', () => {
      const config = createAposConfig();
      expect(config.modules['@apostrophecms/express'].options.trustProxy).toBe(true);
    });
  });

  // Tests for L37-L51: Cookie configuration
  describe('Cookie configuration (L37-L51)', () => {
    beforeEach(() => {
      delete process.env.NODE_ENV;
    });

    test('configures cookie for development environment', () => {
      process.env.NODE_ENV = 'development';
      const config = createAposConfig();
      const cookieConfig = config.modules['@apostrophecms/express'].options.session.cookie;
      
      expect(cookieConfig.secure).toBe(false);
      expect(cookieConfig.sameSite).toBe('lax');
      expect(cookieConfig.httpOnly).toBe(true);
      expect(cookieConfig.maxAge).toBe(24 * 60 * 60 * 1000); // 24 hours
      expect(cookieConfig.domain).toBeUndefined();
    });

    test('configures cookie for production environment with domain', () => {
      process.env.NODE_ENV = 'production';
      const config = createAposConfig();
      const cookieConfig = config.modules['@apostrophecms/express'].options.session.cookie;
      
      expect(cookieConfig.secure).toBe(true);
      expect(cookieConfig.sameSite).toBe('lax');
      expect(cookieConfig.httpOnly).toBe(true);
      expect(cookieConfig.maxAge).toBe(24 * 60 * 60 * 1000); // 24 hours
      expect(cookieConfig.domain).toBe('.speedandfunction.com');
    });

    test('configures cookie for undefined NODE_ENV (defaults to development)', () => {
      delete process.env.NODE_ENV;
      const config = createAposConfig();
      const cookieConfig = config.modules['@apostrophecms/express'].options.session.cookie;
      
      expect(cookieConfig.secure).toBe(false);
      expect(cookieConfig.domain).toBeUndefined();
    });
  });

  // Tests for L55-L66: CSRF cookie configuration
  describe('CSRF cookie configuration (L55-L66)', () => {
    beforeEach(() => {
      delete process.env.NODE_ENV;
    });

    test('configures CSRF cookie for development environment', () => {
      process.env.NODE_ENV = 'development';
      const config = createAposConfig();
      const csrfCookieConfig = config.modules['@apostrophecms/express'].options.csrf.cookie;
      
      expect(csrfCookieConfig.key).toBe('_csrf');
      expect(csrfCookieConfig.path).toBe('/');
      expect(csrfCookieConfig.httpOnly).toBe(true);
      expect(csrfCookieConfig.secure).toBe(false);
      expect(csrfCookieConfig.sameSite).toBe('lax');
      expect(csrfCookieConfig.maxAge).toBe(3600);
      expect(csrfCookieConfig.domain).toBeUndefined();
    });

    test('configures CSRF cookie for production environment with domain', () => {
      process.env.NODE_ENV = 'production';
      const config = createAposConfig();
      const csrfCookieConfig = config.modules['@apostrophecms/express'].options.csrf.cookie;
      
      expect(csrfCookieConfig.key).toBe('_csrf');
      expect(csrfCookieConfig.path).toBe('/');
      expect(csrfCookieConfig.httpOnly).toBe(true);
      expect(csrfCookieConfig.secure).toBe(true);
      expect(csrfCookieConfig.sameSite).toBe('lax');
      expect(csrfCookieConfig.maxAge).toBe(3600);
      expect(csrfCookieConfig.domain).toBe('.speedandfunction.com');
    });
  });

  // Tests for CSRF value function
  describe('CSRF value function', () => {
    test('extracts CSRF token from request body', () => {
      const config = createAposConfig();
      const csrfValueFn = config.modules['@apostrophecms/express'].options.csrf.value;
      
      const mockReq = {
        body: { _csrf: 'body-token' },
        query: {},
        headers: {}
      };
      
      expect(csrfValueFn(mockReq)).toBe('body-token');
    });

    test('extracts CSRF token from query parameters', () => {
      const config = createAposConfig();
      const csrfValueFn = config.modules['@apostrophecms/express'].options.csrf.value;
      
      const mockReq = {
        body: {},
        query: { _csrf: 'query-token' },
        headers: {}
      };
      
      expect(csrfValueFn(mockReq)).toBe('query-token');
    });

    test('extracts CSRF token from x-csrf-token header', () => {
      const config = createAposConfig();
      const csrfValueFn = config.modules['@apostrophecms/express'].options.csrf.value;
      
      const mockReq = {
        body: {},
        query: {},
        headers: { 'x-csrf-token': 'header-token' }
      };
      
      expect(csrfValueFn(mockReq)).toBe('header-token');
    });

    test('extracts CSRF token from x-xsrf-token header', () => {
      const config = createAposConfig();
      const csrfValueFn = config.modules['@apostrophecms/express'].options.csrf.value;
      
      const mockReq = {
        body: {},
        query: {},
        headers: { 'x-xsrf-token': 'xsrf-token' }
      };
      
      expect(csrfValueFn(mockReq)).toBe('xsrf-token');
    });

    test('extracts CSRF token from csrf-token header', () => {
      const config = createAposConfig();
      const csrfValueFn = config.modules['@apostrophecms/express'].options.csrf.value;
      
      const mockReq = {
        body: {},
        query: {},
        headers: { 'csrf-token': 'csrf-header-token' }
      };
      
      expect(csrfValueFn(mockReq)).toBe('csrf-header-token');
    });

    test('prioritizes body over query and headers', () => {
      const config = createAposConfig();
      const csrfValueFn = config.modules['@apostrophecms/express'].options.csrf.value;
      
      const mockReq = {
        body: { _csrf: 'body-token' },
        query: { _csrf: 'query-token' },
        headers: { 'x-csrf-token': 'header-token' }
      };
      
      expect(csrfValueFn(mockReq)).toBe('body-token');
    });
  });

  // Tests for L89-L96: Hostname and header logic
  describe('Hostname and header logic middleware (L89-L96)', () => {
    let middleware;
    let mockReq;
    let mockRes;
    let mockNext;

    beforeEach(() => {
      const config = createAposConfig();
      middleware = config.modules['@apostrophecms/express'].options.middleware[0].middleware;
      
      mockReq = {
        hostname: '',
        headers: {},
        get: jest.fn()
      };
      mockRes = {
        setHeader: jest.fn()
      };
      mockNext = jest.fn();
    });

    test('sets headers when hostname is speedandfunction.com', () => {
      mockReq.hostname = 'speedandfunction.com';
      
      middleware(mockReq, mockRes, mockNext);
      
      expect(mockReq.headers['x-forwarded-host']).toBe('speedandfunction.com');
      expect(mockReq.headers['x-forwarded-proto']).toBe('https');
      expect(mockNext).toHaveBeenCalled();
    });

    test('sets headers when host header is speedandfunction.com', () => {
      mockReq.hostname = 'other.com';
      mockReq.get.mockReturnValue('speedandfunction.com');
      
      middleware(mockReq, mockRes, mockNext);
      
      expect(mockReq.headers['x-forwarded-host']).toBe('speedandfunction.com');
      expect(mockReq.headers['x-forwarded-proto']).toBe('https');
      expect(mockNext).toHaveBeenCalled();
    });

    test('does not set headers for other hostnames', () => {
      mockReq.hostname = 'localhost';
      mockReq.get.mockReturnValue('localhost:3000');
      
      middleware(mockReq, mockRes, mockNext);
      
      expect(mockReq.headers['x-forwarded-host']).toBeUndefined();
      expect(mockReq.headers['x-forwarded-proto']).toBeUndefined();
      expect(mockNext).toHaveBeenCalled();
    });
  });

  // Tests for L97-L112: CORS headers
  describe('CORS headers middleware (L97-L112)', () => {
    let middleware;
    let mockReq;
    let mockRes;
    let mockNext;

    beforeEach(() => {
      const config = createAposConfig();
      middleware = config.modules['@apostrophecms/express'].options.middleware[0].middleware;
      
      mockReq = {
        hostname: '',
        headers: {},
        get: jest.fn()
      };
      mockRes = {
        setHeader: jest.fn()
      };
      mockNext = jest.fn();
    });

    test('sets CORS headers for allowed origin speedandfunction.com', () => {
      mockReq.headers.origin = 'https://speedandfunction.com';
      
      middleware(mockReq, mockRes, mockNext);
      
      expect(mockRes.setHeader).toHaveBeenCalledWith('Access-Control-Allow-Origin', 'https://speedandfunction.com');
      expect(mockRes.setHeader).toHaveBeenCalledWith('Access-Control-Allow-Credentials', 'true');
      expect(mockRes.setHeader).toHaveBeenCalledWith('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
      expect(mockRes.setHeader).toHaveBeenCalledWith(
        'Access-Control-Allow-Headers',
        'Origin, X-Requested-With, Content-Type, Accept, Authorization, X-CSRF-Token, X-XSRF-TOKEN'
      );
      expect(mockNext).toHaveBeenCalled();
    });

    test('sets CORS headers for allowed origin apostrophe-cms-production.up.railway.app', () => {
      mockReq.headers.origin = 'https://apostrophe-cms-production.up.railway.app';
      
      middleware(mockReq, mockRes, mockNext);
      
      expect(mockRes.setHeader).toHaveBeenCalledWith('Access-Control-Allow-Origin', 'https://apostrophe-cms-production.up.railway.app');
      expect(mockRes.setHeader).toHaveBeenCalledWith('Access-Control-Allow-Credentials', 'true');
      expect(mockRes.setHeader).toHaveBeenCalledWith('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
      expect(mockRes.setHeader).toHaveBeenCalledWith(
        'Access-Control-Allow-Headers',
        'Origin, X-Requested-With, Content-Type, Accept, Authorization, X-CSRF-Token, X-XSRF-TOKEN'
      );
      expect(mockNext).toHaveBeenCalled();
    });

    test('does not set CORS headers for disallowed origins', () => {
      mockReq.headers.origin = 'https://malicious-site.com';
      
      middleware(mockReq, mockRes, mockNext);
      
      expect(mockRes.setHeader).not.toHaveBeenCalledWith('Access-Control-Allow-Origin', expect.anything());
      expect(mockRes.setHeader).not.toHaveBeenCalledWith('Access-Control-Allow-Credentials', expect.anything());
      expect(mockNext).toHaveBeenCalled();
    });

    test('does not set CORS headers when no origin header is present', () => {
      delete mockReq.headers.origin;
      
      middleware(mockReq, mockRes, mockNext);
      
      expect(mockRes.setHeader).not.toHaveBeenCalledWith('Access-Control-Allow-Origin', expect.anything());
      expect(mockRes.setHeader).not.toHaveBeenCalledWith('Access-Control-Allow-Credentials', expect.anything());
      expect(mockNext).toHaveBeenCalled();
    });

    test('middleware is configured to run before @apostrophecms/csrf', () => {
      const config = createAposConfig();
      const middlewareConfig = config.modules['@apostrophecms/express'].options.middleware[0];
      
      expect(middlewareConfig.before).toBe('@apostrophecms/csrf');
      expect(typeof middlewareConfig.middleware).toBe('function');
    });
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
