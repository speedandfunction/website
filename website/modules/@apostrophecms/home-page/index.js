const mainWidgets = require('../../../lib/mainWidgets');

module.exports = {
  options: {
    label: 'Home Page',
  },
  fields: {
    add: {
      header: {
        type: 'area',
        options: {
          max: 1,
          widgets: {
            'home-hero': {},
          },
        },
      },
      main: {
        type: 'area',
        options: mainWidgets,
      },
    },
    remove: ['orphan'],
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
