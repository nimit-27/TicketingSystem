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
}));

import Login from '../Login';

describe('Login page', () => {
  beforeEach(() => {
    mockLoginUser.mockClear();
    mockUseApi.mockReset();
    mockUseApi.mockReturnValue({ data: null, error: null, apiHandler: jest.fn((fn: () => Promise<any>) => fn()) });
  });

  it('allows portal selection and form submission', async () => {
    const { getByText, getAllByRole, container } = render(<Login />);

    fireEvent.click(getByText('Requestor Login'));
    const [userIdInput] = getAllByRole('textbox');
    fireEvent.change(userIdInput, { target: { value: 'tester' } });
    const passwordInput = container.querySelector('input[type="password"]') as HTMLInputElement;
    fireEvent.change(passwordInput, { target: { value: 'secret' } });
    fireEvent.click(getByText('Login'));

    expect(mockLoginUser).toHaveBeenCalledWith({ username: 'tester', password: 'secret', portal: 'requestor' });
  });

  it('returns to portal selection', () => {
    const { getByText } = render(<Login />);
    fireEvent.click(getByText('Helpdesk Login'));
    fireEvent.click(getByText('Choose a different portal'));
    expect(getByText('Select your portal')).toBeInTheDocument();
  });
});
