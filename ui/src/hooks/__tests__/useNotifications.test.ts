jest.mock('../../services/api', () => ({
  BASE_URL: 'http://test.local',
}));

jest.mock('../../config/config', () => ({
  getCurrentUserDetails: jest.fn(),
}));

jest.mock('../../services/NotificationService', () => ({
  fetchNotifications: jest.fn(),
  markNotificationsAsRead: jest.fn(),
}));

import { act, renderHook, waitFor } from '@testing-library/react';

import { useNotifications } from '../useNotifications';
import { getCurrentUserDetails } from '../../config/config';
import { fetchNotifications, markNotificationsAsRead } from '../../services/NotificationService';

describe('useNotifications', () => {
  class MockEventSource {
    static instances: MockEventSource[] = [];

    public url: string;
    public withCredentials?: boolean;
    public onmessage: ((event: MessageEvent) => void) | null = null;
    public onerror: (() => void) | null = null;
    private listeners = new Map<string, Set<EventListener>>();
    public closed = false;

    constructor(url: string, config?: EventSourceInit) {
      this.url = url;
      this.withCredentials = config?.withCredentials;
      MockEventSource.instances.push(this);
    }

    addEventListener(type: string, listener: EventListener) {
      if (!this.listeners.has(type)) {
        this.listeners.set(type, new Set());
      }
      this.listeners.get(type)!.add(listener);
    }

    dispatch(type: string, event: MessageEvent) {
      const listeners = this.listeners.get(type);
      if (listeners) {
        listeners.forEach(listener => listener(event));
      }
    }

    close() {
      this.closed = true;
    }
  }

  const originalEventSource = global.EventSource;

  beforeEach(() => {
    jest.useFakeTimers();
    jest.clearAllMocks();
    (getCurrentUserDetails as jest.Mock).mockReturnValue({
      userId: 'user-1',
      email: 'user@example.com',
      username: 'tester',
    });
    (fetchNotifications as jest.Mock).mockImplementation(async (page: number) => ({
      data: {
        data: {
          items: [
            {
              id: `notif-${page + 1}`,
              title: `Notification ${page + 1}`,
              message: 'Hello',
              read: page > 0,
              createdAt: `2023-01-0${page + 1}T00:00:00.000Z`,
            },
          ],
          hasMore: page === 0,
          page,
          size: 7,
          total: 2,
        },
      },
    }));
    (markNotificationsAsRead as jest.Mock).mockResolvedValue(undefined);
    // @ts-expect-error assigning mock
    global.EventSource = MockEventSource;
    MockEventSource.instances = [];
  });

  afterEach(() => {
    jest.useRealTimers();
    if (originalEventSource) {
      global.EventSource = originalEventSource;
    } else {
      // @ts-expect-error clearing mock
      delete global.EventSource;
    }
  });

  it('loads notifications on mount and computes the unread count', async () => {
    const { result } = renderHook(() => useNotifications());

    await waitFor(() => expect(fetchNotifications).toHaveBeenCalledWith(0, 7));
    await waitFor(() => expect(result.current.notifications).toHaveLength(1));

    expect(result.current.unreadCount).toBe(1);
    expect(result.current.hasMore).toBe(true);
    expect(MockEventSource.instances).toHaveLength(1);
    expect(MockEventSource.instances[0].withCredentials).toBe(true);
  });

  it('loads additional pages when loadMore is called', async () => {
    const { result } = renderHook(() => useNotifications());

    await waitFor(() => expect(result.current.notifications).toHaveLength(1));

    await act(async () => {
      await result.current.loadMore();
    });

    await waitFor(() => expect(fetchNotifications).toHaveBeenCalledWith(1, 7));
    expect(result.current.notifications).toHaveLength(2);
    expect(result.current.hasMore).toBe(false);
  });

  it('marks notifications as read via the API', async () => {
    const { result } = renderHook(() => useNotifications());

    await waitFor(() => expect(result.current.notifications).toHaveLength(1));

    await act(async () => {
      await result.current.markAllAsRead();
    });

    expect(markNotificationsAsRead).toHaveBeenCalled();
    expect(result.current.unreadCount).toBe(0);
    expect(result.current.notifications.every(notification => notification.read)).toBe(true);
  });

  it('handles realtime notifications and acknowledgement', async () => {
    const { result } = renderHook(() => useNotifications());

    await waitFor(() => expect(MockEventSource.instances).toHaveLength(1));

    const eventSource = MockEventSource.instances[0];
    const payload = { code: 'NEW', title: 'New notification', message: 'Realtime' };

    act(() => {
      eventSource.onmessage?.({ data: JSON.stringify(payload) } as MessageEvent);
    });

    await waitFor(() => expect(result.current.notifications.length).toBe(2));
    expect(result.current.notifications[0].code).toBe('NEW');
    expect(result.current.latestNotification?.code).toBe('NEW');

    act(() => {
      result.current.markAsRead(result.current.notifications[0].id);
    });

    expect(result.current.notifications[0].read).toBe(true);

    act(() => {
      result.current.acknowledgeLatestNotification();
    });

    expect(result.current.latestNotification).toBeNull();
  });
});
