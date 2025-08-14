const gtmUtils = require('./lib/gtm-utils');

module.exports = {
  options: {
    googleTagManager: {
      id: process.env.GOOGLE_TAG_MANAGER_ID,
    },
  },
  // No init hook required (layout renders components explicitly).
  components(self) {
    const getGtmId = (req) => gtmUtils.resolveGtmId(req, self.options);
    return {
      tagManagerBody(req, data) {
        if (!req?.data?.page) {
          return {};
        }
        const gtmId = getGtmId(req);
        if (gtmId) {
          return { gtmId };
        }
        return {};
      },
      tagManagerHead(req, data) {
        if (!req?.data?.page) {
          return {};
        }
        const gtmId = getGtmId(req);
        if (gtmId) {
          return { gtmId };
        }
        return {};
      },
    };
  },
};
