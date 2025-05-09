module.exports = {
  extend: '@apostrophecms/widget-type',
  options: {
    label: 'Pill Request Widget',
    icon: 'pill-icon'
  },
  fields: {
    add: {
      title: {
        type: 'string',
        label: 'Title',
        required: true
      },
      description: {
        type: 'string',
        label: 'Description',
        textarea: true
      },
      buttonText: {
        type: 'string',
        label: 'Button Text',
        required: true,
        def: 'Request Pill'
      },
      buttonLink: {
        type: 'string',
        label: 'Button Link',
        required: true
      }
    }
  }
}; 