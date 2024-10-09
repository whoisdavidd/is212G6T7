const nextJest = require('next/jest');

const createJestConfig = nextJest({
  dir: './', // This tells Jest to use the Next.js root directory.
});

const customJestConfig = {
  setupFilesAfterEnv: ['<rootDir>/worknest/jest.setup.js'], // Adjusted path
  testEnvironment: 'jsdom',
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/$1',
  },
};

module.exports = createJestConfig(customJestConfig);