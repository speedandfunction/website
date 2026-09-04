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
      heading: {
        label: 'Heading',
        type: 'string',
        textarea: true,
        help: 'Enter the heading text. Use line breaks to separate lines: line 1 appears as a pre-heading, remaining lines form the main heading.',
      },
      ctaText: {
        label: 'CTA Text',
        type: 'string',
        help: 'Call-to-action button text (desktop)',
      },
      ctaTextMobile: {
        label: 'CTA Text (Mobile)',
        type: 'string',
        help: 'Call-to-action button text shown on mobile only',
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
        heading: 1,
        ctaText: 1,
        ctaTextMobile: 1,
        ctaLink: 1,
        bodyText: 1,
      },
    },
  },
};
