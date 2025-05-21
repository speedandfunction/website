const headingToolbar = require('./headingToolbar');

module.exports = {
  expanded: true,
  groups: {
    basic: {
      label: 'Basic',
      widgets: {
        '@apostrophecms/image': {},
        '@apostrophecms/video': {},
        'case-studies-carousel': {},
        'map': {},
        'about': {},
        'simple-cards': {},
        'links-buttons': {},
        'buttons': {},
        'whitespace': {},
        'container': {},
        '@apostrophecms/rich-text': {
          ...headingToolbar,
        },
        'table': {},
      },
      columns: 2,
    },
    layout: {
      label: 'Specialty',
      widgets: {
        'leadership-carousel': {},
        'testimonials-carousel': {},
        'insights-carousel': {},
        'contact': {},
        '@apostrophecms/html': {},
        'page-intro': {},
        'home-hero': {},
      },
      columns: 2,
    },
  },
};
