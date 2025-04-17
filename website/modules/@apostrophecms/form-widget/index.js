const headingToolbar = require('../../../lib/headingToolbar');

module.exports = {
  options: {
    fields: {
      add: {
        intro: {
          label: 'Intro',
          type: 'area',
          options: {
            max: 1,
            widgets: {
              '@apostrophecms/rich-text': {
                ...headingToolbar,
              },
            },
          },
        },
      },
    },
  },
};
