document.addEventListener('DOMContentLoaded', function () {
  const trigger = document.getElementById('infinite-scroll-trigger');
  const grid = document.getElementById('case-studies-grid');
  let currentPage = 1;
  const totalPages = window.totalPages;
  let isLoading = false;

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
            const html = await response.text();
            const parser = new DOMParser();
            const doc = parser.parseFromString(html, 'text/html');

            const newCards = doc.querySelectorAll('.cs_card');
            newCards.forEach((card) => {
              grid.appendChild(card.cloneNode(true));
            });

            currentPage = nextPage;

            if (currentPage >= totalPages) {
              observer.unobserve(trigger);
            }
          } catch (error) {
            console.error('Error loading more case studies:', error);
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
