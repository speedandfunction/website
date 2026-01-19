/*
 * TagFilterDOM
 * Handles querying DOM elements, toggling messages, updating styles.
 */

const getTagLabel = function (tagItem) {
  if (tagItem.dataset.label) {
    return tagItem.dataset.label.toLowerCase();
  }
  return '';
};

const showTagItem = function (tagItem) {
  tagItem.style.display = '';
  tagItem.classList.remove('tag-item--hidden');
};

const hideTagItem = function (tagItem) {
  tagItem.style.display = 'none';
};

const toggleNoTagsMessage = function (container, hasVisible) {
  const messageEl = container.querySelector('.no-tags-message');
  if (messageEl) {
    if (hasVisible) {
      messageEl.style.display = 'none';
    } else {
      messageEl.style.display = 'block';
    }
  }
};

/*
 * TagFilterLogic
 * Implements filtering decisions — determines which tags should be shown.
 */

const filterTags = function (
  tagItems,
  filterValue,
  getLabel,
  defaultVisibleCount,
  isSearchActive,
) {
  let hasVisible = false;

  tagItems.forEach(function (tag, index) {
    if (isSearchActive) {
      const match = getLabel(tag).includes(filterValue);
      if (match) {
        showTagItem(tag);
        hasVisible = true;
      } else {
        hideTagItem(tag);
      }
    } else if (index < defaultVisibleCount) {
      showTagItem(tag);
      hasVisible = true;
    } else {
      tag.style.display = '';
      tag.classList.add('tag-item--hidden');
    }
  });

  return hasVisible;
};

/*
 * TagFilterHandler
 * Connects the logic to the DOM, attaches listeners, etc.
 */

const removePreviousHandler = function (input) {
  if (input.tagSearchHandler) {
    input.removeEventListener('input', input.tagSearchHandler);
  }
};

const getDefaultVisibleCount = function (container) {
  let defaultVisibleCount = 5;
  if (container) {
    const parsed = parseInt(container.dataset.defaultVisibleTags, 10);
    if (parsed > 0) {
      defaultVisibleCount = parsed;
    }
  }
  return defaultVisibleCount;
};

const countVisibleItems = function (container) {
  const tagItems = container.querySelectorAll('.tag-item');
  let visibleCount = 0;
  tagItems.forEach(function (item) {
    if (
      item.style.display !== 'none' &&
      !item.classList.contains('tag-item--hidden')
    ) {
      visibleCount += 1;
    }
  });
  return visibleCount;
};

const handleSearchActiveState = function (
  showMoreButton,
  container,
  defaultVisibleCount,
) {
  const visibleCount = countVisibleItems(container);
  if (visibleCount <= defaultVisibleCount) {
    showMoreButton.style.display = 'none';
  } else {
    showMoreButton.style.display = 'flex';
    const textElement = showMoreButton.querySelector('.tags__show-more--text');
    if (textElement) {
      showMoreButton.classList.add('tags__show-more--expanded');
      textElement.textContent = 'Show less';
    }
  }
};

const handleSearchInactiveState = function (
  showMoreButton,
  totalTags,
  defaultVisibleCount,
) {
  const textElement = showMoreButton.querySelector('.tags__show-more--text');
  if (textElement) {
    showMoreButton.classList.remove('tags__show-more--expanded');
    textElement.textContent = 'Show more';
  }
  if (totalTags > defaultVisibleCount) {
    showMoreButton.style.display = 'flex';
  } else {
    showMoreButton.style.display = 'none';
  }
};

const toggleShowMoreButtonVisibility = function (
  container,
  isSearchActive,
  totalTags,
  defaultVisibleCount,
) {
  const showMoreButton = container.querySelector('.tags__show-more');
  if (!showMoreButton) return;

  if (isSearchActive) {
    handleSearchActiveState(showMoreButton, container, defaultVisibleCount);
  } else {
    handleSearchInactiveState(showMoreButton, totalTags, defaultVisibleCount);
  }
};

const setupTagSearchForInput = function (input, options) {
  const {
    containerSelector,
    tagSelector,
    getTagLabel: getTagLabelFn = getTagLabel,
  } = options;

  removePreviousHandler(input);

  const handler = function () {
    const filterValue = input.value.trim().toLowerCase();
    const container = input.closest(containerSelector);
    if (!container) return;

    const defaultVisibleCount = getDefaultVisibleCount(container);
    const tagItems = container.querySelectorAll(tagSelector);
    const isSearchActive = filterValue.length > 0;
    const hasVisible = filterTags(
      tagItems,
      filterValue,
      getTagLabelFn,
      defaultVisibleCount,
      isSearchActive,
    );
    toggleNoTagsMessage(container, hasVisible);

    toggleShowMoreButtonVisibility(
      container,
      isSearchActive,
      tagItems.length,
      defaultVisibleCount,
    );
  };

  input.tagSearchHandler = handler;
  input.addEventListener('input', handler);
};

export { setupTagSearchForInput };
