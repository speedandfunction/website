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
      title: {
        label: 'Client Name',
        type: 'string',
        required: true,
      },
      clientWebsite: {
        label: 'Client Website',
        type: 'string',
        help: "Link to client's official website",
        placeholder: 'https://example.com',
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
      },
      stack: {
        label: 'Tech Stack',
        type: 'string',
        help: 'Comma separated tags indicating the technologies utilized in the project.',
        required: true,
      },
      portfolioTitle: {
        label: 'Portfolio Title',
        type: 'string',
        required: true,
      },
      prodLink: {
        label: 'Link to Prod',
        type: 'string',
        help: 'Public link referring to the delivered result',
        placeholder: 'https://example.com/project',
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
          'clientWebsite',
          'picture',
          'stack',
          'portfolioTitle',
          'prodLink',
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
      stack: {
        label: 'Tech Stack',
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
