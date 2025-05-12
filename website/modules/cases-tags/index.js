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
      _category: {
        type: 'relationship',
        label: 'Category',
        withType: 'categories',
        required: true,
        max: 1,
        builders: {
          project: {
            title: 1,
            slug: 1,
          },
        },
        help: 'Choose a category for this tag',
      },
    },
    group: {
      basics: {
        label: 'Basics',
        fields: ['title', 'description', '_category'],
      },
    },
  },
  columns: {
    add: {
      _category: {
        label: 'Category',
        type: 'string',
        name: '_category.0.title',
      },
    },
  },
};
