module.exports = {
  extend: '@apostrophecms/piece-type',
  options: {
    label: 'Category',
    pluralLabel: 'Categories',
  },
  fields: {
    add: {
      description: {
        type: 'string',
        label: 'Description',
      },
      categoryType: {
        type: 'select',
        label: 'Category Type',
        required: true,
        choices: [
          {
            label: 'Technology',
            value: 'Technology',
          },
          {
            label: 'Case Study Type',
            value: 'Case Study Type',
          },
          {
            label: 'Industry',
            value: 'Industry',
          },
        ],
      },
    },
    group: {
      basics: {
        label: 'Basics',
        fields: ['title', 'description', 'categoryType'],
      },
    },
  },
  columns: {
    add: {
      categoryType: {
        label: 'Category Type',
      },
    },
  },
  filters: {
    add: {
      categoryType: {
        label: 'Category Type',
      },
    },
  },
};
