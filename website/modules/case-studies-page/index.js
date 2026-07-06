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
        req.data = {
          ...req.data,
          pieces,
          totalPieces: pieces.length,
          totalPages: 1,
          casesTags,
          businessPartners,
        };

        // Build filter options from all tags
        const tagMap = createDocMapById(casesTags);
        const partnerMap = createDocMapById(businessPartners);
        req.data.piecesFilters = {
          industry: collectFilterOptions(pieces, 'industryIds', tagMap),
          stack: collectFilterOptions(pieces, 'stackIds', tagMap),
          caseStudyType: collectFilterOptions(
            pieces,
            'caseStudyTypeIds',
            tagMap,
          ),
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
