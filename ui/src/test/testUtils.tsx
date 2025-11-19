import { ReactElement, ReactNode } from 'react';
import { render, RenderOptions } from '@testing-library/react';
import { ThemeProvider, Theme, ThemeOptions, createTheme } from '@mui/material/styles';
import { allThemes, ThemeName } from '../themes/themes';

export const createTestTheme = (options?: ThemeOptions, themeName: ThemeName = 'light'): Theme => {
  const baseTheme = allThemes[themeName];

  if (!options) {
    return baseTheme;
  }

  return createTheme({
    ...baseTheme,
    ...options,
    palette: {
      ...baseTheme.palette,
      ...options.palette,
    },
    components: {
      ...baseTheme.components,
      ...options.components,
    },
    typography: {
      ...baseTheme.typography,
      ...options.typography,
    },
  });
};

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
