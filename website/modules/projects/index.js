const extendedToolbar = require('../../lib/extendedToolbar');
// Const additionalMetaData = require("../partials/additionalMetaData");

module.exports = {
  extend: '@apostrophecms/piece-type',
  options: {
    label: 'Project',
    pluralLabel: 'Projects',
    shortcut: 'G,C',
    sort: {
      title: 1,
      updatedAt: -1,
    },
  },
  fields: {
    add: {
      mediaType: {
        label: 'Media Type',
        type: 'radio',
        choices: [
          {
            label: 'Image',
            value: 'image',
          },
          {
            label: 'Video',
            value: 'video',
          },
        ],
        def: 'image',
      },
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
        if: {
          mediaType: 'image',
        },
      },
      _file: {
        label: 'Video file',
        type: 'relationship',
        withType: '@apostrophecms/file',
        max: 1,
        required: true,
        if: {
          mediaType: 'video',
        },
      },
      stack: {
        label: 'Stack',
        type: 'string',
        required: true,
      },
      subtitle: {
        label: 'Subtitle',
        type: 'string',
        required: true,
      },
      content: {
        label: 'Content',
        type: 'area',
        options: {
          max: 1,
          widgets: {
            '@apostrophecms/rich-text': {
              ...extendedToolbar,
            },
          },
        },
      },
    },
    group: {
      basics: {
        label: 'Basics',
        fields: [
          'mediaType',
          'picture',
          '_file',
          'title',
          'stack',
          'subtitle',
          'content',
        ],
      },
    },
  },
};
