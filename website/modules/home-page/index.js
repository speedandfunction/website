module.exports = {
  extend: '@apostrophecms/page-type',
  options: {
    label: 'Home Page'
  },
  fields: {
    add: {
      main: {
        type: 'area',
        label: 'Main Content',
        options: {
          widgets: {
            '@apostrophecms/rich-text': {
              toolbar: [ 'styles', 'bold', 'italic', 'link', 'unlink' ]
            },
            '@apostrophecms/image': {}
          }
        }
      },
      hero: {
        type: 'area',
        label: 'Hero Section',
        options: {
          widgets: {
            '@apostrophecms/rich-text': {},
            '@apostrophecms/image': {}
          }
        }
      }
    },
    group: {
      basics: {
        label: 'Basics',
        fields: ['title', 'main']
      },
      hero: {
        label: 'Hero',
        fields: ['hero']
      }
    }
  }
}; 