import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';

import CustomThemeProvider, { ThemeModeContext } from '../ThemeContext';

jest.mock('@mui/material/styles', () => ({
  ThemeProvider: ({ children }: { children: React.ReactNode }) => <div data-testid="theme-wrapper">{children}</div>,
  createTheme: (options: unknown) => options,
}));

jest.mock('@mui/material', () => ({
  CssBaseline: () => <div data-testid="css-baseline" />,
}));

describe('ThemeContext', () => {
  const Consumer: React.FC = () => {
    const { mode, toggle, layout, toggleLayout } = React.useContext(ThemeModeContext);
    return (
      <div>
        <span data-testid="mode">{mode}</span>
        <span data-testid="layout">{layout}</span>
        <button type="button" onClick={toggle}>
          toggle-mode
        </button>
        <button type="button" onClick={toggleLayout}>
          toggle-layout
        </button>
      </div>
    );
  };

  it('provides default light mode and layout 1', () => {
    render(
      <CustomThemeProvider>
        <Consumer />
      </CustomThemeProvider>
    );

    expect(screen.getByTestId('theme-wrapper')).toBeInTheDocument();
    expect(screen.getByTestId('css-baseline')).toBeInTheDocument();
    expect(screen.getByTestId('mode').textContent).toBe('light');
    expect(screen.getByTestId('layout').textContent).toBe('2');
  });

  it('toggles theme mode between light and dark', () => {
    render(
      <CustomThemeProvider>
        <Consumer />
      </CustomThemeProvider>
    );

    fireEvent.click(screen.getByText('toggle-mode'));
    expect(screen.getByTestId('mode').textContent).toBe('dark');

    fireEvent.click(screen.getByText('toggle-mode'));
    expect(screen.getByTestId('mode').textContent).toBe('light');
  });

  it('cycles layout values from 1 to 3 and back to 1', () => {
    render(
      <CustomThemeProvider>
        <Consumer />
      </CustomThemeProvider>
    );

    fireEvent.click(screen.getByText('toggle-layout'));
    expect(screen.getByTestId('layout').textContent).toBe('3');

    fireEvent.click(screen.getByText('toggle-layout'));
    expect(screen.getByTestId('layout').textContent).toBe('1');

    fireEvent.click(screen.getByText('toggle-layout'));
    expect(screen.getByTestId('layout').textContent).toBe('2');
  });
});
