/**
 * UrlService - Single Responsibility: URL building and management
 *
 * Handles all operations related to building URLs with query parameters.
 * This service is responsible for:
 * - Building case study URLs with preserved query parameters
 * - Properly encoding URL parameters
 * - Handling both single values and arrays in query parameters
 */
class UrlService {
  /**
   * Builds a case study URL with current query parameters preserved
   * @param {string} baseUrl - The base URL of the case study
   * @param {Object} query - Current query parameters from the request
   * @returns {string} Complete URL with query parameters
   */
  static buildCaseStudyUrl(baseUrl, query = {}) {
    const params = new URLSearchParams();

    // Add industry parameters
    if (query.industry) {
      const industries = UrlService.ensureArray(query.industry);
      industries.forEach((industry, index) => {
        params.append(`industry[${index}]`, industry);
      });
    }

    // Add stack parameters
    if (query.stack) {
      const stacks = UrlService.ensureArray(query.stack);
      stacks.forEach((stack, index) => {
        params.append(`stack[${index}]`, stack);
      });
    }

    // Add case study type parameters
    if (query.caseStudyType) {
      const caseStudyTypes = UrlService.ensureArray(query.caseStudyType);
      caseStudyTypes.forEach((caseStudyType, index) => {
        params.append(`caseStudyType[${index}]`, caseStudyType);
      });
    }

    // Add search parameter
    if (query.search) {
      params.append('search', query.search);
    }

    // Build final URL
    const queryString = params.toString();
    if (queryString) {
      return `${baseUrl}?${queryString}`;
    }
    return baseUrl;
  }

  /**
   * Ensures a value is an array
   * @param {*} value - Value that could be string or array
   * @returns {Array} Array version of the value
   */
  static ensureArray(value) {
    if (Array.isArray(value)) {
      return value;
    }
    return [value];
  }

  /**
   * Attaches index page data to request
   * @param {Object} req - Request object
   * @param {Object} tagCounts - Tag counts data
   */
  static attachIndexData(req, tagCounts) {
    const reqCopy = req;
    if (!reqCopy.data) {
      reqCopy.data = {};
    }
    reqCopy.data.tagCounts = tagCounts;
    reqCopy.data.buildCaseStudyUrl = (caseStudyUrl) =>
      UrlService.buildCaseStudyUrl(caseStudyUrl, req.query);
  }

  /**
   * Attaches show page data to request
   * @param {Object} req - Request object
   * @param {Object} navigation - Navigation data
   */
  static attachShowData(req, navigation) {
    const reqCopy = req;
    if (!reqCopy.data) {
      reqCopy.data = {};
    }

    const queryParams = req.query || {};

    // Build complete URLs server-side to avoid template encoding issues
    reqCopy.data.prev = navigation.prev;
    reqCopy.data.next = navigation.next;

    // Generate URLs with query parameters server-side
    if (navigation.prev) {
      reqCopy.data.prevUrl = UrlService.buildCaseStudyUrl(
        // eslint-disable-next-line no-underscore-dangle
        navigation.prev._url,
        queryParams,
      );
    }

    if (navigation.next) {
      reqCopy.data.nextUrl = UrlService.buildCaseStudyUrl(
        // eslint-disable-next-line no-underscore-dangle
        navigation.next._url,
        queryParams,
      );
    }

    reqCopy.data.backUrl = UrlService.buildCaseStudyUrl('/cases', queryParams);
    reqCopy.data.query = queryParams;
  }
}

module.exports = UrlService;
