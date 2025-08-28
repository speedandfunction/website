// Client-side filtering for case studies with page reload

// No persistence needed for current requirement ("open if tag is selected").

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

const initializeCategoriesVisibility = function () {
  updateCategoriesVisibility();
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

  initializeCategoriesVisibility();

  window.addEventListener('popstate', handlePopState);
  window.addEventListener('resize', handleResize);
  document.addEventListener('click', handleFilterClick);
  
  // Keep aria-expanded in sync with checkbox state
  document.addEventListener('change', function (event) {
    const checkbox = event.target.closest('.filter-category__toggle');
    if (!checkbox) {
      return;
    }
    const button = document.querySelector(`label[for="${checkbox.id}"]`);
    if (button) {
      button.setAttribute('aria-expanded', checkbox.checked ? 'true' : 'false');
    }
  });
};
