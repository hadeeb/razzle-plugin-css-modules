// @ts-check
const ExtractCssChunks = require("extract-css-chunks-webpack-plugin");
const getCSSModuleLocalIdent = require("react-dev-utils/getCSSModuleLocalIdent");

const CssPreset = require("postcss-preset-env");
const PostCssFlexBugFixes = require("postcss-flexbugs-fixes");

const postcssDefaultPlugins = () => {
  return [
    PostCssFlexBugFixes,
    CssPreset({
      autoprefixer: {
        flexbox: "no-2009",
      },
      stage: 3,
    }),
  ];
};

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

  const postCssLoader = {
    loader: require.resolve("postcss-loader"),
    options: options.postcss[envKey],
  };

  /**
   * Replace CSS & CSS module loaders
   */
  config.module.rules.forEach((rule) => {
    if (rule.test && rule.test.exec) {
      const isCSSModulesLoader = rule.test.exec("./something.module.css");
      const isCSSLoader = rule.test.exec("./something.css");

      if (isCSSLoader) {
        rule.use = IS_SERVER
          ? [cssLoaderServer]
          : [IS_DEV ? styleLoader : extractCssLoader, cssLoader, postCssLoader];
      } else if (isCSSModulesLoader) {
        rule.use = IS_SERVER
          ? [cssModuleLoaderServer]
          : [
              ...(IS_DEV ? [styleLoader] : [localsLoader, extractCssLoader]),
              cssModuleLoader,
              postCssLoader,
            ];
      }
    }
  });

  return config;
};
