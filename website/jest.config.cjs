module.exports = {
  testEnvironment: 'jsdom',

  roots: ['<rootDir>/modules', '<rootDir>/scripts', '<rootDir>/utils'],

  testMatch: ['**/__tests__/**/*.js', '**/?(*.)+(spec|test).js'],

  moduleDirectories: ['node_modules'],

  testPathIgnorePatterns: ['/node_modules/', '/apos-build/'],

  collectCoverageFrom: [
    'modules/**/*.js',
    'modules/**/ui/src/js/**/*.js',
    'scripts/**/*.js',
    'utils/**/*.js',
    '!**/*.test.js',
    '!modules/**/public/**/*.js',
    '!modules/**/ui/src/js/**/*.min.js',
    '!**/node_modules/**',
  ],

  coverageDirectory: 'coverage',

  moduleFileExtensions: ['js', 'json'],

  transform: {
    '^.+\\.js$': 'babel-jest',
  },

  transformIgnorePatterns: ['/node_modules/'],

  verbose: true,
};
