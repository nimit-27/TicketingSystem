import React from 'react';
import { screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import UserMenu from '../UserMenu';
import { renderWithTheme } from '../../../test/testUtils';

const mockGetCurrentUserDetails = jest.fn();
const mockGetRoleLookup = jest.fn();
const mockLogout = jest.fn();

jest.mock('../../../config/config', () => ({
  getCurrentUserDetails: () => mockGetCurrentUserDetails(),
}));

jest.mock('../../../utils/Utils', () => ({
  ...jest.requireActual('../../../utils/Utils'),
  getRoleLookup: () => mockGetRoleLookup(),
  logout: () => mockLogout(),
}));

describe('UserMenu', () => {
  beforeEach(() => {
    mockGetCurrentUserDetails.mockReset();
    mockGetRoleLookup.mockReset();
    mockLogout.mockReset();
  });

  const createAnchor = () => {
    const anchor = document.createElement('div');
    document.body.appendChild(anchor);
    return anchor;
  };

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

    renderWithTheme(
      <UserMenu anchorEl={createAnchor()} open onClose={jest.fn()} />,
    );

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

    renderWithTheme(
      <UserMenu anchorEl={createAnchor()} open onClose={onClose} />,
    );

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

    renderWithTheme(
      <UserMenu anchorEl={createAnchor()} open onClose={jest.fn()} />,
    );

    expect(screen.getByText('alt@example.com')).toBeInTheDocument();
    expect(screen.getByText('9990001111')).toBeInTheDocument();
  });

  it('shows fallback values when user information is incomplete', () => {
    mockGetCurrentUserDetails.mockReturnValue({ username: 'sample-user' });
    mockGetRoleLookup.mockReturnValue(undefined);

    renderWithTheme(
      <UserMenu anchorEl={createAnchor()} open onClose={jest.fn()} />,
    );

    const occurrences = screen.getAllByText('sample-user');
    expect(occurrences.length).toBeGreaterThan(0);
    expect(screen.getAllByText('Not available')).toHaveLength(3);
  });
});
