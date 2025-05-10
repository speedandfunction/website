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
     * Security rules
     * Can cause false positives on safe property access
     */
    'security/detect-object-injection': 'error',
    'import/no-unresolved': 'error',
    // Fixable
    'prettier/prettier': 'error',
    'no-secrets/no-secrets': 'error',
    // Fixable
    'eslint-comments/no-unused-disable': 'error',
    'no-console': 'error',
    'max-lines-per-function': 'error',
    // Too many violations across the codebase
    'sort-keys': 'off',
    'line-comment-position': ['error', { position: 'above' }],
    'no-inline-comments': 'error',
    // Too many violations across the codebase
    'no-magic-numbers': 'off',
    // Project uses modern ES syntax
    'node/no-unsupported-features/es-syntax': 'off',
    'func-style': 'error',
    'func-names': ['error', 'never'],
    'no-ternary': 'error',
    'id-length': 'error',
    'require-unicode-regexp': 'error',
    // Fixable
    'sort-imports': 'error',
    // Fixable
    'no-trailing-spaces': 'error',
    // Fixable
    'quote-props': ['error', 'consistent'],
    'no-invalid-this': 'error',
    'node/no-missing-import': 'error',
    'import/no-named-as-default': 'error',
    // Fixable
    'capitalized-comments': 'error',

    // Simple enabled rules (with 'error' only)
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

    // Rules with parameters
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
