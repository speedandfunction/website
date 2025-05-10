const headingToolbar = require('../../lib/headingToolbar');
// const additionalMetaData = require("../partials/additionalMetaData");

module.exports = {
  cascades: ['batchOperations'],
  extend: '@apostrophecms/piece-type',
  options: {
    label: 'Team Member',
    pluralLabel: 'Team Members',
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
      },
      order: {
        label: 'Order',
        help: 'Use this field to order the team. Sorting is acsending, starting from 1',
        type: 'integer',
        min: 1,
        def: 1,
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
        type: 'area',
        options: {
          max: 1,
          widgets: {
            '@apostrophecms/rich-text': {
              ...headingToolbar,
            },
          },
        },
      },
    },
    group: {
      basics: {
        label: 'Basics',
        fields: ['title', 'position', 'order'],
      },
      details: {
        label: 'Details',
        fields: ['headshot', 'bio'],
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
