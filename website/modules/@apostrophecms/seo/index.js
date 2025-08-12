module.exports = {
  improve: '@apostrophecms/seo',
  init(self) {
    // Ensure SEO components are injected into the template
    self.apos.template.prepend('body', '@apostrophecms/seo:tagManagerBody');
    self.apos.template.append('head', '@apostrophecms/seo:tagManagerHead');
    self.apos.template.prepend('head', '@apostrophecms/seo:metaHead');
  },
  components(self) {
    // Resolve GTM ID from global override or module options
    const resolveGtmId = req => {
      const fromGlobal = req?.data?.global?.seoGoogleTagManager;
      const fromOptions = self.options?.googleTagManager?.id;
      return (String(fromGlobal || '').trim() || String(fromOptions || '').trim());
    };

    return {
      async metaHead(req, data) {
        // Only on front-end page requests
        if (!req?.data?.page) {
          return {};
        }
        return {};
      },
      async tagManagerBody(req, data) {
        if (!req?.data?.page) {
          return {};
        }
        const gtmId = resolveGtmId(req);
        return gtmId ? { gtmId } : {};
      },
      async tagManagerHead(req, data) {
        if (!req?.data?.page) {
          return {};
        }
        const gtmId = resolveGtmId(req);
        return gtmId ? { gtmId } : {};
      }
    };
  }
};
