const mainWidgets = require('../../lib/mainWidgets');
const NavigationService = require('./services/NavigationService');
const SearchService = require('./services/SearchService');
const TagCountService = require('./services/TagCountService');
const UrlService = require('./services/UrlService');

const createDocMapById = function (docs) {
  const map = {};
  docs.forEach((doc) => {
    map[doc.aposDocId] = {
      label: doc.title,
      value: doc.slug,
    };
  });
  return map;
};

const collectFilterOptions = function (pieces, fieldName, docMap) {
  const values = {};
  pieces.forEach((piece) => {
    const ids = piece[fieldName] || [];
    ids.forEach((id) => {
      if (docMap[id]) {
        values[id] = docMap[id];
      }
    });
  });
  const options = Object.values(values);
  options.sort((first, second) => first.label.localeCompare(second.label));
  return options;
};

const buildPiecesFiltersFromResults = async function (self, req, pieces) {
  const [tags, partners] = await Promise.all([
    self.apos.modules['cases-tags'].find(req).toArray(),
    self.apos.modules['business-partner'].find(req).toArray(),
  ]);
  const tagMap = createDocMapById(tags);
  const partnerMap = createDocMapById(partners);
  return {
    industry: collectFilterOptions(pieces, 'industryIds', tagMap),
    stack: collectFilterOptions(pieces, 'stackIds', tagMap),
    caseStudyType: collectFilterOptions(pieces, 'caseStudyTypeIds', tagMap),
    partner: collectFilterOptions(pieces, 'partnerIds', partnerMap),
  };
};

const buildIndexQuery = function (self, req) {
  const queryParams = { ...req.query };
  const searchTerm = SearchService.getSearchTerm(queryParams);
  delete queryParams.search;

  const query = self.pieces
    .find(req, {})
    .applyBuildersSafely(queryParams)
    .perPage(self.perPage);
  self.filterByIndexPage(query, req.data.page);

  const resolved = req.data.searchRelationships || {};
  const searchCondition = SearchService.buildSearchCondition(
    searchTerm,
    resolved,
  );
  if (searchCondition) {
    query.and(searchCondition);
  }
  return query;
};

const buildTagCountQuery = function (self, req) {
  const queryParams = { ...req.query };
  const searchTerm = SearchService.getSearchTerm(queryParams);
  delete queryParams.search;
  delete queryParams.page;

  const query = self.pieces.find(req, {}).applyBuildersSafely(queryParams);
  self.filterByIndexPage(query, req.data.page);

  const resolved = req.data.searchRelationships || {};
  const searchCondition = SearchService.buildSearchCondition(
    searchTerm,
    resolved,
  );
  if (searchCondition) {
    query.and(searchCondition);
  }
  return query;
};

const runResolveSearchRelationships = async function (self, req) {
  req.data ||= {};
  const reqData = req.data;
  const searchTerm = SearchService.getSearchTerm(req.query || {});
  if (!searchTerm) {
    reqData.searchRelationships = {};
    return;
  }
  let resolvedRelationships = {};
  try {
    resolvedRelationships = await SearchService.resolveSearchRelationships(
      searchTerm,
      self.apos,
      req,
    );
  } catch (error) {
    self.apos.util.error('Error resolving search relationships:', error);
  }
  reqData.searchRelationships = resolvedRelationships;
};

const runApplyEnhancedSearchResults = async function (self, req) {
  const reqData = req.data;
  const searchTerm = SearchService.getSearchTerm(req.query || {});
  if (!searchTerm) {
    return;
  }
  const queryParams = { ...req.query };
  delete queryParams.search;
  const resolved = reqData.searchRelationships || {};
  const hasRelationshipMatches = Object.keys(resolved).length > 0;
  if (!hasRelationshipMatches) {
    return;
  }
  const searchCondition = SearchService.buildSearchCondition(
    searchTerm,
    resolved,
  );
  if (!searchCondition) {
    return;
  }

  const piecesQuery = self.pieces
    .find(req, {})
    .applyBuildersSafely(queryParams);
  piecesQuery.and(searchCondition);

  const pieces = await piecesQuery.toArray();
  const totalPieces = pieces.length;
  const piecesFilters = await buildPiecesFiltersFromResults(self, req, pieces);
  reqData.pieces = pieces;
  reqData.totalPieces = totalPieces;
  reqData.totalPages = 1;
  reqData.piecesFilters = piecesFilters;
};

const runSetupIndexData = async function (self, req) {
  try {
    const countQuery = buildTagCountQuery(self, req);
    const caseStudiesForCounts = await countQuery.toArray();
    const tagCounts = await TagCountService.calculateTagCounts(
      req,
      self.apos.modules,
      self.options,
      caseStudiesForCounts,
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

const buildIndexSeoData = function (req) {
  const query = req.query || {};
  const hasFilterParams =
    Boolean(query.search) ||
    Boolean(query.industry) ||
    Boolean(query.stack) ||
    Boolean(query.caseStudyType) ||
    Boolean(query.partner);
  const pageNumber = Number(query.page || 1);
  const hasPaginationParam = Number.isFinite(pageNumber) && pageNumber > 1;
  const shouldNoindex = hasFilterParams || hasPaginationParam;
  let pageUrl = '/cases';
  if (req.data && req.data.page && req.data.page.slug) {
    pageUrl = req.data.page.slug;
  }
  let robots = 'index,follow';
  if (shouldNoindex) {
    robots = 'noindex,nofollow';
  }
  return {
    canonicalUrl: pageUrl,
    robots,
  };
};

const runSetupIndexSeoData = function (req) {
  req.data ||= {};
  req.data.caseListingSeo = buildIndexSeoData(req);
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
      await self.resolveSearchRelationships(req);
      await self.applyEnhancedSearchResults(req);
      await self.setupIndexData(req);
      self.setupIndexSeoData(req);
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
      resolveSearchRelationships(req) {
        return runResolveSearchRelationships(self, req);
      },
      applyEnhancedSearchResults(req) {
        return runApplyEnhancedSearchResults(self, req);
      },
      setupIndexData(req) {
        return runSetupIndexData(self, req);
      },
      setupIndexSeoData(req) {
        return runSetupIndexSeoData(req);
      },
      setupShowData(req) {
        return runSetupShowData(self, req);
      },
    };
  },
};
