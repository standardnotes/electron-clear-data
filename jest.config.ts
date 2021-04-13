export default {
  clearMocks: true,
  collectCoverageFrom: [
    "src/**/{!(index),}.ts"
  ],
  coverageDirectory: "coverage",
  coveragePathIgnorePatterns: [
    "<rootDir>/node_modules"
  ],
  coverageReporters: [
    "text"
  ],
  preset: "ts-jest",
  runner: "@jest-runner/electron/main",
  setupFiles: [
    "<rootDir>/test/setupEnv.ts"
  ],
  testEnvironment: "node",
  testMatch: [
    "**/?(*.)(spec|test).ts"
  ],
  testPathIgnorePatterns: [
    "/node_modules/"
  ],
};
