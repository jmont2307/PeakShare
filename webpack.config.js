const path = require('path');
const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const DotenvWebpackPlugin = require('dotenv-webpack');

const appDirectory = path.resolve(__dirname);
const nodeModulesPath = path.join(appDirectory, 'node_modules');

module.exports = {
  mode: process.env.NODE_ENV === 'production' ? 'production' : 'development',
  entry: path.join(appDirectory, 'src/index.web.js'),
  output: {
    path: path.resolve(appDirectory, 'dist'),
    publicPath: '/',
    filename: 'bundle.js',
  },
  resolve: {
    extensions: ['.web.js', '.js', '.jsx', '.ts', '.tsx'],
    alias: {
      'react-native$': 'react-native-web',
      '@env': path.resolve(__dirname, 'src/env.js'),
      '@react-native-async-storage/async-storage': path.resolve(__dirname, 'src/native-modules.js'),
      // Add aliases for all touchable components to fix click issues
      'react-native/Libraries/Components/Touchable/TouchableOpacity': 'react-native-web/dist/exports/TouchableOpacity',
      'react-native/Libraries/Components/Touchable/TouchableHighlight': 'react-native-web/dist/exports/TouchableHighlight',
      'react-native/Libraries/Components/Touchable/TouchableWithoutFeedback': 'react-native-web/dist/exports/TouchableWithoutFeedback',
      'react-native/Libraries/Components/Pressable/Pressable': 'react-native-web/dist/exports/Pressable',
      'react-native/Libraries/Components/Button': 'react-native-web/dist/exports/Button',
    },
    fallback: {
      'path': require.resolve('path-browserify'),
      'stream': require.resolve('stream-browserify'),
      'crypto': false,
      'process': require.resolve('process/browser'),
    }
  },
  module: {
    rules: [
      {
        test: /\.jsx?$/,
        exclude: /node_modules(?!\/(@expo\/vector-icons|react-native-vector-icons|react-native-ratings|react-native-google-places-autocomplete|expo-linear-gradient|@react-native)).*$/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-env', '@babel/preset-react'],
            plugins: ['react-native-web']
          }
        }
      },
      // Handle TypeScript files
      {
        test: /\.tsx?$/,
        exclude: /node_modules(?!\/(@react-native|expo|@expo)).*$/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-env', '@babel/preset-react', '@babel/preset-typescript', '@babel/preset-flow'],
            plugins: ['react-native-web']
          }
        }
      },
      {
        test: /\.(png|jpe?g|gif|svg)$/i,
        use: [
          {
            loader: 'file-loader',
            options: {
              name: '[name].[ext]',
              esModule: false,
            }
          }
        ]
      },
      {
        test: /\.(woff|woff2|eot|ttf|otf)$/i,
        use: [
          {
            loader: 'file-loader',
            options: {
              name: '[name].[ext]',
              esModule: false,
            }
          }
        ]
      },
      // Handle JS files in node_modules that contain JSX or TypeScript or Flow
      {
        test: /\.(js|jsx|ts|tsx)$/,
        include: [
          /node_modules\/@expo\/vector-icons/,
          /node_modules\/expo-linear-gradient/,
          /node_modules\/react-native-vector-icons/,
          /node_modules\/react-native-google-places-autocomplete/,
          /node_modules\/react-native-ratings/,
          /node_modules\/@react-native/,
          /node_modules\/expo-asset/,
          /node_modules\/expo-font/,
        ],
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-env', '@babel/preset-react', '@babel/preset-flow'],
            plugins: ['react-native-web']
          }
        }
      },
      // Handle TypeScript declaration files
      {
        test: /\.d\.ts$/,
        loader: 'ignore-loader'
      }
    ]
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: path.join(appDirectory, 'public/index.html'),
      filename: 'index.html',
      inject: true
    }),
    new DotenvWebpackPlugin({
      systemvars: true, // Load all system variables
      safe: false // Don't require .env.example file
    }),
    new webpack.DefinePlugin({
      __DEV__: process.env.NODE_ENV !== 'production',
      // Hard-code the API keys for Render deployment
      'process.env.GOOGLE_MAPS_API_KEY': JSON.stringify('AIzaSyCk2VuTc5eIvNVLvte5x53mIIrLjomU6Ew'),
      'process.env.WEATHER_API_KEY': JSON.stringify('5a132a14eae24211b1c01327252502'),
      'process.env.FIREBASE_API_KEY': JSON.stringify('AIzaSyCXa2Tbu1a-5qB-PIuUUPNF_kPLCqWk7yA'),
      'process.env.FIREBASE_AUTH_DOMAIN': JSON.stringify('peakshare-fe51b.firebaseapp.com'),
      'process.env.FIREBASE_PROJECT_ID': JSON.stringify('peakshare-fe51b'),
      'process.env.FIREBASE_STORAGE_BUCKET': JSON.stringify('peakshare-fe51b.firebasestorage.app'),
      'process.env.FIREBASE_MESSAGING_SENDER_ID': JSON.stringify('65188809207'),
      'process.env.FIREBASE_APP_ID': JSON.stringify('1:65188809207:web:181339d40dcfe40a2946f2'),
      'process.env.FIREBASE_MEASUREMENT_ID': JSON.stringify('G-SBJHV1DBXJ')
    }),
    new CopyWebpackPlugin({
      patterns: [
        { from: 'assets', to: 'assets' },
        { from: 'public/robots.txt', to: 'robots.txt' }
      ]
    }),
    // Fix native modules
    new webpack.ProvidePlugin({
      'process': require.resolve('process/browser'),
      'process.env': require.resolve('process/browser'),
      'setImmediate': 'setimmediate', 
      'Buffer': ['buffer', 'Buffer']
    })
  ],
  devServer: {
    static: {
      directory: path.join(appDirectory, 'public'),
    },
    port: 3002,
    hot: true,
    historyApiFallback: true,
    open: true,
    client: {
      overlay: true
    }
  }
};