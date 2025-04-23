import React, { useContext } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { Provider as PaperProvider } from 'react-native-paper';
import { Provider as ReduxProvider } from 'react-redux';
import { StatusBar, View, StyleSheet } from 'react-native';

import { store } from './redux/store';
import { AuthProvider } from './contexts/AuthContext';
import { ThemeProvider, ThemeContext } from './contexts/ThemeContext';
import AppNavigator from './navigation/AppNavigator';

// Import polyfills for better web experience
import './web-polyfills';

// Component that uses the theme context
const ThemedApp = () => {
  const { theme, isDarkMode } = useContext(ThemeContext);
  
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

// Basic styles
const styles = StyleSheet.create({
  container: {
    flex: 1
  }
});

export default SimpleApp;