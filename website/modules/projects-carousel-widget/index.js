import headingToolbar from '../../lib/headingToolbar.js';

export default {
  extend: '@apostrophecms/widget-type',
  options: {
    label: 'Projects Carousel',
    icon: 'binoculars-icon'
  },
  fields: {
    add: {
      intro: {
        label: 'Intro',
        type: 'area',
        options: {
          max: 1,
          widgets: {
            '@apostrophecms/rich-text': {
              ...headingToolbar
            }
          }
        }
      },
      _selectedProjects: {
        label: 'Selected projects',
        type: 'relationship',
        withType: 'projects',
        withRelationships: [ '_file' ],
        // Max: 3,
        builders: {
          project: {
            title: 1,
            picture: 1,
            mediaType: 1,
            stack: 1,
            subtitle: 1,
            _file: 1,
            content: 1
          }
        }
      }
    }
  }
};
