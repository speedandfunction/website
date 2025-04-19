import headingToolbar from '../../lib/headingToolbar.js';

export default {
  extend: '@apostrophecms/widget-type',
  options: {
    label: 'Leadership team Carousel',
    icon: 'binoculars-icon'
  },
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
