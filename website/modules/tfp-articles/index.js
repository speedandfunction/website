module.exports = {
  extend: '@apostrophecms/piece-type',
  options: {
    label: 'Article',
    pluralLabel: 'Articles',
    sort: {
      articleDate: -1,
      updatedAt: -1,
    },
    perPage: 9,
  },
  fields: {
    add: {
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
        withType: 'article-tags',
        builders: {
          project: {
            title: 1,
            slug: 1,
          },
        },
      },
    },
    group: {
      basics: {
        label: 'Basics',
        fields: ['title', 'articleDate', 'authorInfo', '_tags'],
      },
      content: {
        label: 'Content',
        fields: ['heroImage', 'summary', 'heroBanner', 'internalContent'],
      },
    },
  },
  columns: {
    add: {
      articleDate: {
        label: 'Article Date',
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
