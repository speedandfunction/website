const mainWidgets = require('../../lib/mainWidgets');

module.exports = {
  extend: '@apostrophecms/page-type',
  options: {
    label: 'Meet the Team Page',
  },
  fields: {
    add: {
      main: {
        type: 'area',
        options: mainWidgets,
      },
    },
    remove: ['orphan'],
    group: {
      mainArea: {
        label: 'Main page content',
        fields: ['title', 'main'],
      },
    },
  },
};
