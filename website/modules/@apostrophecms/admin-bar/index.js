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
        label: 'Blog',
        items: ['tfp-articles', 'article-tags'],
      },
    ],
  },
};
