module.exports = {
  extend: '@apostrophecms/piece-type',
  options: {
    label: 'Category',
    pluralLabel: 'Categories',
    shortcut: false,
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
