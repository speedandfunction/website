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
      rows: {
        label: 'Rows',
        type: 'array',
        titleField: 'title',
        inline: true,
        table: true,
        help: 'Numbered rows with a title (left) and description (right), separated by divider lines.',
        fields: {
          add: {
            title: {
              label: 'Title',
              type: 'string',
              textarea: true,
              help: 'Row title, e.g. "Outsourcing"',
            },
            description: {
              label: 'Description',
              type: 'string',
              textarea: true,
              help: 'Row description text',
            },
          },
        },
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
        rows: 1,
        buttonCollection: 1,
      },
    },
  },
};
