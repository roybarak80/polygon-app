module.exports = {
  preset: "ts-jest",
  testEnvironment: "node",
  testMatch: ["<rootDir>/src/tests/**/*.test.ts"], // Only run .test.ts files in src/tests/
  transform: {
    "^.+\\.ts$": "ts-jest", // Transform .ts files with ts-jest
  },
  moduleFileExtensions: ["ts", "js", "json", "node"],
};
