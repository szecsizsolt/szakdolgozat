const { defineConfig } = require("cypress");

module.exports = defineConfig({
  e2e: {
    baseUrl: "http://localhost:5173",
    video: false,
    screenshotOnRunFailure: true,

    setupNodeEvents(on, config) {
    },
  },
});
