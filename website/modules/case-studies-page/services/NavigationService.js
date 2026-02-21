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
   * @param {Array} slugs - Array of slugs
   * @param {string} moduleKey - Key of the piece module in apos.modules (e.g. 'cases-tags', 'business-partner')
   * @returns {Promise<Array>} Promise resolving to array of document IDs
   */
  static async convertSlugsToIdsForModule(apos, req, slugs, moduleKey) {
    const docPromises = slugs.map(async (slug) => {
      const results = await apos.modules[moduleKey]
        .find(req, { slug })
        .toArray();
      if (results.length > 0) {
        return results[0];
      }
      return null;
    });
    const docs = await Promise.all(docPromises);
    return docs.filter((doc) => doc).map((doc) => doc.aposDocId);
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
   * Applies a single slug-based filter to the query
   * @param {Object} filteredQuery - Current query object
   * @param {Object} req - Request object
   * @param {Object} apos - ApostropheCMS instance
   * @param {Object} options - Options object
   * @param {string} options.paramName - Query parameter name
   * @param {Function} options.convertFn - Async function to convert slugs to IDs
   * @param {string} options.fieldName - Document field name for the filter
   * @returns {Promise<Object>} Promise resolving to modified query object
   */
  static async applySlugFilter(filteredQuery, req, apos, options) {
    const { paramName, convertFn, fieldName } = options;
    const values = req.query[paramName];
    if (!values || values.length === 0) {
      return filteredQuery;
    }
    const ids = await convertFn(apos, req, values);
    if (ids.length === 0) {
      return filteredQuery;
    }
    return filteredQuery.and({ [fieldName]: { $in: ids } });
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
    return filteredQuery;
  }

  /**
   * Gets all case studies with optional filtering applied
   * @param {Object} req - ApostropheCMS request object
   * @param {Object} apos - ApostropheCMS instance
   * @param {boolean} applyFilters - Whether to apply current filters
   * @param {Object} pageModule - Page module for filter application
   * @returns {Promise<Array>} Promise resolving to array of case study objects
   */
  static async getAllCaseStudies(
    req,
    apos,
    applyFilters = false,
    pageModule = null,
  ) {
    let query = apos.modules['case-studies'].find(req);

    if (applyFilters && req.query) {
      query = await NavigationService.applyFiltersToQuery(query, req, apos);
    }

    return await query.sort({ updatedAt: -1 }).toArray();
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
    let prev = null;
    let next = null;

    if (currentIndex > 0) {
      prev = allCaseStudies[currentIndex - 1];
    }

    if (currentIndex < allCaseStudies.length - 1) {
      next = allCaseStudies[currentIndex + 1];
    }

    return { prev, next };
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
      pageModule,
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
