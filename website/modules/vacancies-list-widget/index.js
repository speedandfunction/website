module.exports = {
  extend: '@apostrophecms/widget-type',
  options: {
    label: 'Vacancies List',
    icon: 'flare-icon',
  },
  fields: {
    add: {
      _vacancies: {
        label: 'Vacancies',
        help: 'Select and order the Vacancies',
        required: true,
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
        required: true,
      },
      listSubtitle: {
        label: 'Subtitle',
        type: 'string',
        textarea: true,
        required: false,
      },
      emptyTitle: {
        label: 'Title',
        type: 'string',
        required: true,
      },
      emptySubtitle: {
        label: 'Subtitle',
        type: 'string',
        textarea: true,
        required: false,
      },
    },
    group: {
      vacanciesTexts: {
        label: 'Texts when vacancies EXIST',
        fields: ['_vacancies', 'listTitle', 'listSubtitle'],
      },
      emptyTexts: {
        label: 'Texts when NO vacancies',
        fields: ['emptyTitle', 'emptySubtitle'],
      },
    },
  },
};
