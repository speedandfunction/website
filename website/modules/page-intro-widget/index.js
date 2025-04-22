module.exports = {
  extend: '@apostrophecms/widget-type',
  options: {
    label: 'Page Intro Widget',
  },
  fields: {
    add: {
      label: {
        label: 'Label',
        type: 'string',
        help: 'Short label text that appears above the title',
      },
      title: {
        label: 'Title',
        type: 'string',
        help: 'Main heading for the page intro section',
        required: true,
        max: 100,
      },
      description: {
        label: 'Description Text',
        type: 'string',
        textarea: true,
        help: 'Descriptive text that appears below the title',
        max: 500,
      },
    },
  },
};
