const { getEnv } = require('../../utils/env');

module.exports = {
  handlers(self) {
    return {
      '@apostrophecms/page:beforeSend': {
        webpack(req) {
          req.data.isDev = getEnv('NODE_ENV') !== 'production';
        },
      },
    };
  },
};
