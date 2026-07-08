/**
 * Case Studies Search Handler
 * Performs live, frontend-only keyword search and tag filtering (no page reload,
 * no URL query params). Search is AND-combined with active tag filters; tag
 * filters use AND across filter types and OR within a single filter type.
 */

(function () {
  'use strict';

  // In-memory search term (disconnected from URL query parameters)
  let searchTerm = '';

  // In-memory filter state (disconnected from URL query parameters)
  const filterState = {
    industry: new Set(),
    stack: new Set(),
    caseStudyType: new Set(),
    partner: new Set()
  };

  // sessionStorage keys for preserving the filter state when navigating to a
  // case study show page and back to the /cases listing.
  const FILTER_STORAGE_KEY = 'casesFilterState';
  const FILTER_RETURN_KEY = 'casesFilterReturn';

  // Serialize the current filter state and search term.
  function getFilterStateSnapshot() {
    return {
      industry: Array.from(filterState.industry),
      stack: Array.from(filterState.stack),
      caseStudyType: Array.from(filterState.caseStudyType),
      partner: Array.from(filterState.partner),
      search: searchTerm || ''
    };
  }

  // Persist the current filter state to sessionStorage.
  function persistFilterState() {
    try {
      window.sessionStorage.setItem(
        FILTER_STORAGE_KEY,
        JSON.stringify(getFilterStateSnapshot())
      );
    } catch (error) {
      // Ignore unavailable storage
    }
  }

  // Remove any persisted filter state.
  function clearPersistedFilterState() {
    try {
      window.sessionStorage.removeItem(FILTER_STORAGE_KEY);
    } catch (error) {
      // Ignore unavailable storage
    }
  }

  // Open the filter categories that have active selections after a restore.
  function openCategoriesForActiveFilters() {
    Object.keys(filterState).forEach(function (filterType) {
      if (filterState[filterType].size === 0) {
        return;
      }
      const checkbox = document.getElementById('filter-toggle-' + filterType);
      if (checkbox && !checkbox.checked) {
        checkbox.checked = true;
        const button = document.querySelector(
          'label[for="filter-toggle-' + filterType + '"]'
        );
        if (button) {
          button.setAttribute('aria-expanded', 'true');
        }
      }
    });
  }

  // Restore the persisted filter state (tags + search) into the DOM.
  function restoreFilterState() {
    let saved = null;
    try {
      saved = JSON.parse(window.sessionStorage.getItem(FILTER_STORAGE_KEY));
    } catch (error) {
      saved = null;
    }
    if (!saved) {
      return false;
    }

    Object.keys(filterState).forEach(function (filterType) {
      filterState[filterType].clear();
      const values = Array.isArray(saved[filterType]) ? saved[filterType] : [];
      values.forEach(function (value) {
        filterState[filterType].add(value);
        updateTagActiveState(filterType, value, true);
      });
    });

    searchTerm = saved.search || '';
    const searchInput = document.getElementById('case-studies-search');
    if (searchInput) {
      searchInput.value = searchTerm;
    }

    openCategoriesForActiveFilters();
    return true;
  }

  // Mark intent to restore filters and persist them when the user opens a case
  // study from the listing. This is the precise "leaving /cases -> case study"
  // moment; the flag is consumed when the /cases page next loads.
  function setupReturnIntentOnCardClick() {
    const grid = document.getElementById('case-studies-grid');
    if (!grid) {
      return;
    }
    grid.addEventListener('click', function (event) {
      const card = event.target.closest('.cs_card');
      if (!card) {
        return;
      }
      persistFilterState();
      try {
        window.sessionStorage.setItem(FILTER_RETURN_KEY, '1');
      } catch (error) {
        // Ignore unavailable storage
      }
    });
  }

  // Populate filterState from server-rendered active tag items on page load
  function initFilterState() {
    Object.keys(filterState).forEach(function (filterType) {
      filterState[filterType].clear();
    });
    document.querySelectorAll('.tag-item.active').forEach(function (item) {
      const filterType = item.dataset.filterType;
      const tagValue = item.dataset.tagValue;
      if (filterType && filterState[filterType]) {
        filterState[filterType].add(tagValue);
      }
    });
  }

  // Update in-memory filter state (no URL/history changes)
  function updateFilterState(filterType, tagValue, action) {
    if (!filterState[filterType]) {
      return;
    }
    if (action === 'add') {
      filterState[filterType].add(tagValue);
    } else if (action === 'remove') {
      filterState[filterType].delete(tagValue);
    }
  }

  // Get a card's tag slugs for a given filter type (from data-* attributes)
  function getCardSlugs(card, filterType) {
    const raw = card.dataset[filterType] || '';
    return raw
      .split(',')
      .map(function (value) { return value.trim(); })
      .filter(Boolean);
  }

  // AND across filter types, OR within a single filter type
  // (matches historical server-side behavior via Apostrophe's applyBuildersSafely)
  function cardMatchesTags(card, state) {
    return Object.keys(state).every(function (filterType) {
      const activeSet = state[filterType];
      if (!activeSet || activeSet.size === 0) {
        return true;
      }
      const slugs = getCardSlugs(card, filterType);
      return slugs.some(function (slug) { return activeSet.has(slug); });
    });
  }

  // Keyword search against the card's precomputed data-search text
  function cardMatchesSearch(card, term) {
    const normalizedTerm = (term || '').trim().toLowerCase();
    if (!normalizedTerm) {
      return true;
    }
    const searchText = (card.dataset.search || '').toLowerCase();
    return searchText.indexOf(normalizedTerm) !== -1;
  }

  // Combined match: tag filters (AND across types / OR within a type) AND search keyword
  function cardMatchesFilters(card, state, term) {
    return cardMatchesTags(card, state) && cardMatchesSearch(card, term);
  }

  // Apply the current filterState and searchTerm to the case study cards, updating
  // visibility, items-count text, and the empty-state block
  function applyCardFiltering() {
    const cards = document.querySelectorAll('.cs_card');
    let visibleCount = 0;

    cards.forEach(function (card) {
      const matches = cardMatchesFilters(card, filterState, searchTerm);
      card.classList.toggle('is-hidden', !matches);
      if (matches) {
        visibleCount += 1;
      }
    });

    const itemsCount = document.querySelector('.items-count');
    const itemsCountMobile = document.querySelector('.items-count__mobile');
    const itemLabel = visibleCount === 1 ? 'Item' : 'Items';
    const itemsText = `${visibleCount} ${itemLabel} Found`;
    if (itemsCount) {
      itemsCount.textContent = itemsText;
    }
    if (itemsCountMobile) {
      itemsCountMobile.textContent = itemsText;
    }

    const emptyState = document.querySelector('.cs_empty-state');
    const csList = document.querySelector('.cs_list');
    const hasNoResults = visibleCount === 0;
    if (emptyState) {
      emptyState.classList.toggle('is-hidden', !hasNoResults);
    }
    if (csList) {
      csList.classList.toggle('cs_list--empty', hasNoResults);
    }
  }

  // Recalculate each tag's visible-match count (standard faceted-search recount):
  // for tag V in type T, count cards that would match if V were added to T's
  // active set (OR-combined with other active tags in T), still applying AND
  // against all other filter types' current selections.
  function recalculateTagCounts() {
    const cards = document.querySelectorAll('.cs_card');

    document.querySelectorAll('.tag-item').forEach(function (tagItem) {
      const filterType = tagItem.dataset.filterType;
      const tagValue = tagItem.dataset.tagValue;
      if (!filterType || !tagValue || !filterState[filterType]) {
        return;
      }

      const tempState = {};
      Object.keys(filterState).forEach(function (type) {
        tempState[type] = new Set(filterState[type]);
      });
      tempState[filterType].add(tagValue);

      let count = 0;
      cards.forEach(function (card) {
        if (cardMatchesFilters(card, tempState, searchTerm)) {
          count += 1;
        }
      });

      const countSpan = tagItem.querySelector('.tag-count');
      if (countSpan) {
        countSpan.textContent = `[ ${count} ]`;
      }
    });
  }

  // Update active class on tag items
  function updateTagActiveState(filterType, tagValue, isActive) {
    const tagItems = document.querySelectorAll(`.tag-item[data-filter-type="${filterType}"][data-tag-value="${tagValue}"]`);
    tagItems.forEach(item => {
      if (isActive) {
        item.classList.add('active');
        item.dataset.action = 'remove';
      } else {
        item.classList.remove('active');
        item.dataset.action = 'add';
      }
    });
  }

  // Update selected tags list
  function updateSelectedTagsList() {
    const selectedTagsList = document.querySelector('.selected-tags-list');
    const selectedTagsContainer = document.querySelector('.selected-tags');

    if (!selectedTagsList || !selectedTagsContainer) return;

    // Clear current selected tags
    selectedTagsList.innerHTML = '';

    // Get all active filter types
    const filterTypes = ['industry', 'stack', 'caseStudyType', 'partner'];
    let hasActiveFilters = false;

    filterTypes.forEach(filterType => {
      const values = Array.from(filterState[filterType]);
      if (values.length > 0) {
        hasActiveFilters = true;
        values.forEach(value => {
          // Find the corresponding tag item to get the label
          const tagItem = document.querySelector(`.tag-item[data-filter-type="${filterType}"][data-tag-value="${value}"]`);
          const label = tagItem ? tagItem.dataset.tagLabel : value;

          const li = document.createElement('li');
          li.className = 'selected-tag';
          li.innerHTML = `
            ${label}
            <a class="remove-tag" href="javascript:void(0)" data-filter-type="${filterType}" data-tag-value="${value}" aria-label="Remove ${filterType} tag ${label}">
              <img src="/images/close.svg" alt="Close Icon">
            </a>
          `;
          selectedTagsList.appendChild(li);
        });
      }
    });

    // Show/hide selected tags container and related elements based on active filters
    const itemsCount = document.querySelector('.items-count');
    const itemsCountMobile = document.querySelector('.items-count__mobile');
    const clearAll = document.querySelector('.clear-all');

    [selectedTagsContainer, itemsCount, itemsCountMobile, clearAll].forEach((el) => {
      if (!el) return;
      el.classList.toggle('is-hidden', !hasActiveFilters);
    });
  }

  // Handle clear all click
  function handleClearAllClick(event) {
    const clearAllLink = event.target.closest('.clear-all-link');
    if (!clearAllLink) return;

    event.preventDefault();

    Object.keys(filterState).forEach((filterType) => {
      filterState[filterType].clear();
      document
        .querySelectorAll(`.tag-item[data-filter-type="${filterType}"].active`)
        .forEach((item) => {
          item.classList.remove('active');
          item.dataset.action = 'add';
        });
    });

    updateSelectedTagsList();
    applyCardFiltering();
    recalculateTagCounts();
  }

  // Handle tag click
  function handleTagClick(event) {
    const tagLink = event.target.closest('.tag-link');
    if (!tagLink) return;

    const tagItem = tagLink.closest('.tag-item');
    if (!tagItem) return;

    event.preventDefault();

    const filterType = tagItem.dataset.filterType;
    const tagValue = tagItem.dataset.tagValue;
    const action = tagItem.dataset.action;

    if (!filterType || !tagValue || !action) return;

    // Update in-memory filter state
    updateFilterState(filterType, tagValue, action);

    // Update active state
    const newIsActive = action === 'add';
    updateTagActiveState(filterType, tagValue, newIsActive);

    // Update selected tags list
    updateSelectedTagsList();
    applyCardFiltering();
    recalculateTagCounts();
  }

  // Handle remove tag click from selected tags
  function handleRemoveTagClick(event) {
    const removeLink = event.target.closest('.remove-tag');
    if (!removeLink) return;

    event.preventDefault();

    const filterType = removeLink.dataset.filterType;
    const tagValue = removeLink.dataset.tagValue;

    if (!filterType || !tagValue) return;

    // Update in-memory filter state
    updateFilterState(filterType, tagValue, 'remove');

    // Update active state
    updateTagActiveState(filterType, tagValue, false);

    // Update selected tags list
    updateSelectedTagsList();
    applyCardFiltering();
    recalculateTagCounts();
  }

  const VISIBLE_CLASS = 'cs_search-bar-clear--visible';

  // Sync clear button visibility via CSS class (no inline styles; CSS rules control display)
  function updateClearButtonVisibility(searchInput, clearButton) {
    if (!searchInput || !clearButton) {
      return;
    }
    const hasValue = searchInput.value && searchInput.value.trim();
    if (hasValue) {
      clearButton.classList.add(VISIBLE_CLASS);
    } else {
      clearButton.classList.remove(VISIBLE_CLASS);
    }
  }

  // Handle clear button click
  function handleClearClick(event) {
    event.preventDefault();
    event.stopPropagation();

    const searchInput = document.getElementById('case-studies-search');
    const clearButton = event.target.closest('.cs_search-bar-clear');
    if (!searchInput) {
      return;
    }
    searchInput.value = '';
    searchTerm = '';
    updateClearButtonVisibility(searchInput, clearButton);
    updateSelectedTagsList();
    applyCardFiltering();
    recalculateTagCounts();
  }

  // Handle form submission (Enter key) – filtering already happens live on input,
  // so just prevent the default page reload
  function handleFormSubmit(event) {
    event.preventDefault();
  }

  function handleSearchFocus(event) {
    event.target.setAttribute(
      'placeholder',
      'Try a title, technology, or partner',
    );
  }

  function handleSearchBlur(event) {
    if (!event.target.value) {
      event.target.setAttribute('placeholder', 'Search case studies');
    }
  }

  // Initialize search handler
  function initSearchHandler() {
    const searchForm = document.querySelector('.cs_search-bar-form');
    const searchInput = document.getElementById('case-studies-search');
    const clearButton = document.querySelector('.cs_search-bar-clear');

    if (!searchForm || !searchInput) {
      return;
    }

    function handleSearchInput(event) {
      updateClearButtonVisibility(event.target, clearButton);
      searchTerm = event.target.value;
      updateSelectedTagsList();
      applyCardFiltering();
      recalculateTagCounts();
    }

    // Add input event listener for live, frontend-only search filtering
    searchInput.addEventListener('input', handleSearchInput);

    // Add form submit handler
    searchForm.addEventListener('submit', handleFormSubmit);

    // Add clear button handler
    if (clearButton) {
      clearButton.addEventListener('click', handleClearClick);
    }

    // Update placeholder on focus/blur
    searchInput.addEventListener('focus', handleSearchFocus);
    searchInput.addEventListener('blur', handleSearchBlur);

    // Initial clear button visibility
    if (clearButton) {
      updateClearButtonVisibility(searchInput, clearButton);
    }

    // Add tag click handlers
    const tagsFilter = document.querySelector('.tags-filter');
    if (tagsFilter) {
      tagsFilter.addEventListener('click', handleTagClick);
    }

    // Add remove tag click handlers
    const selectedTagsList = document.querySelector('.selected-tags-list');
    if (selectedTagsList) {
      selectedTagsList.addEventListener('click', handleRemoveTagClick);
    }

    // Add clear all click handler
    const clearAll = document.querySelector('.clear-all');
    if (clearAll) {
      clearAll.addEventListener('click', handleClearAllClick);
    }

    // Persist filters and mark restore intent when opening a case study card
    setupReturnIntentOnCardClick();

    // Initialize in-memory filter state and search term from server-rendered values
    initFilterState();
    searchTerm = searchInput.value;

    // If the user is returning from a case study show page, restore the
    // previously selected filters; otherwise start fresh and drop stored state.
    let shouldRestore = false;
    try {
      shouldRestore =
        window.sessionStorage.getItem(FILTER_RETURN_KEY) === '1';
      window.sessionStorage.removeItem(FILTER_RETURN_KEY);
    } catch (error) {
      shouldRestore = false;
    }

    if (shouldRestore) {
      restoreFilterState();
      clearPersistedFilterState();
    } else {
      clearPersistedFilterState();
    }

    // Sync clear-button visibility with the (possibly restored) search value
    if (clearButton) {
      updateClearButtonVisibility(searchInput, clearButton);
    }

    // Initialize selected tags list, card filtering, and tag counts on page load
    updateSelectedTagsList();
    applyCardFiltering();
    recalculateTagCounts();
  }

  // Initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initSearchHandler);
  } else {
    initSearchHandler();
  }
})();
