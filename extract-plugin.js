// @ts-check
const ExtractCssChunks = require("extract-css-chunks-webpack-plugin");

module.exports = (config, { target, dev: IS_DEV }) => {
  const IS_SERVER = target !== "web";

  if (!IS_SERVER && !IS_DEV) {
    config.plugins.push(
      new ExtractCssChunks({
        filename: "static/css/bundle.[contenthash:8].css",
        chunkFilename: "static/css/[name].[contenthash:8].chunk.css",
        esModule: true,
      })
    );
  }

  return config;
};
