const headingToolbar = require('../../lib/headingToolbar');

module.exports = {
  cascades: ['batchOperations'],
  extend: '@apostrophecms/piece-type',
  options: {
    label: 'Team Leader',
    pluralLabel: 'Team Leaders',
    shortcut: 'G,K',
    sort: {
      order: 1,
      title: 1,
      updatedAt: -1,
    },
  },
  fields: {
    add: {
      title: {
        label: 'Name',
        type: 'string',
        required: true,
      },
      position: {
        label: 'Position',
        type: 'string',
        required: true,
      },
      headshot: {
        label: 'Headshot',
        type: 'area',
        help: 'Aspect Ratio 3:4 is recommended',
        required: true,
        options: {
          max: 1,
          min: 1,
          widgets: {
            '@apostrophecms/image': {},
          },
        },
      },
      bio: {
        label: 'Bio',
        type: 'string',
        textarea: true,
        help: 'Enter a short biography (up to 400 characters)',
        required: true,
      },
      experience: {
        label: 'Experience',
        type: 'integer',
        help: 'Experience in years',
        min: 0,
        def: 0,
        required: true,
      },
      linkedin: {
        label: 'LinkedIn',
        type: 'string',
        help: 'Site url without http protocol.',
        placeholder: 'linkedin.com/in/your-profile',
        required: true,
      },
      order: {
        label: 'Order',
        help: 'Use this field to order the team. Sorting is acsending, starting from 1',
        type: 'integer',
        min: 1,
        def: 1,
      },
    },
    group: {
      basics: {
        label: 'Basics',
        fields: [
          'title',
          'position',
          'order',
          'experience',
          'linkedin',
          'headshot',
          'bio',
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
      order: {
        label: 'Order',
      },
      position: {
        label: 'Position',
      },
      experience: {
        label: 'Experience',
      },
    },
  },
  utilityOperations(self) {
    return {
      add: {
        peopleforce: {
          label: 'Peopleforce',
          modalOptions: {
            modal: 'AposPeopleModal',
          },
          canCreate: true,
          canEdit: true,
        },
      },
    };
  },
};
