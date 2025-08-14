const sanitizeGtmId = function (id) {
  const value = String(id || '')
    .trim()
    .toUpperCase();
  // Strict GTM container format, e.g., "GTM-XXXXXXX"
  if (/^GTM-[\dA-Z]+$/u.test(value)) {
    return value;
  }
  return '';
};

const resolveGtmId = function (req, options) {
  const fromGlobal = req?.data?.global?.seoGoogleTagManager;
  const fromOptions = options?.googleTagManager?.id;
  const candidate =
    (fromGlobal && String(fromGlobal).trim()) ||
    (fromOptions && String(fromOptions).trim());
  return sanitizeGtmId(candidate);
};

module.exports = { sanitizeGtmId, resolveGtmId };
