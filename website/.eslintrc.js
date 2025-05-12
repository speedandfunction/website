module.exports = {
  extends: [
    'apostrophe',
    // All core ESLint rules
    'eslint:all',
    // Sonar rules for ESLint 8 compatibility
    'plugin:sonarjs/recommended-legacy',
    // Security rules
    'plugin:security/recommended-legacy',
    // Promise rules
    'plugin:promise/recommended',
    // Import rules
    'plugin:import/errors',
    'plugin:import/warnings',
    // Node.js rules
    'plugin:node/recommended',
    // Accessibility rules
    'plugin:jsx-a11y/strict',
    'plugin:prettier/recommended',
  ],
  plugins: [
    'sonarjs',
    'security',
    'promise',
    'import',
    'node',
    'jsx-a11y',
    'prettier',
    // Regex optimizations
    'optimize-regex',
    // Prevent XSS
    'no-unsanitized',
    // Prevent secrets in code
    'no-secrets',
    // Enforce ESLint comments best practices
    'eslint-comments',
  ],
  env: {
    browser: true,
    node: true,
    es6: true,
    jest: true,
    commonjs: true,
  },
  parserOptions: {
    ecmaVersion: 2022,
    sourceType: 'module',
    ecmaFeatures: {
      impliedStrict: true,
    },
  },
  globals: {
    apos: 'readonly',
  },
  settings: {
    'import/resolver': {
      node: {
        extensions: ['.js', '.ts'],
      },
    },
  },
  rules: {
    /*
     * Disabled rules
     */
    'security/detect-object-injection': 'off',
    'no-undefined': 'off',
    'sort-keys': 'off',
    'no-magic-numbers': 'off',
    'node/no-unsupported-features/es-syntax': 'off',

    /*
     * Enabled rules (simple)
     */
    'import/no-unresolved': 'error',
    'prettier/prettier': 'error',
    'no-secrets/no-secrets': 'error',
    'eslint-comments/no-unused-disable': 'error',
    'no-console': 'error',
    'max-lines-per-function': 'error',
    'func-style': 'error',
    'no-ternary': 'error',
    'id-length': 'error',
    'require-unicode-regexp': 'error',
    'sort-imports': 'error',
    'no-trailing-spaces': 'error',
    'no-invalid-this': 'error',
    'node/no-missing-import': 'error',
    'import/no-named-as-default': 'error',
    'capitalized-comments': 'error',
    'sonarjs/no-identical-expressions': 'error',
    'sonarjs/cognitive-complexity': 'error',
    'promise/always-return': 'error',
    'node/no-missing-require': 'error',
    'jsx-a11y/alt-text': 'error',
    'optimize-regex/optimize-regex': 'error',
    'no-unsanitized/method': 'error',
    'no-unsanitized/property': 'error',
    'no-debugger': 'error',
    'no-alert': 'error',
    'no-unused-vars': 'error',
    'no-undef': 'error',
    'no-param-reassign': 'error',
    'no-dupe-keys': 'error',
    'init-declarations': 'error',

    /*
     * Enabled rules with parameters
     */
    'line-comment-position': ['error', { position: 'above' }],
    'no-inline-comments': 'error',
    'func-names': ['error', 'never'],
    'quote-props': ['error', 'consistent'],
    'max-depth': ['error', 4],
    'max-lines': ['error', 300],
    'max-nested-callbacks': ['error', 3],
    'max-params': ['error', 5],
    'max-statements': ['error', 50],
    'complexity': ['error', 15],
    'prefer-destructuring': [
      'error',
      {
        array: true,
        object: true,
      },
    ],
    'node/no-extraneous-require': [
      'error',
      {
        allowModules: ['@jest/globals'],
      },
    ],
  },
  overrides: [
    {
      files: ['**/*.test.js', '**/*.spec.js', '**/tests/**/*.js'],
      rules: {
        'max-lines-per-function': 'off',
        'max-statements': 'off',
        'node/no-extraneous-require': 'off',
        'prefer-destructuring': 'off',
      },
    },
    {
      files: ['app.js'],
      rules: {
        'max-lines-per-function': 'off',
        'func-style': 'off',
        'quote-props': 'off',
      },
    },
    {
      files: ['modules/@apostrophecms/form/index.js'],
      rules: {
        'max-lines': 'off',
      },
    },
    {
      files: ['modules/asset/ui/src/index.js'],
      rules: {
        'max-lines-per-function': 'off',
        'func-style': 'off',
      },
    },
    {
      files: ['modules/asset/ui/src/swipers.js'],
      rules: {
        'node/no-missing-import': 'off',
        'import/no-unresolved': 'off',
      },
    },
    {
      files: ['e2e/playwright.config.js', 'e2e/tests/screenshot-test.spec.js'],
      rules: {
        'import/no-unresolved': 'off',
        'no-ternary': 'off',
        'sort-imports': 'off',
        'node/no-missing-import': 'off',
        'node/no-unpublished-import': 'off',
      },
    },
  ],
};
