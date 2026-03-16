import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  webpack(config, { dev }) {
    if (dev && config.resolve?.conditionNames) {
      config.resolve.conditionNames = ['development', ...config.resolve.conditionNames];
    }
    return config;
  },
};

export default nextConfig;
