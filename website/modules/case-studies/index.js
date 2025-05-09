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
        help: "Link to client's official website.",
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
      descriptor: {
        label: 'Descriptor',
        type: 'string',
        help: "A brief summary highlighting the project's value, outcomes, and the impact achieved.",
        textarea: true,
      },
      prodLink: {
        label: 'Link to Prod',
        type: 'string',
        help: 'Public link referring to the delivered result.',
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
      objective: {
        label: 'Objective',
        type: 'string',
        help: 'A brief summary of the specific goals the project aimed to accomplish.',
        textarea: true,
      },
      challenge: {
        label: 'Challenge',
        type: 'string',
        help: 'A concise summary of the key business or technical issues the client faced.',
        textarea: true,
      },
      solution: {
        label: 'Solution',
        type: 'string',
        help: 'A short explanation of the proposed solution to address the challenges.',
        textarea: true,
      },
      results: {
        label: 'Results',
        type: 'string',
        help: '2-4 bullet points summarizing quantifiable improvements in performance, efficiency, cost savings, or business outcomes achieved.',
        textarea: true,
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
          'descriptor',
          'prodLink',
          '_tags',
        ],
      },
      details: {
        label: 'Case Study Details',
        fields: ['objective', 'challenge', 'solution', 'results'],
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
      _tags: {
        label: 'Tags',
        component: 'AposCellTags',
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
