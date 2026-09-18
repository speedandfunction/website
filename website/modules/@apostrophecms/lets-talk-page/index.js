const mainWidgets = require('../../../lib/mainWidgets');

const letsTalkWidgets = {
  ...mainWidgets,
  groups: {
    ...mainWidgets.groups,
    layout: {
      ...mainWidgets.groups.layout,
      widgets: {
        ...mainWidgets.groups.layout.widgets,
        '@apostrophecms/form': {},
      },
    },
  },
};

module.exports = {
  extend: '@apostrophecms/page-type',
  options: {
    label: 'Let\'s Talk Page',
  },
  fields: {
    add: {
      header: {
        type: 'area',
        options: {
          max: 1,
          widgets: {
            'sf-hero': {},
          },
        },
      },
      main: {
        type: 'area',
        options: letsTalkWidgets,
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
