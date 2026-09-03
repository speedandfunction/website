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
      cards: {
        label: 'Cards',
        type: 'array',
        titleField: 'description',
        min: 1,
        fields: {
          add: {
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
        cards: 1,
      },
    },
  },
};
