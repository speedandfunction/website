const gtmUtils = require('./lib/gtm-utils');

module.exports = {
  options: {
    googleTagManager: {
      id: process.env.GOOGLE_TAG_MANAGER_ID,
    },
  },
  init(self) {
    /*
     * SEO components are called directly from layout.html template
     * No automatic injection needed to avoid duplication
     */
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
