module.exports = {
  expanded: true,
  groups: {
    basic: {
      label: 'Basic',
      widgets: {
        '@apostrophecms/image': {},
        '@apostrophecms/video': {},
        'projects-carousel': {},
        map: {},
        about: {},
        'simple-cards': {},
        'links-buttons': {},
      },
      columns: 2,
    },
    layout: {
      label: 'Specialty',
      widgets: {
        'leadership-carousel': {},
        'testimonials-carousel': {},
        'insights-carousel': {},
        contact: {},
        '@apostrophecms/html': {},
        'page-intro': {},
        'home-hero': {},
      },
      columns: 2,
    },
  },
};
