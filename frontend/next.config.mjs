// next.config.js
/** @type {import('next').NextConfig} */

const nextConfig = {
  output: 'standalone',

  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
        pathname: '/**',
      },
    ],
  },

  async rewrites() {
    return [
      {
        source: "/api/presign-url",
        destination: "http://localhost:4000/file/presign-url",
      },
    ];
  },
};

export default nextConfig;
