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
    'security/detect-object-injection': 'error', // Can cause false positives on safe property access
    'import/no-unresolved': 'error',
    'prettier/prettier': 'off', // Fixable
    'no-secrets/no-secrets': 'error',
    'eslint-comments/no-unused-disable': 'error', // Fixable
    'no-console': 'error',
    'max-lines-per-function': 'error',
    'sort-keys': 'off', // Too many violations across the codebase
    'line-comment-position': 'error',
    'no-inline-comments': 'error',
    'no-magic-numbers': 'off', // Too many violations across the codebase
    'node/no-unsupported-features/es-syntax': 'off', // Project uses modern ES syntax
    'func-style': 'error',
    'func-names': 'error',
    'no-ternary': 'error',
    'id-length': 'error',
    'require-unicode-regexp': 'error',
    'sort-imports': 'error', // Fixable
    'no-trailing-spaces': 'error', // Fixable
    'quote-props': 'error', // Fixable
    'no-invalid-this': 'error',
    'node/no-missing-import': 'error',
    'import/no-named-as-default': 'error',
    'capitalized-comments': 'error', // Fixable

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
    {
      files: ['app.js'],
      rules: {
        'max-lines-per-function': 'off',
        'func-style': 'off',
        'quote-props': 'off'
      }
    },
    {
      files: ['.eslintrc.js'],
      rules: {
        'line-comment-position': 'off',
        'no-inline-comments': 'off',
        'no-trailing-spaces': 'off',
        'quote-props': 'off'
      }
    },
    {
      files: ['modules/@apostrophecms/form/index.js'],
      rules: {
        'sonarjs/cognitive-complexity': 'off',
        'security/detect-object-injection': 'off',
        'no-secrets/no-secrets': 'off',
        'no-console': 'off',
        'max-lines-per-function': 'off',
        'line-comment-position': 'off',
        'no-inline-comments': 'off',
        'require-unicode-regexp': 'off'
      }
    },
    {
      files: ['modules/asset/ui/src/index.js'],
      rules: {
        'security/detect-object-injection': 'off',
        'import/no-unresolved': 'off',
        'eslint-comments/no-unused-disable': 'off',
        'max-lines-per-function': 'off',
        'line-comment-position': 'off',
        'no-inline-comments': 'off',
        'func-style': 'off',
        'func-names': 'off',
        'id-length': 'off',
        'sort-imports': 'off',
        'no-invalid-this': 'off',
        'node/no-missing-import': 'off',
        'import/no-named-as-default': 'off'
      }
    },
    {
      files: ['e2e/playwright.config.js', 'e2e/tests/screenshot-test.spec.js'],
      rules: {
        'import/no-unresolved': 'off',
        'no-ternary': 'off',
        'sort-imports': 'off',
        'node/no-missing-import': 'off'
      }
    },
    {
      files: ['modules/whitespace-widget/index.js'],
      rules: {
        'no-trailing-spaces': 'off'
      }
    },
    {
      files: ['modules/team-members/index.js'],
      rules: {
        'capitalized-comments': 'off'
      }
    }
  ],
};
