import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Base path for Webflow Cloud deployment
  basePath: process.env.NODE_ENV === 'production' ? '/rs-en/stories' : '',

  // Asset prefix for production
  assetPrefix: process.env.NODE_ENV === 'production' ? '/rs-en/stories' : '',

  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'cdn.prod.website-files.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'uploads-ssl.webflow.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'assets.website-files.com',
        pathname: '/**',
      },
    ],
  },
};

export default nextConfig;
