module.exports = {
  extends: [
    'apostrophe',
    'eslint:all', // All core ESLint rules
    'plugin:sonarjs/recommended-legacy', // Sonar rules for ESLint 8 compatibility
    'plugin:security/recommended-legacy', // Security rules
    'plugin:promise/recommended', // Promise rules
    'plugin:import/errors', // Import rules
    'plugin:import/warnings',
    'plugin:node/recommended', // Node.js rules
    'plugin:jsx-a11y/strict', // Accessibility rules
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
    'optimize-regex', // Regex optimizations
    'no-unsanitized', // Prevent XSS
    'no-secrets', // Prevent secrets in code
    'eslint-comments', // Enforce ESLint comments best practices
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
    // Disabled rules
    'sonarjs/cognitive-complexity': 'off',
    'security/detect-object-injection': 'off',
    'import/no-unresolved': 'off',
    'prettier/prettier': 'off',
    'no-secrets/no-secrets': 'off',
    'eslint-comments/no-unused-disable': 'off',
    'no-console': 'off',
    'max-lines-per-function': 'off',
    'sort-keys': 'off',
    'line-comment-position': 'off',
    'no-inline-comments': 'off',
    'no-magic-numbers': 'off',
    'node/no-unsupported-features/es-syntax': 'off',
    'func-style': 'off',
    'func-names': 'off',
    'no-ternary': 'off',
    'id-length': 'off',
    'require-unicode-regexp': 'off',
    'sort-imports': 'off',
    'no-trailing-spaces': 'off',
    'quote-props': 'off',
    'no-invalid-this': 'off',
    'node/no-missing-import': 'off',
    'import/no-named-as-default': 'off',
    'capitalized-comments': 'off',

    // Simple enabled rules (with 'error' only)
    'sonarjs/no-identical-expressions': 'error',
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
    'prefer-destructuring': ['error', {
      'array': true,
      'object': true
    }],
    'node/no-extraneous-require': ['error', {
      'allowModules': ['@jest/globals']
    }]
  },
  overrides: [
    {
      files: ['**/*.test.js', '**/*.spec.js', '**/tests/**/*.js'],
      rules: {
        'max-lines-per-function': 'off',
        'max-statements': 'off',
        'node/no-extraneous-require': 'off',
        'prefer-destructuring': 'off'
      },
    },
  ],
};
