const mainWidgets = require('../../lib/mainWidgets');

module.exports = {
  extend: '@apostrophecms/page-type',
  options: {
    label: 'Default Page',
  },
  fields: {
    add: {
      main: {
        type: 'area',
        options: mainWidgets,
      },
    },
    group: {
      mainArea: {
        label: 'Main page content',
        fields: ['main'],
      },
    },
  },
};
