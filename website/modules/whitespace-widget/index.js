module.exports = {
  extend: '@apostrophecms/widget-type',
  options: {
    label: 'Whitespace',
    icon: 'expand-vertical-icon',
  },
  fields: {
    add: {
      size: {
        label: 'Space Size',
        type: 'range',
        min: 8,
        max: 100,
        step: 4,
        def: 8,
      },
    },
  },
};
