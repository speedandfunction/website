module.exports = {
  extend: '@apostrophecms/piece-type',
  options: {
    label: 'Landing Page',
    pluralLabel: 'Landing Pages',
    alias: 'landingPages'
  },
  fields: {
    add: {
      title: {
        type: 'string',
        label: 'Title',
        required: true
      },
      slug: {
        type: 'slug',
        label: 'Slug',
        help: 'Relative path for this landing page',
        required: true,
        following: 'title'
      },
      externalUrl: {
        type: 'url',
        label: 'External URL',
        help: 'Full external URL for this landing page',
        required: false
      }
    },
    group: {
      basics: {
        label: 'Basics',
        fields: ['title', 'slug', 'externalUrl']
      }
    }
  }
};
