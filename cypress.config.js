const { defineConfig } = require("cypress");

module.exports = defineConfig({
  e2e: {
    baseUrl: "http://localhost:5173", // <-- VITE dev server URL-je
    video: false, // (opcionális) ne készítsen videót minden futásról
    screenshotOnRunFailure: true, // (opcionális)
    
    setupNodeEvents(on, config) {
      // Ha később kell backend API seedelő script, ide jön
    },
  },
});
