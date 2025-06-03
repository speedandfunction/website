// FilterHandler class

class FilterHandler {
  constructor(options = {}) {
    this.shouldScrollToFilter = false;
    this.maxScrollAttempts = options.maxScrollAttempts || 10;
    this.filterElementId = options.filterElementId || 'filter';
  }

  scrollToFilterAnchor() {
    const filterElement = document.getElementById(this.filterElementId);
    if (filterElement) {
      filterElement.scrollIntoView({ behavior: 'smooth' });
      return true;
    }
    return false;
  }

  static ensureFilterHashInUrl() {
    const url = new URL(window.location.href);
    url.hash = '#filter';
    window.history.replaceState({}, '', url.toString());
  }

  handleFilterScrolling(hasFilterAnchor) {
    if (!hasFilterAnchor) {
      this.shouldScrollToFilter = false;
      return;
    }

    FilterHandler.ensureFilterHashInUrl();

    const attemptScroll = (attempts = 0) => {
      if (attempts > this.maxScrollAttempts) {
        this.shouldScrollToFilter = false;
        return;
      }

      requestAnimationFrame(() => {
        if (this.scrollToFilterAnchor()) {
          this.shouldScrollToFilter = false;
        } else {
          attemptScroll(attempts + 1);
        }
      });
    };

    attemptScroll();
  }

  shouldHandleFilterNavigation(targetUrl) {
    return targetUrl.includes('#filter') || this.shouldScrollToFilter;
  }

  resetFilterState() {
    this.shouldScrollToFilter = false;
  }

  setShouldScrollToFilter(value) {
    this.shouldScrollToFilter = value;
  }

  getShouldScrollToFilter() {
    return this.shouldScrollToFilter;
  }

  createEnhancedBarbaHandler(barbaEnterCallback) {
    return (data) => {
      const targetUrl = data.next.url.href;
      const hasFilterAnchor = this.shouldHandleFilterNavigation(targetUrl);

      if (hasFilterAnchor) {
        this.handleFilterScrolling(hasFilterAnchor);
      } else {
        this.resetFilterState();
      }

      return barbaEnterCallback(data, hasFilterAnchor);
    };
  }
}

// Create default instance
const defaultFilterHandler = new FilterHandler();

// Main filter handler: Coordinate all filter functionality
const enhanceBarbaWithFilterHandling = function (barbaEnterCallback) {
  return defaultFilterHandler.createEnhancedBarbaHandler(barbaEnterCallback);
};

// Backward compatibility functions that use the default instance
const shouldHandleFilterNavigation = function (targetUrl) {
  return defaultFilterHandler.shouldHandleFilterNavigation(targetUrl);
};

const scrollToFilterAnchor = function () {
  return defaultFilterHandler.scrollToFilterAnchor();
};

const resetFilterState = function () {
  return defaultFilterHandler.resetFilterState();
};

const setShouldScrollToFilter = function (value) {
  return defaultFilterHandler.setShouldScrollToFilter(value);
};

// Public API
export {
  FilterHandler,
  enhanceBarbaWithFilterHandling,
  shouldHandleFilterNavigation,
  scrollToFilterAnchor,
  resetFilterState,
  setShouldScrollToFilter,
  defaultFilterHandler,
};
