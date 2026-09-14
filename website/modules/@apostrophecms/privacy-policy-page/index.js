module.exports = {
  extend: '@apostrophecms/page-type',
  options: {
    label: 'Privacy Policy Page',
  },
  fields: {
    add: {
      main: {
        type: 'area',
        options: {
          widgets: {
            '@apostrophecms/rich-text': {},
          },
        },
      },
    },
    remove: ['orphan'],
    group: {
      mainArea: {
        label: 'Main page content',
        fields: ['main'],
      },
    },
  },
};
