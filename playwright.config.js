const { defineConfig } = require('@playwright/test');

module.exports = defineConfig({
  use: {
    headless: false,
    slowMo: 9000, // 9 seconds delay per action
  },
});