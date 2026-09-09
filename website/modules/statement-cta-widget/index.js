const linkSchema = require('../../lib/linkSchema');

module.exports = {
  extend: '@apostrophecms/widget-type',
  options: {
    label: 'Statement + CTA',
    icon: 'dots-vertical-icon',
    className: 'sf-statement-cta',
    styles: true,
  },
  fields: {
    add: {
      heading: {
        label: 'Statement',
        type: 'string',
        textarea: true,
        help: 'Large statement text, e.g. "With 900+ launches and a 95% retention rate..."',
      },
      buttonCollection: {
        label: 'Buttons',
        type: 'array',
        titleField: 'button.linkTitle',
        help: 'Add one or more buttons. They will be shown side by side.',
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
    group: {
      fields: {
        heading: 1,
        buttonCollection: 1,
      },
    },
  },
};
