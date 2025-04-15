// LinkSchema.js

module.exports = {
  type: 'object',
  fields: {
    add: {
      linkTitle: {
        label: 'Link Title',
        type: 'string'
      },
      linkType: {
        label: 'Link type',
        type: 'select',
        choices: [
          {
            label: 'Page',
            value: 'page'
          },
          {
            label: 'File',
            value: 'file'
          },
          {
            label: 'Custom URL',
            value: 'custom'
          }
        ]
      },
      _page: {
        label: 'Link to page',
        type: 'relationship',
        withType: '@apostrophecms/page',
        max: 1,
        builders: {
          project: {
            title: 1,
            _url: 1
          }
        },
        if: {
          linkType: 'page'
        }
      },
      _file: {
        label: 'Link to file',
        type: 'relationship',
        withType: '@apostrophecms/file',
        max: 1,
        if: {
          linkType: 'file'
        }
      },
      customUrl: {
        label: 'URL for custom link',
        type: 'url',
        if: {
          linkType: 'custom'
        }
      },
      target: {
        label: 'Will the link open a new browser tab?',
        type: 'checkboxes',
        choices: [
          {
            label: 'Open in a new tab',
            value: '_blank'
          }
        ]
      }
    }
  }
};
