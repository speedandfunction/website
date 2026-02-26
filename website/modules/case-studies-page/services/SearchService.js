/**
 * SearchService - Shared search term normalization and safe regex building
 *
 * Used by case-studies-page index query and NavigationService so search
 * behavior and escaping stay consistent and safe (ReDoS prevention).
 */

const REGEX_ESCAPE = /[$()*+.?[\\\]^{|}]/gu;

const MAX_SEARCH_TERM_LENGTH = 200;

/**
 * Normalizes search param from query (handles missing, array, non-string)
 * @param {Object} queryParams - Request query object (e.g. req.query)
 * @returns {string} Trimmed search string, or empty string
 */
const getSearchTerm = function (queryParams) {
  if (!queryParams || !queryParams.search) {
    return '';
  }
  const raw = queryParams.search;
  let value = raw;
  if (Array.isArray(raw)) {
    [value] = raw;
  }
  if (typeof value !== 'string') {
    return '';
  }
  return value.trim();
};

/**
 * Builds a safe MongoDB regex pattern from search term (escape + word match)
 * Search term is capped at MAX_SEARCH_TERM_LENGTH to avoid pathologically long patterns
 * @param {string} searchTerm - User search string
 * @returns {string|null} Pattern for $regex, or null if no search
 */
const buildSearchRegexPattern = function (searchTerm) {
  if (!searchTerm || !searchTerm.trim()) {
    return null;
  }
  const trimmed = searchTerm.trim();
  if (!trimmed) {
    return null;
  }
  let capped = trimmed;
  if (trimmed.length > MAX_SEARCH_TERM_LENGTH) {
    capped = trimmed.slice(0, MAX_SEARCH_TERM_LENGTH);
  }
  const escaped = capped.replace(REGEX_ESCAPE, '\\$&');
  return escaped.split(/\s+/u).join('.*');
};

/**
 * Builds MongoDB $or condition for case study search (single source of truth for searchable fields)
 * @param {string} searchTerm - User search string
 * @returns {Object|null} Condition to pass to query.and(), or null if no search
 */
const buildSearchCondition = function (searchTerm) {
  const regexPattern = buildSearchRegexPattern(searchTerm);
  if (!regexPattern) {
    return null;
  }
  const regexOpts = { $regex: regexPattern, $options: 'i' };
  return {
    $or: [{ title: regexOpts }, { portfolioTitle: regexOpts }],
  };
};

module.exports = {
  buildSearchCondition,
  buildSearchRegexPattern,
  getSearchTerm,
};
