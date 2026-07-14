import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  transpilePackages: ['@velora/calculations', '@velora/shared-types', '@velora/ui'],
  eslint: {
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
