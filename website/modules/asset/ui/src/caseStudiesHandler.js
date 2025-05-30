// Utility functions
const isCaseStudiesPage = (path) => path?.includes('/cases');
const hasQueryParams = () => window.location.search.length > 1;

// URL utilities
const createUrlFromHref = (href) => {
  try {
    return new URL(href);
  } catch {
    return null;
  }
};

const hasSearchParams = (url) => url && url.search.length > 1;

// Animation management
const disablePageAnimations = () => {
  document.body.classList.add('no-page-animations');
};

const enablePageAnimations = () => {
  document.body.classList.remove('no-page-animations');
};

// Navigation state detection
const isFilteringCaseStudies = (currentUrl, nextUrl) => {
  if (!currentUrl || !nextUrl) return false;

  const isSamePath = currentUrl.pathname === nextUrl.pathname;
  const isDifferentQuery = currentUrl.search !== nextUrl.search;
  const isCaseStudiesPath = isCaseStudiesPage(currentUrl.pathname);
  const hasNextQuery = hasSearchParams(nextUrl);

  return isSamePath && isDifferentQuery && isCaseStudiesPath && hasNextQuery;
};

const isClearingFilters = (currentUrl, nextUrl) => {
  if (!currentUrl || !nextUrl) return false;

  const isSamePath = currentUrl.pathname === nextUrl.pathname;
  const isCaseStudiesPath = isCaseStudiesPage(currentUrl.pathname);
  const hadParams = hasSearchParams(currentUrl);
  const hasNoParams = !hasSearchParams(nextUrl);

  return isSamePath && isCaseStudiesPath && hadParams && hasNoParams;
};

// Scroll management
const scrollToTop = () => {
  window.scrollTo({ top: 0, behavior: 'auto' });
};

const scrollToFilterSection = () => {
  requestAnimationFrame(() => {
    const filterSection = document.querySelector('.cs_filter-info');
    if (filterSection) {
      filterSection.scrollIntoView({ behavior: 'smooth' });
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  });
};

// Page initialization
const initCaseStudiesPage = () => {
  if (isCaseStudiesPage(window.location.pathname) && hasQueryParams()) {
    disablePageAnimations();
  }
};

// Barba hook handlers
const handleBeforeLeave = ({ current, next }) => {
  const nextPath = next.url?.path || '';
  const nextUrl = createUrlFromHref(next.url.href);

  if (isCaseStudiesPage(nextPath) && hasSearchParams(nextUrl)) {
    disablePageAnimations();
  }
};

const handleBeforeEnter = ({ current, next }) => {
  let currentUrl = null;
  if (current?.url) {
    currentUrl = createUrlFromHref(current.url.href);
  }

  const nextUrl = createUrlFromHref(next.url.href);
  const nextPath = next.url?.path || '';

  const shouldKeepScroll =
    (isCaseStudiesPage(nextPath) && hasSearchParams(nextUrl)) ||
    isClearingFilters(currentUrl, nextUrl);

  if (!shouldKeepScroll) {
    scrollToTop();
  }
};

const handleAfterTransition = ({ current, next }) => {
  let currentUrl = null;
  if (current?.url) {
    currentUrl = createUrlFromHref(current.url.href);
  }

  const nextUrl = createUrlFromHref(next.url.href);
  const nextPath = next.url?.path || '';

  if (isCaseStudiesPage(nextPath) && hasSearchParams(nextUrl)) {
    return;
  }

  if (isClearingFilters(currentUrl, nextUrl)) {
    enablePageAnimations();
    return;
  }

  scrollToTop();
  enablePageAnimations();
};

const handlePreventTransition = ({ current, next }) => {
  if (!current || !next) return false;

  const currentUrl = createUrlFromHref(current.url.href);
  const nextUrl = createUrlFromHref(next.url.href);

  if (isFilteringCaseStudies(currentUrl, nextUrl)) {
    scrollToFilterSection();
    return true;
  }

  return false;
};

// Hook registration
const registerBeforeLeaveHook = (barba) => {
  barba.hooks.beforeLeave(handleBeforeLeave);
};

const registerBeforeEnterHook = (barba) => {
  barba.hooks.beforeEnter(handleBeforeEnter);
};

const registerAfterHook = (barba) => {
  barba.hooks.after(handleAfterTransition);
};

const createPreventFunction = () => handlePreventTransition;

// Main initialization
const addBarbaHooks = (barba) => {
  registerBeforeLeaveHook(barba);
  registerBeforeEnterHook(barba);
  registerAfterHook(barba);

  return {
    preventFunc: createPreventFunction(),
  };
};

export { initCaseStudiesPage, addBarbaHooks, isCaseStudiesPage };
