const apostrophe = require('apostrophe');
require('dotenv').config({ path: '../.env' });
const { getEnv } = require('./utils/env');

/*
 * Construct MongoDB URI from environment variables
 * This must happen before Apostrophe initialization
 */
function constructMongoDbUri() {
  const mongoUsername = getEnv('DOCUMENTDB_USERNAME');
  const mongoPassword = getEnv('DOCUMENTDB_PASSWORD');
  const mongoHost = getEnv('DOCUMENTDB_HOST');
  const mongoPort = getEnv('DOCUMENTDB_PORT');
  const mongoDatabase = getEnv('DOCUMENTDB_DATABASE');

  /*
   * AWS DocumentDB requires TLS/SSL encryption and SCRAM-SHA-1 authentication
   * Build connection string with proper DocumentDB parameters
   */
  const mongoUri = `mongodb://${encodeURIComponent(mongoUsername)}:${encodeURIComponent(mongoPassword)}@${mongoHost}:${mongoPort}/${mongoDatabase}?tls=true&tlsCAFile=global-bundle.pem&retryWrites=false`;

  // Log success (using simple logging since Apostrophe isn't initialized yet)
  process.stdout.write('✅ MongoDB URI constructed successfully\n');
  process.stdout.write(`   Host: ${mongoHost}:${mongoPort}\n`);
  process.stdout.write(`   Database: ${mongoDatabase}\n`);
  process.stdout.write(`   Username: ${mongoUsername}\n`);
  process.stdout.write(`   TLS: enabled with CA file validation\n`);

  return mongoUri;
}

function createAposConfig() {
  return {
    shortName: 'apostrophe-site',
    baseUrl: getEnv('BASE_URL'),

    // Session configuration
    modules: {
      // Database configuration with direct URI
      '@apostrophecms/db': {
        options: {
          uri: constructMongoDbUri(),
          // Additional MongoDB connection options for DocumentDB
        },
      },

      // Core modules configuration
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

      // Configure page types
      '@apostrophecms/rich-text-widget': {},
      '@apostrophecms/image-widget': {
        options: {
          className: 'bp-image-widget',
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
    },
  };
}

/* istanbul ignore next */
if (require.main === module) {
  apostrophe(createAposConfig());
}
module.exports = { createAposConfig };
