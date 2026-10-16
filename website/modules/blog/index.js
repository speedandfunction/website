const headingToolbar = require('../../lib/headingToolbar');

module.exports = {
  extend: '@apostrophecms/piece-type',
  options: {
    label: 'Blog Post',
    pluralLabel: 'Blog Posts',
    sort: {
      createdAt: -1,
    },
    perPage: 12,
    titleField: 'title',
  },
  fields: {
    add: {
      title: {
        label: 'Title',
        type: 'string',
        required: true,
        max: 150,
      },
      excerpt: {
        label: 'Excerpt',
        type: 'string',
        textarea: true,
        max: 300,
      },
      picture: {
        label: 'Image',
        type: 'area',
        options: {
          max: 1,
          min: 1,
          widgets: {
            '@apostrophecms/image': {
              aspectRatio: [31, 10],
            },
          },
        },
      },
      _authors: {
        label: 'Authors',
        type: 'relationship',
        withType: 'team-members',
        builders: {
          project: {
            title: 1,
            headshot: 1,
          },
        },
      },
      notes: {
        label: 'In this note, we\'ll cover',
        type: 'array',
        inline: true,
        style: 'table',
        fields: {
          add: {
            text: {
              label: 'Item',
              type: 'string',
            },
          },
        },
      },
      body: {
        label: 'Body',
        type: 'area',
        options: {
          widgets: {
            '@apostrophecms/rich-text': {
              ...headingToolbar,
            },
            '@apostrophecms/image': {},
            '@apostrophecms/video': {},
          },
        },
      },
    },
    group: {
      basics: {
        label: 'Basics',
        fields: ['title', 'excerpt', 'picture', '_authors', 'notes'],
      },
      content: {
        label: 'Content',
        fields: ['body'],
      },
    },
  },
  columns: {
    add: {
      title: {
        label: 'Title',
        name: 'title',
      },
    },
  },
};
