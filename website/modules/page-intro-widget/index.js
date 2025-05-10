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
        help: 'Subtile text that appears below the title',
      },
      description: {
        label: 'Description Text',
        type: 'string',
        textarea: true,
        help: 'Descriptive text that appears below the title and the subtitle',
        max: 500,
      },
    },
  },
};
