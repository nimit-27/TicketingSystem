import React from 'react';
import { fireEvent, screen, waitFor } from '@testing-library/react';
import { renderWithTheme } from '../../test/testUtils';

const mockNavigate = jest.fn();
const mockShowMessage = jest.fn();
const mockGetAllUsers = jest.fn();
const mockLoginUser = jest.fn();
const mockGetRolePermission = jest.fn();
const mockGetRoleSummaries = jest.fn();
const mockSetPermissions = jest.fn();
const mockSetRoleLookup = jest.fn();
const mockSetUserDetails = jest.fn();

jest.mock('react-router-dom', () => ({
  useNavigate: () => mockNavigate,
}));

jest.mock('../../context/SnackbarContext', () => ({
  useSnackbar: () => ({ showMessage: mockShowMessage }),
}));

jest.mock('../../context/DevModeContext', () => {
  const React = require('react');
  return {
    DevModeContext: React.createContext({
      devMode: true,
      toggleDevMode: jest.fn(),
      jwtBypass: true,
      setJwtBypass: jest.fn(),
    }),
  };
});

jest.mock('../../services/UserService', () => ({
  getAllUsers: () => mockGetAllUsers(),
}));

jest.mock('../../services/AuthService', () => ({
  loginUser: (...args: unknown[]) => mockLoginUser(...args),
}));

jest.mock('../../services/RoleService', () => ({
  getRolePermission: (...args: unknown[]) => mockGetRolePermission(...args),
  getRoleSummaries: () => mockGetRoleSummaries(),
}));

jest.mock('../../utils/permissions', () => ({
  setPermissions: (...args: unknown[]) => mockSetPermissions(...args),
}));

jest.mock('../../utils/Utils', () => ({
  setRoleLookup: (...args: unknown[]) => mockSetRoleLookup(...args),
  setUserDetails: (...args: unknown[]) => mockSetUserDetails(...args),
}));

import DevLogin from '../DevLogin';

describe('DevLogin', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockGetRoleSummaries.mockResolvedValue({ data: [{ roleId: '1', role: 'Admin' }] });
    mockGetAllUsers.mockResolvedValue({ data: [{ userId: 'u1', username: 'agent1', name: 'Agent One', role: 'Helpdesk Agent', roleNames: ['Helpdesk Agent'] }] });
  });

  it('loads users and logs in selected user with permissions from login response', async () => {
    mockLoginUser.mockResolvedValue({
      data: {
        userId: 'u1',
        username: 'agent1',
        roles: ['Helpdesk Agent'],
        permissions: { users: ['view'] },
      },
    });

    renderWithTheme(<DevLogin />);

    expect(await screen.findByText('agent1')).toBeInTheDocument();
    fireEvent.click(screen.getByText('agent1'));

    await waitFor(() => expect(mockLoginUser).toHaveBeenCalledWith({ username: 'agent1', password: 'admin123', portal: 'helpdesk' }));
    expect(mockSetUserDetails).toHaveBeenCalled();
    expect(mockSetPermissions).toHaveBeenCalledWith({ users: ['view'] });
    expect(mockNavigate).toHaveBeenCalledWith('/');
  });

  it('falls back to role permission lookup when login does not include permissions', async () => {
    mockLoginUser.mockResolvedValue({ data: { userId: 'u1', username: 'agent1', roles: ['Helpdesk Agent'] } });
    mockGetRolePermission.mockResolvedValue({ data: { tickets: ['read'] } });

    renderWithTheme(<DevLogin />);

    fireEvent.click(await screen.findByText('agent1'));

    await waitFor(() => expect(mockGetRolePermission).toHaveBeenCalledWith('Helpdesk Agent'));
    expect(mockSetPermissions).toHaveBeenCalledWith({ tickets: ['read'] });
  });

  it('shows snackbar error when user list loading fails', async () => {
    mockGetAllUsers.mockRejectedValueOnce(new Error('users failed'));

    renderWithTheme(<DevLogin />);

    await waitFor(() => expect(mockShowMessage).toHaveBeenCalledWith('users failed', 'error'));
  });
});
