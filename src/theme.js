import { DefaultTheme } from 'react-native-paper';

export const theme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
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
};