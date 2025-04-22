const path = require('path');
const webpack = require('webpack');

// Define plugins variable first
let plugins = [];

// Add HtmlWebpackPlugin if available
let HtmlWebpackPlugin;
try {
  HtmlWebpackPlugin = require('html-webpack-plugin');
  plugins.push(new HtmlWebpackPlugin({
    template: path.join(__dirname, 'public/index.html'),
  }));
} catch (e) {
  console.warn('HtmlWebpackPlugin not available');
}

// Add CopyWebpackPlugin if available
let CopyWebpackPlugin;
try {
  CopyWebpackPlugin = require('copy-webpack-plugin');
  plugins.push(new CopyWebpackPlugin({
    patterns: [
      { from: 'assets', to: 'assets' }
    ],
  }));
} catch (e) {
  console.warn('CopyWebpackPlugin not available');
}

const appDirectory = path.resolve(__dirname);

module.exports = {
  mode: process.env.NODE_ENV === 'production' ? 'production' : 'development',
  entry: {
    main: './src/index.web.js'
  },
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
        exclude: /node_modules/,
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
        type: 'asset',
      },
    ]
  },
  resolve: {
    extensions: ['.web.js', '.js', '.jsx'],
    alias: {
      'react-native$': 'react-native-web',
    }
  },
  plugins: [
    ...plugins,
    new webpack.DefinePlugin({
      __DEV__: JSON.stringify(process.env.NODE_ENV === 'development'),
      'process.env': {
        NODE_ENV: JSON.stringify(process.env.NODE_ENV || 'development'),
        FIREBASE_API_KEY: JSON.stringify(process.env.FIREBASE_API_KEY),
        FIREBASE_AUTH_DOMAIN: JSON.stringify(process.env.FIREBASE_AUTH_DOMAIN),
        FIREBASE_PROJECT_ID: JSON.stringify(process.env.FIREBASE_PROJECT_ID),
        FIREBASE_STORAGE_BUCKET: JSON.stringify(process.env.FIREBASE_STORAGE_BUCKET),
        FIREBASE_MESSAGING_SENDER_ID: JSON.stringify(process.env.FIREBASE_MESSAGING_SENDER_ID),
        FIREBASE_APP_ID: JSON.stringify(process.env.FIREBASE_APP_ID),
        FIREBASE_MEASUREMENT_ID: JSON.stringify(process.env.FIREBASE_MEASUREMENT_ID),
        GOOGLE_MAPS_API_KEY: JSON.stringify(process.env.GOOGLE_MAPS_API_KEY),
        WEATHER_API_KEY: JSON.stringify(process.env.WEATHER_API_KEY),
      },
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