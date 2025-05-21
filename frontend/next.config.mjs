/** @type {import('next').NextConfig} */
const nextConfig = {};
  webpack: (config, { isServer }) => {
    config.watchOptions = {
      ignored: [
        '**/node_modules',
        'C:/System Volume Information',
        'C:/pagefile.sys',
        'C:/swapfile.sys',
        'C:/DumpStack.log.tmp'
      ]
    };
    return config;
  }

export default nextConfig;
