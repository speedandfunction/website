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
   * Converts tag slugs to IDs
   * @param {Object} apos - ApostropheCMS instance
   * @param {Object} req - Request object
   * @param {Array} slugs - Array of tag slugs
   * @returns {Array} Array of tag IDs
   */
  static async convertSlugsToIds(apos, req, slugs) {
    const tagPromises = slugs.map(async (slug) => {
      const results = await apos.modules['cases-tags']
        .find(req, { slug })
        .toArray();
      if (results.length > 0) {
        return results[0];
      }
      return null;
    });
    const tags = await Promise.all(tagPromises);
    return tags.filter((tag) => tag).map((tag) => tag.aposDocId);
  }

  /**
   * Applies filters to a query based on request parameters
   * @param {Object} query - ApostropheCMS query object
   * @param {Object} req - Request object
   * @param {Object} apos - ApostropheCMS instance
   * @returns {Object} Modified query object
   */
  static async applyFiltersToQuery(query, req, apos) {
    let filteredQuery = query;

    if (req.query.industry && req.query.industry.length > 0) {
      const industryIds = await this.convertSlugsToIds(
        apos,
        req,
        req.query.industry,
      );
      if (industryIds.length > 0) {
        filteredQuery = filteredQuery.and({
          industryIds: { $in: industryIds },
        });
      }
    }

    if (req.query.stack && req.query.stack.length > 0) {
      const stackIds = await this.convertSlugsToIds(apos, req, req.query.stack);
      if (stackIds.length > 0) {
        filteredQuery = filteredQuery.and({ stackIds: { $in: stackIds } });
      }
    }

    if (req.query.caseStudyType && req.query.caseStudyType.length > 0) {
      const caseStudyTypeIds = await this.convertSlugsToIds(
        apos,
        req,
        req.query.caseStudyType,
      );
      if (caseStudyTypeIds.length > 0) {
        filteredQuery = filteredQuery.and({
          caseStudyTypeIds: { $in: caseStudyTypeIds },
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
   * @returns {Array} Array of case study objects
   */
  static async getAllCaseStudies(
    req,
    apos,
    applyFilters = false,
    pageModule = null,
  ) {
    let query = apos.modules['case-studies'].find(req);

    if (applyFilters && req.query) {
      query = await this.applyFiltersToQuery(query, req, apos);
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
   * @returns {Object} Navigation data with prev and next
   */
  static async getNavigationData(req, apos, pageModule, currentPiece) {
    const allCaseStudies = await this.getAllCaseStudies(
      req,
      apos,
      true,
      pageModule,
    );

    const currentIndex = this.findCurrentIndex(allCaseStudies, currentPiece);

    return this.calculatePrevNext(allCaseStudies, currentIndex);
  }
}

module.exports = NavigationService;
