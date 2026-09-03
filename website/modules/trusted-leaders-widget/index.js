module.exports = {
  extend: '@apostrophecms/widget-type',
  options: {
    label: 'Trusted by Leaders',
    icon: 'flare-icon',
    className: 'sf-trusted-leaders',
    styles: true,
  },
  fields: {
    add: {
      heading: {
        label: 'Heading',
        type: 'string',
        textarea: true,
        help: 'Section heading, e.g. "Trusted by visionary leaders"',
      },
      _testimonials: {
        label: 'Testimonials',
        help: 'Select and order the Testimonials',
        type: 'relationship',
        withType: 'testimonials',
        builders: {
          project: {
            title: 1,
            feedback: 1,
            position: 1,
            organization: 1,
            url: 1,
            headshot: 1,
          },
        },
      },
    },
    group: {
      fields: {
        heading: 1,
        _testimonials: 1,
      },
    },
  },
};
