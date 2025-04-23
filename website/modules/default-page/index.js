const mainWidgets = require('../../lib/mainWidgets');

module.exports = {
  extend: '@apostrophecms/page-type',
  options: {
    label: 'Default Page',
  },
  fields: {
    add: {
      header: {
        type: 'area',
        options: {
          max: 1,
          widgets: {
            'default-hero': {},
          },
        },
      },
      main: {
        type: 'area',
        options: mainWidgets,
      },
    },
    group: {
      hero: {
        label: 'Hero',
        fields: ['title', 'header'],
      },
      mainArea: {
        label: 'Main page content',
        fields: ['main'],
      },
    },
  },
};
