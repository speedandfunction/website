// Checks if it's a case studies page
const isCaseStudiesPage = (path) => path && path.includes('/cases');
const hasQueryParams = () => window.location.search.length > 1;

// Adds styles to disable animations
const addNoAnimationStyles = () => {
  if (document.getElementById('barba-no-animations')) return;

  const style = document.createElement('style');
  style.id = 'barba-no-animations';
  style.textContent = `
    .bp-main,
    [data-barba='container'],
    html[data-case-studies-page] *,
    body[data-filter-change] .bp-main,
    body[data-filter-change] [data-barba='container'],
    body[data-no-transitions] .bp-main,
    body[data-no-transitions] [data-barba='container'] {
      opacity: 1 !important;
      transition: none !important;
      animation: none !important;
    }
  `;
  document.head.appendChild(style);
};

// Initialization for the case studies page
const initCaseStudiesPage = () => {
  if (isCaseStudiesPage(window.location.pathname) && hasQueryParams()) {
    document.body.classList.add('case-studies-page');
    document.body.setAttribute('data-no-transitions', 'true');
    document.documentElement.setAttribute('data-case-studies-page', 'true');
    addNoAnimationStyles();
  }
};

// Hook before page transition
const addBeforeLeaveHook = (barba) => {
  barba.hooks.beforeLeave(({ current, next }) => {
    const nextPath = next.url?.path || '';
    if (isCaseStudiesPage(nextPath)) {
      if (new URL(next.url.href).search.length > 1) {
        document.body.setAttribute('data-no-transitions', 'true');
        document.documentElement.setAttribute('data-case-studies-page', 'true');
        addNoAnimationStyles();
      }
    }
  });
};

// Hook after page transition
const addAfterHook = (barba) => {
  barba.hooks.after(({ next }) => {
    const nextPath = next.url?.path || '';
    if (
      isCaseStudiesPage(nextPath) &&
      new URL(next.url.href).search.length > 1
    ) {
      document.body.setAttribute('data-no-transitions', 'true');
      document.documentElement.setAttribute('data-case-studies-page', 'true');
      addNoAnimationStyles();
    } else {
      document.body.removeAttribute('data-no-transitions');
      document.body.classList.remove('case-studies-page');
      document.documentElement.removeAttribute('data-case-studies-page');

      const style = document.getElementById('barba-no-animations');
      if (style) style.remove();
    }
  });
};

// Page transition filter (filtering case studies with query changes)
const createPreventFunction = () => {
  return ({ current, next }) => {
    if (current && next) {
      const currentUrl = new URL(current.url.href);
      const nextUrl = new URL(next.url.href);

      const isSamePath = currentUrl.pathname === nextUrl.pathname;
      const isDifferentQuery = currentUrl.search !== nextUrl.search;
      const isCaseStudiesPath = isCaseStudiesPage(currentUrl.pathname);

      if (isSamePath && isDifferentQuery && isCaseStudiesPath) {
        addNoAnimationStyles();
        document.body.setAttribute('data-no-transitions', 'true');
        document.documentElement.setAttribute('data-case-studies-page', 'true');
        return true;
      }
    }
    return false;
  };
};

// Initializes Barba hooks
const addBarbaHooks = (barba) => {
  addBeforeLeaveHook(barba);
  addAfterHook(barba);
  return { preventFunc: createPreventFunction() };
};

export { initCaseStudiesPage, addBarbaHooks, isCaseStudiesPage };
