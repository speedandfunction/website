const linkSchema = require('../../../lib/linkSchema');
const headingToolbar = require('../../../lib/headingToolbar');

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
              type: 'object',
              fields: {
                add: {
                  linkTitle: {
                    type: 'string',
                    label: 'Link Title',
                    required: true,
                  },
                  linkType: {
                    type: 'select',
                    label: 'Link Type',
                    required: true,
                    choices: [
                      {
                        label: 'Page',
                        value: 'page',
                      },
                      {
                        label: 'Custom URL',
                        value: 'custom',
                      },
                    ],
                  },
                  customUrl: {
                    type: 'string',
                    label: 'Custom URL',
                    required: true,
                    if: {
                      linkType: 'custom',
                    },
                  },
                  _page: {
                    type: 'relationship',
                    label: 'Page',
                    withType: '@apostrophecms/page',
                    max: 1,
                    required: true,
                    if: {
                      linkType: 'page',
                    },
                  },
                  target: {
                    type: 'checkboxes',
                    label: 'Open in new window',
                    choices: [
                      {
                        label: 'Yes',
                        value: '_blank',
                      },
                    ],
                  },
                },
              },
            },
          },
        },
      },
      companyMission: {
        label: 'Company Mission',
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

      // SEO fields
      seoGoogleTagManager: {
        label: 'Google Tag Manager ID',
        type: 'string',
        help: 'Enter your GTM container ID (e.g., GTM-XXXXXXX)',
      },
    },
    group: {
      navs: {
        label: 'Header',
        fields: ['primaryNav'],
      },
      footer: {
        label: 'Footer',
        fields: ['companyMission', 'footerLinks', 'socialMediaLinks'],
      },
      seo: {
        label: 'SEO & Analytics',
        fields: ['seoGoogleTagManager'],
      },
    },
  },
};
