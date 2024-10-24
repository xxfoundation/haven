import { defineConfig } from 'cypress';
import codeCoverage from '@cypress/code-coverage/task';

export default defineConfig({
  env: {
    codeCoverage: {
      url: '/api/__coverage__'
    }
  },
  e2e: {
    hideXHRInCommandLog: true,
    baseUrl: 'http://127.0.0.1:3000/',
    setupNodeEvents(on, config) {
      codeCoverage(on, config);
      return config;
    }
  }
});
