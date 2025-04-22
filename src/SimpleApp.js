import React, { useContext, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { Provider as PaperProvider } from 'react-native-paper';
import { Provider as ReduxProvider } from 'react-redux';
import { StatusBar, View, Platform, StyleSheet } from 'react-native';

import { store } from './redux/store';
import { AuthProvider } from './contexts/AuthContext';
import { ThemeProvider, ThemeContext } from './contexts/ThemeContext';
import AppNavigator from './navigation/AppNavigator';

// Import web polyfills
import './web-polyfills';

// Component that uses the theme context
const ThemedApp = () => {
  const { theme, isDarkMode } = useContext(ThemeContext);
  
  // Apply web-specific touch event fixes
  useEffect(() => {
    if (Platform.OS === 'web') {
      // Make all touchable elements actually respond to touches
      const applyTouchStyles = () => {
        if (typeof document !== 'undefined') {
          const touchableElements = document.querySelectorAll(
            'button, a, [role="button"], .touchable, [class*="touchable"], [class*="button"], [class*="pressable"]'
          );
          
          touchableElements.forEach(el => {
            el.style.touchAction = 'manipulation';
            el.style.cursor = 'pointer';
            el.style.webkitTapHighlightColor = 'transparent';
          });
        }
      };
      
      // Apply immediately and also set interval to catch dynamically added elements
      applyTouchStyles();
      const intervalId = setInterval(applyTouchStyles, 1000);
      
      return () => clearInterval(intervalId);
    }
  }, []);
  
  return (
    <View style={styles.container}>
      <StatusBar 
        barStyle={isDarkMode ? 'light-content' : 'dark-content'} 
        backgroundColor={theme.colors.background}
      />
      <PaperProvider theme={theme}>
        <NavigationContainer theme={theme}>
          <AppNavigator />
        </NavigationContainer>
      </PaperProvider>
    </View>
  );
};

// Main SimpleApp component that sets up providers and navigation
const SimpleApp = () => {
  return (
    <ReduxProvider store={store}>
      <AuthProvider>
        <ThemeProvider>
          <ThemedApp />
        </ThemeProvider>
      </AuthProvider>
    </ReduxProvider>
  );
};

// Define styles for the app container
const styles = StyleSheet.create({
  container: {
    flex: 1,
    // Ensure the container takes full screen on web
    ...(Platform.OS === 'web' ? {
      height: '100%',
      width: '100%',
    } : {})
  }
});

export default SimpleApp;