import { setShouldScrollToFilter } from './enhanceBarbaWithFilterHandling';

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

// Filter navigation detection - Single responsibility: Track filter clicks
const setupFilterLinkDetection = function () {
  document.addEventListener('click', function (event) {
    const link = event.target.closest('a');
    if (link) {
      const href = link.getAttribute('href');
      if (isFilterLink(link, href)) {
        setShouldScrollToFilter(true);
      }
    }
  });
};

// Initialization - Single responsibility: Set up all filter-related functionality
const initCaseStudiesFilterHandler = function () {
  setupFilterLinkDetection();
};

// Public API
export { initCaseStudiesFilterHandler };
