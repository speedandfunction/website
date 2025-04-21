// HeadingToolbar.js
export default {
  toolbar: [
    'styles',
    '|',
    'anchor',
    '|',
    'alignLeft',
    'alignCenter',
    'alignRight',
    '|',
    'undo',
    'redo'
  ],
  styles: [
    {
      tag: 'h2',
      label: 'Heading (H2)',
      class: 'sf-head'
    },
    {
      tag: 'h3',
      label: 'Title H3 large',
      class: 'sf-title'
    },
    {
      tag: 'h3',
      label: 'Title H3 small',
      class: 'sf-subscribe__title'
    },
    {
      tag: 'p',
      label: 'Paragraph',
      class: 'sf-rich'
    }
  ]
};
