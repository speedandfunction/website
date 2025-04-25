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
      alignment: {
        label: 'Alignment',
        type: 'radio',
        choices: [
          {
            label: 'Left⬅️',
            value: 'left',
          },
          {
            label: 'Center↕️',
            value: 'center',
          },
          {
            label: 'Right➡️',
            value: 'right',
          },
        ],
        def: 'center',
      },
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
