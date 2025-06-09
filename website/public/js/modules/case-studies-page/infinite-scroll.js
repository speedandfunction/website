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
              throw new Error('Network response was not ok');
            }
            const html = await response.text();
            const parser = new DOMParser();
            const doc = parser.parseFromString(html, 'text/html');

            const newCards = doc.querySelectorAll('.cs_card');
            if (newCards.length === 0) {
              throw new Error('No new case studies found');
            }

            newCards.forEach((card) => {
              grid.appendChild(card.cloneNode(true));
            });

            currentPage = nextPage;
            errorCount = 0;
            isLoading = false;

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

              let errorText = 'Unable to load more case studies. ';
              if (error.message === 'Network response was not ok') {
                errorText += 'Server error occurred. ';
              } else if (error.message === 'No new case studies found') {
                errorText += 'No more case studies available. ';
              }
              errorText += 'Please refresh the page to try again.';

              errorMessage.textContent = errorText;
              grid.parentNode.insertBefore(errorMessage, grid.nextSibling);
              isLoading = false;
              return;
            }

            setTimeout(() => {
              isLoading = false;
              currentPage--;
            }, 1000);
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
