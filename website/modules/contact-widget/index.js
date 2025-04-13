module.exports = {
  extend: '@apostrophecms/widget-type',
  options: {
    label: 'Form Widget',
    icon: 'form-icon'
  },
  fields: {
    add: {
      form: {
        label: 'Form',
        type: 'area',
        options: {
          widgets: {
            '@apostrophecms/form': {}
          }
        }
      }
    }
  }
};
