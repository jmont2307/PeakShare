// Web polyfills for React Native Web - simplified version

// Only run in web environment
if (typeof document !== 'undefined') {
  // Create style element for better click handling
  const style = document.createElement('style');
  style.textContent = `
    * {
      -webkit-tap-highlight-color: transparent;
    }
    
    html, body {
      touch-action: manipulation;
      user-select: none;
      -webkit-user-select: none;
    }
    
    button, 
    a, 
    [role="button"],
    [data-testid],
    [class*="touchable"],
    [class*="button"],
    [class*="pressable"] {
      cursor: pointer !important;
      touch-action: manipulation !important;
    }
  `;
  document.head.appendChild(style);
  
  // Simplify global event handlers
  const eventNames = [
    'click', 'touchstart', 'touchmove', 'touchend', 'touchcancel'
  ];
  
  eventNames.forEach(eventName => {
    document.addEventListener(eventName, event => {
      // Let events propagate normally without interference
    }, { passive: false, capture: false });
  });
  
  // Prevent double-tap to zoom on iOS devices
  let lastTouchEnd = 0;
  document.addEventListener('touchend', event => {
    const now = Date.now();
    if (now - lastTouchEnd <= 300) {
      event.preventDefault();
    }
    lastTouchEnd = now;
  }, { passive: false });
}

// Simple export
export default {
  install: () => console.log('Web polyfills installed')
};