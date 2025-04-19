module.exports = {
  testEnvironment: 'node',
  collectCoverageFrom: [
    '**/*.{ts,tsx,js,jsx}',
    '!**/node_modules/**',
    '!**/coverage/**',
    '!**/babel.config.js',
    '!**/jest.config.js',
    '!**/public/**',
    '!**/data/**'
  ],
  coverageDirectory: 'coverage',
  coverageReporters: [ 'text', 'lcov' ],
  testMatch: [ '**/__tests__/**/*.js', '**/?(*.)+(spec|test).js' ],
  testPathIgnorePatterns: [ '/node_modules/', '/e2e/' ],
  verbose: true,
  transform: {
    '^.+\\.(js|jsx)$': 'babel-jest'
  },
  moduleFileExtensions: [ 'js', 'jsx', 'json', 'node' ]
};
