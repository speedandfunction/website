const linkSchema = require('../../lib/linkSchema');
const buttonConfig = require('../../lib/buttonConfig');
const buttonAlignment = require('../../lib/buttonAlignment');

module.exports = {
  extend: '@apostrophecms/widget-type',
  options: {
    label: 'Buttons',
    icon: 'dots-vertical-icon',
  },
  fields: {
    add: {
      buttonCollection: {
        label: 'Create Button(s)',
        type: 'array',
        titleField: 'button.linkTitle',
        max: 2,
        help: 'You can create one or two buttons. If you create two, both will be shown side by side.',
        fields: {
          add: {
            button: {
              label: 'Button',
              ...linkSchema,
            },
            ...buttonConfig,
            ...buttonAlignment,
          },
        },
      },
    },
  },
};
