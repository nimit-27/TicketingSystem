import { createTheme } from '@mui/material/styles';

const lightTheme = createTheme({
  palette: {
    mode: 'light',
    primary: { main: '#1b5e20' },
    secondary: { main: '#FF671F' },
    success: { main: '#1b5e20' },
    background: {
      default: '#ffffff',
      paper: '#ffffff',
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
        },
      },
    },
  },
});

const darkTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: { main: '#73B579' },
    secondary: { main: '#232222' },
    success: { main: '#73B579' },
    background: {
      default: '#303030',
      paper: '#424242',
    },
    action: {
      disabledBackground: '#555555',
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
        },
      },
    },
  },
});

const fciTheme = createTheme({
  palette: {
    mode: 'light',
    primary: { main: '#2e7d32' },
    secondary: { main: '#ff9800' },
    success: { main: '#1b5e20' },
    background: {
      default: '#fafafa',
      paper: '#ffffff',
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
        },
      },
    },
  },
});

export const allThemes = {
  light: lightTheme,
  dark: darkTheme,
  fci: fciTheme,
};

export type ThemeName = keyof typeof allThemes;
