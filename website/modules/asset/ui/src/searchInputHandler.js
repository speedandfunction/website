const removePreviousHandler = (input) => {
  if (input.tagSearchHandler) {
    input.removeEventListener('input', input.tagSearchHandler);
  }
};

const getFilterValue = (input) => {
  return input.value.trim().toLowerCase();
};

const getTagItems = (container, tagSelector) => {
  return container.querySelectorAll(tagSelector);
};

const filterTagItems = (tagItems, filterValue, getTagLabel) => {
  tagItems.forEach((tagItem) => {
    const tagLabel = getTagLabel(tagItem);
    if (tagLabel.includes(filterValue)) {
      tagItem.style.display = '';
    } else {
      tagItem.style.display = 'none';
    }
  });
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
  filterTagItems(tagItems, filterValue, getTagLabel);
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
