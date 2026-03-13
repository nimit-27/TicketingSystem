import React from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import NotificationBell from '../NotificationBell';
import { useNotificationContext } from '../../../context/NotificationContext';

const mockNavigate = jest.fn();

jest.mock('react-router-dom', () => ({
  useNavigate: () => mockNavigate,
}));

jest.mock('../../../context/NotificationContext', () => ({
  useNotificationContext: jest.fn(),
}));

describe('NotificationBell', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('marks all as read on open and navigates when a notification is clicked', async () => {
    const markAllAsRead = jest.fn().mockResolvedValue(undefined);
    const markAsRead = jest.fn();
    useNotificationContext.mockReturnValue({
      notifications: [
        { id: '1', title: 'Older', timestamp: '2024-01-01T00:00:00Z', read: true },
        { id: '2', title: 'Newer', timestamp: '2024-01-02T00:00:00Z', read: false, data: { ticketId: 'TK-22' } },
      ],
      unreadCount: 1,
      markAllAsRead,
      markAsRead,
      hasMore: false,
      loadMore: jest.fn(),
      loading: false,
      latestNotification: null,
      acknowledgeLatestNotification: jest.fn(),
    });

    render(<NotificationBell iconColor="#fff" />);

    fireEvent.click(screen.getByLabelText('Notifications'));

    await waitFor(() => expect(markAllAsRead).toHaveBeenCalled());

    const notificationItems = screen.getAllByText(/Older|Newer/);
    expect(notificationItems[0]).toHaveTextContent('Newer');

    fireEvent.click(screen.getByText('Newer'));

    expect(markAsRead).toHaveBeenCalledWith('2');
    expect(mockNavigate).toHaveBeenCalledWith('/tickets/TK-22');
  });

  it('shows snackbar and empty menu state', () => {
    const acknowledgeLatestNotification = jest.fn();

    useNotificationContext.mockReturnValue({
      notifications: [],
      unreadCount: 0,
      markAllAsRead: jest.fn(),
      markAsRead: jest.fn(),
      hasMore: false,
      loadMore: jest.fn(),
      loading: false,
      latestNotification: { id: 'latest', title: 'Incoming', message: 'A new update', timestamp: '2024-01-03T00:00:00Z', read: false },
      acknowledgeLatestNotification,
    });

    render(<NotificationBell iconColor="#fff" />);

    expect(screen.getByText('Incoming')).toBeInTheDocument();
    expect(acknowledgeLatestNotification).toHaveBeenCalled();

    fireEvent.click(screen.getByLabelText('Notifications'));
    expect(screen.getByText("You're all caught up!")).toBeInTheDocument();
  });

  it('loads more notifications when requested', async () => {
    const loadMore = jest.fn().mockResolvedValue(undefined);

    useNotificationContext.mockReturnValue({
      notifications: [{ id: '1', title: 'Item', timestamp: '2024-01-03T00:00:00Z', read: true }],
      unreadCount: 0,
      markAllAsRead: jest.fn(),
      markAsRead: jest.fn(),
      hasMore: true,
      loadMore,
      loading: false,
      latestNotification: null,
      acknowledgeLatestNotification: jest.fn(),
    });

    render(<NotificationBell iconColor="#fff" />);
    fireEvent.click(screen.getByLabelText('Notifications'));
    fireEvent.click(screen.getByRole('button', { name: 'Show more' }));

    await waitFor(() => expect(loadMore).toHaveBeenCalled());
  });
});
