// Web polyfills to ensure React Native components work on web
import 'setimmediate';

// Mock missing native modules
if (typeof window !== 'undefined') {
  window.__DEV__ = process.env.NODE_ENV !== 'production';
  
  // Mock native modules if needed
  if (!window.ReactNativeWebView) {
    window.ReactNativeWebView = {
      postMessage: (data) => {
        console.log('ReactNativeWebView.postMessage mock', data);
      },
    };
  }
}

export default {
  install: () => {
    console.log('Web polyfills installed');
  },
};