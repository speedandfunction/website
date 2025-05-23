module.exports = {
  extend: '@apostrophecms/widget-type',
  options: {
    label: 'Vacancies List',
    icon: 'flare-icon',
  },
  fields: {
    add: {
      intro: {
        label: 'Intro',
        type: 'area',
        options: {
          max: 1,
          widgets: {
            '@apostrophecms/rich-text': {},
          },
        },
      },
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
    },
  },
};
