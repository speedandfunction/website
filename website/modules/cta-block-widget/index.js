const linkSchema = require('../../lib/linkSchema');

module.exports = {
  extend: '@apostrophecms/widget-type',
  options: {
    label: 'CTA Block',
    icon: 'dots-vertical-icon',
    className: 'sf-cta-block',
    styles: true,
  },
  fields: {
    add: {
      heading: {
        label: 'Heading',
        type: 'string',
        textarea: true,
        help: 'Section heading, e.g. "See how we build for change"',
      },
      buttonCollection: {
        label: 'Create Button(s)',
        type: 'array',
        titleField: 'button.linkTitle',
        help: 'Add one or more buttons. They will be shown one after another.',
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
