import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Turbopack configuration for SVG support
  experimental: {
    turbo: {
      rules: {
        '*.svg': {
          loaders: ['@svgr/webpack'],
          as: '*.js',
        },
      },
    },
  },

  // Webpack configuration for production builds
  webpack: (config) => {
    // svgr - allows importing SVGs as React components
    config.module.rules.push({
      test: /\.svg$/i,
      use: [
        {
          loader: '@svgr/webpack',
          options: {
            typescript: true,
            icon: true,
            dimensions: false,
          },
        },
      ],
    });

    return config;
  },
};

export default nextConfig;
