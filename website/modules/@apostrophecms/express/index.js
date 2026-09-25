const { getEnv } = require('../../../utils/env');
const morgan = require('morgan');

module.exports = {
  options: {
    session: {
      // If this still says `undefined`, set a real secret!
      secret: getEnv('SESSION_SECRET'),
    },
    apiKeys: {
      /*
       * Use your own key value. Ideally use a strong, randomly generated
       * key.
       */
      ...(process.env.EDITOR_KEY && {
        // The user role associated with this key
        [process.env.EDITOR_KEY]: {
          role: 'admin',
        },
      }),
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
