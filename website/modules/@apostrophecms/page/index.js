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
        name: 'tfp-articles-page',
        label: 'Blog Landing Page',
      },
    ],
    park: [
      {
        slug: '/search',
        parkedId: 'search',
        title: 'Search',
        type: '@apostrophecms/search',
      },
      {
        parkedId: 'blogParkedId',
        type: 'tfp-articles-page',
        _defaults: {
          slug: '/blog',
          title: 'Blog',
        },
      },
    ],
  },
};
