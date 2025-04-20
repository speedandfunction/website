const linkSchema = require('../../lib/linkSchema');
const buttonConfig = require('../../lib/buttonConfig');

module.exports = {
  extend: '@apostrophecms/widget-type',
  options: {
    label: 'Buttons',
    icon: 'dots-vertical-icon',
  },
  fields: {
    add: {
      buttonCollection: {
        label: 'Button Collection',
        type: 'array',
        titleField: 'button.linkTitle',
        fields: {
          add: {
            button: {
              label: 'Button',
              ...linkSchema,
            },
            ...buttonConfig,
          },
        },
      },
    },
  },
};
