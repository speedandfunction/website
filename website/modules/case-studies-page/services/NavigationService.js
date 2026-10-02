const SearchService = require('./SearchService');

const NAV_CACHE_TTL = 60 * 1000;
const navListingCache = new Map();

const FILTER_QUERY_KEYS = [
  'industry',
  'stack',
  'caseStudyType',
  'partner',
  'search',
];

/*
 * Prev/next needs _url (slug) and _id; relationship IDs keep filtered
 * navigation working when the URL carries filter params.
 */
const NAV_PROJECTION = {
  title: 1,
  slug: 1,
  aposDocId: 1,
  aposLocale: 1,
  updatedAt: 1,
  industryIds: 1,
  stackIds: 1,
  caseStudyTypeIds: 1,
  partnerIds: 1,
};

/**
 * NavigationService - Single Responsibility: Case study navigation
 *
 * Handles all operations related to case study navigation.
 * This service is responsible for:
 * - Fetching filtered case studies for navigation
 * - Finding current case study position in filtered list
 * - Calculating previous and next case studies
 */
class NavigationService {
  /**
   * Converts slugs to document IDs for a given piece module
   * @param {Object} apos - ApostropheCMS instance
   * @param {Object} req - Request object
   * @param {Array|string} slugs - Array of slugs or single slug (Express may pass string for one query param)
   * @param {string} moduleKey - Key of the piece module in apos.modules (e.g. 'cases-tags', 'business-partner')
   * @returns {Promise<Array>} Promise resolving to array of document IDs
   */
  static async convertSlugsToIdsForModule(apos, req, slugs, moduleKey) {
    let slugList = [];
    if (Array.isArray(slugs)) {
      slugList = slugs;
    } else if (slugs) {
      slugList = [slugs];
    }
    if (slugList.length === 0) {
      return [];
    }
    const docs = await apos.modules[moduleKey]
      .find(req, { slug: { $in: slugList } })
      .project({ aposDocId: 1 })
      .toArray();
    return docs.map((doc) => doc.aposDocId);
  }

  /**
   * Converts tag slugs to IDs (cases-tags module)
   * @param {Object} apos - ApostropheCMS instance
   * @param {Object} req - Request object
   * @param {Array} slugs - Array of tag slugs
   * @returns {Promise<Array>} Promise resolving to array of tag IDs
   */
  static convertSlugsToIds(apos, req, slugs) {
    return NavigationService.convertSlugsToIdsForModule(
      apos,
      req,
      slugs,
      'cases-tags',
    );
  }

  /**
   * Converts business partner slugs to IDs
   * @param {Object} apos - ApostropheCMS instance
   * @param {Object} req - Request object
   * @param {Array} slugs - Array of partner slugs
   * @returns {Promise<Array>} Promise resolving to array of partner IDs
   */
  static convertPartnerSlugsToIds(apos, req, slugs) {
    return NavigationService.convertSlugsToIdsForModule(
      apos,
      req,
      slugs,
      'business-partner',
    );
  }

  /**
   * Applies search filter to query when search param is present.
   * Resolves relationship matches so search covers taxonomy and
   * partner fields in addition to text fields.
   * @param {Object} filteredQuery - Query object
   * @param {Object} req - Request object
   * @param {Object} apos - ApostropheCMS instance
   * @returns {Promise<Object>} Modified query
   */
  static async applySearchFilter(filteredQuery, req, apos) {
    const searchTerm = SearchService.getSearchTerm(req.query || {});
    const resolvedRelationships =
      await SearchService.resolveSearchRelationships(searchTerm, apos, req);
    const searchCondition = SearchService.buildSearchCondition(
      searchTerm,
      resolvedRelationships,
    );
    if (!searchCondition) {
      return filteredQuery;
    }
    return filteredQuery.and(searchCondition);
  }

  /**
   * Applies filters to a query based on request parameters
   * @param {Object} query - ApostropheCMS query object
   * @param {Object} req - Request object
   * @param {Object} apos - ApostropheCMS instance
   * @returns {Promise<Object>} Promise resolving to modified query object
   */
  static async applyFiltersToQuery(query, req, apos) {
    const filterConfigs = [
      {
        param: 'industry',
        convert: NavigationService.convertSlugsToIds,
        field: 'industryIds',
      },
      {
        param: 'stack',
        convert: NavigationService.convertSlugsToIds,
        field: 'stackIds',
      },
      {
        param: 'caseStudyType',
        convert: NavigationService.convertSlugsToIds,
        field: 'caseStudyTypeIds',
      },
      {
        param: 'partner',
        convert: NavigationService.convertPartnerSlugsToIds,
        field: 'partnerIds',
      },
    ];
    const idArrays = await Promise.all(
      filterConfigs.map((config) => {
        if (req.query[config.param]?.length) {
          return config.convert(apos, req, req.query[config.param]);
        }
        return Promise.resolve([]);
      }),
    );
    let filteredQuery = query;
    for (let index = 0; index < filterConfigs.length; index += 1) {
      const ids = idArrays[index];
      if (ids.length > 0) {
        filteredQuery = filteredQuery.and({
          [filterConfigs[index].field]: { $in: ids },
        });
      }
    }
    return await NavigationService.applySearchFilter(filteredQuery, req, apos);
  }

