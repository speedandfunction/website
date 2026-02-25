/**
 * SearchService - Shared search term normalization and safe regex building
 *
 * Used by case-studies-page index query and NavigationService so search
 * behavior and escaping stay consistent and safe (ReDoS prevention).
 */

const REGEX_ESCAPE = /[$()*+.?[\\\]^{|}]/gu;

/**
 * Normalizes search param from query (handles missing, array, non-string)
 * @param {Object} queryParams - Request query object (e.g. req.query)
 * @returns {string} Trimmed search string, or empty string
 */
function getSearchTerm(queryParams) {
  if (!queryParams || !queryParams.search) {
    return '';
  }
  const raw = queryParams.search;
  const value = Array.isArray(raw) ? raw[0] : raw;
  if (typeof value !== 'string') {
    return '';
  }
  return value.trim();
}

/**
 * Builds a safe MongoDB regex pattern from search term (escape + word match)
 * @param {string} searchTerm - User search string
 * @returns {string|null} Pattern for $regex, or null if no search
 */
function buildSearchRegexPattern(searchTerm) {
  if (!searchTerm || !searchTerm.trim()) {
    return null;
  }
  const escaped = searchTerm.trim().replace(REGEX_ESCAPE, '\\$&');
  return escaped.split(/\s+/u).join('.*');
}

module.exports = {
  getSearchTerm,
  buildSearchRegexPattern,
};
