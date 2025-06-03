/*
 * This configures the @apostrophecms/page module to add a "home" page type to the
 * pages menu
 */

module.exports = {
  options: {
    types: [
      {
        name: 'default-page',
        label: 'Default',
      },
      {
        name: '@apostrophecms/home-page',
        label: 'Home',
      },
      {
        name: 'case-studies-page',
        label: 'Case Studies Page',
      },
    ],
    park: [
      {
        parkedId: 'caseParkedId',
        type: 'case-studies-page',
        _defaults: {
          slug: '/cases',
          title: 'Case Studies',
        },
      },
    ],
  },
};
