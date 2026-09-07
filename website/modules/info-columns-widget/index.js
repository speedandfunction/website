module.exports = {
  extend: '@apostrophecms/widget-type',
  options: {
    label: 'Info Columns',
    icon: 'doc-icon',
    className: 'sf-info-columns',
    styles: true,
  },
  fields: {
    add: {
      heading: {
        label: 'Heading',
        type: 'string',
        textarea: true,
        help: 'The heading text, e.g. "17+ years of building more than software"',
      },
      leftColumn: {
        label: 'Left Column',
        type: 'area',
        options: {
          widgets: {
            '@apostrophecms/rich-text': {
              toolbar: ['styles'],
              styles: [
                {
                  tag: 'p',
                  label: 'Paragraph',
                },
                {
                  tag: 'strong',
                  label: 'Bold',
                },
              ],
            },
          },
        },
      },
      rightColumn: {
        label: 'Right Column',
        type: 'area',
        options: {
          widgets: {
            '@apostrophecms/rich-text': {
              toolbar: ['styles'],
              styles: [
                {
                  tag: 'p',
                  label: 'Paragraph',
                },
                {
                  tag: 'strong',
                  label: 'Bold',
                },
              ],
            },
          },
        },
      },
    },
    group: {
      fields: {
        heading: 1,
        leftColumn: 1,
        rightColumn: 1,
      },
    },
  },
};
