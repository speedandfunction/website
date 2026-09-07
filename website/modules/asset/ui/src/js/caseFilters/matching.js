/**
 * Case Studies card matching
 * Pure predicates deciding whether a card passes the active tag filters and
 * the keyword search. Tag filters are AND-combined across filter types and
 * OR-combined within a single filter type, matching the historical
 * server-side behaviour via Apostrophe's applyBuildersSafely.
 */

// Get a card's tag slugs for a given filter type (from data-* attributes).
const getCardSlugs = (card, filterType) => {
  const raw = card.dataset[filterType] || '';
  return raw
    .split(',')
    .map((value) => value.trim())
    .filter(Boolean);
};

// AND across filter types, OR within a single filter type.
const cardMatchesTags = (card, state) =>
  Object.keys(state).every((filterType) => {
    const activeSet = state[filterType];
    if (!activeSet || activeSet.size === 0) {
      return true;
    }
    const slugs = getCardSlugs(card, filterType);
    return slugs.some((slug) => activeSet.has(slug));
  });

// Keyword search against the card's precomputed data-search text.
const cardMatchesSearch = (card, term) => {
  const normalizedTerm = (term || '').trim().toLowerCase();
  if (!normalizedTerm) {
    return true;
  }
  const searchText = (card.dataset.search || '').toLowerCase();
  return searchText.includes(normalizedTerm);
};

/*
 * Combined match: tag filters (AND across types / OR within a type) AND the
 * search keyword.
 */
const cardMatchesFilters = (card, state, term) =>
  cardMatchesTags(card, state) && cardMatchesSearch(card, term);

export { cardMatchesFilters, cardMatchesSearch, cardMatchesTags, getCardSlugs };
