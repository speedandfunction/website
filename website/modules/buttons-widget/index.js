import linkSchema from '../../lib/linkSchema.js';
import buttonConfig from '../../lib/buttonConfig.js';

export default {
  extend: '@apostrophecms/widget-type',
  options: {
    label: 'Buttons',
    icon: 'dots-vertical-icon'
  },
  fields: {
    add: {
      buttonCollection: {
        label: 'Button Collection',
        type: 'array',
        titleField: 'button.linkTitle',
        fields: {
          add: {
            button: {
              label: 'Button',
              ...linkSchema
            },
            ...buttonConfig
          }
        }
      }
    }
  }
};
