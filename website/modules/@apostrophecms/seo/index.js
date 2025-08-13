module.exports = {
  improve: '@apostrophecms/seo',
  init(self) {
    // Ensure SEO components are injected into the template
    self.apos.template.prepend('body', '@apostrophecms/seo:tagManagerBody');
    self.apos.template.append('head', '@apostrophecms/seo:tagManagerHead');
    self.apos.template.prepend('head', '@apostrophecms/seo:metaHead');
  },
  components(self) {
    /*
     * Resolve GTM ID from global override or module options
     * Only allow valid GTM container IDs (e.g. “GTM-XXXX”)
     */
    const sanitizeGtmId = (id) => {
      const value = String(id || '').trim();
      if (/^gtm-[\da-z]+$/iu.test(value)) {
        return value.toUpperCase();
      }
      return '';
    };
    const resolveGtmId = (req) => {
      const fromGlobal = req?.data?.global?.seoGoogleTagManager;
      const fromOptions = self.options?.googleTagManager?.id;
      const candidate =
        (fromGlobal && String(fromGlobal).trim()) ||
        (fromOptions && String(fromOptions).trim());
      return sanitizeGtmId(candidate);
    };

    return {
      metaHead(req, data) {
        // Only on front-end page requests
        if (!req?.data?.page) {
          return {};
        }
        return {};
      },
      tagManagerBody(req, data) {
        if (!req?.data?.page) {
          return {};
        }
        const gtmId = resolveGtmId(req);
        if (gtmId) {
          return { gtmId };
        }
        return {};
      },
      tagManagerHead(req, data) {
        if (!req?.data?.page) {
          return {};
        }
        const gtmId = resolveGtmId(req);
        if (gtmId) {
          return { gtmId };
        }
        return {};
      },
    };
  },
};
