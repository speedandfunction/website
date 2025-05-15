module.exports = {
  handlers(self) {
    return {
      '@apostrophecms/page:beforeSend': {
        addGlobalData(req) {
          req.data.currentYear = new Date().getFullYear();
        },
      },
    };
  },
};
