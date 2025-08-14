const gtmUtils = require('./lib/gtm-utils');

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
        const gtmId = gtmUtils.resolveGtmId(req, self.options);
        if (gtmId) {
          return { gtmId };
        }
        return {};
      },
      tagManagerHead(req, data) {
        if (!req?.data?.page) {
          return {};
        }
        const gtmId = gtmUtils.resolveGtmId(req, self.options);
        if (gtmId) {
          return { gtmId };
        }
        return {};
      },
    };
  },
};
