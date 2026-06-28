const path = require('path');

/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ['@maximus/utils', '@maximus/types', '@maximus/ui'],
  webpack(config) {
    const reactDir = path.dirname(require.resolve('react/package.json'));
    const reactDomDir = path.dirname(require.resolve('react-dom/package.json'));
    config.resolve.alias['react'] = reactDir;
    config.resolve.alias['react-dom'] = reactDomDir;
    return config;
  },
};

module.exports = nextConfig;
