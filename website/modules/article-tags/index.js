module.exports = {
  extend: '@apostrophecms/piece-type',
  options: {
    label: 'Article Tag',
    pluralLabel: 'Article Tags',
    slugPrefix: 'article-tag-',
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
