module.exports = {
  extend: '@apostrophecms/piece-page-type',
  options: {
    label: 'Blog Page',
    pluralLabel: 'Blog Pages',
    pieces: 'blog',
    previous: true,
    next: true,
  },
  fields: {
    add: {
      heading: {
        label: 'Heading',
        type: 'string',
        textarea: true,
        help: 'Use a line break for the intended wrap, e.g. "The S&F" then "Journal".',
      },
      description: {
        label: 'Description',
        type: 'string',
        textarea: true,
      },
      image: {
        label: 'Full-width Image',
        type: 'area',
        options: {
          max: 1,
          min: 1,
          widgets: {
            '@apostrophecms/image': {
              aspectRatio: [18, 5],
            },
          },
        },
      },
      imageMobile: {
        label: 'Full-width Image (Mobile)',
        type: 'area',
        options: {
          max: 1,
          min: 1,
          widgets: {
            '@apostrophecms/image': {
              aspectRatio: [22, 15],
            },
          },
        },
      },
      main: {
        label: 'Main Content',
        type: 'area',
        options: {
          widgets: {
            'cta-block': {},
            'posts': {},
          },
        },
      },
    },
    remove: ['orphan'],
    group: {
      basics: {
        fields: ['heading', 'description', 'image', 'imageMobile'],
      },
      mainArea: {
        label: 'Main page content',
        fields: ['main'],
      },
    },
  },
  methods(self) {
    return {
      async indexPage(req) {
        req.data.pieces = [];
        req.data.currentPage = 1;
        req.data.totalPages = 1;
        req.data.totalPieces = 0;
        if (self.apos.util.isAjaxRequest(req)) {
          self.setTemplate(req, 'indexAjax');
        } else {
          self.setTemplate(req, 'index');
        }
        await self.beforeIndex(req);
      },
      async beforeShow(req) {
        const { piece } = req.data;
        const edge = (createdAt) =>
          self.pieces.find(req, {}).sort({ createdAt }).limit(1).toObject();
        const [oldest, newest] = await Promise.all([edge(1), edge(-1)]);
        const other = (doc) => {
          if (!doc) {
            return null;
          }
          // eslint-disable-next-line no-underscore-dangle
          if (doc._id === piece._id) {
            return null;
          }
          return doc;
        };
        req.data.previous ??= other(oldest);
        req.data.next ??= other(newest);
      },
    };
  },
};
