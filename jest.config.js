module.exports = {
  preset: "./Preset.js",
  testEnvironment: "node",
  transform: {
    "^.+\\.(ts|tsx|js|jsx)$": "ts-jest",
    ".+\\.(css|less|sass|scss|png|jpg|gif|ttf|woff|woff2|svg)$":
      "jest-transform-stub",
  },
  transformIgnorePatterns: ["./src/node_modules/"],
  automock: false,
  setupFiles: ["./setupJest.js"],
  setupFilesAfterEnv: ["expect-puppeteer"],
};
