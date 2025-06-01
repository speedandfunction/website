// Variable to track if we should scroll to filter
let shouldScrollToFilter = false;

// Anchor scrolling - Single responsibility: Handle scrolling to filter anchor
const scrollToFilterAnchor = function () {
  const filterElement = document.getElementById('filter');
  if (filterElement) {
    filterElement.scrollIntoView({ behavior: 'smooth' });
    return true;
  }
  return false;
};

// URL hash management - Single responsibility: Manage #filter in URL
const ensureFilterHashInUrl = function () {
  const url = new URL(window.location.href);
  url.hash = '#filter';
  window.history.replaceState({}, '', url.toString());
};

// Filter scroll handling - Single responsibility: Handle post-transition scrolling
const handleFilterScrolling = function (hasFilterAnchor) {
  if (!hasFilterAnchor) {
    shouldScrollToFilter = false;
    return;
  }

  // Force the hash to be in the URL
  ensureFilterHashInUrl();

  // Use requestAnimationFrame for better timing
  const attemptScroll = (attempts = 0) => {
    if (attempts > 10) {
      shouldScrollToFilter = false;
      return;
    }

    requestAnimationFrame(() => {
      if (scrollToFilterAnchor()) {
        shouldScrollToFilter = false;
      } else {
        attemptScroll(attempts + 1);
      }
    });
  };

  attemptScroll();
};

// Filter state detection - Single responsibility: Determine if filter navigation occurred
const shouldHandleFilterNavigation = function (targetUrl) {
  return targetUrl.includes('#filter') || shouldScrollToFilter;
};

// Reset filter state - Single responsibility: Clean up filter tracking
const resetFilterState = function () {
  shouldScrollToFilter = false;
};

// Main filter handler - Single responsibility: Coordinate all filter functionality
const enhanceBarbaWithFilterHandling = function (barbaEnterCallback) {
  return function (data) {
    // Check if we should scroll to filter
    const targetUrl = data.next.url.href;
    const hasFilterAnchor = shouldHandleFilterNavigation(targetUrl);

    // Handle filter-specific behavior
    if (hasFilterAnchor) {
      handleFilterScrolling(hasFilterAnchor);
    } else {
      resetFilterState();
    }

    // Call the original enter callback with filter handling applied
    return barbaEnterCallback(data, hasFilterAnchor);
  };
};

// Function to set shouldScrollToFilter from external modules
const setShouldScrollToFilter = function (value) {
  shouldScrollToFilter = value;
};

// Public API
export {
  enhanceBarbaWithFilterHandling,
  shouldHandleFilterNavigation,
  scrollToFilterAnchor,
  resetFilterState,
  setShouldScrollToFilter,
};
