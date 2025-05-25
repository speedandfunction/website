/*
 * Const headingToolbar = require('../../lib/headingToolbar');
 * const linkSchema = require('../../lib/linkSchema');
 */

/*
 * Module.exports = {
 *   extend: '@apostrophecms/widget-type',
 *   options: {
 *     label: 'Leadership Team Carousel',
 *     icon: 'binoculars-icon',
 *   },
 *   fields: {
 *     add: {
 *       intro: {
 *         label: 'Intro',
 *         type: 'area',
 *         options: {
 *           widgets: {
 *             '@apostrophecms/rich-text': {
 *               ...headingToolbar,
 *             },
 *           },
 *         },
 *       },
 *       cards: {
 *         label: 'Team members',
 *         type: 'array',
 *         titleField: 'title',
 *         min: 1,
 *         fields: {
 *           add: {
 *             cardTitle: {
 *               label: 'Name',
 *               type: 'string',
 *               required: true,
 *             },
 *             position: {
 *               label: 'Position',
 *               type: 'string',
 *               required: true,
 *             },
 *             yearsOfExperience: {
 *               label: 'Years of Experience',
 *               type: 'integer',
 *               min: 1,
 *               required: false,
 *             },
 *             headshot: {
 *               label: 'Headshot',
 *               type: 'area',
 *               required: true,
 *               options: {
 *                 max: 1,
 *                 min: 1,
 *                 help: '1:1 is recommended',
 *                 widgets: {
 *                   '@apostrophecms/image': {
 *                     aspectRatio: [1, 1],
 *                   },
 *                 },
 *               },
 *             },
 *             bio: {
 *               label: 'Bio',
 *               type: 'area',
 *               required: true,
 *               options: {
 *                 widgets: {
 *                   '@apostrophecms/rich-text': {
 *                     ...headingToolbar,
 *                   },
 *                 },
 *               },
 *             },
 *             ...linkSchema.fields.add,
 *           },
 *         },
 *       },
 *     },
 *   },
 * };
 */

const headingToolbar = require('../../lib/headingToolbar');

module.exports = {
  extend: '@apostrophecms/widget-type',
  options: {
    label: 'Leadership Team Widget',
    previewImage: 'png',
    icon: 'flare-icon',
  },
  fields: {
    add: {
      intro: {
        label: 'Intro',
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
      _teamLeaders: {
        label: 'Team Leaders',
        help: 'Select and order the Team Leaders',
        required: true,
        type: 'relationship',
        withType: 'team-members',
        builders: {
          project: {
            title: 1,
            position: 1,
            headshot: 1,
            order: 1,
            experience: 1,
            linkedin: 1,
            bio: 1,
          },
        },
      },
    },
  },
};
