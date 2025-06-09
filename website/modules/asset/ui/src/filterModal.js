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
    this.modalBody = this.modal.querySelector('.filter-modal__body');
    this.openBtn = document.querySelector(openBtnSelector);
    this.closeBtn = this.modal.querySelector(closeBtnSelector);
    this.backdrop = this.modal.querySelector(backdropSelector);
    this.clearAll = document.querySelector(clearAllSelector);
    this.selectedTags = document.querySelector(selectedTagsSelector);
    this.tagsFilter = document.querySelector(tagsFilterSelector);

    this.originalParents = {};
    if (this.clearAll) {
      this.originalParents.clearAll = this.clearAll.parentNode;
    } else {
      this.originalParents.clearAll = null;
    }
    if (this.selectedTags) {
      this.originalParents.selectedTags = this.selectedTags.parentNode;
    } else {
      this.originalParents.selectedTags = null;
    }
    if (this.tagsFilter) {
      this.originalParents.tagsFilter = this.tagsFilter.parentNode;
    } else {
      this.originalParents.tagsFilter = null;
    }

    this.init();
  }

  open() {
    this.modalBody.innerHTML = '';

    this.modalBody.appendChild(createFilterHeader());

    if (this.clearAll) this.modalBody.appendChild(this.clearAll);
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
