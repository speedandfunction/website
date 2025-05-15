module.exports = {
  options: {
    session: {
      // If this still says `undefined`, set a real secret!
      secret: process.env.SESSION_SECRET,
    },
  },
};
