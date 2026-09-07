/**
 * Case Studies filter rendering
 * Reflects the in-memory filter state onto the DOM: card visibility, the
 * items-found counters, the empty state, per-tag match counts, and the list of
 * currently selected tags.
 */

import { FILTER_TYPES, filterState, getSearchTerm } from './state';
import { cardMatchesFilters } from './matching';

// Update active class on tag items.
const updateTagActiveState = (filterType, tagValue, isActive) => {
  const tagItems = document.querySelectorAll(
    `.tag-item[data-filter-type="${filterType}"][data-tag-value="${tagValue}"]`,
  );
  tagItems.forEach((item) => {
    if (isActive) {
      item.classList.add('active');
      item.dataset.action = 'remove';
    } else {
      item.classList.remove('active');
      item.dataset.action = 'add';
    }
  });
};

// Open the filter categories that have active selections after a restore.
const openCategoriesForActiveFilters = () => {
  FILTER_TYPES.forEach((filterType) => {
    if (filterState[filterType].size === 0) {
      return;
    }
    const checkbox = document.getElementById(`filter-toggle-${filterType}`);
    if (checkbox && !checkbox.checked) {
      checkbox.checked = true;
      const button = document.querySelector(
        `label[for="filter-toggle-${filterType}"]`,
      );
      if (button) {
        button.setAttribute('aria-expanded', 'true');
      }
    }
  });
};

// Pluralize the items-found label without a ternary.
const getItemsFoundText = (visibleCount) => {
  let noun = 'Items';
  if (visibleCount === 1) {
    noun = 'Item';
  }
  return `${visibleCount} ${noun} Found`;
};

/*
 * Apply the current filter state and search term to the case study cards,
 * updating visibility, items-count text, and the empty-state block.
 */
const applyCardFiltering = () => {
  const cards = document.querySelectorAll('.cs_card');
  const searchTerm = getSearchTerm();
  let visibleCount = 0;

  cards.forEach((card) => {
    const matches = cardMatchesFilters(card, filterState, searchTerm);
    card.classList.toggle('is-hidden', !matches);
    if (matches) {
      visibleCount += 1;
    }
  });

  const itemsText = getItemsFoundText(visibleCount);
  const itemsCount = document.querySelector('.items-count');
  const itemsCountMobile = document.querySelector('.items-count__mobile');
  if (itemsCount) {
    itemsCount.textContent = itemsText;
  }
  if (itemsCountMobile) {
    itemsCountMobile.textContent = itemsText;
  }

  const emptyState = document.querySelector('.cs_empty-state');
  const csList = document.querySelector('.cs_list');
  const hasNoResults = visibleCount === 0;
  if (emptyState) {
    emptyState.classList.toggle('is-hidden', !hasNoResults);
  }
  if (csList) {
    csList.classList.toggle('cs_list--empty', hasNoResults);
  }
};

/*
 * Recalculate each tag's visible-match count (standard faceted-search recount):
 * for tag V in type T, count cards that would match if V were added to T's
 * active set (OR-combined with other active tags in T), still applying AND
 * against all other filter types' current selections.
 */
const recalculateTagCounts = () => {
  const cards = document.querySelectorAll('.cs_card');
  const searchTerm = getSearchTerm();

  document.querySelectorAll('.tag-item').forEach((tagItem) => {
    const { filterType, tagValue } = tagItem.dataset;
    if (!filterType || !tagValue || !filterState[filterType]) {
      return;
    }

    const tempState = {};
    FILTER_TYPES.forEach((type) => {
      tempState[type] = new Set(filterState[type]);
    });
    tempState[filterType].add(tagValue);

    let count = 0;
    cards.forEach((card) => {
      if (cardMatchesFilters(card, tempState, searchTerm)) {
        count += 1;
      }
    });

    const countSpan = tagItem.querySelector('.tag-count');
    if (countSpan) {
      countSpan.textContent = `[ ${count} ]`;
    }
  });
};

// Resolve a tag's human-readable label, falling back to its raw value.
const getTagLabel = (filterType, value) => {
  const tagItem = document.querySelector(
    `.tag-item[data-filter-type="${filterType}"][data-tag-value="${value}"]`,
  );
  if (tagItem) {
    return tagItem.dataset.tagLabel;
  }
  return value;
};

/*
 * Build a selected-tag chip using DOM APIs. Labels come from content-editable
 * data, so they are assigned as text nodes rather than interpolated markup.
 */
const buildSelectedTag = (filterType, value) => {
  const label = getTagLabel(filterType, value);

  const chip = document.createElement('li');
  chip.className = 'selected-tag';
  chip.append(document.createTextNode(label));

  const removeLink = document.createElement('a');
  removeLink.className = 'remove-tag';
  removeLink.setAttribute('href', '#');
  removeLink.dataset.filterType = filterType;
  removeLink.dataset.tagValue = value;
  removeLink.setAttribute('aria-label', `Remove ${filterType} tag ${label}`);

  const icon = document.createElement('img');
  icon.setAttribute('src', '/images/close.svg');
  icon.setAttribute('alt', 'Close Icon');

  removeLink.appendChild(icon);
  chip.appendChild(removeLink);
  return chip;
};

// Rebuild the selected-tags list and toggle the filter summary controls.
const updateSelectedTagsList = () => {
  const selectedTagsList = document.querySelector('.selected-tags-list');
  const selectedTagsContainer = document.querySelector('.selected-tags');

  if (!selectedTagsList || !selectedTagsContainer) {
    return;
  }

  selectedTagsList.replaceChildren();
  let hasActiveFilters = false;

  FILTER_TYPES.forEach((filterType) => {
    Array.from(filterState[filterType]).forEach((value) => {
      hasActiveFilters = true;
      selectedTagsList.appendChild(buildSelectedTag(filterType, value));
    });
  });

  const itemsCount = document.querySelector('.items-count');
  const itemsCountMobile = document.querySelector('.items-count__mobile');
  const clearAll = document.querySelector('.clear-all');

  [selectedTagsContainer, itemsCount, itemsCountMobile, clearAll].forEach(
    (el) => {
      if (!el) {
        return;
      }
      el.classList.toggle('is-hidden', !hasActiveFilters);
    },
  );
};

/*
 * Refresh everything that depends on the filter state. Called after any tag or
 * search change so the chips, cards, and counts stay in sync.
 */
const refreshFilterUi = () => {
  updateSelectedTagsList();
  applyCardFiltering();
  recalculateTagCounts();
};

export {
  applyCardFiltering,
  openCategoriesForActiveFilters,
  recalculateTagCounts,
  refreshFilterUi,
  updateSelectedTagsList,
  updateTagActiveState,
};
