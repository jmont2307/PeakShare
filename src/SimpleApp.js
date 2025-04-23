import React, { useContext } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { Provider as PaperProvider } from 'react-native-paper';
import { Provider as ReduxProvider } from 'react-redux';
import { StatusBar, View, StyleSheet, Text, ActivityIndicator } from 'react-native';

import { store } from './redux/store';
import { AuthProvider } from './contexts/AuthContext';
import { ThemeProvider, ThemeContext } from './contexts/ThemeContext';
import AppNavigator from './navigation/AppNavigator';

// Import polyfills for better web experience
import './web-polyfills';

// Simple loading spinner for any loading state
const LoadingSpinner = () => (
  <View style={styles.loadingContainer}>
    <ActivityIndicator size="large" color="#0066CC" />
    <Text style={styles.loadingText}>Loading...</Text>
  </View>
);

// Component that uses the theme context
const ThemedApp = () => {
  const { theme, isDarkMode, isLoading } = useContext(ThemeContext);
  
  // Show loading indicator while theme is loading
  if (isLoading) {
    return <LoadingSpinner />;
  }
  
  return (
    <View style={styles.container}>
      <StatusBar 
        barStyle={isDarkMode ? 'light-content' : 'dark-content'} 
        backgroundColor={theme.colors.background}
      />
      <PaperProvider theme={theme}>
        <NavigationContainer theme={theme} fallback={<LoadingSpinner />}>
          <AppNavigator />
        </NavigationContainer>
      </PaperProvider>
    </View>
  );
};

// Error boundary implementation to catch render errors
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Error in component:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <View style={styles.errorContainer}>
          <Text style={styles.errorTitle}>Something went wrong</Text>
          <Text style={styles.errorMessage}>
            The app encountered an error. Please try refreshing the page.
          </Text>
        </View>
      );
    }

    return this.props.children;
  }
}

// Main SimpleApp component that sets up providers and navigation
const SimpleApp = () => {
  return (
    <ErrorBoundary>
      <ReduxProvider store={store}>
        <AuthProvider>
          <ThemeProvider>
            <ThemedApp />
          </ThemeProvider>
        </AuthProvider>
      </ReduxProvider>
    </ErrorBoundary>
  );
};

// Enhanced styles
const styles = StyleSheet.create({
  container: {
    flex: 1
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF'
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#0066CC'
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#FFFFFF'
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#B00020',
    marginBottom: 10
  },
  errorMessage: {
    fontSize: 16,
    textAlign: 'center',
    color: '#333333'
  }
});

export default SimpleApp;