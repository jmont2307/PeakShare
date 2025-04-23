import React, { createContext, useState, useEffect } from 'react';
import { AsyncStorage } from '../native-modules';
import { LightTheme, DarkTheme } from '../theme';

// Safe logging function
const safeLog = (...args) => {
  try {
    if (typeof console !== 'undefined' && console.error) {
      console.error(...args);
    }
  } catch (e) {
    // Silent fallback
  }
};

// Check for system dark mode preference safely
const getSystemColorScheme = () => {
  try {
    return typeof window !== 'undefined' && 
           window.matchMedia && 
           window.matchMedia('(prefers-color-scheme: dark)').matches;
  } catch (e) {
    safeLog('Error checking system color scheme:', e);
    return false;
  }
};

// Create a context to manage the theme state
export const ThemeContext = createContext({
  isDarkMode: false,
  theme: LightTheme,
  toggleTheme: () => {},
  isLoading: false
});

// Theme provider component with enhanced error handling
export const ThemeProvider = ({ children }) => {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [theme, setTheme] = useState(LightTheme);
  const [isLoading, setIsLoading] = useState(true);

  // Apply theme change safely
  const applyTheme = (darkMode) => {
    try {
      setIsDarkMode(darkMode);
      setTheme(darkMode ? DarkTheme : LightTheme);
    } catch (e) {
      safeLog('Error applying theme:', e);
      // Fallback to light theme
      setIsDarkMode(false);
      setTheme(LightTheme);
    }
  };

  // Load saved theme preference with enhanced error handling
  useEffect(() => {
    let isMounted = true;

    const loadThemePreference = async () => {
      try {
        // Default to light theme initially
        let darkModeEnabled = false;

        // We'll use a unique key for each user by using the user ID or a device ID
        // For now, we'll use a simple approach with localStorage to keep it per-browser
        const storageKey = 'userThemePreference_local';
        
        try {
          const savedThemePreference = await AsyncStorage.getItem(storageKey);
          
          if (savedThemePreference !== null) {
            darkModeEnabled = savedThemePreference === 'true';
          } else {
            // Check system preference
            darkModeEnabled = getSystemColorScheme();
          }
        } catch (storageError) {
          safeLog('Storage error when loading theme, using system preference:', storageError);
          darkModeEnabled = getSystemColorScheme();
        }

        // Only update state if the component is still mounted
        if (isMounted) {
          applyTheme(darkModeEnabled);
        }
      } catch (error) {
        safeLog('Critical error in theme initialization:', error);
        // Ensure we have a fallback
        if (isMounted) {
          applyTheme(false); // Default to light theme
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    // Start loading the theme
    loadThemePreference();

    // Clean up function to prevent state updates if unmounted
    return () => {
      isMounted = false;
    };
  }, []);

  // Toggle between light and dark theme with improved error handling
  const toggleTheme = async () => {
    try {
      const newDarkModeValue = !isDarkMode;
      const storageKey = 'userThemePreference_local';
      
      // First update the UI immediately
      applyTheme(newDarkModeValue);
      
      // Then try to persist the setting
      try {
        await AsyncStorage.setItem(storageKey, String(newDarkModeValue));
      } catch (storageError) {
        safeLog('Error saving theme preference:', storageError);
        // UI is already updated, so the app will still work
      }
    } catch (error) {
      safeLog('Error toggling theme:', error);
      // If all else fails, at least try to keep UI state consistent
      applyTheme(isDarkMode);
    }
  };

  return (
    <ThemeContext.Provider value={{ 
      isDarkMode, 
      theme, 
      toggleTheme, 
      isLoading 
    }}>
      {children}
    </ThemeContext.Provider>
  );
};