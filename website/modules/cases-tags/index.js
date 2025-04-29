module.exports = {
  extend: '@apostrophecms/piece-type',
  options: {
    label: 'Case Study Tag',
    pluralLabel: 'Case Studies Tags',
    slugPrefix: 'cases-tag-',
    shortcut: 'G,M',
  },
  fields: {
    add: {
      description: {
        type: 'string',
        label: 'Description',
      },
    },
    group: {
      basics: {
        label: 'Basics',
        fields: ['title', 'description'],
      },
    },
  },
};
