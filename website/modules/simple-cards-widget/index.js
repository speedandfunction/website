import extendedToolbar from'../../lib/extendedToolbar.js';
import headingToolbar from'../../lib/headingToolbar.js';

export default {
  extend: '@apostrophecms/widget-type',
  options: {
    label: 'Simple Cards',
    icon: 'view-column-icon'
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
      },
      cards: {
        label: 'Cards',
        type: 'array',
        titleField: 'cardTitle',
        min: 1,
        fields: {
          add: {
            cardTitle: {
              label: 'Title',
              type: 'string'
            },
            cardContent: {
              label: 'Content',
              type: 'area',
              options: {
                max: 1,
                widgets: {
                  '@apostrophecms/rich-text': {
                    className: 'sf-simple-card__text',
                    ...extendedToolbar
                  }
                }
              }
            }
          }
        }
      }
    }
  }
};
