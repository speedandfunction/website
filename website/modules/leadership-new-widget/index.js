module.exports = {
  extend: '@apostrophecms/widget-type',
  options: {
    label: 'Leadership New',
    icon: 'flare-icon',
    className: 'sf-leadership-new',
    styles: true,
  },
  fields: {
    add: {
      heading: {
        label: 'Heading',
        type: 'string',
        textarea: true,
        def: 'Meet who you’ll\nbe building with',
        help: 'A line break splits the heading into two lines',
      },
      intro: {
        label: 'Intro',
        type: 'string',
        textarea: true,
        def: 'Get to know the leaders guiding the work, and the people behind the projects.',
      },
      _teamMembers: {
        label: 'Team Members',
        help: 'Select and order the team members',
        required: true,
        type: 'relationship',
        withType: 'team-members',
        builders: {
          project: {
            title: 1,
            position: 1,
            headshot: 1,
            experience: 1,
            linkedin: 1,
            bio: 1,
          },
        },
      },
    },
    group: {
      fields: ['heading', 'intro', '_teamMembers'],
    },
  },
};
