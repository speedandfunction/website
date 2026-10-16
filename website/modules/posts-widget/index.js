module.exports = {
  extend: '@apostrophecms/widget-type',
  options: {
    label: 'Posts',
    icon: 'format-list-bulleted-icon',
    className: 'sf-posts',
  },
  fields: {
    add: {
      title: {
        label: 'Title',
        type: 'string',
        textarea: true,
        help: 'Section heading. Use a line break to put the number on its own line, e.g. "02" then "People".',
      },
      posts: {
        label: 'Posts',
        type: 'array',
        inline: true,
        style: 'table',
        fields: {
          add: {
            _post: {
              label: 'Post',
              type: 'relationship',
              withType: 'blog',
              max: 1,
              required: true,
              builders: {
                project: {
                  title: 1,
                  picture: 1,
                  notes: 1,
                  _url: 1,
                },
                relationships: ['_authors'],
              },
            },
          },
        },
      },
    },
  },
};
