const headingToolbar = require('../../lib/headingToolbar');

module.exports = {
  extend: '@apostrophecms/piece-type',
  options: {
    label: 'Testimonial',
    pluralLabel: 'Testimonials',
    searchable: false,
  },
  init(self) {
    // Register migrations
    self.apos.migration.add('add-new-testimonial', async () => {
      await self.apos.doc.insert(self.apos.task.getReq(), {
        type: 'testimonials',
        title: 'John Doe',
        position: 'CEO',
        organization: 'Tech Corp',
        url: 'techcorp.com',
        feedback: {
          type: 'area',
          items: [
            {
              type: '@apostrophecms/rich-text',
              content: '<p>Working with this team has been an absolute pleasure. Their expertise and dedication to quality have helped us achieve remarkable results.</p>',
            },
          ],
        },
        published: true,
      });
    });
  },
  fields: {
    add: {
      title: {
        label: 'Name',
        type: 'string',
      },
      headshot: {
        label: 'Image/Logo/Headshot',
        type: 'area',
        options: {
          max: 1,
          min: 1,
          help: '1:1 is recommended',
          widgets: {
            '@apostrophecms/image': {
              aspectRatio: [1, 1],
            },
          },
        },
      },
      position: {
        label: 'Position',
        type: 'string',
      },
      organization: {
        label: 'Organization',
        type: 'string',
      },
      _caseStudy: {
        label: 'Case Study',
        type: 'relationship',
        withType: 'case-studies',
        max: 1,
        builders: {
          project: {
            title: 1,
            stack: 1,
            portfolioTitle: 1,
            content: 1,
            picture: 1,
            mediaType: 1,
            _file: 1,
          },
        },
        columns: [
          {
            name: 'title',
            label: 'Title',
          },
          {
            name: 'portfolioTitle',
            label: 'Portfolio Title',
          },
          {
            name: 'stack',
            label: 'Stack',
          },
        ],
      },
      url: {
        label: 'URL',
        type: 'string',
        help: 'Site url without http protocol.',
        placeholder: 'wikimediafoundation.org',
      },
      feedback: {
        label: 'Feedback',
        type: 'area',
        options: {
          max: 1,
          widgets: {
            '@apostrophecms/rich-text': {
              ...headingToolbar,
            },
          },
        },
      },
    },
    group: {
      basics: {
        label: 'Basics',
        fields: [
          'headshot',
          'title',
          'position',
          'organization',
          '_caseStudy',
          'feedback',
          'url',
        ],
      },
    },
  },
  columns: {
    add: {
      title: {
        label: 'Name',
        name: 'title',
      },
      position: {
        label: 'Position',
        name: 'position',
      },
      organization: {
        label: 'Organization',
        name: 'organization',
      },
      _caseStudy: {
        label: 'Related Case Study',
        name: '_caseStudy.0.title',
      },
    },
  },
  filters: {
    add: {
      _caseStudy: {
        label: 'Case Study',
      },
    },
  },
};
