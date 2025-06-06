module.exports = {
  cascades: ['batchOperations'],
  extend: '@apostrophecms/piece-type',
  options: {
    label: 'Team Leader',
    pluralLabel: 'Team Leaders',
    shortcut: 'G,K',
    sort: {
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
        help: 'Site url (must include http(s) protocol).',
        placeholder: 'linkedin.com/in/your-profile',
        required: true,
      },
    },
    group: {
      basics: {
        label: 'Basics',
        fields: [
          'title',
          'position',
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
