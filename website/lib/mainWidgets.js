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
        'big-block': {},
        '@apostrophecms/rich-text': {
          ...headingToolbar,
        },
        'table': {},
        'vacancies-list': {},
      },
      columns: 2,
    },
    layout: {
      label: 'Specialty',
      widgets: {
        'testimonials-carousel': {},
        'insights-carousel': {},
        'contact': {},
        '@apostrophecms/html': {},
        'page-intro': {},
        'home-hero': {},
        'sf-hero': {},
        'purpose-cards': {},
        'trusted-leaders': {},
        'cta-block': {},
        'leadership-team': {},
      },
      columns: 2,
    },
  },
};
