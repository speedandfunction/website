module.exports = {
  extend: '@apostrophecms/module',
  init(self) {
    self.extendTemplateData = function (req, data) {
      if (typeof req.csrfToken === 'function') {
        data.csrfToken = req.csrfToken();
      }
    };
  },
  extendMethods(self) {
    return {
      getCsrfToken(req) {
        return req.csrfToken();
      },
    };
  },
  extendHelpers(self) {
    return {
      getCsrfToken(req) {
        return req.csrfToken();
      },
    };
  },
};
