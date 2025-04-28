module.exports = {
  extend: '@apostrophecms/piece-page-type',
  options: {
    label: 'Case Studies Page',
    pluralLabel: 'Case Studies Pages',
    perPage: 6,
    piecesFilters: [{ name: 'tags' }],
  },
};
