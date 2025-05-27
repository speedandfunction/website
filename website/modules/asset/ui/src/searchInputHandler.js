const removePreviousHandler = (input) => {
  if (input.tagSearchHandler) {
    input.removeEventListener('input', input.tagSearchHandler);
  }
};

const toggleNoTagsMessage = (
  tagItems,
  hasVisible,
  parentSelector = '.filter-section',
) => {
  const parent = tagItems[0]?.closest(parentSelector);
  const messageEl = parent?.querySelector('.no-tags-message');
  if (messageEl) {
    if (hasVisible) {
      messageEl.style.display = 'none';
    } else {
      messageEl.style.display = 'block';
    }
  }
};

const getFilterValue = (input) => {
  return input.value.trim().toLowerCase();
};

const getTagItems = (container, tagSelector) => {
  return container.querySelectorAll(tagSelector);
};

const filterTagItems = (tagItems, filterValue, getTagLabel, parentSelector) => {
  let hasVisible = false;

  tagItems.forEach((tagItem) => {
    const tagLabel = getTagLabel(tagItem);
    if (tagLabel.includes(filterValue)) {
      tagItem.style.display = '';
      hasVisible = true;
    } else {
      tagItem.style.display = 'none';
    }
  });

  toggleNoTagsMessage(tagItems, hasVisible, parentSelector);
};

const handleTagSearch = (
  input,
  containerSelector,
  tagSelector,
  getTagLabel,
) => {
  const filterValue = getFilterValue(input);
  const container = input.closest(containerSelector);
  if (!container) return;

  const tagItems = getTagItems(container, tagSelector);
  filterTagItems(tagItems, filterValue, getTagLabel, containerSelector);
};

const createTagSearchHandler = (
  input,
  containerSelector,
  tagSelector,
  getTagLabel,
) => {
  return () =>
    handleTagSearch(input, containerSelector, tagSelector, getTagLabel);
};

export const setupTagSearchForInput = (
  input,
  { containerSelector, tagSelector, getTagLabel },
) => {
  removePreviousHandler(input);
  const handler = createTagSearchHandler(
    input,
    containerSelector,
    tagSelector,
    getTagLabel,
  );
  input.tagSearchHandler = handler;
  input.addEventListener('input', handler);
};
