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
    '^.+\\.(js|jsx|mjs|ts|tsx)$': 'babel-jest', // Use babel-jest for .js, .jsx, .mjs files
  },
  transformIgnorePatterns: ['<rootDir>/node_modules/'], // Ensure node_modules are not transformed
};

module.exports = createJestConfig(customJestConfig);