// Client-side filtering for case studies with page reload

const EXPANDED_CATEGORIES_KEY = 'caseStudiesExpandedCategories';

const saveExpandedCategories = function () {
  const expandedCategories = [];
  const checkboxes = document.querySelectorAll('.filter-category__toggle');
  
  checkboxes.forEach(function (checkbox) {
    if (checkbox.checked) {
      // Extract filter type from checkbox id (e.g., 'filter-toggle-industry' -> 'industry')
      const filterType = checkbox.id.replace('filter-toggle-', '');
      expandedCategories.push(filterType);
    }
  });
  
  sessionStorage.setItem(EXPANDED_CATEGORIES_KEY, JSON.stringify(expandedCategories));
};

const hasSelectedTagsInCategory = function (filterType) {
  // Check if any tags are selected in this category
  const selectedTags = document.querySelectorAll(
    `#filter-content-${filterType} .tag-item.active`,
  );
  return selectedTags.length > 0;
};

const isDesktop = function () {
  // Check if current viewport is desktop (typically > 1024px)
  return window.innerWidth > 1024;
};

const updateCategoriesVisibility = function () {
  // Update categories visibility based on selected tags
  const checkboxes = document.querySelectorAll('.filter-category__toggle');
  
  checkboxes.forEach(function (checkbox) {
    const filterType = checkbox.id.replace('filter-toggle-', '');
    const hasSelectedTags = hasSelectedTagsInCategory(filterType);
    const isIndustryCategory = filterType === 'industry';
    
    // Industry category should always be open on desktop
    const shouldBeOpen = hasSelectedTags || (isIndustryCategory && isDesktop());
    
    if (shouldBeOpen && !checkbox.checked) {
      checkbox.checked = true;
      // Update aria-expanded attribute
      const button = document.querySelector(`label[for="${checkbox.id}"]`);
      if (button) {
        button.setAttribute('aria-expanded', 'true');
      }
    } else if (!shouldBeOpen && checkbox.checked) {
      checkbox.checked = false;
      // Update aria-expanded attribute
      const button = document.querySelector(`label[for="${checkbox.id}"]`);
      if (button) {
        button.setAttribute('aria-expanded', 'false');
      }
    }
  });
};

const restoreExpandedCategories = function () {
  try {
    const saved = sessionStorage.getItem(EXPANDED_CATEGORIES_KEY);
    if (!saved) {
      // If no saved state, update categories based on selected tags
      updateCategoriesVisibility();
      return;
    }
    
    const expandedCategories = JSON.parse(saved);
    expandedCategories.forEach(function (filterType) {
      const checkbox = document.getElementById(`filter-toggle-${filterType}`);
      if (checkbox && !checkbox.checked) {
        // Only expand if category has selected tags or was manually expanded
        if (hasSelectedTagsInCategory(filterType)) {
          checkbox.checked = true;
          // Update aria-expanded attribute
          const button = document.querySelector(`label[for="filter-toggle-${filterType}"]`);
          if (button) {
            button.setAttribute('aria-expanded', 'true');
          }
        }
      }
    });
    
    // After restoring, update categories visibility based on selected tags
    updateCategoriesVisibility();
  } catch (error) {
    // Ignore parsing errors and update categories visibility
    updateCategoriesVisibility();
  }
};

const shouldInterceptClick = function (link) {
  const href = link.getAttribute('href');
  return (
    href &&
    (href.includes('#filter') ||
      href.includes('?industry=') ||
      href.includes('&industry=') ||
      href.includes('?stack=') ||
      href.includes('&stack=') ||
      href.includes('?caseStudyType=') ||
      href.includes('&caseStudyType='))
  );
};

const handleFilterClick = function (event) {
  const filterLink = event.target.closest(
    '.tag-link, .remove-tag, .clear-all-link',
  );
  if (!filterLink || !shouldInterceptClick(filterLink)) {
    return;
  }

  event.preventDefault();

  // Clear saved state if this is a "clear all" action
  if (filterLink.classList.contains('clear-all-link')) {
    sessionStorage.removeItem(EXPANDED_CATEGORIES_KEY);
  } else {
    // Save current state of expanded categories before reload
    saveExpandedCategories();
  }

  const href = filterLink.getAttribute('href');
  try {
    const url = new URL(href, window.location.origin);
    const newUrl = url.pathname + url.search + url.hash;

    history.pushState({ clientSideFilter: true, url: newUrl }, '', newUrl);
    window.location.reload();
  } catch {
    // Fallback to default navigation if URL construction fails
    window.location.href = href;
  }
};

const handlePopState = function (event) {
  if (event.state?.clientSideFilter) {
    window.location.reload();
  }
};

const handleResize = function () {
  // Update categories visibility when viewport changes
  updateCategoriesVisibility();
};

export const initClientSideFiltering = function () {
  if (!document.querySelector('.cs_list')) {
    return;
  }

  // Restore expanded categories after page load
  restoreExpandedCategories();

  window.addEventListener('popstate', handlePopState);
  window.addEventListener('resize', handleResize);
  document.addEventListener('click', handleFilterClick);
};
