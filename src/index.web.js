// Web entry point for PeakShare
import { AppRegistry } from 'react-native';
import SimpleApp from './SimpleApp';

// Get app name
const APP_NAME = 'PeakShare';

// Register the app
AppRegistry.registerComponent(APP_NAME, () => SimpleApp);

// Apply click/touch event overrides directly
if (typeof document !== 'undefined') {
  // Create style for better touchable elements
  const style = document.createElement('style');
  style.textContent = `
    * {
      -webkit-tap-highlight-color: transparent;
    }
    
    html, body, #root {
      height: 100%;
      margin: 0;
      padding: 0;
    }
    
    button, 
    a, 
    [role="button"], 
    .touchable,
    [class*="touchable"], 
    [class*="button"],
    [class*="pressable"] {
      cursor: pointer !important;
    }
  `;
  document.head.appendChild(style);
  
  // Very simple click handler
  document.addEventListener('click', function() {
    // Just let clicks happen naturally
  });
  
  document.addEventListener('touchstart', function() {
    // Just let touches happen naturally
  });
}

// Run the app
AppRegistry.runApplication(APP_NAME, {
  rootTag: document.getElementById('root')
});