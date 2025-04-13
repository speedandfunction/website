const headingToolbar = require('../../lib/headingToolbar');

module.exports = {
  extend: '@apostrophecms/widget-type',
  options: {
    label: 'About Widget',
    icon: 'anchor-icon'
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
              ...headingToolbar
            }
          }
        }
      },
      records: {
        label: 'Counter',
        type: 'array',
        titleField: 'description',
        fields: {
          add: {
            number: {
              label: 'Number',
              type: 'integer',
              required: true
            },
            description: {
              label: 'Description',
              type: 'string',
              textarea: true
            }
          }
        }
      }
    }
  }
};
