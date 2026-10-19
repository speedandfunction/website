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
  const name = cleanText(globalDoc?.seoSiteName) || 'Speed & Function';
  const description =
    cleanText(globalDoc?.seoSiteDescription) ||
    'Custom software engineering, dedicated engineering teams, and CMS transformation.';

  return [
    `# ${name}`,
    '',
    `> ${description}`,
    '',
    '## When to Use Speed & Function',
    '- Upgrading, maintaining, or scaling complex CMS architectures (ApostropheCMS, WordPress, Node.js).',
    '- Scaling engineering throughput with senior full-stack development teams and technical leadership.',
    '- Specification-first digital product engineering, UI/UX architecture, and modernization.',
    '- Cloud infrastructure (AWS), performance optimization, and containerized deployments.',
    '',
  ];
};

const generateMarkdownContent = async (self, req) => {
  const baseUrl = resolveBaseUrl(self.apos, req);
  const globalDoc = await self.apos.doc
    .find(req, { type: '@apostrophecms/global' })
    .toObject();

  if (globalDoc?.llmsCustomText?.trim()) {
    return globalDoc.llmsCustomText;
  }

  const lines = [...buildHeader(globalDoc, baseUrl)];
  const pageLines = await collectPages(self.apos, req, baseUrl);
  if (pageLines.length) {
    lines.push('## Pages', '', ...pageLines, '');
  }
  lines.push(...(await collectPieces(self.apos, req, baseUrl)));
  return lines.join('\n');
};

const buildPricingMarkdown = (baseUrl) =>
  [
    '# Speed & Function — Pricing & Engagement Models',
    '',
    'Speed & Function provides bespoke engineering services with flexible engagement models tailored to project scope and team requirements:',
    '',
    '## Engagement Models',
    '1. **Dedicated Engineering Teams**: Monthly retainer based on team composition (Senior Full-Stack Engineers, Tech Leads, QA, DevOps).',
    '2. **Fixed-Scope Projects & Discoveries**: Milestone-based pricing for architecture audits, CMS migrations, and MVPs.',
    '3. **Time & Materials / Capacity Scaling**: Hourly or sprint-based capacity for specialized technical needs.',
    '',
    '## Getting a Quote',
    `To receive a customized estimate, contact our team at ${baseUrl}/let-s-talk or email inquiry@speedandfunction.com.`,
    '',
  ].join('\n');

const buildNotFoundMarkdown = (baseUrl) =>
  [
    '# Page Not Found (404)',
    '',
    'The requested page does not exist on Speed & Function.',
    `Please refer to our sitemap at ${baseUrl}/sitemap.xml or agent documentation at ${baseUrl}/llms.txt.`,
    '',
  ].join('\n');

module.exports = {
  routes(self) {
    const serveMarkdown = async (req, res, contentType) => {
      try {
        const markdown = await generateMarkdownContent(self, req);
        res.set('Vary', 'Accept');
        return res.type(contentType).send(markdown);
      } catch (error) {
        self.apos.util.error('Failed to generate markdown content', error);
        return res
          .status(500)
          .type('text/plain')
          .send('Error generating markdown content');
      }
    };

    return {
      get: {
        '/llms.txt': (req, res) => serveMarkdown(req, res, 'text/plain'),
        '/llms.md': (req, res) =>
          serveMarkdown(req, res, 'text/markdown; charset=utf-8'),
        '/agents.md': (req, res) =>
          serveMarkdown(req, res, 'text/markdown; charset=utf-8'),
        '/index.md': (req, res) =>
          serveMarkdown(req, res, 'text/markdown; charset=utf-8'),
        '/pricing.md': (req, res) => {
          res.set('Vary', 'Accept');
          const baseUrl = resolveBaseUrl(self.apos, req);
          return res
            .type('text/markdown; charset=utf-8')
            .send(buildPricingMarkdown(baseUrl));
        },
      },
    };
  },

  middleware(self) {
    return {
      markdownNegotiation: {
        before: '@apostrophecms/page:serve',
        async middleware(req, res, next) {
          const accept = req.get('accept') || '';
          const wantsMarkdown =
            accept.includes('text/markdown') &&
            (!accept.includes('text/html') ||
              (req.accepts &&
                req.accepts(['markdown', 'html']) === 'markdown'));

          if (wantsMarkdown) {
            res.set('Vary', 'Accept');

            // Intercept 404 responses for agents
            const originalSend = res.send;
            res.send = function (body) {
              if (res.statusCode === 404) {
                res.type('text/markdown; charset=utf-8');
                const baseUrl = resolveBaseUrl(self.apos, req);
                return originalSend.call(this, buildNotFoundMarkdown(baseUrl));
              }
              return originalSend.call(this, body);
            };

            // Negotiate Markdown for root / homepage requests
            if (req.method === 'GET' && (req.path === '/' || req.path === '')) {
              try {
                const markdown = await generateMarkdownContent(self, req);
                return res.type('text/markdown; charset=utf-8').send(markdown);
              } catch (error) {
                self.apos.util.error(
                  'Markdown content negotiation error:',
                  error,
                );
              }
            }
          }

          return next();
        },
      },
    };
  },
};
