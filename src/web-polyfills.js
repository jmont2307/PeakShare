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
  
  // Fix for touch and click events in React Native Web
  if (typeof document !== 'undefined') {
    // Add touch/click polyfill script
    const script = document.createElement('script');
    script.innerHTML = `
      // Ensure proper click handling for touch events
      (function() {
        // Modify the touch-action CSS property for all interactable elements
        const style = document.createElement('style');
        style.innerHTML = \`
          button, a, [role="button"], .touchable, [data-clickable="true"],
          [data-testid], [class*="touchable"], [class*="button"],
          [class*="pressable"] {
            touch-action: manipulation !important;
            cursor: pointer !important;
            -webkit-tap-highlight-color: transparent !important;
          }
        \`;
        document.head.appendChild(style);
        
        // Add passive false to touch events to ensure they behave correctly
        window.addEventListener('touchstart', function() {}, { passive: false });
        window.addEventListener('touchmove', function() {}, { passive: false });
        window.addEventListener('touchend', function() {}, { passive: false });
      })();
    `;
    document.head.appendChild(script);
    
    // Add fast click override
    document.addEventListener('DOMContentLoaded', function() {
      const linkTags = document.getElementsByTagName('a');
      const buttonTags = document.getElementsByTagName('button');
      
      // Add click handlers to ensure they fire properly
      for (let i = 0; i < linkTags.length; i++) {
        linkTags[i].addEventListener('click', function(e) {
          e.preventDefault();
          e.stopPropagation();
          if (this.href) window.location.href = this.href;
        });
      }
      
      for (let i = 0; i < buttonTags.length; i++) {
        buttonTags[i].addEventListener('click', function(e) {
          // Ensure the click event is propagated correctly
          if (this.onclick) this.onclick();
        });
      }
    });
  }
}

export default {
  install: () => {
    console.log('Web polyfills installed');
  },
};