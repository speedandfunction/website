const headingToolbar = require('../../lib/headingToolbar');

module.exports = {
  extend: '@apostrophecms/widget-type',
  options: {
    label: 'Flex Cards',
    previewImage: 'png',
    icon: 'view-column-icon',
  },
  fields: {
    add: {
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
            cardColor: {
              type: 'color',
              label: 'Card color',
            },
            _image: {
              label: 'Image',
              type: 'relationship',
              withType: '@apostrophecms/image',
              help: 'Aspect Ratio 2:3 is recommended',
              max: 1,
            },
            cardContent: {
              label: 'Content',
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
          },
        },
      },
    },
  },
};
