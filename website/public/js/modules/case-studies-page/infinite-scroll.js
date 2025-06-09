document.addEventListener('DOMContentLoaded', function () {
  const trigger = document.getElementById('infinite-scroll-trigger');
  const grid = document.getElementById('case-studies-grid');
  let currentPage = 1;
  const totalPages = window.totalPages;
  let isLoading = false;
  let errorCount = 0;
  const MAX_RETRIES = 3;

  if (trigger && grid) {
    const observer = new IntersectionObserver(
      async (entries) => {
        const entry = entries[0];
        if (entry.isIntersecting && !isLoading && currentPage < totalPages) {
          isLoading = true;
          const nextPage = currentPage + 1;
          const url = new URL(window.location.href);
          url.searchParams.set('page', nextPage);

          try {
            const response = await fetch(url.toString());
            if (!response.ok) {
              throw new Error(`HTTP error! status: ${response.status}`);
            }
            const html = await response.text();
            const parser = new DOMParser();
            const doc = parser.parseFromString(html, 'text/html');

            const newCards = doc.querySelectorAll('.cs_card');
            newCards.forEach((card) => {
              grid.appendChild(card.cloneNode(true));
            });

            currentPage = nextPage;
            errorCount = 0;

            if (currentPage >= totalPages) {
              observer.unobserve(trigger);
            }
          } catch (error) {
            errorCount++;

            if (errorCount >= MAX_RETRIES) {
              observer.unobserve(trigger);

              const errorMessage = document.createElement('div');
              errorMessage.style.cssText =
                'text-align: center; padding: 20px; color: #666; font-size: 14px;';
              errorMessage.textContent =
                'Unable to load more case studies. Please refresh the page to try again.';
              grid.parentNode.insertBefore(errorMessage, grid.nextSibling);
              return;
            }

            setTimeout(() => {
              isLoading = false;
              currentPage--;
            }, 1000);
          } finally {
            isLoading = false;
          }
        }
      },
      {
        rootMargin: '0px 0px 200px 0px',
      },
    );

    observer.observe(trigger);
  }
});
