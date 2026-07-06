const mainWidgets = require('../../lib/mainWidgets');
const NavigationService = require('./services/NavigationService');
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

  methods(self) {
    return {
      async beforeIndex(req) {
        // Load all case studies and tags for frontend filtering
        const [pieces, casesTags, businessPartners] = await Promise.all([
          self.pieces.find(req).toArray(),
          self.apos.modules['cases-tags'].find(req).toArray(),
          self.apos.modules['business-partner'].find(req).toArray(),
        ]);
        req.data.pieces = pieces;
        req.data.totalPieces = pieces.length;
        req.data.totalPages = 1;
        req.data.casesTags = casesTags;
        req.data.businessPartners = businessPartners;

        // Build filter options from all tags
        const tagMap = createDocMapById(casesTags);
        const partnerMap = createDocMapById(businessPartners);
        req.data.piecesFilters = {
          industry: collectFilterOptions(pieces, 'industryIds', tagMap),
          stack: collectFilterOptions(pieces, 'stackIds', tagMap),
          caseStudyType: collectFilterOptions(pieces, 'caseStudyTypeIds', tagMap),
          partner: collectFilterOptions(pieces, 'partnerIds', partnerMap),
        };

        // Attach URL helpers for template
        UrlService.attachIndexData(req, {
          industry: {},
          stack: {},
          caseStudyType: {},
          partner: {},
        });
      },
      async beforeShow(req) {
        await self.setupShowData(req);
      },
      setupShowData(req) {
        return runSetupShowData(self, req);
      },
    };
  },
};
