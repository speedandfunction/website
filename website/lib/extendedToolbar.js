// ExtendedToolbar.js

module.exports = {
  toolbar: [
    'styles',
    '|',
    'bold',
    'italic',
    'strike',
    'link',
    'anchor',
    '|',
    'alignLeft',
    'alignCenter',
    'alignRight',
    '|',
    'bulletList',
    'orderedList',
    '|',
    'undo',
    'redo'
  ],
  styles: [
    {
      tag: 'p',
      label: 'Paragraph (P)',
      class: 'paragraph'
    },
    {
      tag: 'h1',
      label: 'Heading 1 (H1)'
    },
    {
      tag: 'h2',
      label: 'Heading 2 (H2)'
    },
    {
      tag: 'h3',
      label: 'Heading 3 (H3)'
    },
    {
      tag: 'h4',
      label: 'Heading 4 (H4)'
    },
    {
      tag: 'h5',
      label: 'Heading 5 (H5)'
    },
    {
      tag: 'h6',
      label: 'Heading 6 (H6)'
    }
  ],
  insert: [
    'table',
    'image'
  ]
};
