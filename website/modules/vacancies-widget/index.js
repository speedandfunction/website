module.exports = {
  extend: '@apostrophecms/widget-type',
  options: {
    label: 'Vacancies',
    icon: 'flare-icon',
    className: 'sf-vacancies-widget',
  },
  fields: {
    add: {
      _vacancies: {
        label: 'Vacancies',
        help: 'Select and order the Vacancies',
        required: false,
        type: 'relationship',
        withType: 'vacancies',
        builders: {
          project: {
            title: 1,
            description: 1,
            link: 1,
          },
        },
      },
      listTitle: {
        label: 'Title',
        type: 'string',
        textarea: true,
        required: false,
      },
      emptyTitle: {
        label: 'Empty state title',
        type: 'string',
        textarea: true,
        required: false,
      },
    },
    group: {
      vacancies: {
        label: 'Vacancies',
        fields: ['_vacancies', 'listTitle'],
      },
      empty: {
        label: 'Empty state',
        fields: ['emptyTitle'],
      },
    },
  },
};
