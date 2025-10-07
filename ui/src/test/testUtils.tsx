import { ReactElement, ReactNode } from 'react';
import { render, RenderOptions } from '@testing-library/react';
import { ThemeProvider, Theme, ThemeOptions, createTheme } from '@mui/material/styles';

export const createTestTheme = (options?: ThemeOptions): Theme =>
  createTheme({
    palette: {
      mode: 'light',
      primary: { main: '#1976d2' },
      success: { main: '#2e7d32', dark: '#1b5e20' },
    },
    ...options,
  });

interface ProvidersOptions extends Omit<RenderOptions, 'wrapper'> {
  theme?: Theme;
}

const renderWithTheme = (ui: ReactElement, { theme = createTestTheme(), ...renderOptions }: ProvidersOptions = {}) => {
  if (typeof window !== 'undefined' && typeof window.matchMedia !== 'function') {
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: (query: string) => ({
        matches: false,
        media: query,
        onchange: null,
        addListener: () => undefined,
        removeListener: () => undefined,
        addEventListener: () => undefined,
        removeEventListener: () => undefined,
        dispatchEvent: () => false,
      }),
    });
  }

  function Wrapper({ children }: { children?: ReactNode }) {
    return <ThemeProvider theme={theme}>{children}</ThemeProvider>;
  }

  return render(ui, { wrapper: Wrapper, ...renderOptions });
};

export { renderWithTheme };
