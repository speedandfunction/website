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

const filterTags = function (tagItems, filterValue, getLabel) {
  let hasVisible = false;

  tagItems.forEach(function (tag) {
    const match = getLabel(tag).includes(filterValue);
    if (match) {
      showTagItem(tag);
      hasVisible = true;
    } else {
      hideTagItem(tag);
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

    const tagItems = container.querySelectorAll(tagSelector);
    const hasVisible = filterTags(tagItems, filterValue, getTagLabelFn);
    toggleNoTagsMessage(container, hasVisible);
  };

  input.tagSearchHandler = handler;
  input.addEventListener('input', handler);
};

export { setupTagSearchForInput };
