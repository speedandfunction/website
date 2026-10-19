module.exports = {
  routes() {
    return {
      get: {
        '/healthz': (req, res) => {
          return res.status(200).type('text/plain').send('OK');
        },
        '/health': (req, res) => {
          return res.status(200).type('text/plain').send('OK');
        },
      },
    };
  },
};
