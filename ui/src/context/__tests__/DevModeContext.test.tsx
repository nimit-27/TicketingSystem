import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';

import DevModeProvider, { DevModeContext } from '../DevModeContext';
import { isJwtBypassEnabled, setJwtBypassEnabled } from '../../utils/authToken';

jest.mock('../../utils/authToken', () => ({
  isJwtBypassEnabled: jest.fn(),
  setJwtBypassEnabled: jest.fn(),
}));

describe('DevModeContext', () => {
  const Consumer: React.FC = () => {
    const { devMode, toggleDevMode, jwtBypass, toggleJwtBypass, setJwtBypass } = React.useContext(DevModeContext);

    return (
      <div>
        <span data-testid="dev-mode">{devMode ? 'enabled' : 'disabled'}</span>
        <span data-testid="jwt-bypass">{jwtBypass ? 'enabled' : 'disabled'}</span>
        <button type="button" onClick={toggleDevMode}>
          toggle-dev
        </button>
        <button type="button" onClick={toggleJwtBypass}>
          toggle-jwt
        </button>
        <button type="button" onClick={() => setJwtBypass(true)}>
          enable-jwt
        </button>
      </div>
    );
  };

  beforeEach(() => {
    sessionStorage.clear();
    (isJwtBypassEnabled as jest.Mock).mockReset();
    (setJwtBypassEnabled as jest.Mock).mockReset();
  });

  it('initializes from sessionStorage and auth token helpers', () => {
    sessionStorage.setItem('dev', 'true');
    (isJwtBypassEnabled as jest.Mock).mockReturnValue(true);

    render(
      <DevModeProvider>
        <Consumer />
      </DevModeProvider>
    );

    expect(screen.getByTestId('dev-mode').textContent).toBe('enabled');
    expect(screen.getByTestId('jwt-bypass').textContent).toBe('enabled');
    expect(isJwtBypassEnabled).toHaveBeenCalled();
    expect(setJwtBypassEnabled).toHaveBeenCalledWith(true);
  });

  it('toggles dev mode and jwt bypass state', () => {
    sessionStorage.setItem('dev', 'false');
    (isJwtBypassEnabled as jest.Mock).mockReturnValue(false);

    render(
      <DevModeProvider>
        <Consumer />
      </DevModeProvider>
    );

    fireEvent.click(screen.getByText('toggle-dev'));
    expect(screen.getByTestId('dev-mode').textContent).toBe('enabled');
    expect(sessionStorage.getItem('dev')).toBe('true');

    fireEvent.click(screen.getByText('toggle-jwt'));
    expect(screen.getByTestId('jwt-bypass').textContent).toBe('enabled');
    expect(setJwtBypassEnabled).toHaveBeenLastCalledWith(true);

    fireEvent.click(screen.getByText('enable-jwt'));
    expect(screen.getByTestId('jwt-bypass').textContent).toBe('enabled');
    expect(setJwtBypassEnabled).toHaveBeenLastCalledWith(true);
  });
});
