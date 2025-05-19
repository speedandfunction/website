const { getEnv } = require('../../../utils/env');

module.exports = {
  options: {
    session: {
      // If this still says `undefined`, set a real secret!
      secret: getEnv('SESSION_SECRET'),
    },
  },
};
