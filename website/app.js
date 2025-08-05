const apostrophe = require('apostrophe');
require('dotenv').config({ path: '../.env' });
const { getEnv } = require('./utils/env');

function createAposConfig() {
  const isProduction = process.env.NODE_ENV === 'production';
  let baseUrl = getEnv('BASE_URL');
  if (!baseUrl) {
    if (isProduction) {
      baseUrl = 'https://speedandfunction.com';
    } else {
      baseUrl = 'http://localhost:3000';
    }
  }

  return {
    shortName: 'apostrophe-site',
    baseUrl,

    // Session configuration
    modules: {
      // Core modules configuration
      '@apostrophecms/express': {
        options: {
          // Trust proxy for Railway deployment
          trustProxy: true,

          session: {
            // If using Redis (recommended for production)
            secret: getEnv('SESSION_SECRET'),
            store: {
              connect: require('connect-redis'),
              options: {
                url: getEnv('REDIS_URI'),
              },
            },
            cookie: (() => {
              const cookieConfig = {
                secure: isProduction,
                sameSite: 'lax',
                httpOnly: true,
                // 24 hours
                maxAge: 24 * 60 * 60 * 1000,
              };
              // Set domain for production to work with custom domain
              if (isProduction) {
                cookieConfig.domain = '.speedandfunction.com';
              }
              return cookieConfig;
            })(),
          },

          csrf: {
            cookie: (() => {
              const csrfCookieConfig = {
                key: '_csrf',
                path: '/',
                httpOnly: true,
                secure: isProduction,
                sameSite: 'lax',
                maxAge: 3600,
              };
              // CRITICAL: Set domain for CSRF cookie to work with custom domain
              if (isProduction) {
                csrfCookieConfig.domain = '.speedandfunction.com';
              }
              return csrfCookieConfig;
            })(),
            // Additional CSRF options for better security
            ignoreMethods: ['GET', 'HEAD', 'OPTIONS'],
            value: (req) => {
              const csrfKey = '_csrf';
              return (
                (req.body && req.body[csrfKey]) ||
                (req.query && req.query[csrfKey]) ||
                req.headers['x-csrf-token'] ||
                req.headers['x-xsrf-token'] ||
                req.headers['csrf-token']
              );
            },
          },

          // Add middleware to handle domain-specific headers
          middleware: [
            {
              before: '@apostrophecms/csrf',
              middleware: (req, res, next) => {
                // Ensure proper headers for custom domain
                if (
                  req.hostname === 'speedandfunction.com' ||
                  req.get('host') === 'speedandfunction.com'
                ) {
                  req.headers['x-forwarded-host'] = 'speedandfunction.com';
                  req.headers['x-forwarded-proto'] = 'https';
                }

                // Set CORS headers for API requests
                const allowedOrigins = [
                  'https://speedandfunction.com',
                  'https://apostrophe-cms-production.up.railway.app',
                ];

                const { origin } = req.headers;
                if (allowedOrigins.includes(origin)) {
                  res.setHeader('Access-Control-Allow-Origin', origin);
                  res.setHeader('Access-Control-Allow-Credentials', 'true');
                  res.setHeader(
                    'Access-Control-Allow-Methods',
                    'GET, POST, PUT, DELETE, OPTIONS',
                  );
                  res.setHeader(
                    'Access-Control-Allow-Headers',
                    'Origin, X-Requested-With, Content-Type, Accept, Authorization, X-CSRF-Token, X-XSRF-TOKEN',
                  );
                }

                next();
              },
            },
          ],
        },
      },

      // Make getEnv function available to templates
      '@apostrophecms/template': {
        options: {
          nunjucksEnv: {
            getEnv,
          },
        },
      },

      // Add global data module
      'global-data': {},

      // Shared constants module
      '@apostrophecms/shared-constants': {},

      // Configure page types
      '@apostrophecms/rich-text-widget': {},
      '@apostrophecms/image-widget': {
        options: {
          className: 'bp-image-widget',
          placeholderImage: false,
        },
      },
      '@apostrophecms/video-widget': {
        options: {
          className: 'bp-video-widget',
        },
      },

      // Custom Widgets
      'home-hero-widget': {},
      'default-hero-widget': {},
      'buttons-widget': {},
      'flex-cards-widget': {},
      'links-buttons-widget': {},
      'team-carousel-widget': {},
      'testimonials-carousel-widget': {},
      'about-widget': {},
      'map-widget': {},
      'simple-cards-widget': {},
      'insights-carousel-widget': {},
      'contact-widget': {},
      'page-intro-widget': {},
      'whitespace-widget': {},

      // The main form module
      '@apostrophecms/form': {},
      // The form widget module, allowing editors to add forms to content areas
      '@apostrophecms/form-widget': {},
      // Form field widgets, used by the main form module to build forms.
      '@apostrophecms/form-text-field-widget': {},
      '@apostrophecms/form-textarea-field-widget': {},
      '@apostrophecms/form-checkboxes-field-widget': {},

      // Custom Pieces
      'team-members': {},
      'testimonials': {},

      // `asset` supports the project"s webpack build for client-side assets.
      'asset': {},

      // The project"s first custom page type.
      'default-page': {},
      '@apostrophecms/import-export': {},
      'cases-tags': {},
      'case-studies': {},
      'case-studies-page': {},
      'categories': {},
      'vacancies': {},
      'vacancies-list-widget': {},
      'case-studies-carousel-widget': {},
      'container-widget': {},
      'leadership-team-widget': {},
      'table-widget': {},
      'form-field-standardizer': {},
    },
  };
}

/* istanbul ignore next */
if (require.main === module) {
  apostrophe(createAposConfig());
}

module.exports = { createAposConfig };
