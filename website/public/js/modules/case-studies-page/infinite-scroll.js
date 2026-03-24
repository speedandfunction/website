document.addEventListener('DOMContentLoaded', function () {
  const trigger = document.getElementById('infinite-scroll-trigger');
  const grid = document.getElementById('case-studies-grid');
  let currentPage = 1;
  const totalPages = window.totalPages;
  let isLoading = false;
  let errorCount = 0;
  const MAX_RETRIES = 3;
  const existingCardUrls = new Set();

  function trackExistingCards() {
    const cards = grid.querySelectorAll('.cs_card');
    cards.forEach((card) => {
      if (card.href) {
        existingCardUrls.add(card.href);
      }
    });
  }

  function hasActiveSidebarFilters(url) {
    const filterParams = [
      'industry[]',
      'industry[0]',
      'stack[]',
      'stack[0]',
      'caseStudyType[]',
      'caseStudyType[0]',
      'partner[]',
      'partner[0]',
    ];
    return filterParams.some((param) => url.searchParams.has(param));
  }

  async function fetchWithFallback(url) {
    let response = await fetch(url.toString());
    if (
      response.status === 404 &&
      url.searchParams.has('search') &&
      hasActiveSidebarFilters(url)
    ) {
      const fallbackUrl = new URL(url.toString());
      fallbackUrl.searchParams.delete('search');
      response = await fetch(fallbackUrl.toString());
    }
    return response;
  }

  function stopInfiniteScroll(observer, trigger) {
    observer.unobserve(trigger);
    isLoading = false;
  }

  async function loadNextPage(observer, trigger) {
    const nextPage = currentPage + 1;
    const url = new URL(window.location.href);
    url.searchParams.set('page', nextPage);
    try {
      const response = await fetchWithFallback(url);
      if (!response.ok) {
        if (response.status === 404) {
          stopInfiniteScroll(observer, trigger);
          return;
        }
        throw new Error('Network response was not ok');
      }
      const html = await response.text();
      const parser = new DOMParser();
      const doc = parser.parseFromString(html, 'text/html');
      const newCards = doc.querySelectorAll('.cs_card');
      if (newCards.length === 0) {
        stopInfiniteScroll(observer, trigger);
        return;
      }
      newCards.forEach((card) => {
        if (!card.href || existingCardUrls.has(card.href)) {
          return;
        }
        existingCardUrls.add(card.href);
        grid.appendChild(card.cloneNode(true));
      });
      currentPage = nextPage;
      errorCount = 0;
      isLoading = false;
      if (currentPage >= totalPages) {
        observer.unobserve(trigger);
      }
    } catch (error) {
      handleLoadError(error, observer, trigger);
    }
  }

  function displayErrorMessage(error) {
    const errorMessage = document.createElement('div');
    errorMessage.style.cssText =
      'text-align: center; padding: 20px; color: #666; font-size: 14px;';
    let errorText = 'Unable to load more case studies. ';
    if (error.message === 'Network response was not ok') {
      errorText += 'Server error occurred. ';
    } else if (error.message === 'No new case studies found') {
      errorText += 'No more case studies available. ';
    }
    errorText += 'Please refresh the page to try again.';
    errorMessage.textContent = errorText;
    grid.parentNode.insertBefore(errorMessage, grid.nextSibling);
  }

  function handleLoadError(error, observer, trigger) {
    errorCount++;
    if (errorCount >= MAX_RETRIES) {
      stopInfiniteScroll(observer, trigger);
      displayErrorMessage(error);
      return;
    }
    setTimeout(() => {
      isLoading = false;
    }, 1000);
  }

  if (trigger && grid) {
    trackExistingCards();
    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (!entry.isIntersecting || isLoading || currentPage >= totalPages) {
          return;
        }
        isLoading = true;
        loadNextPage(observer, trigger);
      },
      {
        rootMargin: '0px 0px 200px 0px',
      },
    );
    observer.observe(trigger);
  }
});
