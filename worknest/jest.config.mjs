import nextJest from 'next/jest.js';

const createJestConfig = nextJest({
  dir: './', // Points to your Next.js root directory
});

const customJestConfig = {
  setupFilesAfterEnv: ['<rootDir>/jest.setup.mjs'], // Ensure jest-dom is set up
  testEnvironment: 'jsdom', // Use jsdom for browser-like testing environment
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/$1', // Adjust path aliasing if needed
  },
  testMatch: ['<rootDir>/src/app/test/**/*.test.mjs'], // Ensure .test.mjs files are matched
  transformIgnorePatterns: ['<rootDir>/node_modules/'], // Ensure node_modules are not transformed
};

export default createJestConfig(customJestConfig);