const OG_PROPERTIES = ['og:url', 'og:title', 'og:image'];

function syncMetaProperty(nextDoc, property) {
  const nextMeta = nextDoc.querySelector(
    `meta[property="${property}"]`,
  );
  if (!nextMeta) {
    return;
  }

  const content = nextMeta.getAttribute('content') || '';
  let currentMeta = document.head.querySelector(
    `meta[property="${property}"]`,
  );

  if (!currentMeta) {
    currentMeta = document.createElement('meta');
    currentMeta.setAttribute('property', property);
    document.head.appendChild(currentMeta);
  }

  currentMeta.setAttribute('content', content);
}

function syncCanonical(nextDoc) {
  const nextCanonical = nextDoc.querySelector('link[rel="canonical"]');
  let currentCanonical = document.head.querySelector(
    'link[rel="canonical"]',
  );

  if (!nextCanonical) {
    if (currentCanonical) {
      currentCanonical.remove();
    }
    return;
  }

  const href = nextCanonical.getAttribute('href') || '';
  if (!currentCanonical) {
    currentCanonical = document.createElement('link');
    currentCanonical.setAttribute('rel', 'canonical');
    document.head.appendChild(currentCanonical);
  }

  currentCanonical.setAttribute('href', href);
}

function syncRobots(nextDoc) {
  const nextRobots = nextDoc.querySelector('meta[name="robots"]');
  let currentRobots = document.head.querySelector(
    'meta[name="robots"]',
  );

  if (!nextRobots) {
    if (currentRobots) {
      currentRobots.remove();
    }
    return;
  }

  const content = nextRobots.getAttribute('content') || '';
  if (!currentRobots) {
    currentRobots = document.createElement('meta');
    currentRobots.setAttribute('name', 'robots');
    document.head.appendChild(currentRobots);
  }

  currentRobots.setAttribute('content', content);
}

/*
 * Barba only swaps [data-barba="container"], so title and social meta stay
 * on the first page unless we copy them from the fetched next document.
 */
function syncDocumentHead(nextHtml) {
  if (!nextHtml) {
    return;
  }

  const nextDoc = new DOMParser().parseFromString(
    nextHtml,
    'text/html',
  );

  if (nextDoc.title) {
    document.title = nextDoc.title;
  }

  OG_PROPERTIES.forEach((property) => {
    syncMetaProperty(nextDoc, property);
  });
  syncCanonical(nextDoc);
  syncRobots(nextDoc);
}

export { syncDocumentHead };
