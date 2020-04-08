// @ts-check
const ExtractCssChunks = require("extract-css-chunks-webpack-plugin");
const paths = require("razzle/config/paths");
const getCSSModuleLocalIdent = require("react-dev-utils/getCSSModuleLocalIdent");

const autoprefixer = require("autoprefixer");
const PostCssFlexBugFixes = require("postcss-flexbugs-fixes");

const sassRegex = /\.(scss|sass)$/;
const sassModuleRegex = /\.module\.(scss|sass)$/;

const postcssDefaultPlugins = () => [
  PostCssFlexBugFixes,
  autoprefixer({
    flexbox: "no-2009",
  }),
];

const defaultOptions = {
  postcss: {
    dev: {
      ident: "postcss",
      sourceMap: true,
      plugins: postcssDefaultPlugins,
    },
    prod: {
      ident: "postcss",
      sourceMap: false,
      plugins: postcssDefaultPlugins,
    },
  },
  sass: {
    dev: {
      sourceMap: true,
      includePaths: [paths.appNodeModules],
    },
    prod: {
      // XXX Source maps are required for the resolve-url-loader to properly
      // function. Disable them in later stages if you do not want source maps.
      sourceMap: true,
      sourceMapContents: false,
      includePaths: [paths.appNodeModules],
    },
  },
  css: {
    dev: {
      sourceMap: true,
      importLoaders: 1,
      modules: false,
    },
    prod: {
      sourceMap: false,
      importLoaders: 1,
      modules: false,
    },
  },
  cssModules: {
    dev: {
      sourceMap: true,
      importLoaders: 2,
      localsConvention: "camelCaseOnly",
      modules: true,
    },
    prod: {
      sourceMap: false,
      importLoaders: 2,
      modules: {
        getLocalIdent: getCSSModuleLocalIdent,
      },
    },
  },
  style: {},
  resolveUrl: {
    dev: {},
    prod: {},
  },
};

const localsLoader = require.resolve("constant-locals-loader");

module.exports = (defaultConfig, { target, dev: IS_DEV }, options) => {
  const IS_SERVER = target !== "web";

  const envKey = IS_DEV ? "dev" : "prod";

  const config = { ...defaultConfig };
  options = { ...defaultOptions, ...options };

  const styleLoader = {
    loader: require.resolve("style-loader"),
    options: options.style,
  };

  const extractCssLoader = {
    loader: ExtractCssChunks.loader,
    options: {
      esModule: true,
    },
  };

  const cssLoader = {
    loader: require.resolve("css-loader"),
    options: options.css[envKey],
  };

  const cssLoaderServer = {
    loader: require.resolve("css-loader"),
    options: { ...options.css[envKey], onlyLocals: true },
  };

  const cssModuleLoader = {
    loader: require.resolve("css-loader"),
    options: options.cssModules[envKey],
  };

  const cssModuleLoaderServer = {
    loader: require.resolve("css-loader"),
    options: {
      ...options.cssModules[envKey],
      onlyLocals: true,
    },
  };

  const resolveUrlLoader = {
    loader: require.resolve("resolve-url-loader"),
    options: options.resolveUrl[envKey],
  };

  const postCssLoader = {
    loader: require.resolve("postcss-loader"),
    options: options.postcss[envKey],
  };

  const sassLoader = {
    loader: require.resolve("sass-loader"),
    options: options.sass[envKey],
  };

  config.module.rules.push(
    {
      test: sassRegex,
      exclude: [paths.appBuild, sassModuleRegex],
      use: IS_SERVER
        ? [cssLoaderServer, resolveUrlLoader, postCssLoader, sassLoader]
        : [
            IS_DEV ? styleLoader : extractCssLoader,
            cssLoader,
            postCssLoader,
            resolveUrlLoader,
            sassLoader,
          ],
    },
    {
      test: sassModuleRegex,
      exclude: [paths.appBuild],
      use: IS_SERVER
        ? [cssModuleLoaderServer, resolveUrlLoader, postCssLoader, sassLoader]
        : [
            ...(IS_DEV ? [styleLoader] : [localsLoader, extractCssLoader]),
            cssModuleLoader,
            postCssLoader,
            resolveUrlLoader,
            sassLoader,
          ],
    }
  );

  return config;
};
