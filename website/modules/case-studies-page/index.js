const mainWidgets = require('../../lib/mainWidgets');
const NavigationService = require('./services/NavigationService');
const SearchService = require('./services/SearchService');
const TagCountService = require('./services/TagCountService');
const UrlService = require('./services/UrlService');

const buildIndexQuery = function (self, req) {
  const queryParams = { ...req.query };
  const searchTerm = SearchService.getSearchTerm(queryParams);
  delete queryParams.search;

  const query = self.pieces
    .find(req, {})
    .applyBuildersSafely(queryParams)
    .perPage(self.perPage);
  self.filterByIndexPage(query, req.data.page);

  const searchCondition = SearchService.buildSearchCondition(searchTerm);
  if (searchCondition) {
    query.and(searchCondition);
  }
  return query;
};

const runSetupIndexData = async function (self, req) {
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
      partner: {},
    });
  }
};

const runSetupShowData = async function (self, req) {
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
};

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
      { name: 'partner' },
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
    const superBeforeIndex = self.beforeIndex;
    self.beforeIndex = async (req) => {
      if (superBeforeIndex) {
        await superBeforeIndex(req);
      }
      await self.setupIndexData(req);
    };

    const superBeforeShow = self.beforeShow;
    self.beforeShow = async (req) => {
      if (superBeforeShow) {
        await superBeforeShow(req);
      }
      await self.setupShowData(req);
    };
  },

  methods(self) {
    return {
      indexQuery(req) {
        return buildIndexQuery(self, req);
      },
      async setupIndexData(req) {
        return await runSetupIndexData(self, req);
      },
      async setupShowData(req) {
        return await runSetupShowData(self, req);
      },
    };
  },
};
