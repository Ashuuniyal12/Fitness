/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ['@maximus/utils', '@maximus/types', '@maximus/ui'],
  async redirects() {
    return [
      {
        source: '/profile',
        destination: '/settings',
        permanent: true,
      },
    ];
  },
};

module.exports = nextConfig;
