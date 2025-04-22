// Web polyfills to ensure React Native components work on web
import 'setimmediate';

// Apply polyfills immediately and directly
if (typeof window !== 'undefined') {
  // Set development flag
  window.__DEV__ = process.env.NODE_ENV !== 'production';
  
  // Apply touch event fixes
  if (typeof document !== 'undefined') {
    // Create and inject global styles for better touch handling
    const touchStyle = document.createElement('style');
    touchStyle.innerHTML = `
      * {
        outline: none !important;
      }
      
      html, body {
        overscroll-behavior: none;
        touch-action: manipulation;
        -webkit-tap-highlight-color: transparent;
        user-select: none;
        -webkit-user-select: none;
      }
      
      button, 
      a, 
      [role="button"], 
      .touchable,
      [data-testid],
      [class*="touchable"], 
      [class*="button"],
      [class*="pressable"],
      .r-cursor-pointer,
      input[type="button"],
      input[type="submit"] {
        touch-action: manipulation !important;
        cursor: pointer !important;
        -webkit-tap-highlight-color: transparent !important;
      }
    `;
    document.head.appendChild(touchStyle);
  
    // Simplify the touch event model by removing unnecessary handlers
    const preventDefaultForScrollKeys = (e) => {
      const keys = {37: 1, 38: 1, 39: 1, 40: 1};
      if (keys[e.keyCode]) {
        e.preventDefault();
        return false;
      }
    };
    
    // Disable scrolling when interacting with touchable elements
    window.addEventListener('touchmove', function(e) {
      // Allow scrolling in scrollable areas
      const target = e.target;
      let shouldPrevent = true;
      
      // Check if we're in a scrollable area
      let el = target;
      while (el) {
        if (el.classList && 
            (el.classList.contains('scrollable') || 
             el.tagName === 'TEXTAREA' || 
             el.tagName === 'INPUT' ||
             getComputedStyle(el).overflow === 'scroll' || 
             getComputedStyle(el).overflow === 'auto')) {
          shouldPrevent = false;
          break;
        }
        el = el.parentElement;
      }
      
      if (shouldPrevent) {
        e.preventDefault();
      }
    }, { passive: false });
    
    // Prevent double tap zoom
    let lastTouchEnd = 0;
    document.addEventListener('touchend', function(e) {
      const now = Date.now();
      if (now - lastTouchEnd <= 300) {
        e.preventDefault();
      }
      lastTouchEnd = now;
    }, { passive: false });
    
    // Add touchstart event with very simple propagation
    document.addEventListener('touchstart', function() {}, { passive: false });
    
    // Also prevent default for selected keys
    window.addEventListener('keydown', preventDefaultForScrollKeys, { passive: false });
    
    // Create a mutation observer to apply touch enhancements to new elements
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.addedNodes && mutation.addedNodes.length > 0) {
          for (let i = 0; i < mutation.addedNodes.length; i++) {
            const node = mutation.addedNodes[i];
            if (node.nodeType === 1) { // Element node
              if (node.tagName === 'BUTTON' || 
                  node.tagName === 'A' || 
                  node.hasAttribute('role') && node.getAttribute('role') === 'button') {
                node.style.touchAction = 'manipulation';
                node.style.cursor = 'pointer';
                node.style.webkitTapHighlightColor = 'transparent';
              }
            }
          }
        }
      });
    });
    
    // Start observing with a configuration object
    observer.observe(document.body, { 
      childList: true, 
      subtree: true 
    });
  }
}

export default {
  install: () => {
    console.log('Simplified web polyfills installed');
  },
};