const nodeExternals = require("webpack-node-externals");

/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    appDir: true,
  },
};

module.exports = {
  ...nextConfig,
  webpack: (config, { isServer }) => {
    config.externals = [nodeExternals()];
    return config;
  },
};
