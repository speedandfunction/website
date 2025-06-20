// Client-side filtering for case studies with page reload

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
    // Fallback to default navigation if URL construction fails
    window.location.href = href;
  }
};

const handlePopState = function (event) {
  if (event.state?.clientSideFilter) {
    window.location.reload();
  }
};

export const initClientSideFiltering = function () {
  if (!document.querySelector('.cs_list')) {
    return;
  }

  window.addEventListener('popstate', handlePopState);
  document.addEventListener('click', handleFilterClick);
};
