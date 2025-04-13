module.exports = {
  extend: '@apostrophecms/widget-type',
  options: {
    label: 'Our Team',
    icon: 'instagram-icon'
  },
  fields: {
    add: {
      intro: {
        label: 'Intro',
        type: 'area',
        options: {
          max: 1,
          widgets: {
            'links-buttons': {}
          }
        }
      },
      _teamMembers: {
        label: 'Team Members',
        help: 'Select and order the Team Members',
        type: 'relationship',
        withType: 'team-members',
        builders: {
          project: {
            title: 1,
            // _url: 1,
            headshot: 1,
            position: 1,
            bio: 1
          }
        }
      }
    }
  }
};
