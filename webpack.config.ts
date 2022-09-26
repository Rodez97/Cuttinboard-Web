import { Colors } from "@cuttinboard-solutions/cuttinboard-library/utils";
import AntdDayjsWebpackPlugin from "antd-dayjs-webpack-plugin";
import CopyWebpackPlugin from "copy-webpack-plugin";
import ForkTsCheckerWebpackPlugin from "fork-ts-checker-webpack-plugin";
import HtmlWebpackPlugin from "html-webpack-plugin";
import LodashModuleReplacementPlugin from "lodash-webpack-plugin";
import path from "path";
import TsconfigPathsPlugin from "tsconfig-paths-webpack-plugin";
import { DefinePlugin } from "webpack";

const webpackConfig = () => ({
  entry: "./src/index.tsx",
  ...(process.env.production || !process.env.development
    ? {}
    : { devtool: "eval-source-map" }),

  optimization: {
    runtimeChunk: "single",
    splitChunks: {
      chunks: "all",
      maxInitialRequests: Infinity,
      minSize: 0,
      cacheGroups: {
        vendor: {
          test: /[\\/]node_modules[\\/]/,
          name(module) {
            const pkgName = module.context.match(
              /[\\/]node_modules[\\/](.*?)([\\/]|$)/
            )[1];
            return `package.${pkgName.replace("@", "")}`;
          },
        },
      },
    },
  },

  resolve: {
    alias: { "@": "/src" },
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
    chunkFilename: "[name].chunk.js",
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
                modifyVars: {
                  "layout-header-background": Colors.MainDark,
                  "layout-body-background": "#fff",
                },
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
        use: ["webp-loader"],
      },
      {
        test: /\.(js|jsx)$/,
        loader: "babel-loader",
        exclude: /node_modules/,
      },
    ],
  },
  devServer: {
    port: 3000,
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
    }),
    // DefinePlugin allows you to create global constants which can be configured at compile time
    new DefinePlugin({
      "process.env": process.env.production || !process.env.development,
    }),
    new ForkTsCheckerWebpackPlugin(),
    new CopyWebpackPlugin({
      patterns: [{ from: "src/assets/images", to: "images/" }, "public"],
    }),
    new LodashModuleReplacementPlugin(),
    new AntdDayjsWebpackPlugin(),
  ],
});

export default webpackConfig;
