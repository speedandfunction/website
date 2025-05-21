// HeadingToolbar.js
const toolbarGroups = [
  ['styles', 'color'],
  ['bold', 'italic', 'strike', 'underline'],
  ['link', 'horizontalRule', 'anchor'],
  ['bulletList', 'orderedList', 'blockquote'],
  ['alignLeft', 'alignCenter', 'alignRight', 'alignJustify'],
  ['redo', 'undo'],
  ['|'],
];

const toolbar = toolbarGroups.flat();

const styleMap = [
  ['p', 'Paragraph large', 'sf-rich-large'],
  ['p', 'Paragraph small', 'sf-rich-small'],
  ['h1', 'Heading H1', 'sf-h2'],
  ['h2', 'Heading H2', 'sf-title'],
  ['h3', 'Heading H3', 'sf-subscribe__title'],
  ['h4', 'Heading H4', 'sf-h5'],
  ['h5', 'Heading H5', 'sf-h6'],
  ['h1', 'Heading H1 large', 'sf-h1'],
  ['h2', 'Heading H2 large', 'sf-h2'],
];

const styles = styleMap.map(([tag, label, className]) => ({
  tag,
  label,
  class: className,
}));

module.exports = {
  toolbar,
  styles,
  color: {
    presetColors: ['#191919', '#7C7C7C'],
  },
};
