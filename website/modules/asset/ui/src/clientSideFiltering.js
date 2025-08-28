// Client-side filtering for case studies with page reload

const EXPANDED_CATEGORIES_KEY = 'caseStudiesExpandedCategories';

const saveExpandedCategories = function () {
  const expandedCategories = [];
  const checkboxes = document.querySelectorAll('.filter-category__toggle');
  checkboxes.forEach(function (checkbox) {
    if (checkbox.checked) {
      const filterType = checkbox.id.replace('filter-toggle-', '');
      expandedCategories.push(filterType);
    }
  });

  sessionStorage.setItem(
    EXPANDED_CATEGORIES_KEY,
    JSON.stringify(expandedCategories),
  );
};

const hasSelectedTagsInCategory = function (filterType) {
  const selectedTags = document.querySelectorAll(
    `#filter-content-${filterType} .tag-item.active`,
  );
  return selectedTags.length > 0;
};

const isDesktop = function () {
  return window.innerWidth > 1024;
};

const updateCategoriesVisibility = function () {
  const checkboxes = document.querySelectorAll('.filter-category__toggle');
  checkboxes.forEach(function (checkbox) {
    const filterType = checkbox.id.replace('filter-toggle-', '');
    const hasSelectedTags = hasSelectedTagsInCategory(filterType);
    const isIndustryCategory = filterType === 'industry';

    const shouldBeOpen = hasSelectedTags || (isIndustryCategory && isDesktop());
    if (shouldBeOpen && !checkbox.checked) {
      checkbox.checked = true;
      const button = document.querySelector(`label[for="${checkbox.id}"]`);
      if (button) {
        button.setAttribute('aria-expanded', 'true');
      }
    } else if (!shouldBeOpen && checkbox.checked) {
      checkbox.checked = false;
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
      updateCategoriesVisibility();
      return;
    }
    
    const expandedCategories = JSON.parse(saved);
    expandedCategories.forEach(function (filterType) {
      const checkbox = document.getElementById(`filter-toggle-${filterType}`);
      if (checkbox && !checkbox.checked) {
        if (hasSelectedTagsInCategory(filterType)) {
          checkbox.checked = true;
          const button = document.querySelector(
            `label[for="filter-toggle-${filterType}"]`,
          );
          if (button) {
            button.setAttribute('aria-expanded', 'true');
          }
        }
      }
    });
    
    updateCategoriesVisibility();
  } catch (error) {
    // Fallback to default visibility logic if parsing fails
    console.warn('Failed to restore expanded categories:', error);
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

  if (filterLink.classList.contains('clear-all-link')) {
    sessionStorage.removeItem(EXPANDED_CATEGORIES_KEY);
  } else {
    saveExpandedCategories();
  }

  const href = filterLink.getAttribute('href');
  try {
    const url = new URL(href, window.location.origin);
    const newUrl = url.pathname + url.search + url.hash;

    history.pushState({ clientSideFilter: true, url: newUrl }, '', newUrl);
    window.location.reload();
  } catch {
    window.location.href = href;
  }
};

const handlePopState = function (event) {
  if (event.state?.clientSideFilter) {
    window.location.reload();
  }
};

const handleResize = function () {
  updateCategoriesVisibility();
};

export const initClientSideFiltering = function () {
  if (!document.querySelector('.cs_list')) {
    return;
  }

  restoreExpandedCategories();

  window.addEventListener('popstate', handlePopState);
  window.addEventListener('resize', handleResize);
  document.addEventListener('click', handleFilterClick);
};
