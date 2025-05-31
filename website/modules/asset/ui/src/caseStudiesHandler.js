// Variable to track if we should scroll to filter
let shouldScrollToFilter = false;

// Filter link detection - Single responsibility: Identify filter-related links
const isFilterLink = function (link, href) {
  if (!href) return false;

  return (
    href.includes('#filter') ||
    link.classList.contains('clear-all-link') ||
    link.classList.contains('remove-tag') ||
    link.classList.contains('tag-link') ||
    href.includes('industry') ||
    href.includes('stack') ||
    href.includes('caseStudyType')
  );
};

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
  const [currentUrl] = window.location.href.split('#');
  window.history.replaceState({}, '', `${currentUrl}#filter`);
};

// Filter navigation detection - Single responsibility: Track filter clicks
const setupFilterLinkDetection = function () {
  document.addEventListener('click', function (event) {
    const link = event.target.closest('a');
    if (link) {
      const href = link.getAttribute('href');
      if (isFilterLink(link, href)) {
        shouldScrollToFilter = true;
      }
    }
  });
};

// Filter scroll handling - Single responsibility: Handle post-transition scrolling
const handleFilterScrolling = function (hasFilterAnchor) {
  if (!hasFilterAnchor) {
    shouldScrollToFilter = false;
    return;
  }

  // Force the hash to be in the URL
  ensureFilterHashInUrl();

  // Use multiple timeouts to ensure DOM is fully updated
  setTimeout(() => {
    if (!scrollToFilterAnchor()) {
      // Fallback: try again after longer delay
      setTimeout(scrollToFilterAnchor, 300);
    }
    // Reset the flag after scrolling
    shouldScrollToFilter = false;
  }, 100);
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

// Initialization - Single responsibility: Set up all filter-related functionality
const initCaseStudiesFilterHandler = function () {
  setupFilterLinkDetection();
};

// Public API
export {
  initCaseStudiesFilterHandler,
  enhanceBarbaWithFilterHandling,
  shouldHandleFilterNavigation,
  scrollToFilterAnchor,
  resetFilterState,
};
