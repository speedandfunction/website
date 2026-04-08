module.exports = {
  routes(self) {
    return {
      get: {
        '/robots.txt': (req, res) => {
          const baseUrl = self.apos.baseUrl || '';
          let baseHost = '';
          try {
            baseHost = new URL(baseUrl).hostname;
          } catch (error) {
            self.apos.util.warn('Invalid baseUrl for robots.txt route', error);
            baseHost = '';
          }
          const isProduction = process.env.NODE_ENV === 'production';
          const isProductionHost = baseHost === 'www.speedandfunction.com';
          if (!isProduction || !isProductionHost) {
            return res.type('text/plain').send('User-agent: *\nDisallow: /\n');
          }

          const robotsContent =
            'User-agent: *\n' +
            'Allow: /\n\n' +
            `Sitemap: ${baseUrl}/sitemap.xml\n`;
          return res.type('text/plain').send(robotsContent);
        },
      },
    };
  },
};
