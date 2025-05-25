module.exports = {
  extend: '@apostrophecms/piece-type',
  options: {
    label: 'Vacancy',
    pluralLabel: 'Vacancies',
    sort: {
      title: 1,
      updatedAt: -1,
    },
    titleField: 'title',
  },
  fields: {
    add: {
      title: {
        label: 'Position',
        type: 'string',
        required: true,
        max: 100,
      },
      description: {
        label: 'Description',
        type: 'string',
        textarea: true,
        required: true,
        help: 'Description of the vacancy',
        max: 500,
      },
      link: {
        label: 'Link',
        type: 'string',
        required: true,
        help: 'Application link for the position (must include http(s) protocol)',
        placeholder: 'https://example.com/vacancy',
      },
    },
    group: {
      basics: {
        label: 'Basics',
        fields: ['title', 'description', 'link'],
      },
    },
  },
  columns: {
    add: {
      title: {
        label: 'Position',
        name: 'title',
      },
      link: {
        label: 'Link',
        name: 'link',
      },
    },
  },
};
