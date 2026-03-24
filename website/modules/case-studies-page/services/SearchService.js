/**
 * SearchService - Search term normalization, safe regex building,
 * and relationship resolution for case-study search.
 *
 * Used by case-studies-page index query and NavigationService so
 * search behavior stays consistent (ReDoS prevention, escaping).
 */

const REGEX_ESCAPE = /[$()*+.?[\\\]^{|}]/gu;

const MAX_SEARCH_TERM_LENGTH = 200;

const TEXT_FIELDS = [
  'title',
  'portfolioTitle',
  'descriptor',
  'objective',
  'challenge',
  'solution',
  'results',
];

const RELATIONSHIP_CONFIGS = [
  {
    module: 'cases-tags',
    caseStudyFields: ['stackIds', 'industryIds', 'caseStudyTypeIds'],
  },
  {
    module: 'business-partner',
    caseStudyFields: ['partnerIds'],
  },
];

/**
 * Normalizes search param from query
 * @param {Object} queryParams - Request query object
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
 * Builds a safe MongoDB regex pattern from search term.
 * Capped at MAX_SEARCH_TERM_LENGTH to avoid long patterns.
 * @param {string} searchTerm - User search string
 * @returns {string|null} Pattern for $regex, or null
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
 * Resolves relationship document IDs whose title or slug
 * matches the search term. Returns a map of case-study
 * ID-array field names to arrays of matching aposDocId values.
 * @param {string} searchTerm - User search string
 * @param {Object} apos - ApostropheCMS instance
 * @param {Object} req - Request object
 * @returns {Promise<Object>} Field-name-to-IDs map
 */
const resolveSearchRelationships = async function (searchTerm, apos, req) {
  const regexPattern = buildSearchRegexPattern(searchTerm);
  if (!regexPattern) {
    return {};
  }

  const regexOpts = { $regex: regexPattern, $options: 'i' };
  const result = {};

  const lookups = RELATIONSHIP_CONFIGS.map(async (config) => {
    const docs = await apos.modules[config.module]
      .find(req, {})
      .and({
        $or: [{ title: regexOpts }, { slug: regexOpts }],
      })
      .toArray();

    const ids = docs.map((doc) => doc.aposDocId);
    if (ids.length > 0) {
      config.caseStudyFields.forEach((field) => {
        result[field] = ids;
      });
    }
  });

  await Promise.all(lookups);
  return result;
};

/**
 * Builds MongoDB $or condition for case study search across
 * text fields and pre-resolved relationship ID fields.
 * @param {string} searchTerm - User search string
 * @param {Object} [resolvedRelationships] - Pre-resolved IDs
 * @returns {Object|null} Condition for query.and(), or null
 */
const buildSearchCondition = function (searchTerm, resolvedRelationships) {
  const regexPattern = buildSearchRegexPattern(searchTerm);
  if (!regexPattern) {
    return null;
  }

  const regexOpts = { $regex: regexPattern, $options: 'i' };
  const orBranches = TEXT_FIELDS.map((field) => ({ [field]: regexOpts }));

  const relationships = resolvedRelationships || {};
  Object.keys(relationships).forEach((field) => {
    const ids = relationships[field];
    if (ids && ids.length > 0) {
      orBranches.push({ [field]: { $in: ids } });
    }
  });

  if (orBranches.length === 0) {
    return null;
  }

  return { $or: orBranches };
};

module.exports = {
  buildSearchCondition,
  buildSearchRegexPattern,
  getSearchTerm,
  resolveSearchRelationships,
};
