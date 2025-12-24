import React from 'react';
import { screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import UserMenu from '../UserMenu';
import { renderWithTheme } from '../../../test/testUtils';

const mockGetCurrentUserDetails = jest.fn();
const mockGetRoleLookup = jest.fn();
const mockGetDisplayRoles = jest.fn();
const mockLogout = jest.fn();
const mockNavigate = jest.fn();

jest.mock('../../../config/config', () => ({
  getCurrentUserDetails: () => mockGetCurrentUserDetails(),
}));

jest.mock('../../../utils/Utils', () => ({
  ...jest.requireActual('../../../utils/Utils'),
  getRoleLookup: () => mockGetRoleLookup(),
  getDisplayRoles: () => mockGetDisplayRoles(),
  logout: () => mockLogout(),
}));

jest.mock('react-router-dom', () => ({
  useNavigate: () => mockNavigate,
}));

describe('UserMenu', () => {
  beforeEach(() => {
    mockGetCurrentUserDetails.mockReset();
    mockGetRoleLookup.mockReset();
    mockGetDisplayRoles.mockReset();
    mockLogout.mockReset();
    mockNavigate.mockReset();
    mockGetDisplayRoles.mockReturnValue([]);
  });

  const createAnchor = () => {
    const anchor = document.createElement('div');
    document.body.appendChild(anchor);
    return anchor;
  };

  const renderMenu = (onClose = jest.fn()) => renderWithTheme(
    <UserMenu anchorEl={createAnchor()} open onClose={onClose} />,
  );

  it('renders user information and resolved role names', () => {
    mockGetCurrentUserDetails.mockReturnValue({
      name: 'Jane Doe',
      username: 'jane',
      userId: 'user-123',
      email: 'jane.doe@example.com',
      phone: '1234567890',
      role: ['1', 'custom'],
    });
    mockGetRoleLookup.mockReturnValue([
      { roleId: 1, role: 'Manager' },
      { roleId: 'CUSTOM', role: 'Custom Role' },
    ]);
    mockGetDisplayRoles.mockReturnValue([
      { roleId: 1, role: 'Manager' },
      { roleId: 'CUSTOM', role: 'Custom Role' },
    ]);

    renderMenu();

    expect(screen.getByText('Jane Doe')).toBeInTheDocument();
    expect(screen.getByText('jane')).toBeInTheDocument();
    expect(screen.getByText('jane.doe@example.com')).toBeInTheDocument();
    expect(screen.getByText('1234567890')).toBeInTheDocument();

    const rolesSection = screen.getByText('ROLES').closest('div');
    expect(rolesSection).not.toBeNull();
    expect(within(rolesSection as HTMLElement).getByText('Manager')).toBeInTheDocument();
    expect(within(rolesSection as HTMLElement).getByText('Custom Role')).toBeInTheDocument();
  });

  it('calls logout when confirmed by the user', async () => {
    mockGetCurrentUserDetails.mockReturnValue({ userId: 'user-1' });
    mockGetRoleLookup.mockReturnValue([]);
    const onClose = jest.fn();
    const confirmSpy = jest.spyOn(window, 'confirm').mockReturnValue(true);

    renderMenu(onClose);

    await userEvent.click(screen.getByRole('menuitem', { name: /logout/i }));

    expect(onClose).toHaveBeenCalledTimes(1);
    expect(confirmSpy).toHaveBeenCalledWith('Are you sure you want to logout?');
    expect(mockLogout).toHaveBeenCalledTimes(1);

    confirmSpy.mockRestore();
  });

  it('shows alternate email and contact keys when present', () => {
    mockGetCurrentUserDetails.mockReturnValue({
      name: 'Alt User',
      username: 'alt-user',
      userId: 'user-alt',
      emailId: 'alt@example.com',
      mobileNo: '9990001111',
      role: [],
    });
    mockGetRoleLookup.mockReturnValue([]);

    renderMenu();

    expect(screen.getByText('alt@example.com')).toBeInTheDocument();
    expect(screen.getByText('9990001111')).toBeInTheDocument();
  });

  it('shows fallback values when user information is incomplete', () => {
    mockGetCurrentUserDetails.mockReturnValue({ username: 'sample-user' });
    mockGetRoleLookup.mockReturnValue(undefined);

    renderMenu();

    const occurrences = screen.getAllByText('sample-user');
    expect(occurrences.length).toBeGreaterThan(0);
    expect(screen.getAllByText('Not available')).toHaveLength(3);
  });

  it('navigates to change password and closes the menu', async () => {
    mockGetCurrentUserDetails.mockReturnValue({ username: 'user', userId: 'user-1' });
    mockGetRoleLookup.mockReturnValue([]);
    const onClose = jest.fn();

    renderMenu(onClose);

    await userEvent.click(screen.getByRole('menuitem', { name: /change password/i }));

    expect(onClose).toHaveBeenCalledTimes(1);
    expect(mockNavigate).toHaveBeenCalledWith('/account/change-password');
  });
});
