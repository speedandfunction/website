module.exports = {
  options: {
    fields: {
      add: {
        intro: {
          label: 'Intro',
          type: 'area',
          options: {
            max: 1,
            widgets: {
              '@apostrophecms/rich-text': {},
            },
          },
        },
      },
    },
    /*
     * Assets: {
     *   scripts: ['module:asset/ui/src/index.js'],
     * },
     */
  },
};
