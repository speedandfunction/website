const ListingService = require('./services/ListingService');
const NavigationService = require('./services/NavigationService');
const UrlService = require('./services/UrlService');

const PAGE_CACHE_MAX_AGE = 60;

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
        const listing = await ListingService.loadListingData(self, req);
        req.data = {
          ...req.data,
          ...listing,
          ...ListingService.selectCardsToRender(req, listing.pieces),
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

  /*
   * Deferred cards must not use /cases?query — Cloudflare challenges every
   * query-string request to /cases, and fetch() cannot complete that challenge.
   * Page types share @apostrophecms/page's action, so this route uses an
   * absolute path (see getRouteUrl) instead of a module-relative name.
   */
  apiRoutes(self) {
    return {
      get: {
        // Absolute path — page types share @apostrophecms/page's action.
        async '/api/v1/case-studies-page/cards'(req) {
          return ListingService.renderDeferredCards(self, req);
        },
      },
    };
  },

  handlers(self) {
    const clearCaches = function () {
      ListingService.clearListingCache();
      NavigationService.clearNavigationCache();
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
      'case-studies:afterSave': { clearCaches },
      'case-studies:afterDelete': { clearCaches },
      'cases-tags:afterSave': { clearCaches },
      'cases-tags:afterDelete': { clearCaches },
      'business-partner:afterSave': { clearCaches },
      'business-partner:afterDelete': { clearCaches },
    };
  },
};
