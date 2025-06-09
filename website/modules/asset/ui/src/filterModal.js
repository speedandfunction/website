/**
 * FilterModal for Case Studies mobile filter modal
 */

/**
 * Creates a "Filter" header with a line for the modal window
 * @returns {HTMLHeadingElement}
 */
export const createFilterHeader = function () {
  const header = document.createElement('h2');
  header.className = 'filter-header';
  header.innerHTML = `Filter`;
  return header;
};

/**
 * Class for managing the filter modal window
 */
export class FilterModal {
  constructor({
    modalSelector,
    openBtnSelector,
    closeBtnSelector,
    backdropSelector,
    clearAllSelector,
    selectedTagsSelector,
    tagsFilterSelector,
  }) {
    this.modal = document.querySelector(modalSelector);
    if (!this.modal) {
      throw new Error(`Modal element not found: ${modalSelector}`);
    }
    this.modalBody = this.modal.querySelector('.filter-modal__body');
    if (!this.modalBody) {
      throw new Error('Modal body element not found');
    }
    this.openBtn = document.querySelector(openBtnSelector);
    if (!this.openBtn) {
      throw new Error(`Open button not found: ${openBtnSelector}`);
    }
    this.closeBtn = this.modal.querySelector(closeBtnSelector);
    if (!this.closeBtn) {
      throw new Error(`Close button not found: ${closeBtnSelector}`);
    }
    this.backdrop = this.modal.querySelector(backdropSelector);
    if (!this.backdrop) {
      throw new Error(`Backdrop element not found: ${backdropSelector}`);
    }
    this.clearAll = document.querySelector(clearAllSelector);
    this.selectedTags = document.querySelector(selectedTagsSelector);
    this.tagsFilter = document.querySelector(tagsFilterSelector);

    this.originalParents = this.initializeOriginalParents();
    this.init();
  }

  initializeOriginalParents() {
    return {
      clearAll: this.clearAll?.parentNode || null,
      selectedTags: this.selectedTags?.parentNode || null,
      tagsFilter: this.tagsFilter?.parentNode || null,
    };
  }

  open() {
    this.modalBody.innerHTML = '';
    this.modalBody.appendChild(createFilterHeader());

    const topRow = document.createElement('div');
    topRow.className = 'filter-modal__top-row';

    const itemsCount = document.querySelector('.items-count__mobile');
    if (itemsCount) {
      topRow.appendChild(itemsCount);
      itemsCount.classList.add('is-visible');
    }

    if (this.clearAll) {
      topRow.appendChild(this.clearAll);
    }

    this.modalBody.appendChild(topRow);

    if (this.selectedTags) this.modalBody.appendChild(this.selectedTags);
    if (this.tagsFilter) this.modalBody.appendChild(this.tagsFilter);
    this.modal.classList.add('active');
  }

  close() {
    if (this.clearAll && this.originalParents.clearAll) {
      this.originalParents.clearAll.appendChild(this.clearAll);
    }
    if (this.selectedTags && this.originalParents.selectedTags) {
      this.originalParents.selectedTags.appendChild(this.selectedTags);
    }
    if (this.tagsFilter && this.originalParents.tagsFilter) {
      this.originalParents.tagsFilter.appendChild(this.tagsFilter);
    }

    const itemsCount = this.modalBody.querySelector('.items-count__mobile');
    if (itemsCount) {
      itemsCount.classList.remove('is-visible');
      const filterInfo = document.querySelector('.cs_filter-info');
      if (filterInfo) filterInfo.appendChild(itemsCount);
    }
    this.modal.classList.remove('active');
    this.modalBody.innerHTML = '';
  }

  init() {
    if (this.openBtn) this.openBtn.addEventListener('click', () => this.open());
    if (this.closeBtn)
      this.closeBtn.addEventListener('click', () => this.close());
    if (this.backdrop)
      this.backdrop.addEventListener('click', () => this.close());
    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape' && this.modal.classList.contains('active')) {
        this.close();
      }
    });
  }
}
