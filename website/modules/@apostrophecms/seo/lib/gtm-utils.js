module.exports = {
  /**
   * Sanitize and validate GTM ID
   * Only allow valid GTM container IDs (e.g. "GTM-XXXX")
   */
  sanitizeGtmId(id) {
    const value = String(id || '').trim();
    if (/^gtm-[\da-z]+$/iu.test(value)) {
      return value.toUpperCase();
    }
    return '';
  },

  /**
   * Resolve GTM ID from global override or module options
   */
  resolveGtmId(req, options) {
    const fromGlobal = req?.data?.global?.seoGoogleTagManager;
    const fromOptions = options?.googleTagManager?.id;
    const candidate =
      (fromGlobal && String(fromGlobal).trim()) ||
      (fromOptions && String(fromOptions).trim());
    return this.sanitizeGtmId(candidate);
  },
};
