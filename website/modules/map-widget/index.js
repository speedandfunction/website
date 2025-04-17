// Const headingToolbar = require('../../lib/headingToolbar');

module.exports = {
  extend: '@apostrophecms/widget-type',
  options: {
    label: 'Map Team',
    // PreviewImage: 'png',
    icon: 'map-marker-icon',
  },
  /*
   * Fields: {
   *   add: {
   *     intro: {
   *       label: 'Intro',
   *       type: 'area',
   *       options: {
   *         max: 1,
   *         widgets: {
   *           '@apostrophecms/rich-text': {
   *             ...headingToolbar
   *           }
   *         }
   *       }
   *     },
   *     _testimonials: {
   *       label: 'Testimonials',
   *       help: 'Select and order the Testimonials',
   *       required: true,
   *       type: 'relationship',
   *       withType: 'testimonials',
   *       builders: {
   *         project: {
   *           title: 1,
   *           feedback: 1,
   *           position: 1,
   *           url: 1,
   *           headshot: 1
   *         }
   *       }
   *     }
   *   }
   * }
   */
};
