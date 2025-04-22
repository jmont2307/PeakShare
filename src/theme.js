import { DefaultTheme, DarkTheme as PaperDarkTheme } from 'react-native-paper';
import { DefaultTheme as NavigationDefaultTheme, DarkTheme as NavigationDarkTheme } from '@react-navigation/native';

// Light theme
export const LightTheme = {
  ...DefaultTheme,
  ...NavigationDefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    ...NavigationDefaultTheme.colors,
    primary: '#0066CC',
    accent: '#FFFFFF',
    background: '#FFFFFF',
    surface: '#F8FAFC',
    error: '#B00020',
    text: '#1A202C',
    onBackground: '#1A202C',
    onSurface: '#1A202C',
    disabled: '#C9C9C9',
    placeholder: '#A0A0A0',
    backdrop: 'rgba(0, 0, 0, 0.5)',
    notification: '#0066CC',
    // Skiing aesthetic colors
    snow: '#FFFFFF',
    ice: '#E1F5FE',
    glacier: '#81D4FA',
    powder: '#F5F5F5',
    mountain: '#2D3748',
    forest: '#1B5E20',
    deepBlue: '#004080',
    skyBlue: '#4299E1',
    midnight: '#1A202C',
    silver: '#CBD5E0',
    warning: '#FFC107',
    success: '#38A169',
  },
  fonts: {
    ...DefaultTheme.fonts,
    regular: {
      fontFamily: 'sans-serif',
      fontWeight: 'normal',
    },
    medium: {
      fontFamily: 'sans-serif-medium',
      fontWeight: 'normal',
    },
    light: {
      fontFamily: 'sans-serif-light',
      fontWeight: 'normal',
    },
    thin: {
      fontFamily: 'sans-serif-thin',
      fontWeight: 'normal',
    },
  },
  roundness: 8,
  animation: {
    scale: 1.0,
  },
  dark: false,
};

// Dark theme
export const DarkTheme = {
  ...PaperDarkTheme,
  ...NavigationDarkTheme,
  colors: {
    ...PaperDarkTheme.colors,
    ...NavigationDarkTheme.colors,
    primary: '#4299E1',
    accent: '#333333',
    background: '#121212',
    surface: '#1E1E1E',
    error: '#CF6679',
    text: '#FFFFFF',
    onBackground: '#FFFFFF',
    onSurface: '#FFFFFF',
    disabled: '#555555',
    placeholder: '#777777',
    backdrop: 'rgba(0, 0, 0, 0.7)',
    notification: '#4299E1',
    // Skiing aesthetic colors
    snow: '#FFFFFF',
    ice: '#81D4FA',
    glacier: '#4299E1',
    powder: '#2A2A2A',
    mountain: '#A0AEC0',
    forest: '#48BB78',
    deepBlue: '#4299E1',
    skyBlue: '#63B3ED',
    midnight: '#E2E8F0',
    silver: '#4A5568',
    warning: '#F6AD55',
    success: '#68D391',
    card: '#1E1E1E',
    border: '#333333',
  },
  fonts: {
    ...PaperDarkTheme.fonts,
    regular: {
      fontFamily: 'sans-serif',
      fontWeight: 'normal',
    },
    medium: {
      fontFamily: 'sans-serif-medium',
      fontWeight: 'normal',
    },
    light: {
      fontFamily: 'sans-serif-light',
      fontWeight: 'normal',
    },
    thin: {
      fontFamily: 'sans-serif-thin',
      fontWeight: 'normal',
    },
  },
  roundness: 8,
  animation: {
    scale: 1.0,
  },
  dark: true,
};

// Default theme export for backward compatibility
export const theme = LightTheme;