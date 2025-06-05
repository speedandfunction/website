const mainWidgets = require('../../lib/mainWidgets');
const TagCountService = require('./services/TagCountService');
const NavigationService = require('./services/NavigationService');

module.exports = {
  extend: '@apostrophecms/piece-page-type',
  options: {
    label: 'Case Studies Page',
    pluralLabel: 'Case Studies Pages',
    perPage: 6,
    piecesFilters: [
      { name: 'industry' },
      { name: 'stack' },
      { name: 'caseStudyType' },
    ],
    pieces: 'case-studies',
    piecesFiltersUrl: '/case-studies',
  },
  fields: {
    add: {
      main: {
        type: 'area',
        options: mainWidgets,
      },
    },
    remove: ['orphan'],
    group: {
      mainArea: {
        label: 'Main page content',
        fields: ['main'],
      },
    },
  },

  init(self) {
    self.beforeIndex = async (req) => {
      try {
        const tagCounts = await self.calculateTagCounts(req);

        const reqCopy = req;
        if (!reqCopy.data) {
          reqCopy.data = {};
        }
        reqCopy.data.tagCounts = tagCounts;
      } catch (error) {
        self.apos.util.error('Error calculating tag counts:', error);

        const reqCopy = req;
        if (!reqCopy.data) {
          reqCopy.data = {};
        }
        reqCopy.data.tagCounts = {
          industry: {},
          stack: {},
          caseStudyType: {},
        };
      }
    };

    self.beforeShow = async (req) => {
      try {
        const navigation = await self.getNavigationData(req);

        const reqCopy = req;
        if (!reqCopy.data) {
          reqCopy.data = {};
        }
        reqCopy.data.prev = navigation.prev;
        reqCopy.data.next = navigation.next;
        reqCopy.data.query = req.query || {};
      } catch (error) {
        self.apos.util.error('Error calculating navigation data:', error);

        const reqCopy = req;
        if (!reqCopy.data) {
          reqCopy.data = {};
        }
        reqCopy.data.prev = null;
        reqCopy.data.next = null;
        reqCopy.data.query = req.query || {};
      }
    };
  },

  methods(self) {
    return {
      async calculateTagCounts(req) {
        const tagCounts = {
          industry: {},
          stack: {},
          caseStudyType: {},
        };

        const [caseStudies, casesTags] =
          await TagCountService.fetchCaseStudiesAndTags(
            req,
            self.apos.modules,
            self.options,
          );

        const tagMap = TagCountService.createTagMap(casesTags);

        TagCountService.processCaseStudies(caseStudies, tagMap, tagCounts);

        return tagCounts;
      },

      getNavigationData(req) {
        const currentPiece = req.data.piece;

        return NavigationService.getNavigationData(
          req,
          self.apos,
          self,
          currentPiece,
        );
      },
    };
  },
};
