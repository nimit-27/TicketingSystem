import React from 'react';
import { fireEvent, render } from '@testing-library/react';

const mockLoginUser = jest.fn(() => Promise.resolve({ token: 'abc' }));
const mockUseApi = jest.fn();

jest.mock('../../services/AuthService', () => ({
  loginUser: (...args: unknown[]) => mockLoginUser(...args),
}));

jest.mock('../../services/RoleService', () => ({
  getRoleSummaries: jest.fn(() => Promise.resolve({ data: [] })),
}));

jest.mock('../../utils/permissions', () => ({
  setPermissions: jest.fn(),
}));

jest.mock('../../utils/Utils', () => ({
  setRoleLookup: jest.fn(),
  setUserDetails: jest.fn(),
}));

jest.mock('../../utils/authToken', () => ({
  storeToken: jest.fn(),
  getDecodedAuthDetails: jest.fn(() => null),
}));

jest.mock('../../hooks/useApi', () => ({
  useApi: (...args: unknown[]) => mockUseApi(...args),
}));

jest.mock('../../context/DevModeContext', () => {
  const ReactModule = require('react');
  return {
    DevModeContext: ReactModule.createContext({
      devMode: false,
      jwtBypass: false,
      toggleJwtBypass: jest.fn(),
      toggleDevMode: jest.fn(),
    }),
  };
});

jest.mock('react-router-dom', () => ({
  useNavigate: () => jest.fn(),
  Link: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

import Login from '../Login';

describe('Login page', () => {
  beforeEach(() => {
    mockLoginUser.mockClear();
    mockUseApi.mockReset();
    mockUseApi.mockReturnValue({ data: null, error: null, apiHandler: jest.fn((fn: () => Promise<any>) => fn()) });
  });

  it('allows requester login submission', async () => {
    const { getByText, getAllByRole, container } = render(<Login />);

    const [userIdInput] = getAllByRole('textbox');
    fireEvent.change(userIdInput, { target: { value: 'tester' } });
    const passwordInput = container.querySelector('input[type="password"]') as HTMLInputElement;
    fireEvent.change(passwordInput, { target: { value: 'secret' } });
    fireEvent.click(getByText('LOGIN'));

    expect(mockLoginUser).toHaveBeenCalledWith({ username: 'tester', password: 'secret', portal: 'requestor' });
  });

  it('switches to helpdesk portal', () => {
    const { getByRole, getAllByRole, container, getByText } = render(<Login />);

    fireEvent.click(getByRole('tab', { name: 'Helpdesk' }));
    const [userIdInput] = getAllByRole('textbox');
    fireEvent.change(userIdInput, { target: { value: 'agent' } });
    const passwordInput = container.querySelector('input[type="password"]') as HTMLInputElement;
    fireEvent.change(passwordInput, { target: { value: 'secret' } });
    fireEvent.click(getByText('LOGIN'));

    expect(mockLoginUser).toHaveBeenCalledWith({ username: 'agent', password: 'secret', portal: 'helpdesk' });
  });
});
