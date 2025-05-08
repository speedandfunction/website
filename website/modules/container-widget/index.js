const headingToolbar = require('../../lib/headingToolbar');

module.exports = {
  extend: '@apostrophecms/widget-type',
  options: {
    label: 'Container',
    icon: 'dots-vertical-icon',
    className: 'sf-container-widget',
  },
  fields: {
    add: {
      content: {
        type: 'area',
        label: 'Content',
        options: {
          widgets: {
            '@apostrophecms/rich-text': {
              ...headingToolbar,
            },
          },
        },
      },
      widthDesktop: {
        label: 'Content width (desktop)',
        type: 'range',
        min: 0,
        max: 1400,
        step: 2,
        def: 900,
      },
      widthMobile: {
        label: 'Content width (mobile)',
        type: 'range',
        min: 0,
        max: 768,
        step: 2,
        def: 322,
      },
      paddingBottomDesktop: {
        label: 'Padding bottom (desktop)',
        type: 'range',
        min: 0,
        max: 300,
        step: 2,
        def: 0,
      },
      paddingBottomMobile: {
        label: 'Padding bottom (mobile)',
        type: 'range',
        min: 0,
        max: 300,
        step: 2,
        def: 0,
      },
      paddingTopDesktop: {
        label: 'Padding top (desktop)',
        type: 'range',
        min: 0,
        max: 300,
        step: 2,
        def: 0,
      },
      paddingTopMobile: {
        label: 'Padding top (mobile)',
        type: 'range',
        min: 0,
        max: 300,
        step: 2,
        def: 0,
      },
      backgroundColor: {
        type: 'color',
        label: 'Background Color',
      },
    },
  },
};
