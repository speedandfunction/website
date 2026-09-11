/*
 * This configures the @apostrophecms/page module to add a "home" page type to the
 * pages menu
 */

module.exports = {
  options: {
    types: [
      {
        name: '@apostrophecms/home-page',
        label: 'Home (Teal Amber)',
      },
      {
        name: '@apostrophecms/about-page',
        label: 'About Page (Lavender_Teal)',
      },
      {
        name: '@apostrophecms/build-differently-page',
        label: 'Build Differently Page (Peach Cloud)',
      },
      {
        name: '@apostrophecms/solutions-page',
        label: 'Solutions Page (Golden Teal Drift)',
      },
      {
        name: '@apostrophecms/how-we-deliver-page',
        label: 'How We Deliver Page (Rose Teal Mist)',
      },
      {
        name: '@apostrophecms/careers-page',
        label: 'Careers Page (Rose Teal Mist)',
      },
      {
        name: 'case-studies-page',
        label: 'Case Studies Page',
      },
      {
        name: 'default-page',
        label: 'Default',
      },
      {
        name: 'home-simplified',
        label: 'Home - Simplified',
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
      {
        slug: '/search',
        parkedId: 'search',
        title: 'Search',
        type: '@apostrophecms/search',
      },
    ],
  },
};
