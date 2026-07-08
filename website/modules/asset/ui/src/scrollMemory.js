/*
Scroll memory for the case studies index page.
Preserves the user's scroll position when navigating from a case study
show page back to the /cases listing.
*/

const CASES_PATH = '/cases';
/*
Use sessionStorage so the position survives full page reloads. The Barba
enter callback triggers window.location.reload() for pages without an
Apostrophe form (which includes the /cases listing), so an in-memory store
would be wiped before we could restore.
*/
const STORAGE_KEY = 'casesScrollPosition';

const isCasesListing = function (pathname) {
  return pathname === CASES_PATH;
};

// Save current scroll position for a given URL if it is the cases listing.
const saveScrollPosition = function (url) {
  try {
    const { pathname } = new URL(url, window.location.origin);
    if (isCasesListing(pathname)) {
      const position = window.scrollY || window.pageYOffset || 0;
      window.sessionStorage.setItem(STORAGE_KEY, String(position));
    }
  } catch (error) {
    // Ignore malformed URLs / unavailable storage
    // eslint-disable-next-line no-console
    console.error('Failed to save scroll position:', error);
  }
};

// Returns the stored scroll position for a URL, or null if none exists.
const getSavedScrollPosition = function (url) {
  try {
    const { pathname } = new URL(url, window.location.origin);
    if (!isCasesListing(pathname)) {
      return null;
    }
    const stored = window.sessionStorage.getItem(STORAGE_KEY);
    if (stored === null) {
      return null;
    }
    const parsed = parseInt(stored, 10);
    if (isNaN(parsed)) {
      return null;
    }
    return parsed;
  } catch (error) {
    // Ignore malformed URLs / unavailable storage
    // eslint-disable-next-line no-console
    console.error('Failed to get saved scroll position:', error);
    return null;
  }
};

// Clears the stored scroll position.
const clearSavedScrollPosition = function () {
  try {
    window.sessionStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    // Ignore unavailable storage
    // eslint-disable-next-line no-console
    console.error('Failed to clear saved scroll position:', error);
  }
};

export {
  saveScrollPosition,
  getSavedScrollPosition,
  clearSavedScrollPosition,
  isCasesListing,
};
