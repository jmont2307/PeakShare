const path = require('path');
const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');

const appDirectory = path.resolve(__dirname);

module.exports = {
  mode: 'development',
  entry: path.join(appDirectory, 'src/index.web.js'),
  output: {
    path: path.resolve(appDirectory, 'dist'),
    publicPath: '/',
    filename: 'bundle.js',
  },
  module: {
    rules: [
      // Process JS with Babel
      {
        test: /\.(js|jsx)$/,
        include: [
          path.resolve(appDirectory, 'src'),
        ],
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-env', '@babel/preset-react'],
            plugins: ['react-native-web'],
          },
        },
      },
      // Handle image assets
      {
        test: /\.(gif|jpe?g|png|svg)$/,
        use: {
          loader: 'url-loader',
          options: {
            name: '[name].[ext]',
            esModule: false,
          },
        },
      },
    ],
  },
  resolve: {
    extensions: ['.web.js', '.js', '.jsx'],
    alias: {
      'react-native$': 'react-native-web',
    }
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: path.join(appDirectory, 'public/index.html'),
    }),
    new webpack.DefinePlugin({
      __DEV__: JSON.stringify(true),
    }),
    new CopyWebpackPlugin({
      patterns: [
        { from: 'assets', to: 'assets' }
      ],
    }),
  ],
  devServer: {
    static: [
      {
        directory: path.join(appDirectory, 'web'),
        publicPath: '/',
      },
      {
        directory: path.join(appDirectory, 'assets'),
        publicPath: '/assets',
      }
    ],
    port: 3002,
    hot: true,
    historyApiFallback: true,
    open: true,
    client: {
      overlay: {
        errors: true,
        warnings: false,
      },
    },
  },
};