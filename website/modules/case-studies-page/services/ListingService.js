const NavigationService = require('./NavigationService');
const UrlService = require('./UrlService');

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

const INITIAL_CARD_COUNT = 24;
const LISTING_CACHE_TTL = 60 * 1000;
/*
 * Absolute API path: page-type modules share @apostrophecms/page's action, so
 * a module-relative route would collide with the page REST :_id handler.
 */
const CARDS_API_PATH = '/api/v1/case-studies-page/cards';
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
  const locale =
    (req.data.page && req.data.page.aposLocale) || req.locale || 'default';
  return `${locale}:${req.mode || 'published'}`;
};

/**
 * Loads case study listing data with a short anonymous-request cache.
 * @param {object} self - Case studies page module instance
 * @param {object} req - Apostrophe request
 * @returns {Promise<object>} Pieces and filter option maps
 */
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

/*
 * Decide which cards this response renders. Anonymous, unfiltered page loads
 * render only the first INITIAL_CARD_COUNT cards; the client fetches the rest
 * from the cards API when idle so instant client-side filtering still covers
 * every card.
 */
const selectCardsToRender = function (req, pieces) {
  const canDefer =
    !req.user &&
    !NavigationService.hasFilterParams(req.query) &&
    pieces.length > INITIAL_CARD_COUNT;
  if (!canDefer) {
    return { pieces, cardOffset: 0 };
  }
  return {
    pieces: pieces.slice(0, INITIAL_CARD_COUNT),
    cardOffset: 0,
    deferredCardsUrl: `${CARDS_API_PATH}?from=${INITIAL_CARD_COUNT}`,
    deferredCardsCount: pieces.length - INITIAL_CARD_COUNT,
  };
};

/**
 * Renders the deferred card HTML fragment for the cards API route.
 * @param {object} self - Case studies page module instance
 * @param {object} req - Apostrophe request
 * @returns {Promise<string>} Rendered card markup
 */
const renderDeferredCards = async function (self, req) {
  const offset = Number.parseInt(req.query.from, 10);
  if (Number.isNaN(offset) || offset < 0) {
    throw self.apos.error('invalid', 'Invalid from parameter');
  }

  const listing = await loadListingData(self, req);
  const pieces = listing.pieces.slice(offset);

  req.res.set('X-Robots-Tag', 'noindex');
  if (!req.user) {
    req.res.set('Cache-Control', `max-age=${LISTING_CACHE_TTL / 1000}`);
  }

  return self.render(req, 'caseCards', {
    pieces,
    cardOffset: offset,
    buildCaseStudyUrl: (caseStudyUrl) =>
      UrlService.buildCaseStudyUrl(caseStudyUrl, {}),
    user: req.user,
  });
};

const clearListingCache = function () {
  listingCache.clear();
};

module.exports = {
  CARDS_API_PATH,
  INITIAL_CARD_COUNT,
  clearListingCache,
  loadListingData,
  renderDeferredCards,
  selectCardsToRender,
};
