module.exports = {
  improve: '@apostrophecms/seo',
  init(self) {
    // Ensure SEO components are injected into the template
    self.apos.template.prepend('body', '@apostrophecms/seo:tagManagerBody');
    self.apos.template.append('head', '@apostrophecms/seo:tagManagerHead');
    self.apos.template.prepend('head', '@apostrophecms/seo:metaHead');
  },
  components(self) {
    return {
      async metaHead(req, data) {
        // Meta tags and other SEO head elements
        return {};
      },
      async tagManagerBody(req, data) {
        // GTM noscript tag for body
        const global = req.data.global;
        if (global && global.seoGoogleTagManager) {
          return {
            gtmId: global.seoGoogleTagManager
          };
        }
        return {};
      },
      async tagManagerHead(req, data) {
        // GTM script tag for head
        const global = req.data.global;
        if (global && global.seoGoogleTagManager) {
          return {
            gtmId: global.seoGoogleTagManager
          };
        }
        return {};
      }
    };
  }
};
