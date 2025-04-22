import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { Provider as PaperProvider } from 'react-native-paper';
import { Provider as ReduxProvider } from 'react-redux';

import { theme } from './theme';
import { store } from './redux/store';
import { AuthProvider } from './contexts/AuthContext';
import AppNavigator from './navigation/AppNavigator';

// Main SimpleApp component that sets up providers and navigation
const SimpleApp = () => {
  return (
    <ReduxProvider store={store}>
      <AuthProvider>
        <PaperProvider theme={theme}>
          <NavigationContainer>
            <AppNavigator />
          </NavigationContainer>
        </PaperProvider>
      </AuthProvider>
    </ReduxProvider>
  );
};

export default SimpleApp;