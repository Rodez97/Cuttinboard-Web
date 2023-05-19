/* eslint-disable no-undef */
import AntdDayjsWebpackPlugin from "antd-dayjs-webpack-plugin";
import CopyWebpackPlugin from "copy-webpack-plugin";
import ForkTsCheckerWebpackPlugin from "fork-ts-checker-webpack-plugin";
import HtmlWebpackPlugin from "html-webpack-plugin";
//import LodashModuleReplacementPlugin from "lodash-webpack-plugin";
import path from "path";
import TsconfigPathsPlugin from "tsconfig-paths-webpack-plugin";
import { fileURLToPath } from "url";
import { CleanWebpackPlugin } from "clean-webpack-plugin";
import { GenerateSW } from "workbox-webpack-plugin";
import Dotenv from "dotenv-webpack";
//import { BundleAnalyzerPlugin } from "webpack-bundle-analyzer";
import CompressionPlugin from "compression-webpack-plugin";
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const webpackConfig = () => {
  return {
    entry: "./src/index.tsx",
    // ...(process.env.production ? {} : { devtool: "eval-source-map" }),

    optimization: {
      minimize: true,
      usedExports: true,
      splitChunks: {
        chunks: "all",
        minSize: 20000,
        maxSize: 70000,
        minChunks: 1,
        maxAsyncRequests: 30,
        maxInitialRequests: 30,
        automaticNameDelimiter: "~",
        enforceSizeThreshold: 50000,
        cacheGroups: {
          defaultVendors: {
            test: /[\\/]node_modules[\\/]/,
            priority: -10,
            reuseExistingChunk: true,

            name(module) {
              const packageName = module.context.match(
                /[\\/]node_modules[\\/](.*?)([\\/]|$)/
              )[1];

              return `npm.${packageName.replace("@", "")}`;
            },
          },
        },
      },
    },

    performance: {
      //hints: true,
      maxEntrypointSize: 512000,
      maxAssetSize: 512000,
    },

    resolve: {
      alias: {
        "@": "/src",
        "react-firebase-hooks/auth$":
          "react-firebase-hooks/auth/dist/index.cjs.js",
      },
      extensions: [".ts", ".tsx", ".js", ".jsx"],
      plugins: [new TsconfigPathsPlugin({ configFile: "./tsconfig.json" })],
      fallback: {
        fs: false,
      },
    },
    output: {
      path: path.join(__dirname, "/build"),
      filename: "[name].bundle.js",
      sourceMapFilename: "[name].chunk.map",
      chunkFilename: "[name].[contenthash].chunk.js",
      publicPath: "/",
    },
    module: {
      rules: [
        {
          test: /\.less$/,
          use: [
            {
              loader: "style-loader",
            },
            {
              loader: "css-loader", // translates CSS into CommonJS
            },
            {
              loader: "sass-loader", // translates CSS into CommonJS
            },
            {
              loader: "less-loader",
              options: {
                lessOptions: {
                  javascriptEnabled: true,
                },
              },
            },
          ],
        },
        {
          test: /\.(sass|scss|css)$/i,
          use: [
            {
              loader: "style-loader",
            },
            {
              loader: "css-loader", // translates CSS into CommonJS
            },
            {
              loader: "sass-loader", // translates CSS into CommonJS
            },
          ],
        },
        {
          test: /\.tsx?$/,
          loader: "ts-loader",
          options: {
            transpileOnly: true,
          },
          exclude: /build|node_modules/,
        },
        {
          test: /\.(png|jpe?g|gif)$/,
          use: [
            {
              loader: "url-loader",
              options: {
                limit: 10_000,
                name: "images/[name].[ext]",
              },
            },
          ],
        },
        {
          test: /\.svg$/i,
          issuer: /\.[jt]sx?$/,
          use: ["@svgr/webpack"],
        },
        {
          test: /\.webp$/i,
          use: ["file-loader", "webp-loader"],
        },
        {
          test: /\.jsx$/,
          loader: "babel-loader",
          exclude: /node_modules/,
          options: {
            presets: [["es2015", { modules: false }]],
          },
        },
        {
          test: /\.js$/,
          exclude:
            /node_modules[/\\](?!react-native-gifted-chat|react-native-lightbox|react-native-parsed-text)/,
          use: {
            loader: "babel-loader",
            options: {
              babelrc: false,
              configFile: false,
              presets: [
                ["@babel/preset-env", { useBuiltIns: "usage" }],
                "@babel/preset-react",
              ],
              plugins: ["@babel/plugin-proposal-class-properties"],
            },
          },
        },
      ],
    },
    devServer: {
      port: 8080,
      open: true,
      historyApiFallback: {
        rewrites: [{ from: /^.*\/index\.js$/, to: "/index.js" }],
      },
      client: {
        overlay: false,
      },
    },
    plugins: [
      new HtmlWebpackPlugin({
        // HtmlWebpackPlugin simplifies creation of HTML files to serve your webpack bundles
        template: "./src/index.html",
        favicon: "./src/assets/images/favicon.ico",
        minify: {
          removeComments: true,
          collapseWhitespace: true,
          removeRedundantAttributes: true,
          useShortDoctype: true,
          removeEmptyAttributes: true,
          removeStyleLinkTypeAttributes: true,
          keepClosingSlash: true,
          minifyJS: true,
          minifyCSS: true,
          minifyURLs: true,
        },
      }),
      new ForkTsCheckerWebpackPlugin(),
      new CopyWebpackPlugin({
        patterns: [{ from: "src/assets/images", to: "images/" }, "public"],
      }),
      new AntdDayjsWebpackPlugin(),
      //new LodashModuleReplacementPlugin({ paths: true }),
      //new BundleAnalyzerPlugin(),
      new CompressionPlugin({
        algorithm: "gzip",
        test: /\.js$|\.css$/,
        threshold: 10240,
        minRatio: 0.8,
      }),
      new CleanWebpackPlugin(),
      new Dotenv(),
      new GenerateSW({
        cleanupOutdatedCaches: true,
        clientsClaim: true,
        skipWaiting: true,
        runtimeCaching: [
          {
            urlPattern: /\.js$/,
            handler: "NetworkFirst",
          },
          {
            urlPattern: /https?:\/\/[^\s]+\.(jpg|jpeg|png)(?:\?.*)?/gm,
            handler: "CacheFirst",
            options: {
              cacheName: "images",
              expiration: {
                maxEntries: 100,
                maxAgeSeconds: 60 * 60 * 24 * 7, // 7 days
              },
            },
          },
          {
            urlPattern: new RegExp("^https://fonts.googleapis.com/"),
            handler: "CacheFirst",
            options: {
              cacheName: "google-fonts",
              expiration: {
                maxEntries: 100,
                maxAgeSeconds: 60 * 60 * 24 * 365,
              },
            },
          },
          {
            urlPattern: new RegExp("^https://fonts.gstatic.com/"),
            handler: "CacheFirst",
            options: {
              cacheName: "google-fonts",
              expiration: {
                maxEntries: 100,
                maxAgeSeconds: 60 * 60 * 24 * 365,
              },
            },
          },
        ],
      }),
    ],
  };
};

export default webpackConfig;
