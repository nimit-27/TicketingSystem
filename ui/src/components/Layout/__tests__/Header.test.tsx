import React from 'react';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Header from '../Header';
import { ThemeModeContext } from '../../../context/ThemeContext';
import { LanguageContext } from '../../../context/LanguageContext';
import { DevModeContext } from '../../../context/DevModeContext';
import { renderWithTheme, createTestTheme } from '../../../test/testUtils';

jest.mock('../UserMenu', () => ({ open }: { open: boolean }) => (
  <div data-testid="user-menu" data-open={open} />
));

jest.mock('../../Notifications/NotificationBell', () => ({ iconColor }: { iconColor: string }) => (
  <div data-testid="notification-bell" data-icon-color={iconColor} />
));

jest.mock('../../../config/config', () => ({
  getCurrentUserDetails: jest.fn(() => ({
    name: 'John Doe',
    username: 'johnd',
    userId: 'user-1',
  })),
}));

describe('Header', () => {
  const toggleSidebar = jest.fn();
  const toggleTheme = jest.fn();
  const toggleLanguage = jest.fn();
  const toggleDevMode = jest.fn();
  const toggleJwtBypass = jest.fn();
  const toggleLayout = jest.fn();

  const renderHeader = ({
    mode = 'light',
    devMode = false,
    jwtBypass = false,
    collapsed = false,
  }: {
    mode?: 'light' | 'dark';
    devMode?: boolean;
    jwtBypass?: boolean;
    collapsed?: boolean;
  } = {}) => {
    const theme = createTestTheme({ palette: { mode } });

    return renderWithTheme(
      <ThemeModeContext.Provider value={{ mode, toggle: toggleTheme, layout: 1, toggleLayout }}>
        <LanguageContext.Provider value={{ language: 'en', toggleLanguage }}>
          <DevModeContext.Provider
            value={{
              devMode,
              toggleDevMode,
              jwtBypass,
              toggleJwtBypass,
              setJwtBypass: jest.fn(),
            }}
          >
            <Header collapsed={collapsed} toggleSidebar={toggleSidebar} />
          </DevModeContext.Provider>
        </LanguageContext.Provider>
      </ThemeModeContext.Provider>,
      { theme },
    );
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('opens the user menu from the avatar and toggles the sidebar button', async () => {
    renderHeader({ collapsed: true });

    const menuButton = screen.getByTestId('MenuIcon').closest('button');
    expect(menuButton).toBeInTheDocument();

    await userEvent.click(menuButton!);
    expect(toggleSidebar).toHaveBeenCalledTimes(1);

    const avatar = screen.getByTestId('PersonIcon').closest('div');
    expect(avatar).not.toBeNull();

    await userEvent.click(avatar!);
    expect(screen.getByTestId('user-menu')).toHaveAttribute('data-open', 'true');
  });

  it('triggers theme, language and dev mode toggles', async () => {
    renderHeader({ devMode: true, jwtBypass: true });

    const darkModeButton = screen.getByTestId('DarkModeIcon').closest('button');
    const translateButton = screen.getByTestId('TranslateIcon').closest('button');
    const devModeButton = screen.getByTestId('CodeIcon').closest('button');
    const jwtBypassButton = screen.getByTestId('LockOpenIcon').closest('button');
    const layoutButton = screen.getByRole('button', { name: '1' });

    await userEvent.click(darkModeButton!);
    await userEvent.click(translateButton!);
    await userEvent.click(devModeButton!);
    await userEvent.click(jwtBypassButton!);
    await userEvent.click(layoutButton);

    expect(toggleTheme).toHaveBeenCalledTimes(1);
    expect(toggleLanguage).toHaveBeenCalledTimes(1);
    expect(toggleDevMode).toHaveBeenCalledTimes(1);
    expect(toggleJwtBypass).toHaveBeenCalledTimes(1);
    expect(toggleLayout).toHaveBeenCalledTimes(1);
  });

  it('renders appropriate logo for light and dark themes', () => {
    const { unmount } = renderHeader({ mode: 'light' });

    expect(screen.getByRole('img')).toHaveAttribute('src', './logo.png');

    unmount();

    renderWithTheme(
      <ThemeModeContext.Provider value={{ mode: 'dark', toggle: toggleTheme, layout: 1, toggleLayout }}>
        <LanguageContext.Provider value={{ language: 'en', toggleLanguage }}>
          <DevModeContext.Provider
            value={{
              devMode: false,
              toggleDevMode,
              jwtBypass: false,
              toggleJwtBypass,
              setJwtBypass: jest.fn(),
            }}
          >
            <Header collapsed={false} toggleSidebar={toggleSidebar} />
          </DevModeContext.Provider>
        </LanguageContext.Provider>
      </ThemeModeContext.Provider>,
      { theme: createTestTheme({ palette: { mode: 'dark' } }) },
    );

    const logo = screen.getByRole('img');
    expect(logo).toHaveAttribute('src', './fciLogo.png');
  });
});
