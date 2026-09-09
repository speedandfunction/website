module.exports = {
  extend: '@apostrophecms/widget-type',
  options: {
    label: 'Purpose Cards',
    icon: 'view-column-icon',
    className: 'sf-purpose-cards',
    styles: true,
  },
  fields: {
    add: {
      headingMain: {
        label: 'Heading',
        type: 'string',
        textarea: true,
        help: 'The heading text, e.g. "Purpose-built software for meaningful change"',
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
        help: 'How many cards to display per row on desktop',
      },
      cards: {
        label: 'Cards',
        type: 'array',
        titleField: 'description',
        min: 1,
        fields: {
          add: {
            title: {
              label: 'Title (optional)',
              type: 'string',
              textarea: true,
              help: 'Card title, e.g. "Development"',
            },
            description: {
              label: 'Description',
              type: 'string',
              textarea: true,
              help: 'Card description text',
            },
          },
        },
      },
    },
    group: {
      fields: {
        headingMain: 1,
        cardsPerRow: 1,
        cards: 1,
      },
    },
  },
};
