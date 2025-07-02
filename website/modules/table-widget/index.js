const headingToolbar = require('../../lib/headingToolbar');
const linkSchema = require('../../lib/linkSchema');

module.exports = {
  extend: '@apostrophecms/widget-type',
  options: {
    label: 'Table Widget',
    icon: 'table-icon',
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
        required: false,
      },
      rows: {
        label: 'Table Rows',
        type: 'array',
        titleField: 'title',
        min: 1,
        fields: {
          add: {
            title: {
              label: 'Title',
              type: 'string',
              required: true,
            },
            description: {
              label: 'Description',
              type: 'string',
              textarea: true,
              required: true,
            },
            ...linkSchema.fields.add,
          },
        },
      },
    },
  },
};
