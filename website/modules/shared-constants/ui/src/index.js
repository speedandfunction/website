/*
 * Client-side access to shared constants.
 * The actual constants are defined in the server-side module.
 */

export default () => {
  // Get constants from the module's browser data
  const moduleData = window.apos.modules.sharedConstants || {};

  // Return browser data or empty objects as fallback
  return {
    STANDARD_FORM_FIELD_NAMES: moduleData.STANDARD_FORM_FIELD_NAMES || {},
  };
};
