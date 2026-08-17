module.exports = {
  extend: '@apostrophecms/widget-type',
  options: {
    label: 'Test Big Block',
    icon: 'dots-vertical-icon',
    className: 'sf-big-block-widget',
    styles: true,
    scripts: [
      {
        name: 'big-block-animations',
        source: 'ui/src/index.js',
      },
    ],
  },
  fields: {
    add: {
      _testimonials: {
        label: 'Testimonials',
        type: 'relationship',
        withType: 'testimonials',
        max: 6,
        builders: {
          project: {
            title: 1,
            position: 1,
            organization: 1,
            feedback: 1,
            url: 1,
            headshot: 1,
          },
        },
      },
    },
  },
};
