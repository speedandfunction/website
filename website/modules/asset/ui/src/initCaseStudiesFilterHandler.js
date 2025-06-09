import { setShouldScrollToFilter } from './enhanceBarbaWithFilterHandling';

// Get configuration from backend (set in case-studies-page/index.js)
const getDefaultVisibleTagsCount = function () {
  // Fallback to 5 if not set
  return window.DEFAULT_VISIBLE_TAGS_COUNT || 5;
};

// Filter link detection - Single responsibility: Identify filter-related links
const isFilterLink = function (link, href) {
  if (!href) return false;

  return (
    href.includes('#filter') ||
    link.classList.contains('clear-all-link') ||
    link.classList.contains('remove-tag') ||
    link.classList.contains('tag-link') ||
    href.includes('?industry=') ||
    href.includes('&industry=') ||
    href.includes('?stack=') ||
    href.includes('&stack=') ||
    href.includes('?caseStudyType=') ||
    href.includes('&caseStudyType=')
  );
};

// Filter navigation detection - Single responsibility: Track filter clicks
const setupFilterLinkDetection = function () {
  const handleFilterClick = function (event) {
    const link = event.target.closest('a');
    if (link) {
      const href = link.getAttribute('href');
      if (isFilterLink(link, href)) {
        setShouldScrollToFilter(true);
      }
    }
  };

  document.addEventListener('click', handleFilterClick);

  // Return cleanup function
  return function () {
    document.removeEventListener('click', handleFilterClick);
  };
};

// Empty cleanup function constant
const emptyCleanup = function () {
  // No cleanup needed
};

// Setup keyboard event handlers for filter buttons
const setupKeydownHandlers = function (filterButtons) {
  const handleKeyDown = function (event) {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      // Find the associated checkbox and trigger click
      const checkboxId = event.target.getAttribute('for');
      const checkbox = document.getElementById(checkboxId);
      if (checkbox) {
        checkbox.click();
      }
    }
  };

  filterButtons.forEach(function (button) {
    button.addEventListener('keydown', handleKeyDown);
  });

  return function () {
    filterButtons.forEach(function (button) {
      button.removeEventListener('keydown', handleKeyDown);
    });
  };
};

// Setup aria-expanded attribute updates
const setupAriaExpandedHandlers = function (checkboxes) {
  const updateAriaExpanded = function (event) {
    const checkbox = event.target;
    const button = document.querySelector(`label[for="${checkbox.id}"]`);
    if (button) {
      button.setAttribute('aria-expanded', checkbox.checked.toString());
    }
  };

  checkboxes.forEach(function (checkbox) {
    checkbox.addEventListener('change', updateAriaExpanded);
  });

  return function () {
    checkboxes.forEach(function (checkbox) {
      checkbox.removeEventListener('change', updateAriaExpanded);
    });
  };
};

// Setup accessibility enhancements for filter expand/collapse
const setupFilterAccessibility = function () {
  const filterButtons = document.querySelectorAll(
    '.filter-category__expand-button',
  );

  // Early return if no filter buttons found
  if (filterButtons.length === 0) {
    return emptyCleanup;
  }

  const checkboxes = document.querySelectorAll('.filter-category__toggle');
  if (checkboxes.length === 0) {
    return emptyCleanup;
  }

  const keydownCleanup = setupKeydownHandlers(filterButtons);
  const ariaCleanup = setupAriaExpandedHandlers(checkboxes);

  // Return combined cleanup function
  return function () {
    keydownCleanup();
    ariaCleanup();
  };
};

// Helper function to collapse tags with animation
const collapseTagsWithAnimation = function (allItems, button, textElement) {
  if (!allItems || !button || !textElement) return;

  let hiddenCounter = 0;
  allItems.forEach(function (item, index) {
    if (index >= getDefaultVisibleTagsCount()) {
      // Add small delay for staggered animation effect
      setTimeout(function () {
        item.classList.add('tag-item--hidden');
      }, hiddenCounter * 30);
      hiddenCounter += 1;
    }
  });
  button.classList.remove('tags__show-more--expanded');
  textElement.textContent = 'Show more';
};

// Helper function to expand tags with animation
const expandTagsWithAnimation = function (allItems, button, textElement) {
  if (!allItems || !button || !textElement) return;

  let expandCounter = 0;
  allItems.forEach(function (item, index) {
    if (index >= getDefaultVisibleTagsCount()) {
      // Add small delay for staggered animation effect
      setTimeout(function () {
        item.classList.remove('tag-item--hidden');
      }, expandCounter * 50);
      expandCounter += 1;
    } else {
      item.classList.remove('tag-item--hidden');
    }
  });
  button.classList.add('tags__show-more--expanded');
  textElement.textContent = 'Show less';
};

// Setup Show More/Show Less functionality for tags
const setupShowMoreHandlers = function () {
  const showMoreButtons = document.querySelectorAll('.tags__show-more');

  if (showMoreButtons.length === 0) {
    return emptyCleanup;
  }

  const handleShowMoreClick = function (event) {
    const button = event.target.closest('.tags__show-more');
    if (!button) return;

    const filterContent = button.closest('.filter-content');
    const allItems = filterContent.querySelectorAll('.tag-item');
    const textElement = button.querySelector('.tags__show-more__text');

    if (button.classList.contains('tags__show-more--expanded')) {
      collapseTagsWithAnimation(allItems, button, textElement);
    } else {
      expandTagsWithAnimation(allItems, button, textElement);
    }
  };

  showMoreButtons.forEach(function (button) {
    button.addEventListener('click', handleShowMoreClick);
  });

  return function () {
    showMoreButtons.forEach(function (button) {
      button.removeEventListener('click', handleShowMoreClick);
    });
  };
};

// Initialization - Single responsibility: Set up all filter-related functionality
const initCaseStudiesFilterHandler = function () {
  const filterCleanup = setupFilterLinkDetection();
  const accessibilityCleanup = setupFilterAccessibility();
  const showMoreCleanup = setupShowMoreHandlers();

  // Return combined cleanup function
  return function () {
    filterCleanup();
    accessibilityCleanup();
    showMoreCleanup();
  };
};

// Public API
export { initCaseStudiesFilterHandler, getDefaultVisibleTagsCount };
