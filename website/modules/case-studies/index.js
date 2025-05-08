const headingToolbar = require('../../lib/headingToolbar');

module.exports = {
  extend: '@apostrophecms/piece-type',
  options: {
    label: 'Case Study',
    pluralLabel: 'Case Studies',
    sort: {
      updatedAt: -1,
    },
    perPage: 9,
  },
  fields: {
    add: {
      picture: {
        label: 'Image',
        type: 'area',
        required: true,
        options: {
          max: 1,
          min: 1,
          widgets: {
            '@apostrophecms/image': {
              aspectRatio: [1200, 900],
            },
          },
        },
      },
      stack: {
        label: 'Technology Stack',
        type: 'string',
        required: true,
      },
      subtitle: {
        label: 'Subtitle',
        type: 'string',
        required: true,
      },
      _tags: {
        type: 'relationship',
        label: 'Tags',
        withType: 'cases-tags',
        builders: {
          project: {
            title: 1,
            slug: 1,
          },
        },
      },
      content: {
        label: 'Content',
        type: 'area',
        options: {
          widgets: {
            '@apostrophecms/rich-text': {
              ...headingToolbar,
            },
          },
        },
      },
    },
    group: {
      basics: {
        label: 'Basics',
        fields: ['title', 'picture', 'stack', 'subtitle', '_tags'],
      },
      content: {
        label: 'Content',
        fields: ['content'],
      },
    },
  },
  columns: {
    add: {
      stack: {
        label: 'Technology Stack',
      },
    },
  },
  filters: {
    add: {
      _tags: {
        label: 'Tags',
      },
    },
  },
};
