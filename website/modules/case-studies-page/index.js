const mainWidgets = require('../../lib/mainWidgets');
const TagCountService = require('./services/TagCountService');
const NavigationService = require('./services/NavigationService');
const UrlService = require('./services/UrlService');

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
      await self.setupIndexData(req);
    };

    self.beforeShow = async (req) => {
      await self.setupShowData(req);
    };
  },

  methods(self) {
    return {
      async setupIndexData(req) {
        try {
          const tagCounts = await TagCountService.calculateTagCounts(
            req,
            self.apos.modules,
            self.options,
          );
          UrlService.attachIndexData(req, tagCounts);
        } catch (error) {
          self.apos.util.error('Error calculating tag counts:', error);
          UrlService.attachIndexData(req, {
            industry: {},
            stack: {},
            caseStudyType: {},
          });
        }
      },

      async setupShowData(req) {
        try {
          const navigation = await NavigationService.getNavigationDataForPage(
            req,
            self.apos,
            self,
          );
          UrlService.attachShowData(req, navigation);
        } catch (error) {
          self.apos.util.error('Error calculating navigation data:', error);
          UrlService.attachShowData(req, { prev: null, next: null });
        }
      },
    };
  },
};
