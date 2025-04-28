const headingToolbar = require('../../lib/headingToolbar');
const linkSchema = require('../../lib/linkSchema');

module.exports = {
  extend: '@apostrophecms/widget-type',
  options: {
    label: 'Links/Buttons Widget',
    previewImage: 'png',
    icon: 'format-list-bulleted-icon',
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
      textSpacing: {
        label: 'Text Spacing',
        type: 'range',
        min: 0,
        max: 40,
        step: 4,
        def: 0,
        help: 'Space between text and button/link (in pixels)'
      },
      links: {
        label: 'Links',
        type: 'array',
        titleField: 'link.linkTitle',
        fields: {
          add: {
            link: {
              label: 'Link',
              ...linkSchema,
            },
          },
        },
      },
      buttons: {
        label: 'Buttons',
        type: 'array',
        titleField: 'button.linkTitle',
        fields: {
          add: {
            button: {
              label: 'Button',
              ...linkSchema,
            },
          },
        },
      },
    },
  },
};
