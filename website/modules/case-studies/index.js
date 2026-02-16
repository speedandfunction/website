module.exports = {
  extend: '@apostrophecms/piece-type',
  options: {
    label: 'Case Study',
    pluralLabel: 'Case Studies',
    sort: {
      updatedAt: -1,
    },
    perPage: 50,
    alias: 'caseStudy',
    shortcut: false,
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
        help: "Link to client's official website (must include http(s) protocol).",
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
      _stack: {
        label: 'Tech Stack',
        type: 'relationship',
        withType: 'cases-tags',
        required: true,
        builders: {
          project: {
            title: 1,
            slug: 1,
          },
        },
        help: 'Select technologies utilized in the project.',
      },
      _partner: {
        label: 'Partner',
        type: 'relationship',
        withType: 'business-partner',
        max: 1,
        builders: {
          project: {
            title: 1,
            slug: 1,
            partnerLogo: 1,
            partnerWebsite: 1,
          },
        },
        help: 'Select a partner for this case study.',
      },
      _caseStudyType: {
        label: 'Case Study Type',
        type: 'relationship',
        withType: 'cases-tags',
        required: true,
        builders: {
          project: {
            title: 1,
            slug: 1,
          },
        },
        help: 'The nature of the project identifying the projectʼs scope and requirements, relationship, or key characteristics.',
      },
      _industry: {
        label: 'Industry',
        type: 'relationship',
        withType: 'cases-tags',
        required: true,
        builders: {
          project: {
            title: 1,
            slug: 1,
          },
        },
        help: "Select client's industry or sector.",
      },
      portfolioTitle: {
        label: 'Portfolio Title',
        type: 'string',
        help: 'The official product name or a concise, descriptive project name if confidentiality is necessary.',
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
        help: 'Public link referring to the delivered result (must include http(s) protocol).',
        placeholder: 'https://example.com/project',
      },
      fullStoryUrl: {
        label: 'Full Story URL',
        type: 'string',
        help: 'Link to the full case study article or story (must include http(s) protocol).',
        placeholder: 'https://example.com/full-story',
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
          '_stack',
          '_caseStudyType',
          '_industry',
          '_partner',
          'portfolioTitle',
          'descriptor',
          'prodLink',
          'fullStoryUrl',
        ],
      },
      details: {
        label: 'Case Study Details',
        fields: ['objective', 'challenge', 'solution', 'results'],
      },
      content: {
        label: 'Content',
        fields: ['testimonials'],
      },
    },
  },
  columns: {
    add: {
      portfolioTitle: {
        label: 'Portfolio Title',
        name: 'portfolioTitle',
      },
      _stack: {
        label: 'Tech Stack',
        component: 'AposCellTags',
      },
    },
  },
  filters: {
    add: {
      _industry: {
        label: 'Industry',
      },
      _caseStudyType: {
        label: 'Case Study Type',
      },
      _stack: {
        label: 'Stack',
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
        /* eslint-disable no-underscore-dangle */
        tags.forEach((tag) => {
          const category = tag._category?.[0]?.title || 'Uncategorized';
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
