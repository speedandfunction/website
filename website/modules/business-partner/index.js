module.exports = {
  extend: '@apostrophecms/piece-type',
  options: {
    label: 'Business Partner',
    pluralLabel: 'Business Partners',
    slugPrefix: 'business-partner-',
    sort: {
      title: 1,
    },
    shortcut: false,
  },
  fields: {
    add: {
      title: {
        label: 'Partner Name',
        type: 'string',
        required: true,
      },
      partnerLogo: {
        label: 'Partner Logo',
        type: 'area',
        required: true,
        options: {
          max: 1,
          min: 1,
          widgets: {
            '@apostrophecms/image': {},
          },
        },
      },
      partnerWebsite: {
        label: 'Partner Website',
        type: 'string',
        required: true,
        help: "Link to partner's official website (must include http(s) protocol).",
        placeholder: 'https://example.com',
      },
    },
    group: {
      basics: {
        label: 'Basics',
        fields: ['title', 'partnerLogo', 'partnerWebsite'],
      },
    },
  },
};

