const extendedToolbar = require('../../lib/extendedToolbar');
const headingToolbar = require('../../lib/headingToolbar');

module.exports = {
  extend: '@apostrophecms/widget-type',
  options: {
    label: 'Simple Cards',
    icon: 'view-column-icon',
  },
  fields: {
    add: {
      showCounter: {
        label: 'Show Numbers',
        type: 'boolean',
        def: true,
        help: 'Show numbers before each card',
        },
      intro: {
        label: 'Intro',
        type: 'area',
        options: {
          max: 1,
          widgets: {
            '@apostrophecms/rich-text': {
              ...headingToolbar,
            },
          },
        },
      },
      cards: {
        label: 'Cards',
        type: 'array',
        titleField: 'cardTitle',
        min: 1,
        fields: {
          add: {
            cardTitle: {
              label: 'Title',
              type: 'string',
            },
            cardContent: {
              label: 'Content',
              type: 'area',
              options: {
                widgets: {
                  '@apostrophecms/rich-text': {
                    className: 'sf-simple-card__text',
                    ...extendedToolbar,
                  },
                  'buttons': {},
                },
              },
            },
          },
        },
      },
    },
  },
};
