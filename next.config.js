const nextBuildId = require('next-build-id');

const nextConfig = {
  reactStrictMode: false,
  generateBuildId: () => nextBuildId({ dir: __dirname }),
};

module.exports = nextConfig;
