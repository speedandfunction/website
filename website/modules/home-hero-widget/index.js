const extendedToolbar = require('../../lib/extendedToolbar');

module.exports = {
  extend: '@apostrophecms/widget-type',
  options: {
    label: 'Hero Homepage Widget',
  },
  fields: {
    add: {
      heading: {
        label: 'Heading',
        type: 'string',
      },
      content: {
        label: 'Hero Content',
        type: 'area',
        options: {
          widgets: {
            'buttons': {},
            '@apostrophecms/rich-text': {
              ...extendedToolbar,
              insert: ['image'],
            },
          },
        },
      },
    },
  },
};
