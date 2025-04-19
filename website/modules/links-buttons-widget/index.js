import headingToolbar from '../../lib/headingToolbar.js';
import linkSchema from '../../lib/linkSchema.js';

export default {
  extend: '@apostrophecms/widget-type',
  options: {
    label: 'Links/Buttons Widget',
    previewImage: 'png',
    icon: 'format-list-bulleted-icon'
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
      links: {
        label: 'Links',
        type: 'array',
        titleField: 'link.linkTitle',
        fields: {
          add: {
            link: {
              label: 'Link',
              ...linkSchema
            }
          }
        }
      },
      buttons: {
        label: 'Buttons',
        type: 'array',
        titleField: 'button.linkTitle',
        fields: {
          add: {
            button: {
              label: 'Button',
              ...linkSchema
            }
          }
        }
      }
    }
  }
};
