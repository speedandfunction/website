module.exports = {
  extend: '@apostrophecms/piece-type',
  options: {
    label: 'Case Study',
    pluralLabel: 'Case Studies',
    sort: {
      articleDate: -1,
      updatedAt: -1,
    },
    perPage: 9,
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
        label: 'Technology Stack',
        type: 'string',
        required: true,
      },
      subtitle: {
        label: 'Subtitle',
        type: 'string',
        required: true,
      },
      articleDate: {
        label: 'Date',
        type: 'date',
        required: false,
      },
      authorInfo: {
        label: 'Author',
        type: 'object',
        fields: {
          add: {
            authorName: {
              type: 'string',
              label: 'Name',
              help: 'Names are intentionally kept untranslatable on pages to avoid potential inaccuracies in translations and prevent issues that may arise from incorrect rendering of personal or specific names.',
            },
            authorPosition: {
              type: 'string',
              help: 'Will be rendered only if Name is not empty',
              label: 'Position',
            },
          },
        },
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
            '@apostrophecms/rich-text': {},
          },
        },
      },
    },
    group: {
      basics: {
        label: 'Basics',
        fields: [
          'title',
          'mediaType',
          'picture',
          '_file',
          'stack',
          'subtitle',
          'articleDate',
          'authorInfo',
          '_tags',
        ],
      },
      content: {
        label: 'Content',
        fields: ['content'],
      },
    },
  },
  columns: {
    add: {
      articleDate: {
        label: 'Case Study Date',
      },
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
