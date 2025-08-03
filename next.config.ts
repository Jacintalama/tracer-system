/** @type {import('next').NextConfig} */
const nextConfig = {
  // … your other settings …
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'http://192.168.1.236:8000/api/:path*', 
      },
    ];
  },
};

module.exports = nextConfig;
