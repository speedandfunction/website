module.exports = {
  extend: '@apostrophecms/page-type',
  options: {
    label: 'Default Page'
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
      }
    },
    group: {
      basics: {
        label: 'Basics',
        fields: ['title', 'main']
      }
    }
  }
}; 