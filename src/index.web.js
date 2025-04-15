// Enhanced web entry point for PeakShare
import { AppRegistry } from 'react-native';
import SimpleApp from './SimpleApp';

// Use constant app name instead of importing from app.json
const APP_NAME = 'PeakShare';

// Register the app
AppRegistry.registerComponent(APP_NAME, () => SimpleApp);

// Web setup
const rootTag = document.getElementById('root');
if (rootTag) {
  AppRegistry.runApplication(APP_NAME, {
    rootTag: rootTag
  });
} else {
  console.error('Root element not found');
}

// Enhanced web styling
const style = document.createElement('style');
style.textContent = `
  html, body, #root {
    height: 100%;
    margin: 0;
    padding: 0;
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
    -webkit-font-smoothing: antialiased;
  }
  
  #root {
    display: flex;
    flex-direction: column;
    max-width: 100%;
    overflow-x: hidden;
  }
  
  /* Responsive styles */
  @media (min-width: 768px) {
    #root {
      max-width: 1024px;
      margin: 0 auto;
      box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
    }
  }
  
  /* Improved form elements for web */
  input, button, textarea {
    font-family: inherit;
  }
  
  /* Better scrolling experience */
  * {
    -webkit-overflow-scrolling: touch;
  }
`;

document.head.appendChild(style);