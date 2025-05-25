module.exports = {
  extend: '@apostrophecms/widget-type',
  options: {
    label: 'Page Intro Widget',
  },
  fields: {
    add: {
      title: {
        label: 'Title',
        type: 'string',
        help: 'Main heading for the page intro section',
        required: true,
        max: 100,
      },
      subtitle: {
        label: 'Subtitle',
        type: 'string',
        help: 'Subtitle text that appears below the title',
      },
      descriptions: {
        label: 'Description Texts',
        type: 'array',
        titleField: 'description',
        help: 'Add one or more description blocks',
        fields: {
          add: {
            description: {
              label: 'Description',
              type: 'string',
              textarea: true,
              max: 500,
            },
          },
        },
      },
    },
  },
};
