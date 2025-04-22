import React, { createContext, useState, useEffect } from 'react';
import { AsyncStorage } from '../native-modules';
import { LightTheme, DarkTheme } from '../theme';

// Create a context to manage the theme state
export const ThemeContext = createContext({
  isDarkMode: false,
  theme: LightTheme,
  toggleTheme: () => {},
});

// Theme provider component
export const ThemeProvider = ({ children }) => {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [theme, setTheme] = useState(LightTheme);
  const [isLoading, setIsLoading] = useState(true);

  // Load saved theme preference
  useEffect(() => {
    const loadThemePreference = async () => {
      try {
        const savedThemePreference = await AsyncStorage.getItem('isDarkMode');
        
        if (savedThemePreference !== null) {
          const darkModeEnabled = savedThemePreference === 'true';
          setIsDarkMode(darkModeEnabled);
          setTheme(darkModeEnabled ? DarkTheme : LightTheme);
        }
      } catch (error) {
        console.error('Error loading theme preference:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadThemePreference();
  }, []);

  // Toggle between light and dark theme
  const toggleTheme = async () => {
    try {
      const newDarkModeValue = !isDarkMode;
      await AsyncStorage.setItem('isDarkMode', String(newDarkModeValue));
      setIsDarkMode(newDarkModeValue);
      setTheme(newDarkModeValue ? DarkTheme : LightTheme);
    } catch (error) {
      console.error('Error saving theme preference:', error);
    }
  };

  // Return a loading placeholder while theme is loading
  if (isLoading) {
    return null; // or a loading indicator
  }

  return (
    <ThemeContext.Provider value={{ isDarkMode, theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};