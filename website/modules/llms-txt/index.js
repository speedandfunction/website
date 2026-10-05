const MAX_PIECES_PER_TYPE = 100;

const cleanText = (value) =>
  String(value || '')
    .replace(/[\n\r]+/gu, ' ')
    .trim();

const resolveBaseUrl = (apos, req) => {
  try {
    const { origin } = new URL(apos.baseUrl || '');
    if (origin && origin !== 'null') {
      return origin;
    }
  } catch (error) {
    apos.util.warn('Invalid baseUrl for llms.txt route', error);
  }
  return `${req.protocol}://${req.get('host')}`;
};

const toAbsolute = (url, baseUrl) => {
  if (url && url.startsWith('/')) {
    return baseUrl + url;
  }
  return url;
};

const formatEntry = (doc, baseUrl) => {
  // eslint-disable-next-line no-underscore-dangle
  const url = toAbsolute(doc._url || doc.slug, baseUrl);
  const title = cleanText(doc.title);
  const description = cleanText(doc.seoDescription);
  let line = `- [${title}](${url})`;
  if (description) {
    line += `: ${description}`;
  }
  return line;
};

const collectPages = async (apos, req, baseUrl) => {
  const pages = await apos.page
    .find(req, {})
    .sort({ level: 1, rank: 1 })
    .toArray();
  return pages
    .filter((page) => !page.visibility || page.visibility === 'public')
    .map((page) => formatEntry(page, baseUrl));
};

const pieceManagers = (apos) =>
  Object.values(apos.doc.managers).filter(
    (manager) =>
      apos.instanceOf(manager, '@apostrophecms/piece-type') &&
      // eslint-disable-next-line no-underscore-dangle
      !manager.__meta.name.startsWith('@apostrophecms/'),
  );

const pieceHeading = (manager) =>
  cleanText(manager.options.pluralLabel) ||
  cleanText(manager.options.label) ||
  'Content';

const collectPieceType = async (apos, req, manager, baseUrl) => {
  const pieces = await manager
    .find(req, {})
    .limit(MAX_PIECES_PER_TYPE)
    .toArray();
  const lines = pieces
    // eslint-disable-next-line no-underscore-dangle
    .filter((doc) => doc._url)
    .sort((left, right) =>
      cleanText(left.title).localeCompare(cleanText(right.title)),
    )
    .map((doc) => formatEntry(doc, baseUrl));
  if (!lines.length) {
    return [];
  }
  return [`## ${pieceHeading(manager)}`, '', ...lines, ''];
};

const collectPieces = async (apos, req, baseUrl) => {
  const groups = await Promise.all(
    pieceManagers(apos).map((manager) =>
      collectPieceType(apos, req, manager, baseUrl),
    ),
  );
  return groups.flat();
};

const buildHeader = (globalDoc, baseUrl) => {
  const name = cleanText(globalDoc && globalDoc.seoSiteName) || baseUrl;
  const lines = [`# ${name}`, ''];
  const description = cleanText(globalDoc && globalDoc.seoSiteDescription);
  if (description) {
    lines.push(`> ${description}`, '');
  }
  return lines;
};

module.exports = {
  routes(self) {
    return {
      get: {
        '/llms.txt': async (req, res) => {
          try {
            const baseUrl = resolveBaseUrl(self.apos, req);
            const globalDoc = await self.apos.doc
              .find(req, { type: '@apostrophecms/global' })
              .toObject();
            if (
              globalDoc &&
              globalDoc.llmsCustomText &&
              globalDoc.llmsCustomText.trim()
            ) {
              return res.type('text/plain').send(globalDoc.llmsCustomText);
            }
            const lines = [...buildHeader(globalDoc, baseUrl)];
            const pageLines = await collectPages(self.apos, req, baseUrl);
            if (pageLines.length) {
              lines.push('## Pages', '', ...pageLines, '');
            }
            lines.push(...(await collectPieces(self.apos, req, baseUrl)));
            return res.type('text/plain').send(lines.join('\n'));
          } catch (error) {
            self.apos.util.error('Failed to generate llms.txt', error);
            return res
              .status(500)
              .type('text/plain')
              .send('Error generating llms.txt');
          }
        },
      },
    };
  },
};
