module.exports = {
  extends: 'apostrophe',
  env: {
    browser: true,
    node: true,
    es6: true,
    jest: true
  },
  parserOptions: {
    ecmaVersion: 2020
  },
  globals: {
    apos: 'readonly'
  },
  rules: {
    // Add any custom rules here
  }
};
