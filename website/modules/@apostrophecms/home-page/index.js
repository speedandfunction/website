import mainWidgets from '../../../lib/mainWidgets.js';

export default {
  options: {
    label: 'Home Page'
  },
  fields: {
    add: {
      header: {
        type: 'area',
        options: {
          max: 1,
          widgets: {
            'home-hero': {}
          }
        }
      },
      main: {
        type: 'area',
        options: mainWidgets
      }
    },
    group: {
      hero: {
        label: 'Hero',
        fields: [
          'title',
          'header'
        ]
      },
      mainArea: {
        label: 'Main page content',
        fields: [ 'main' ]
      }
    }
  }
};
