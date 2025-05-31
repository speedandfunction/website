module.exports = {
  testEnvironment: 'jsdom',
  roots: ['<rootDir>/modules', '<rootDir>/scripts'],
  testMatch: ['**/__tests__/**/*.js', '**/?(*.)+(spec|test).js'],
  moduleDirectories: ['node_modules'],
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  testPathIgnorePatterns: ['/node_modules/', '/apos-build/'],
  collectCoverageFrom: [
    'modules/**/ui/src/js/**/*.js',
    'scripts/**/*.js',
    'utils/**/*.js',
    '!**/*.test.js',
    '!modules/**/ui/src/js/**/*.min.js',
    '!**/node_modules/**',
  ],
  coverageDirectory: 'coverage',
  verbose: true,
};
