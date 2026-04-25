import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",

  turbopack: {
    root: process.cwd(),
  },

  allowedDevOrigins: ['studybites9653.builtwithrocket.new'],

  webpack(config) {
config.module.rules.push({
      test: /\.(jsx|tsx)$/,
      exclude: [/node_modules/],
      use: [{ loader: '@dhiwise/component-tagger/nextLoader' }],
    });

    return config;
  }
};

export default nextConfig;
