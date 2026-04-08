module.exports = {
  routes(self) {
    return {
      get: {
        '/robots.txt': (req, res) => {
          const baseUrl = self.apos.baseUrl || '';
          const isDevHost = baseUrl.includes('://dv.');
          const isProduction = process.env.NODE_ENV === 'production';
          if (!isProduction || isDevHost) {
            return res.type('text/plain').send('User-agent: *\nDisallow: /\n');
          }

          const robotsContent =
            'User-agent: *\n' +
            'Allow: /\n\n' +
            '# Block indexation of huge filter/search combinations under /cases\n' +
            'Disallow: /cases?*\n' +
            'Disallow: /cases/*?*\n\n' +
            `Sitemap: ${baseUrl}/sitemap.xml\n`;
          return res.type('text/plain').send(robotsContent);
        },
      },
    };
  },
};
