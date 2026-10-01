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

// Move selected (checked) tag items to the top and re-apply visibility (first 5 visible)
const reorderSelectedTagsFirst = function () {
  const tagsLists = document.querySelectorAll('.tags-list');
  const visibleCount = getDefaultVisibleTagsCount();

  tagsLists.forEach(function (list) {
    const items = Array.from(list.querySelectorAll('.tag-item'));
    const active = items.filter(function (item) {
      return item.classList.contains('active');
    });
    const inactive = items.filter(function (item) {
      return !item.classList.contains('active');
    });
    const reordered = active.concat(inactive);

    reordered.forEach(function (item) {
      list.appendChild(item);
    });

    reordered.forEach(function (item, index) {
      if (index >= visibleCount) {
        item.classList.add('tag-item--hidden');
      } else {
        item.classList.remove('tag-item--hidden');
      }
    });
  });
};

/*
 * Expand buttons cover the whole filter box; clicking one toggles the
 * hidden checkbox that drives the CSS open state (native <button> gives
 * Enter/Space activation for free).
 */
const setupExpandButtonHandlers = function (filterButtons) {
  const handleClick = function (event) {
    const checkbox = event.target
      .closest('.filter-section')
      ?.querySelector('.filter-category__toggle');
    if (checkbox) {
      checkbox.click();
    }
  };

  filterButtons.forEach(function (button) {
    button.addEventListener('click', handleClick);
  });

  return function () {
    filterButtons.forEach(function (button) {
      button.removeEventListener('click', handleClick);
    });
  };
};

// Setup aria-expanded attribute updates
const setupAriaExpandedHandlers = function (checkboxes) {
  const updateAriaExpanded = function (event) {
    const checkbox = event.target;
    const button = checkbox
      .closest('.filter-section')
      ?.querySelector('.filter-category__expand-button');
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

  const expandCleanup = setupExpandButtonHandlers(filterButtons);
  const ariaCleanup = setupAriaExpandedHandlers(checkboxes);

  // Return combined cleanup function
  return function () {
    expandCleanup();
    ariaCleanup();
  };
};

// Helper function to collapse tags with animation
const collapseTagsWithAnimation = function (
  itemsToProcess,
  button,
  textElement,
) {
  if (!itemsToProcess || !button || !textElement) return;

  // Prevent double-clicking during animation
  if (button.dataset.animating === 'true') {
    return;
  }

  button.dataset.animating = 'true';

  // Update button state immediately
  button.classList.remove('tags__show-more--expanded');
  textElement.textContent = 'Show more';

  // Immediately hide items that should be hidden (no animation delay)
  itemsToProcess.forEach(function (item, index) {
    if (index >= getDefaultVisibleTagsCount()) {
      item.classList.add('tag-item--hidden');
    } else {
      item.classList.remove('tag-item--hidden');
    }
  });

  // Remove animation lock after CSS transition completes
  setTimeout(function () {
    button.dataset.animating = 'false';
  }, 500);
};

// Helper function to expand tags with animation
const expandTagsWithAnimation = function (itemsToProcess, button, textElement) {
  if (!itemsToProcess || !button || !textElement) return;

  // Prevent double-clicking during animation
  if (button.dataset.animating === 'true') {
    return;
  }

  button.dataset.animating = 'true';

  // Update button state immediately
  button.classList.add('tags__show-more--expanded');
  textElement.textContent = 'Show less';

  // Show all items with staggered animation for smooth effect
  let expandCounter = 0;
  let maxDelay = 0;
  itemsToProcess.forEach(function (item, index) {
    if (index >= getDefaultVisibleTagsCount()) {
      const delay = expandCounter * 50;
      maxDelay = Math.max(maxDelay, delay);
      setTimeout(function () {
        item.classList.remove('tag-item--hidden');
      }, delay);
      expandCounter += 1;
    } else {
      item.classList.remove('tag-item--hidden');
    }
  });

  // Remove animation lock after all expand animations complete
  setTimeout(function () {
    button.dataset.animating = 'false';
  }, maxDelay + 500);
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
    if (!filterContent) return;

    const searchInput = filterContent.querySelector('.tag-search');
    const isSearchActive = searchInput && searchInput.value.trim().length > 0;

    const textElement = button.querySelector('.tags__show-more--text');
    const allItems = filterContent.querySelectorAll('.tag-item');

    if (isSearchActive) {
      const matchingItems = Array.from(allItems).filter(function (item) {
        return item.style.display !== 'none';
      });

      if (button.classList.contains('tags__show-more--expanded')) {
        collapseTagsWithAnimation(matchingItems, button, textElement);
      } else {
        expandTagsWithAnimation(matchingItems, button, textElement);
      }
    } else {
      const allItemsArray = Array.from(allItems);
      if (button.classList.contains('tags__show-more--expanded')) {
        collapseTagsWithAnimation(allItemsArray, button, textElement);
      } else {
        expandTagsWithAnimation(allItemsArray, button, textElement);
      }
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
  reorderSelectedTagsFirst();
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
