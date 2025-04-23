module.exports = {
  extend: '@apostrophecms/widget-type',
  options: {
    label: 'Default Hero',
    icon: 'image-icon',
  },
  fields: {
    add: {
      title: {
        type: 'string',
        label: 'Title',
        required: true,
      },
      subtitle: {
        type: 'string',
        label: 'Subtitle',
      },
      backgroundImage: {
        type: 'area',
        options: {
          max: 1,
          widgets: {
            '@apostrophecms/image': {},
          },
        },
      },
    },
  },
};
