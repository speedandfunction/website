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
          const productionHosts = [
            'speedandfunction.com',
            'www.speedandfunction.com',
          ];
          const isProductionHost = productionHosts.includes(baseHost);
          const parsedBaseUrl = new URL(baseUrl);
          const normalizedBaseUrl = parsedBaseUrl.origin;
          if (!isProduction || !isProductionHost) {
            return res.type('text/plain').send('User-agent: *\nDisallow: /\n');
          }

          const robotsContent =
            'User-agent: *\n' +
            'Allow: /\n\n' +
            `Sitemap: ${normalizedBaseUrl}/sitemap.xml\n`;
          return res.type('text/plain').send(robotsContent);
        },
      },
    };
  },
};
