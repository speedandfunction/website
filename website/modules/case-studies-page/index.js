const mainWidgets = require('../../lib/mainWidgets');

module.exports = {
  extend: '@apostrophecms/piece-page-type',
  options: {
    label: 'Case Studies Page',
    pluralLabel: 'Case Studies Pages',
    perPage: 6,
    piecesFilters: [{ name: 'tags' }],
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
