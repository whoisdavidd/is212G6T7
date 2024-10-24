import nextJest from 'next/jest.js';

const createJestConfig = nextJest({
  dir: './', // Tells Jest to use the Next.js root directory
});

const customJestConfig = {
  setupFilesAfterEnv: ['<rootDir>/jest.setup.mjs'],
  testEnvironment: 'jsdom',
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/$1',
  },
  // Ensure Jest matches .test.mjs files
  testMatch: ['<rootDir>/src/app/test/**/*.test.mjs'],
  // Tell Jest to treat .mjs files as ES modules
  transformIgnorePatterns: ['<rootDir>/node_modules/'], // Ensure node_modules are not transformed
};

export default createJestConfig(customJestConfig);