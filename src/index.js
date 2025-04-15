import { AppRegistry, Platform } from 'react-native';
import App from '../App';
import { name as appName } from '../app.json';

// Get app name from app.json consistently
const APP_NAME = appName || 'PeakShare';

// Register the app
AppRegistry.registerComponent(APP_NAME, () => App);

// Web-specific setup
if (Platform.OS === 'web') {
  const rootTag = document.getElementById('root');
  
  if (rootTag) {
    AppRegistry.runApplication(APP_NAME, {
      initialProps: {},
      rootTag: rootTag,
    });
  } else {
    console.error('Root element not found. The app cannot be rendered.');
  }
}