import { resolve } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export default {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
        pathname: '/**'
      }
    ]
  },
  webpack: (config) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      '@': resolve(__dirname, 'src'),
      '@users': resolve(__dirname, 'subgraph-users/pages'),
      '@bookings': resolve(__dirname, 'subgraph-bookings/pages'),
      '@pages': resolve(__dirname, 'pages'),
    };
    return config;
  },
};