const nextJest = require('next/jest');

const createJestConfig = nextJest({
  dir: './', // This tells Jest to use the Next.js root directory.
});

const customJestConfig = {
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'], // Adjusted path, if needed
  testEnvironment: 'jsdom',
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/$1',
  },
  // Correct testMatch to look for .test.mjs files
  testMatch: ['<rootDir>/src/app/test/*.test.mjs'], // Adjusted to match .test.mjs files
  transform: {
    '^.+\\.mjs$': 'babel-jest', // Transform .mjs files using Babel
  },
  extensionsToTreatAsEsm: ['.mjs'], // Treat .mjs files as ESM
};

module.exports = createJestConfig(customJestConfig);