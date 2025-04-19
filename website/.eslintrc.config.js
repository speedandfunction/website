import js from '@eslint/js';
import pluginSonar from 'eslint-plugin-sonarjs';
import pluginSecurity from 'eslint-plugin-security';
import pluginPromise from 'eslint-plugin-promise';
import pluginImport from 'eslint-plugin-import';
import pluginNode from 'eslint-plugin-n';
import pluginJsxA11y from 'eslint-plugin-jsx-a11y';
import pluginPrettier from 'eslint-plugin-prettier';
import pluginOptimizeRegex from 'eslint-plugin-optimize-regex';
import pluginNoUnsanitized from 'eslint-plugin-no-unsanitized';
import pluginNoSecrets from 'eslint-plugin-no-secrets';
import pluginEslintComments from 'eslint-plugin-eslint-comments';

export default [
  js.configs.all,

  {
    files: ['**/*.js'],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'module',
      globals: {
        apos: 'readonly',
      },
    },
    linterOptions: {
      reportUnusedDisableDirectives: true,
    },
    plugins: {
      sonarjs: pluginSonar,
      security: pluginSecurity,
      promise: pluginPromise,
      import: pluginImport,
      node: pluginNode,
      'jsx-a11y': pluginJsxA11y,
      prettier: pluginPrettier,
      'optimize-regex': pluginOptimizeRegex,
      'no-unsanitized': pluginNoUnsanitized,
      'no-secrets': pluginNoSecrets,
      'eslint-comments': pluginEslintComments,
    },
    rules: {
      'sonarjs/cognitive-complexity': 'off',
      'sonarjs/no-identical-expressions': 'off',
      'security/detect-object-injection': 'off',
      'promise/always-return': 'off',
      'import/no-unresolved': 'off',
      'node/no-missing-require': 'off',
      'jsx-a11y/alt-text': 'off',
      'prettier/prettier': 'off',
      'optimize-regex/optimize-regex': 'off',
      'no-unsanitized/method': 'off',
      'no-unsanitized/property': 'off',
      'no-secrets/no-secrets': 'off',
      'eslint-comments/no-unused-disable': 'off',

      'no-console': 'off',
      'no-debugger': 'error',
      'no-alert': 'error',
      'no-unused-vars': 'error',
      'no-undef': 'error',
      'no-param-reassign': 'error',
      'max-depth': 'off',
      'max-lines': ['error', 300],
      'max-lines-per-function': 'off',
      'max-nested-callbacks': ['error', 3],
      'max-params': 'off',
      'max-statements': 'off',
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
      'no-dupe-keys': 'off',
      'complexity': 'off',
      'no-invalid-this': 'off',
      'node/no-missing-import': 'off',
      'import/no-named-as-default': 'off',
      'capitalized-comments': 'off',
    },
    settings: {
      'import/resolver': {
        node: {
          extensions: ['.js', '.ts'],
        },
      },
    },
  },

  {
    files: ['**/*.test.js', '**/*.spec.js', '**/tests/**/*.js'],
    rules: {
      'max-lines-per-function': 'off',
      'max-statements': 'off',
    },
  },
];
