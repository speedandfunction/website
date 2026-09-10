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
      sideInfo: {
        label: 'Side info',
        type: 'string',
        textarea: true,
        help: 'Optional paragraph shown to the right of the statement on desktop (below it on mobile).',
      },
      rows: {
        label: 'Rows',
        type: 'array',
        titleField: 'title',
        inline: true,
        table: true,
        help: 'Numbered rows with a title (left) and description (right), separated by divider lines. Can also be rendered as cards using the Display Mode option below.',
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
      rowsDisplay: {
        label: 'Rows display mode',
        type: 'select',
        choices: [
          { label: 'Rows', value: 'rows' },
          { label: 'Cards', value: 'cards' },
        ],
        def: 'rows',
        help: 'Choose whether to render rows as horizontal divider-separated rows or as bordered cards (3 per row on desktop, stacked on mobile).',
      },
      cardsPerRow: {
        label: 'Number of cards in row',
        type: 'select',
        choices: [
          { label: '2', value: '2' },
          { label: '3', value: '3' },
          { label: '4', value: '4' },
        ],
        def: '3',
        if: {
          rowsDisplay: 'cards',
        },
        help: 'How many cards to display per row on desktop (only applies when Rows display mode is "Cards")',
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
        sideInfo: 1,
        rows: 1,
        rowsDisplay: 1,
        cardsPerRow: 1,
        buttonCollection: 1,
      },
    },
  },
};
