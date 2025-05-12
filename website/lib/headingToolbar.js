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
  ['h1', 'Heading H1', 'sf-h1'],
  ['h2', 'Heading H2', 'sf-h2'],
  ['h3', 'Heading H3', 'sf-title'],
  ['h4', 'Heading H4', 'sf-subscribe__title'],
  ['h5', 'Heading H5', 'sf-h5'],
  ['h6', 'Heading H6', 'sf-h6'],
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
