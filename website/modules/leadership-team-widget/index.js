const headingToolbar = require('../../lib/headingToolbar');

module.exports = {
  extend: '@apostrophecms/widget-type',
  options: {
    label: 'Leadership Team Widget',
    previewImage: 'png',
    icon: 'flare-icon',
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
              ...headingToolbar,
            },
          },
        },
      },
      _teamLeaders: {
        label: 'Team Leaders',
        help: 'Select and order the Team Leaders',
        required: true,
        type: 'relationship',
        withType: 'team-members',
        builders: {
          project: {
            title: 1,
            position: 1,
            headshot: 1,
            order: 1,
            experience: 1,
            linkedin: 1,
            bio: 1,
          },
        },
      },
    },
  },
};
