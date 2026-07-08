import { FilterModal } from './filterModal';

function initFilterModal() {
  if (!document.querySelector('.cs_list')) {
    return;
  }

  window.caseStudiesFilterModal = new FilterModal({
    modalSelector: '#filter-modal',
    openBtnSelector: '.filters-cta',
    closeBtnSelector: '.filter-modal__button',
    backdropSelector: '.filter-modal__backdrop',
    clearAllSelector: '.clear-all',
    selectedTagsSelector: '.selected-tags',
    tagsFilterSelector: '.tags-filter',
  });
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initFilterModal);
} else {
  initFilterModal();
}

export { initFilterModal };