  /**
   * Gets all case studies with optional filtering applied
   * @param {Object} req - ApostropheCMS request object
   * @param {Object} apos - ApostropheCMS instance
   * @param {boolean} applyFilters - Whether to apply current filters
   * @param {Object} pageModule - Page module for filter application
   * @returns {Promise<Array>} Promise resolving to array of case study objects
   */
  static async getAllCaseStudies(req, apos, applyFilters = false) {
    const hasFilters = NavigationService.hasFilterParams(req.query);
    const cacheKey = `${req.locale}:${req.mode || 'published'}`;
    const useCache = !req.user && !hasFilters;

    if (useCache) {
      const cached = navListingCache.get(cacheKey);
      if (cached && cached.expiresAt > Date.now()) {
        return cached.docs;
      }
    }

    let query = apos.modules['case-studies'].find(req).project(NAV_PROJECTION);

    if (applyFilters && hasFilters) {
      query = await NavigationService.applyFiltersToQuery(query, req, apos);
    }

    const docs = await query.sort({ updatedAt: -1 }).toArray();

    if (useCache) {
      navListingCache.set(cacheKey, {
        docs,
        expiresAt: Date.now() + NAV_CACHE_TTL,
      });
    }

    return docs;
  }

  /** Checks whether the request query carries filter or search params. */
  static hasFilterParams(query) {
    if (!query) {
      return false;
    }
    return FILTER_QUERY_KEYS.some((key) => {
      const value = query[key];
      return Boolean(value && value.length !== 0);
    });
  }

  /** Clears the memoized case-study ordering (called on save/delete). */
  static clearNavigationCache() {
    navListingCache.clear();
  }

  /**
   * Finds the index of the current case study in the filtered list
   * @param {Array} allCaseStudies - Array of all case studies
   * @param {Object} currentPiece - Current case study object
   * @returns {number} Index of current case study (-1 if not found)
   */
  static findCurrentIndex(allCaseStudies, currentPiece) {
    // eslint-disable-next-line no-underscore-dangle
    return allCaseStudies.findIndex((study) => study._id === currentPiece._id);
  }

  /**
   * Calculates previous and next case studies for navigation
   * @param {Array} allCaseStudies - Array of all case studies
   * @param {number} currentIndex - Index of current case study
   * @returns {Object} Object with prev and next case studies
   */
  static calculatePrevNext(allCaseStudies, currentIndex) {
    const count = allCaseStudies.length;
    if (currentIndex < 0 || count < 2) {
      return { prev: null, next: null };
    }

    // Wrap around: prev of the first is the last, next of the last is the first.
    return {
      prev: allCaseStudies[(currentIndex - 1 + count) % count],
      next: allCaseStudies[(currentIndex + 1) % count],
    };
  }

  /**
   * Gets complete navigation data for a case study
   * @param {Object} req - ApostropheCMS request object
   * @param {Object} apos - ApostropheCMS instance
   * @param {Object} pageModule - Page module for filter application
   * @param {Object} currentPiece - Current case study object
   * @returns {Promise<Object>} Promise resolving to navigation data with prev and next
   */
  static async getNavigationData(req, apos, pageModule, currentPiece) {
    const allCaseStudies = await NavigationService.getAllCaseStudies(
      req,
      apos,
      true,
    );

    const currentIndex = NavigationService.findCurrentIndex(
      allCaseStudies,
      currentPiece,
    );

    return NavigationService.calculatePrevNext(allCaseStudies, currentIndex);
  }

  /**
   * Gets navigation data for page module
   * @param {Object} req - ApostropheCMS request object
   * @param {Object} apos - ApostropheCMS instance
   * @param {Object} pageModule - Page module for filter application
   * @returns {Promise<Object>} Promise resolving to navigation data with prev and next
   */
  static async getNavigationDataForPage(req, apos, pageModule) {
    const currentPiece = req.data.piece;

    return await NavigationService.getNavigationData(
      req,
      apos,
      pageModule,
      currentPiece,
    );
  }
}

module.exports = NavigationService;
