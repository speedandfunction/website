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
    // No fields - content is hardcoded in template
  },
};
