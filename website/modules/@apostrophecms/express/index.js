const { getEnv } = require('../../../utils/env');
const morgan = require('morgan');

module.exports = {
  options: {
    session: {
      // If this still says `undefined`, set a real secret!
      secret: getEnv('SESSION_SECRET'),
    },
  },
  middleware(_self) {
    return {
      logRequests: {
        middleware: morgan(
          ':date[iso] :method :url :status :response-time ms - :remote-addr - :user-agent',
        ),
      },
    };
  },
};
