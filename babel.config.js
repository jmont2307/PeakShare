module.exports = function(api) {
  api.cache(true);
  
  // Check if we're in a web build
  const isWeb = process.env.PLATFORM === 'web' || process.env.NODE_ENV === 'production';
  
  const presets = isWeb 
    ? ['@babel/preset-env', '@babel/preset-react']
    : ['module:metro-react-native-babel-preset'];
    
  const plugins = [
    'react-native-web'
  ];
  
  // Only add dotenv in development
  if (process.env.NODE_ENV !== 'production') {
    plugins.push(['module:react-native-dotenv', {
      moduleName: '@env',
      path: '.env',
      safe: false,
      allowUndefined: true
    }]);
  }
  
  return {
    presets,
    plugins
  };
};