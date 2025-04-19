import headingToolbar from '../../../lib/headingToolbar.js';

export default {
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
                ...headingToolbar
              }
            }
          }
        }
      }
    }
  }
};
