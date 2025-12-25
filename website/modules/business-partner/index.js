module.exports = {
  extend: '@apostrophecms/piece-type',
  options: {
    label: 'Business Partner',
    pluralLabel: 'Business Partners',
    slugPrefix: 'business-partner-',
    sort: {
      createdAt: -1,
    },
    shortcut: false,
  },
  fields: {
    add: {
      partnerLogoMobile: {
        label: 'Partner Logo (Mobile)',
        type: 'area',
        required: true,
        options: {
          max: 1,
          min: 1,
          widgets: {
            '@apostrophecms/image': {},
          },
        },
        help: 'Upload 66px × 66px logo for mobile/default view',
      },
      partnerLogoDesktop: {
        label: 'Partner Logo (Desktop)',
        type: 'area',
        required: true,
        options: {
          max: 1,
          min: 1,
          widgets: {
            '@apostrophecms/image': {},
          },
        },
        help: 'Upload 146px × 146px logo for desktop (≥ medium breakpoint)',
      },
      partnerWebsite: {
        label: 'Partner Website',
        type: 'url',
        required: true,
        help: "Link to partner's official website (must include http(s) protocol).",
        placeholder: 'https://example.com',
      },
    },
    group: {
      basics: {
        label: 'Basics',
        fields: ['partnerLogoMobile', 'partnerLogoDesktop', 'partnerWebsite'],
      },
    },
  },
};
