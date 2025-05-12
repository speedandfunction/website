// HeadingToolbar.js
module.exports = {
  toolbar: [
    'styles',
    'color',
    'bold',
    'italic',
    'strike',
    'underline',
    'link',
    'horizontalRule',
    'anchor',
    'bulletList',
    'orderedList',
    'blockquote',
    'alignLeft',
    'alignCenter',
    'alignRight',
    'alignJustify',
    'redo',
    'undo',
    '|',
  ],
  styles: [
    {
      tag: 'h1',
      label: 'Heading H1',
      class: 'sf-h1',
    },
    {
      tag: 'h2',
      label: 'Heading H2',
      class: 'sf-h2',
    },
    {
      tag: 'h3',
      label: 'Heading H3',
      class: 'sf-title',
    },
    {
      tag: 'h4',
      label: 'Heading H4',
      class: 'sf-subscribe__title',
    },
    {
      tag: 'h5',
      label: 'Heading H5',
      class: 'sf-h5',
    },
    {
      tag: 'h6',
      label: 'Heading H6',
      class: 'sf-h6',
    },
    {
      tag: 'p',
      label: 'Paragraph',
      class: 'sf-rich',
    },
  ],
  color: {
    presetColors: ['#191919', '#7C7C7C'],
  },
};
