const nodeExternals = require("webpack-node-externals");

/** @type {import('next').NextConfig} */
const nextConfig = {};

module.exports = {
  ...nextConfig,
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.externals = [nodeExternals()];
    }
    return config;
  },
};
