const extendedToolbar = require('../../lib/extendedToolbar');

module.exports = {
  extend: '@apostrophecms/piece-type',
  options: {
    label: 'Testimonial',
    pluralLabel: 'Testimonials',
    searchable: false,
  },
  fields: {
    add: {
      title: {
        label: 'Name',
        type: 'string',
      },
      headshot: {
        label: 'Image/Logo/Headshot',
        type: 'area',
        options: {
          max: 1,
          min: 1,
          help: '1:1 is recommended',
          widgets: {
            '@apostrophecms/image': {
              aspectRatio: [1, 1],
            },
          },
        },
      },
      position: {
        label: 'Position',
        type: 'string',
      },
      organization: {
        label: 'Organization',
        type: 'string',
      },
      _caseStudy: {
        label: 'Case Study',
        type: 'relationship',
        withType: 'projects',
        max: 1,
        builders: {
          project: {
            title: 1,
            stack: 1,
            subtitle: 1,
            content: 1,
            picture: 1,
            mediaType: 1,
            _file: 1,
          },
        },
      },
      url: {
        label: 'URL',
        type: 'string',
        help: 'Site url without http protocol.',
        placeholder: 'wikimediafoundation.org',
      },
      feedback: {
        label: 'Feedback',
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
          'headshot',
          'title',
          'position',
          'organization',
          '_caseStudy',
          'feedback',
          'url',
        ],
      },
    },
  },
  columns: {
    add: {
      title: {
        label: 'Name',
        name: 'title',
      },
      position: {
        label: 'Position',
        name: 'position',
      },
      organization: {
        label: 'Organization',
        name: 'organization',
      },
    },
  },
};
