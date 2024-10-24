const nextBuildId = require('next-build-id');

const nextConfig = {
  output: 'export',
  reactStrictMode: false,
  generateBuildId: () => nextBuildId({ dir: __dirname })
};

module.exports = nextConfig;
