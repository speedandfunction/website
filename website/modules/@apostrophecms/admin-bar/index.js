module.exports = {
  options: {
    groups: [
      {
        label: 'Media',
        items: [
          '@apostrophecms/image',
          '@apostrophecms/file',
          '@apostrophecms/image-tag',
          '@apostrophecms/file-tag',
        ],
      },
      {
        label: 'Cases',
        items: ['case-studies', 'cases-tags'],
      },
      {
        label: 'Categories',
        items: ['categories'],
      },
    ],
  },
};
