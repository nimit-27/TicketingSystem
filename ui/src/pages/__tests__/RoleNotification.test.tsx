import React from 'react';
import { fireEvent, screen, waitFor } from '@testing-library/react';
import { renderWithTheme } from '../../test/testUtils';

const mockGetGrid = jest.fn();
const mockUpdateChannels = jest.fn();
const mockNavigate = jest.fn();
const mockShowMessage = jest.fn();

jest.mock('../../services/RoleNotificationChannelService', () => ({
  getRoleNotificationChannelGrid: () => mockGetGrid(),
  updateRoleNotificationChannels: (...args: unknown[]) => mockUpdateChannels(...args),
}));

jest.mock('../../context/SnackbarContext', () => ({
  useSnackbar: () => ({ showMessage: mockShowMessage }),
}));

jest.mock('../../utils/Utils', () => ({
  getUserDetails: () => ({ username: 'tester', userId: 'tester-id' }),
}));

jest.mock('react-router-dom', () => ({
  useNavigate: () => mockNavigate,
}));

import RoleNotification from '../RoleNotification';

const gridResponse = {
  roles: [{ roleId: 1, role: 'Admin' }],
  notifications: [{ notificationTypeId: 10, name: 'Ticket Assigned', code: 'TICKET_ASSIGNED' }],
  mappings: [
    {
      roleId: 1,
      notificationTypeId: 10,
      channels: { EMAIL: true, IN_APP: false, SMS: false },
    },
  ],
};

describe('RoleNotification', () => {
  beforeEach(() => {
    mockGetGrid.mockReset();
    mockUpdateChannels.mockReset();
    mockNavigate.mockClear();
    mockShowMessage.mockClear();
    mockGetGrid.mockResolvedValue({ data: { success: true, data: gridResponse } });
    mockUpdateChannels.mockResolvedValue({ data: { success: true, data: { updated: 1, created: 0 } } });
  });

  it('renders role-notification grid and saves only changed channel toggles', async () => {
    renderWithTheme(<RoleNotification />);

    expect(await screen.findByText('Ticket Assigned')).toBeInTheDocument();
    expect(screen.getByText('Admin')).toBeInTheDocument();

    fireEvent.click(screen.getByLabelText('Admin Ticket Assigned Email active'));
    fireEvent.click(screen.getByRole('button', { name: 'Save' }));

    await waitFor(() => {
      expect(mockUpdateChannels).toHaveBeenCalledWith({
        updatedBy: 'tester',
        items: [
          {
            roleId: 1,
            notificationTypeId: 10,
            channelCode: 'EMAIL',
            isActive: false,
          },
        ],
      });
    });
  });
});
