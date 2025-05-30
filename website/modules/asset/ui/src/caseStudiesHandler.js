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
    addNoAnimationStyles();
  }
};

// Hook before page transition
const addBeforeLeaveHook = (barba) => {
  barba.hooks.beforeLeave(({ current, next }) => {
    const nextPath = next.url?.path || '';
    if (isCaseStudiesPage(nextPath)) {
      if (new URL(next.url.href).search.length > 1) {
        addNoAnimationStyles();
        // Не скролимо тут
      }
    }
  });
};

const addBeforeEnterHook = (barba) => {
  barba.hooks.beforeEnter(({ next }) => {
    const nextPath = next.url?.path || '';
    const nextUrl = new URL(next.url.href);

    if (!(isCaseStudiesPage(nextPath) && nextUrl.search.length > 1)) {
      // Скролимо одразу, ще до рендеру
      window.scrollTo({ top: 0, behavior: 'auto' });
    }
  });
};

// Hook after page transition
const addAfterHook = (barba) => {
  barba.hooks.after(({ next }) => {
    const nextPath = next.url?.path || '';
    const nextUrl = new URL(next.url.href);

    if (isCaseStudiesPage(nextPath) && nextUrl.search.length > 1) {
      /*
       * If (isCaseStudiesPage(nextPath)) {
       * Якщо це still /cases з query — не скролимо
       */
    } else {
      window.scrollTo({ top: 0, behavior: 'auto' });

      const style = document.getElementById('barba-no-animations');
      if (style) style.remove();
    }
  });
};

// Page transition filter (filtering case studies with query changes)
const createPreventFunction = () => {
  console.log('🧪 preventFunc called');
  return ({ current, next }) => {
    if (current && next) {
      const currentUrl = new URL(current.url.href);
      const nextUrl = new URL(next.url.href);

      const isSamePath = currentUrl.pathname === nextUrl.pathname;
      const isDifferentQuery = currentUrl.search !== nextUrl.search;
      const isCaseStudiesPath = isCaseStudiesPage(currentUrl.pathname);

      const hasNextQuery = nextUrl.search.length > 1; // ← ось ця перевірка

      if (isSamePath && isDifferentQuery && isCaseStudiesPath && hasNextQuery) {
        // Прокрутка тільки якщо є фільтри
        requestAnimationFrame(() => {
          const filterSection = document.querySelector('.cs_filter-info');
          if (filterSection) {
            filterSection.scrollIntoView({ behavior: 'smooth' });
          } else {
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }
        });

        return true; // DOM не оновлюється — внутрішній фільтр
      }
    }
    return false;
  };
};

// Initializes Barba hooks
const addBarbaHooks = (barba) => {
  addBeforeLeaveHook(barba);
  addBeforeEnterHook(barba);
  addAfterHook(barba);
  return { preventFunc: createPreventFunction() };
};

export { initCaseStudiesPage, addBarbaHooks, isCaseStudiesPage };
