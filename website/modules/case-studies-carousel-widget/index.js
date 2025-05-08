const headingToolbar = require('../../lib/headingToolbar');

module.exports = {
  extend: '@apostrophecms/widget-type',
  options: {
    label: 'Case Studies Carousel',
    icon: 'binoculars-icon',
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
      _selectedCases: {
        label: 'Selected case studies',
        type: 'relationship',
        withType: 'case-studies',
        withRelationships: ['_url'],
        projection: {
          title: 1,
          clientWebsite: 1,
          picture: 1,
          mediaType: 1,
          stack: 1,
          portfolioTitle: 1,
          prodLink: 1,
          _url: 1,
          content: 1,
        },
      },
    },
  },
};
