const apostrophe = require('apostrophe');
require('dotenv').config({ path: '../.env' });

function createAposConfig() {
  return {
    shortName: 'apostrophe-site',
    baseUrl: process.env.BASE_URL || 'http://localhost:3000',

    // Session configuration
    modules: {
      // Core modules configuration
      '@apostrophecms/express': {
        options: {
          session: {
            // If using Redis (recommended for production)
            secret: process.env.SESSION_SECRET || 'changeme',
            store: {
              connect: require('connect-redis'),
              options: {
                url: process.env.REDIS_URI || 'redis://localhost:6379',
              },
            },
          },
        },
      },

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
      'leadership-carousel-widget': {},
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
      '@apostrophecms/form-select-field-widget': {},
      '@apostrophecms/form-radio-field-widget': {},
      '@apostrophecms/form-file-field-widget': {},
      '@apostrophecms/form-checkboxes-field-widget': {},
      '@apostrophecms/form-boolean-field-widget': {},
      '@apostrophecms/form-conditional-widget': {},
      '@apostrophecms/form-divider-widget': {},
      '@apostrophecms/form-group-widget': {},

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
    },
  };
}

/* istanbul ignore next */
if (require.main === module) {
  apostrophe(createAposConfig());
}
module.exports = { createAposConfig };
