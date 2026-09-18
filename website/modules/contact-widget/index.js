module.exports = {
  extend: '@apostrophecms/widget-type',
  options: {
    label: 'Form Widget',
    icon: 'form-icon',
  },
  fields: {
    add: {
      heading: {
        label: 'Heading',
        type: 'string',
        help: 'Optional heading displayed above the form, e.g. "Let\'s talk".',
      },
      form: {
        label: 'Form',
        type: 'area',
        options: {
          widgets: {
            '@apostrophecms/form': {},
          },
        },
      },
    },
  },
};
