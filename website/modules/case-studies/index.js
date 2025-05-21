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
    alias: 'caseStudy',
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
      caseStudyType: {
        label: 'Case Study Type',
        type: 'string',
        help: 'The nature of the project identifying the projectʼs scope and requirements, relationship, or key characteristics (e.g., Mobile Development, Product Enhancement, ML/AI).',
        required: true,
      },
      industry: {
        label: 'Industry',
        type: 'string',
        help: "Comma seperated tags representing the client's industry or sector (e.g. Financial Services, Healthcare, Retail & E-commerce).",
        required: true,
      },
      portfolioTitle: {
        label: 'Portfolio Title',
        type: 'string',
        help: 'The official product name or a concise, descriptive project name if confidentiality is necessary',
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
            _category: 1,
          },
        },
        withRelationships: ['_category'],
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
            '@apostrophecms/rich-text': {
              ...headingToolbar,
            },
          },
        },
      },
      testimonials: {
        label: 'Testimonials',
        type: 'area',
        options: {
          widgets: {
            'testimonials-carousel': {},
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
          'caseStudyType',
          'industry',
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
        fields: ['content', 'testimonials'],
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
  helpers() {
    return {
      groupTagsByCategory(tags) {
        const grouped = {};
        if (!Array.isArray(tags)) {
          return grouped;
        }
        tags.forEach((tag) => {
          const category =
            (tag._category && tag._category[0] && tag._category[0].title) ||
            'Uncategorized';
          if (!grouped[category]) {
            grouped[category] = [];
          }
          grouped[category].push(tag.label);
        });
        return grouped;
      },
    };
  },
};
