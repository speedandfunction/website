/**
 * Case Studies filter state
 * Owns the in-memory tag/search state and its sessionStorage persistence.
 * State is deliberately disconnected from URL query parameters: filtering is
 * live and frontend-only, with no page reload and no history entries.
 */

const filterState = {
  industry: new Set(),
  stack: new Set(),
  caseStudyType: new Set(),
  partner: new Set(),
};

const FILTER_TYPES = Object.keys(filterState);

let searchTerm = '';

const getSearchTerm = () => searchTerm;

const setSearchTerm = (value) => {
  searchTerm = value || '';
};

/*
 * Storage keys used to preserve the filter state when navigating to a case
 * study show page and back to the /cases listing.
 */
const FILTER_STORAGE_KEY = 'casesFilterState';
const FILTER_RETURN_KEY = 'casesFilterReturn';

// Coerce a persisted value into an array of tag values.
const toValueArray = (value) => {
  if (Array.isArray(value)) {
    return value;
  }
  return [];
};

// Serialize the current filter state and search term.
const getFilterStateSnapshot = () => ({
  industry: Array.from(filterState.industry),
  stack: Array.from(filterState.stack),
  caseStudyType: Array.from(filterState.caseStudyType),
  partner: Array.from(filterState.partner),
  search: searchTerm,
});

// Persist the current filter state to sessionStorage.
const persistFilterState = () => {
  try {
    window.sessionStorage.setItem(
      FILTER_STORAGE_KEY,
      JSON.stringify(getFilterStateSnapshot()),
    );
  } catch {
    // Storage is unavailable (private mode or quota); persistence is optional.
  }
};

// Read the persisted filter state, or null when absent/unparseable.
const readPersistedFilterState = () => {
  try {
    return JSON.parse(window.sessionStorage.getItem(FILTER_STORAGE_KEY));
  } catch {
    return null;
  }
};

// Remove any persisted filter state.
const clearPersistedFilterState = () => {
  try {
    window.sessionStorage.removeItem(FILTER_STORAGE_KEY);
  } catch {
    // Storage is unavailable; nothing to clear.
  }
};

/*
 * Flag that the user is leaving the listing for a case study, so the filters
 * should be restored when the listing next loads.
 */
const markFilterReturnIntent = () => {
  try {
    window.sessionStorage.setItem(FILTER_RETURN_KEY, '1');
  } catch {
    // Storage is unavailable; the filters simply will not be restored.
  }
};

// Read and clear the return-intent flag set when opening a case study.
const consumeFilterReturnIntent = () => {
  try {
    const shouldRestore =
      window.sessionStorage.getItem(FILTER_RETURN_KEY) === '1';
    window.sessionStorage.removeItem(FILTER_RETURN_KEY);
    return shouldRestore;
  } catch {
    return false;
  }
};

// Populate filterState from server-rendered active tag items on page load.
const initFilterState = () => {
  FILTER_TYPES.forEach((filterType) => {
    filterState[filterType].clear();
  });
  document.querySelectorAll('.tag-item.active').forEach((item) => {
    const { filterType, tagValue } = item.dataset;
    if (filterType && filterState[filterType]) {
      filterState[filterType].add(tagValue);
    }
  });
};

// Update in-memory filter state (no URL/history changes).
const updateFilterState = (filterType, tagValue, action) => {
  if (!filterState[filterType]) {
    return;
  }
  if (action === 'add') {
    filterState[filterType].add(tagValue);
  } else if (action === 'remove') {
    filterState[filterType].delete(tagValue);
  }
};

// Drop every active tag selection.
const clearFilterState = () => {
  FILTER_TYPES.forEach((filterType) => {
    filterState[filterType].clear();
  });
};

export {
  FILTER_TYPES,
  clearFilterState,
  clearPersistedFilterState,
  consumeFilterReturnIntent,
  filterState,
  getSearchTerm,
  initFilterState,
  markFilterReturnIntent,
  persistFilterState,
  readPersistedFilterState,
  setSearchTerm,
  toValueArray,
  updateFilterState,
};
