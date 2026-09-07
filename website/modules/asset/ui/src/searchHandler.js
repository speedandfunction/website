/**
 * Case Studies Search Handler
 * Wires up live, frontend-only keyword search and tag filtering (no page
 * reload, no URL query params). Search is AND-combined with active tag filters;
 * tag filters use AND across filter types and OR within a single filter type.
 * State lives in js/caseFilters/state, rendering in js/caseFilters/render.
 */

import {
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
} from './js/caseFilters/state';
import {
  openCategoriesForActiveFilters,
  refreshFilterUi,
  updateTagActiveState,
} from './js/caseFilters/render';

const SEARCH_INPUT_ID = 'case-studies-search';
const VISIBLE_CLASS = 'cs_search-bar-clear--visible';

// Restore the persisted filter state (tags + search) into the DOM.
const restoreFilterState = () => {
  const saved = readPersistedFilterState();
  if (!saved) {
    return;
  }

  FILTER_TYPES.forEach((filterType) => {
    filterState[filterType].clear();
    toValueArray(saved[filterType]).forEach((value) => {
      filterState[filterType].add(value);
      updateTagActiveState(filterType, value, true);
    });
  });

  setSearchTerm(saved.search);
  const searchInput = document.getElementById(SEARCH_INPUT_ID);
  if (searchInput) {
    searchInput.value = getSearchTerm();
  }

  openCategoriesForActiveFilters();
};

/*
 * Mark intent to restore filters and persist them when the user opens a case
 * study from the listing. This is the precise "leaving /cases -> case study"
 * moment; the flag is consumed when the /cases page next loads.
 */
const setupReturnIntentOnCardClick = () => {
  const grid = document.getElementById('case-studies-grid');
  if (!grid) {
    return;
  }
  grid.addEventListener('click', (event) => {
    if (!event.target.closest('.cs_card')) {
      return;
    }
    persistFilterState();
    markFilterReturnIntent();
  });
};

// Handle clear all click.
const handleClearAllClick = (event) => {
  if (!event.target.closest('.clear-all-link')) {
    return;
  }

  event.preventDefault();

  FILTER_TYPES.forEach((filterType) => {
    document
      .querySelectorAll(`.tag-item[data-filter-type="${filterType}"].active`)
      .forEach((item) => {
        item.classList.remove('active');
        item.dataset.action = 'add';
      });
  });
  clearFilterState();

  refreshFilterUi();
};

// Handle tag click.
const handleTagClick = (event) => {
  const tagLink = event.target.closest('.tag-link');
  if (!tagLink) {
    return;
  }

  const tagItem = tagLink.closest('.tag-item');
  if (!tagItem) {
    return;
  }

  event.preventDefault();

  const { filterType, tagValue, action } = tagItem.dataset;
  if (!filterType || !tagValue || !action) {
    return;
  }

  updateFilterState(filterType, tagValue, action);
  updateTagActiveState(filterType, tagValue, action === 'add');
  refreshFilterUi();
};

// Handle remove tag click from selected tags.
const handleRemoveTagClick = (event) => {
  const removeLink = event.target.closest('.remove-tag');
  if (!removeLink) {
    return;
  }

  event.preventDefault();

  const { filterType, tagValue } = removeLink.dataset;
  if (!filterType || !tagValue) {
    return;
  }

  updateFilterState(filterType, tagValue, 'remove');
  updateTagActiveState(filterType, tagValue, false);
  refreshFilterUi();
};

/*
 * Sync clear button visibility via CSS class (no inline styles; CSS rules
 * control display).
 */
const updateClearButtonVisibility = (searchInput, clearButton) => {
  if (!searchInput || !clearButton) {
    return;
  }
  if (searchInput.value && searchInput.value.trim()) {
    clearButton.classList.add(VISIBLE_CLASS);
  } else {
    clearButton.classList.remove(VISIBLE_CLASS);
  }
};

// Handle clear button click.
const handleClearClick = (event) => {
  event.preventDefault();
  event.stopPropagation();

  const searchInput = document.getElementById(SEARCH_INPUT_ID);
  if (!searchInput) {
    return;
  }
  searchInput.value = '';
  setSearchTerm('');
  updateClearButtonVisibility(
    searchInput,
    event.target.closest('.cs_search-bar-clear'),
  );
  refreshFilterUi();
};

/*
 * Handle form submission (Enter key) - filtering already happens live on
 * input, so just prevent the default page reload.
 */
const handleFormSubmit = (event) => {
  event.preventDefault();
};

const handleSearchFocus = (event) => {
  event.target.setAttribute(
    'placeholder',
    'Try a title, technology, or partner',
  );
};

const handleSearchBlur = (event) => {
  if (!event.target.value) {
    event.target.setAttribute('placeholder', 'Search case studies');
  }
};

// Attach the search input, form, and clear-button listeners.
const bindSearchListeners = (searchForm, searchInput, clearButton) => {
  const handleSearchInput = (event) => {
    updateClearButtonVisibility(event.target, clearButton);
    setSearchTerm(event.target.value);
    refreshFilterUi();
  };

  searchInput.addEventListener('input', handleSearchInput);
  searchForm.addEventListener('submit', handleFormSubmit);
  searchInput.addEventListener('focus', handleSearchFocus);
  searchInput.addEventListener('blur', handleSearchBlur);

  if (clearButton) {
    clearButton.addEventListener('click', handleClearClick);
  }
};

// Attach the tag, remove-tag, and clear-all delegated listeners.
const bindTagListeners = () => {
  const tagsFilter = document.querySelector('.tags-filter');
  if (tagsFilter) {
    tagsFilter.addEventListener('click', handleTagClick);
  }

  const selectedTagsList = document.querySelector('.selected-tags-list');
  if (selectedTagsList) {
    selectedTagsList.addEventListener('click', handleRemoveTagClick);
  }

  const clearAll = document.querySelector('.clear-all');
  if (clearAll) {
    clearAll.addEventListener('click', handleClearAllClick);
  }
};

/*
 * Seed the filter state from the server-rendered markup, then restore the
 * previous selection when the user is returning from a case study show page.
 */
const initFilterStateForPageLoad = (searchInput) => {
  initFilterState();
  setSearchTerm(searchInput.value);

  if (consumeFilterReturnIntent()) {
    restoreFilterState();
  }
  clearPersistedFilterState();
};

// Initialize search handler.
const initSearchHandler = () => {
  const searchForm = document.querySelector('.cs_search-bar-form');
  const searchInput = document.getElementById(SEARCH_INPUT_ID);
  const clearButton = document.querySelector('.cs_search-bar-clear');

  if (!searchForm || !searchInput) {
    return;
  }

  bindSearchListeners(searchForm, searchInput, clearButton);
  bindTagListeners();
  setupReturnIntentOnCardClick();

  initFilterStateForPageLoad(searchInput);

  // Sync clear-button visibility with the (possibly restored) search value.
  updateClearButtonVisibility(searchInput, clearButton);

  refreshFilterUi();
};

export { initSearchHandler };
