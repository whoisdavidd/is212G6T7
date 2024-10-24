const nextJest = require('next/jest');

const createJestConfig = nextJest({
  dir: './', // Tells Jest to use the Next.js root directory
});

const customJestConfig = {
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  testEnvironment: 'jsdom',
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/$1',
  },
  // Ensure Jest matches .test.mjs files
  testMatch: ['<rootDir>/src/app/test/*.test.mjs'],
  transform: {
    // Use babel-jest to transform .mjs files
    '^.+\\.mjs$': 'babel-jest',
  },
  transformIgnorePatterns: ['<rootDir>/node_modules/'], // Ensure node_modules are not transformed
};

module.exports = createJestConfig(customJestConfig);