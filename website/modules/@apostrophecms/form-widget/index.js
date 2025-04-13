const headingToolbar = require('../../../lib/headingToolbar');

module.exports = {
  fields: {
    add: {
      intro: {
        label: 'Intro',
        type: 'area',
        options: {
          max: 1,
          widgets: {
            '@apostrophecms/rich-text': {
              ...headingToolbar
            }
          }
        }
      }
    }
  }
};
