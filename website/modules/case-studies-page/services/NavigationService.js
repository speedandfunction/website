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

    if (applyFilters && pageModule) {
      query = pageModule.indexQuery(req, query) || query;
    }

    // Use the same sorting as the case-studies piece type (updatedAt: -1)
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

    // Previous: lower index (currentIndex - 1)
    if (currentIndex > 0) {
      prev = allCaseStudies[currentIndex - 1];
    }

    // Next: higher index (currentIndex + 1)
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
