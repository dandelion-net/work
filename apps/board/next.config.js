/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverActions: {
      allowedOrigins: ['http://localhost:3000'],
    }
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: { 
    unoptimized: true,
    domains: ['localhost']
  },
  output: 'standalone',
  webpack: (config, { dev, isServer }) => {
    // Disable webpack caching in all environments to prevent ENOENT errors
    config.cache = false;
    
    // Handle Prisma and other binary dependencies
    if (isServer) {
      config.externals = [
        ...config.externals || [],
        {
          '@prisma/client': 'commonjs @prisma/client',
          'prisma': 'commonjs prisma'
        }
      ];
    }
    
    // Optimize development build
    if (dev) {
      config.optimization = {
        ...config.optimization,
        minimize: false,
        moduleIds: 'named',
        chunkIds: 'named',
        splitChunks: false,
      };
    }
    
    return config;
  },
};

module.exports = nextConfig;