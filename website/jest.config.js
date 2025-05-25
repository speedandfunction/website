module.exports = {
  testEnvironment: 'node',
  roots: ['<rootDir>/modules/'],
  testMatch: ['**/__tests__/**/*.js', '**/?(*.)+(spec|test).js'],
  collectCoverageFrom: [
    'modules/**/*.js',
    '!modules/**/public/**/*.js',
    '!**/node_modules/**',
  ],
  coverageDirectory: 'coverage',
  testPathIgnorePatterns: ['/node_modules/'],
  moduleFileExtensions: ['js', 'json'],
  transform: {
    '^.+\\.js$': 'babel-jest',
  },
  transformIgnorePatterns: ['/node_modules/'],
};
