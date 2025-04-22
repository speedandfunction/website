const linkSchema = require('../../../lib/linkSchema');

module.exports = {
  options: {
    deferWidgetLoading: true,
  },
  fields: {
    add: {
      primaryNav: {
        label: 'Primary site navigation',
        type: 'array',
        titleField: 'menuItem.linkTitle',
        fields: {
          add: {
            menuItem: {
              label: 'Menu Item',
              ...linkSchema,
            },
            //  Sublinks: {} for future second level of menu
          },
        },
      },
      comAddress: {
        label: 'Company Address',
        type: 'area',
        options: {
          max: 1,
          widgets: {
            '@apostrophecms/rich-text': {
              styles: [
                {
                  tag: 'p',
                  label: 'Text',
                },
                {
                  tag: 'h2',
                  label: 'Heading',
                  class: 'sf-head',
                },
              ],
            },
          },
        },
      },
      footerLinks: {
        label: 'Footer Links',
        type: 'array',
        titleField: 'footerLink.linkTitle',
        fields: {
          add: {
            footerLink: {
              label: 'Link',
              ...linkSchema,
            },
          },
        },
      },
      socialMediaLinks: {
        label: 'Social Media Links',
        type: 'array',
        titleField: 'SMLink.linkTitle',
        fields: {
          add: {
            SMLink: {
              label: 'Social Media Link',
              ...linkSchema,
            },
          },
        },
      },
      footerForm: {
        label: 'Footer Form',
        type: 'area',
        options: {
          max: 1,
          widgets: {
            '@apostrophecms/form': {},
          },
        },
      },
    },
    group: {
      navs: {
        label: 'Header',
        fields: ['primaryNav'],
      },
      footer: {
        label: 'Footer',
        fields: ['comAddress', 'footerLinks', 'socialMediaLinks', 'footerForm'],
      },
    },
  },
};
