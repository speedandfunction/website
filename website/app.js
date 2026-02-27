const apostrophe = require('apostrophe');
require('dotenv').config({ path: '../.env' });
const { getEnv } = require('./utils/env');

function createAposConfig() {
  return {
    shortName: 'apostrophe-site',
    baseUrl: process.env.BASE_URL || 'https://speedandfunction.com',

    // Session configuration
    modules: {
      // Core modules configuration
      '@apostrophecms/security-headers': {},
      '@apostrophecms/express': {
        options: {
          session: {
            // If using Redis (recommended for production)
            secret: getEnv('SESSION_SECRET'),
            store: {
              connect: require('connect-redis'),
              options: {
                url: getEnv('REDIS_URI'),
              },
            },
          },
          csrf: {
            cookie: {
              key: '_csrf',
              path: '/',
              httpOnly: true,
              secure: process.env.NODE_ENV === 'production',
              sameSite: 'lax',
              maxAge: 3600,
            },
          },
          // Add CORS configuration for production
          cors: {
            origin: (() => {
              if (process.env.NODE_ENV === 'production') {
                return 'https://speedandfunction.com';
              }
              return true;
            })(),
            credentials: true,
            methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
            allowedHeaders: [
              'Content-Type',
              'Authorization',
              'X-Requested-With',
              'X-CSRF-Token',
            ],
          },
        },
      },
      // Enable local SEO module with GTM integration
      '@apostrophecms/seo': {},
      '@apostrophecms/global': {},
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
      /*
       * 'links-buttons-widget': {},
       * 'team-carousel-widget': {},
       */

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
      'landing-pages': {},

      // `asset` supports the project"s webpack build for client-side assets.
      'asset': {},
      // The project"s first custom page type.
      'default-page': {},
      '@apostrophecms/import-export': {},
      'cases-tags': {},
      'case-studies': {},
      'case-studies-page': {},
      'business-partner': {},
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
