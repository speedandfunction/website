const NavigationService = require('./services/NavigationService');
const UrlService = require('./services/UrlService');

/*
 * Listing cards need only these fields. The projection keeps long-text
 * fields (descriptor, objective, challenge, solution, results), testimonials
 * and unused URLs out of the payload. Relationship storage fields stay so
 * the joins and collectFilterOptions keep working.
 */
const PIECES_LISTING_PROJECTION = {
  title: 1,
  slug: 1,
  aposDocId: 1,
  aposLocale: 1,
  picture: 1,
  portfolioTitle: 1,
  industryIds: 1,
  stackIds: 1,
  caseStudyTypeIds: 1,
  partnerIds: 1,
};

const FILTER_DOC_PROJECTION = {
  title: 1,
  slug: 1,
  aposDocId: 1,
};

const LISTING_CACHE_TTL = 60 * 1000;
const PAGE_CACHE_MAX_AGE = 60;
const listingCache = new Map();

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

const getListingCacheKey = function (req) {
  return `${req.data.page.aposLocale}:${req.mode || 'published'}`;
};

const loadListingData = async function (self, req) {
  const canCache = !req.user && self.isSafeToCache(req);
  let cacheKey = null;
  if (canCache) {
    cacheKey = getListingCacheKey(req);
  }
  const cached = cacheKey && listingCache.get(cacheKey);

  if (cached && cached.expiresAt > Date.now()) {
    return cached.data;
  }

  const [pieces, casesTags, businessPartners] = await Promise.all([
    self.pieces.find(req).project(PIECES_LISTING_PROJECTION).toArray(),
    self.apos.modules['cases-tags']
      .find(req)
      .project(FILTER_DOC_PROJECTION)
      .toArray(),
    self.apos.modules['business-partner']
      .find(req)
      .project(FILTER_DOC_PROJECTION)
      .toArray(),
  ]);

  const tagMap = createDocMapById(casesTags);
  const partnerMap = createDocMapById(businessPartners);
  const data = {
    pieces,
    casesTags,
    businessPartners,
    piecesFilters: {
      industry: collectFilterOptions(pieces, 'industryIds', tagMap),
      stack: collectFilterOptions(pieces, 'stackIds', tagMap),
      caseStudyType: collectFilterOptions(pieces, 'caseStudyTypeIds', tagMap),
      partner: collectFilterOptions(pieces, 'partnerIds', partnerMap),
    },
  };

  if (cacheKey) {
    listingCache.set(cacheKey, {
      data,
      expiresAt: Date.now() + LISTING_CACHE_TTL,
    });
  }

  return data;
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
      heading: {
        label: 'Heading',
        type: 'string',
        textarea: true,
      },
      description: {
        label: 'Description',
        type: 'string',
        textarea: true,
      },
      numbers: {
        label: 'Numbers',
        type: 'array',
        titleField: 'value',
        inline: true,
        style: 'table',
        fields: {
          add: {
            value: {
              label: 'Value',
              type: 'string',
              required: true,
            },
            label: {
              label: 'Label',
              type: 'string',
              required: true,
            },
          },
        },
      },
      _featuredCases: {
        label: 'Featured Projects',
        type: 'relationship',
        withType: 'case-studies',
        help: 'Case studies displayed in the featured slider below the numbers.',
        projection: {
          title: 1,
          clientWebsite: 1,
          picture: 1,
          portfolioTitle: 1,
          fullStoryUrl: 1,
          _url: 1,
        },
      },
    },
    remove: ['orphan'],
    group: {
      basics: {
        fields: ['heading', 'description', 'numbers', '_featuredCases'],
      },
    },
  },

  methods(self) {
    return {
      async indexPage(req) {
        await self.beforeIndex(req);
        let template = 'index';
        if (self.apos.util.isAjaxRequest(req)) {
          template = 'indexAjax';
        }
        self.setTemplate(req, template);
      },
      async beforeIndex(req) {
        const listing = await loadListingData(self, req);
        req.data = {
          ...req.data,
          ...listing,
          totalPieces: listing.pieces.length,
          totalPages: 1,
          currentPage: 1,
        };

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

  handlers(self) {
    const clearListingCache = function () {
      listingCache.clear();
    };
    return {
      /*
       * Scope HTTP page caching to this page type only. setMaxAge sends
       * `Cache-Control: max-age` for cacheable anonymous requests and
       * `no-store` otherwise (editors, sessions with state).
       */
      '@apostrophecms/page:serve': {
        setCaseStudiesCacheHeaders(req) {
          if (req.data.page && req.data.page.type === 'case-studies-page') {
            self.setMaxAge(req, PAGE_CACHE_MAX_AGE);
          }
        },
      },
      'case-studies:afterSave': { clearListingCache },
      'case-studies:afterDelete': { clearListingCache },
      'cases-tags:afterSave': { clearListingCache },
      'cases-tags:afterDelete': { clearListingCache },
      'business-partner:afterSave': { clearListingCache },
      'business-partner:afterDelete': { clearListingCache },
    };
  },
};
