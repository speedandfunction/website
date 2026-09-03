module.exports = {
  extend: '@apostrophecms/widget-type',
  options: {
    label: 'S&F Hero',
    icon: 'dots-vertical-icon',
    className: 'sf-hero-section',
    styles: true,
    scripts: [
      {
        name: 'sf-hero-animations',
        source: 'ui/src/index.js',
      },
    ],
  },
  fields: {
    add: {
      headingPre: {
        label: 'Heading (first line)',
        type: 'string',
        help: 'The first line of the heading, e.g. "You don\'t need more code."',
      },
      headingMain: {
        label: 'Heading (main line)',
        type: 'string',
        help: 'The main line of the heading, e.g. "You need software that can handle complexity —"',
      },
      headingAccent: {
        label: 'Heading (accent / gradient)',
        type: 'string',
        help: 'The gradient-coloured part of the heading, e.g. "in the tech and in the team"',
      },
      ctaText: {
        label: 'CTA Text',
        type: 'string',
        help: 'Call-to-action button text',
      },
      ctaLink: {
        label: 'CTA Link',
        type: 'string',
        help: 'URL for the CTA button, e.g. /cases',
      },
      bodyText: {
        label: 'Body Text',
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
        headingPre: 1,
        headingMain: 1,
        headingAccent: 1,
        ctaText: 1,
        ctaLink: 1,
        bodyText: 1,
      },
    },
  },
};
