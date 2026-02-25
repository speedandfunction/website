/**
 * Case Studies Search Handler
 * Triggers search on Enter (form submit) and clear button click
 */

(function () {
  'use strict';

  // Build URL with search and existing filters
  function buildSearchUrl(searchValue) {
    const url = new URL(window.location.href);
    const params = new URLSearchParams(url.search);

    // Update or remove search parameter
    if (searchValue && searchValue.trim()) {
      params.set('search', searchValue.trim());
    } else {
      params.delete('search');
    }

    // Remove page parameter when searching (reset to page 1)
    params.delete('page');

    // Build new URL
    const newSearch = params.toString();
    const newUrl =
      url.pathname + (newSearch ? '?' + newSearch : '') + url.hash;

    return newUrl;
  }

  // Navigate to URL with updated search (single history entry; Back works as expected)
  function performSearch(searchValue) {
    const newUrl = buildSearchUrl(searchValue);
    window.location.assign(newUrl);
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
    const hadValue = searchInput.value && searchInput.value.trim();
    searchInput.value = '';
    updateClearButtonVisibility(searchInput, clearButton);
    if (hadValue) {
      performSearch('');
    }
  }

  // Handle form submission (Enter key) – triggers search
  function handleFormSubmit(event) {
    event.preventDefault();
    const searchInput = event.target.querySelector('.cs_search-bar-input');
    if (searchInput) {
      performSearch(searchInput.value);
    }
  }

  function handleSearchFocus(event) {
    event.target.setAttribute('placeholder', 'Try a title or description');
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
    }

    // Add input event listener (handler closes over clearButton; no live query per keystroke)
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
  }

  // Initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initSearchHandler);
  } else {
    initSearchHandler();
  }
})();
