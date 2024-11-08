const nextBuildId = require('next-build-id');
const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true'
})
const nextConfig = {
  output: 'export',
  reactStrictMode: false,
  generateBuildId: () => nextBuildId({ dir: __dirname })
};

module.exports = withBundleAnalyzer(nextConfig);
