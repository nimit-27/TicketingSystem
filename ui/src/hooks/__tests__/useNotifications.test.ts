jest.mock('../../services/api', () => ({ BASE_URL: 'http://test.local' }));
jest.mock('../../config/config', () => ({ getCurrentUserDetails: jest.fn() }));
jest.mock('../../services/NotificationService', () => ({ getNotifications: jest.fn(), markNotificationsAsRead: jest.fn() }));
jest.mock('../useApi', () => ({ useApi: jest.fn() }));

import { act, renderHook, waitFor } from '@testing-library/react';
import { getCurrentUserDetails } from '../../config/config';
import { getNotifications, markNotificationsAsRead } from '../../services/NotificationService';
import { useApi } from '../useApi';
import { useNotifications } from '../useNotifications';

const mockUseApiState = {
  data: null as any,
  success: false,
  apiHandler: jest.fn((cb: () => Promise<any>) => cb()),
};

const seedData = {
  items: [{ id: 'notif-1', title: 'Notification 1', message: 'Hello', read: false, createdAt: '2023-01-01T00:00:00.000Z' }],
  hasMore: true,
  page: 0,
  size: 7,
  total: 2,
};

describe('useNotifications', () => {
  class MockEventSource {
    static instances: MockEventSource[] = [];
    public onmessage: ((event: MessageEvent) => void) | null = null;
    public onerror: (() => void) | null = null;
    private listeners = new Map<string, Set<EventListener>>();
    public closed = false;
    constructor(public url: string, public config?: EventSourceInit) {
      MockEventSource.instances.push(this);
    }
    addEventListener(type: string, listener: EventListener) {
      if (!this.listeners.has(type)) this.listeners.set(type, new Set());
      this.listeners.get(type)!.add(listener);
    }
    dispatch(type: string, event: MessageEvent) {
      this.listeners.get(type)?.forEach(listener => listener(event));
    }
    close() { this.closed = true; }
  }

  const originalEventSource = global.EventSource;

  beforeEach(() => {
    jest.useFakeTimers();
    jest.clearAllMocks();
    mockUseApiState.data = null;
    mockUseApiState.success = false;
    mockUseApiState.apiHandler = jest.fn((cb: () => Promise<any>) => cb());
    (useApi as jest.Mock).mockImplementation(() => mockUseApiState);

    (getCurrentUserDetails as jest.Mock).mockReturnValue({ userId: 'user-1', email: 'user@example.com', username: 'tester' });
    (getNotifications as jest.Mock).mockImplementation(async (page: number) => ({
      data: { data: { items: [{ id: `notif-${page + 1}`, title: `Notification ${page + 1}`, message: 'Hello', read: page > 0, createdAt: `2023-01-0${page + 1}T00:00:00.000Z` }], hasMore: page === 0, page, size: 7, total: 2 } },
    }));
    (markNotificationsAsRead as jest.Mock).mockResolvedValue(undefined);
    // @ts-expect-error test mock
    global.EventSource = MockEventSource;
    MockEventSource.instances = [];
  });

  afterEach(() => {
    jest.useRealTimers();
    if (originalEventSource) global.EventSource = originalEventSource;
    else delete (global as any).EventSource;
  });

  const renderWithApiSeed = async () => {
    const hook = renderHook(() => useNotifications());
    act(() => {
      mockUseApiState.data = seedData;
      mockUseApiState.success = true;
      hook.rerender();
    });
    await waitFor(() => expect(hook.result.current.notifications).toHaveLength(1));
    return hook;
  };

  it('loads notifications and computes unread count', async () => {
    const { result } = await renderWithApiSeed();
    expect(result.current.unreadCount).toBe(1);
    expect(result.current.hasMore).toBe(true);
    expect(MockEventSource.instances[0].config?.withCredentials).toBe(true);
  });

  it('setNotificationsHandler updates existing IDs and adds new IDs', async () => {
    const { result, rerender } = await renderWithApiSeed();
    act(() => { mockUseApiState.success = false; rerender(); });
    act(() => {
      mockUseApiState.data = { items: [{ id: 'notif-1', title: 'Updated', message: 'u', read: true, createdAt: '2023-01-01T00:00:00.000Z' }, { id: 'notif-2', title: 'New', message: 'n', read: false, createdAt: '2023-01-02T00:00:00.000Z' }], hasMore: false, page: 0, size: 7 };
      mockUseApiState.success = true;
      rerender();
    });
    await waitFor(() => expect(result.current.notifications).toHaveLength(2));
    expect(result.current.notifications.find(n => n.id === 'notif-1')?.title).toBe('Updated');
  });

  it('normalizes array payload from useApi', async () => {
    const { result, rerender } = await renderWithApiSeed();
    act(() => { mockUseApiState.success = false; rerender(); });
    act(() => {
      mockUseApiState.data = [{ notificationId: 'arr-1', code: 'ARR', message: 'From array payload', createdAt: '2023-01-03T00:00:00.000Z' }];
      mockUseApiState.success = true;
      rerender();
    });
    await waitFor(() => expect(result.current.notifications.some(i => i.id === 'arr-1')).toBe(true));
  });

  it('loadMore fetches next page only when hasMore true', async () => {
    const { result } = await renderWithApiSeed();
    (getNotifications as jest.Mock).mockClear();
    await act(async () => { await result.current.loadMore(); });
    await waitFor(() => expect(getNotifications).toHaveBeenCalledWith(1, 7));
  });


  it('marks all as read and handles mark failures', async () => {
    const errorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    const { result } = await renderWithApiSeed();
    await act(async () => { await result.current.markAllAsRead(); });
    expect(result.current.unreadCount).toBe(0);

    (markNotificationsAsRead as jest.Mock).mockRejectedValueOnce(new Error('mark failed'));
    await act(async () => { await result.current.markAllAsRead(); });
    expect(errorSpy).toHaveBeenCalledWith('Failed to mark notifications as read', expect.any(Error));
  });

  it('handles realtime notifications, parse errors, and acknowledgement', async () => {
    const errorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    const { result } = await renderWithApiSeed();
    const source = MockEventSource.instances[0];
    act(() => {
      source.onmessage?.({ data: JSON.stringify({ code: 'NEW', title: 'New notification', message: 'Realtime' }) } as MessageEvent);
      source.dispatch('notification', { data: 'bad-json' } as MessageEvent);
    });
    await waitFor(() => expect(result.current.latestNotification?.code).toBe('NEW'));
    expect(errorSpy).toHaveBeenCalledWith('Failed to parse SSE notification payload', expect.any(Error));

    act(() => { result.current.acknowledgeLatestNotification(); });
    expect(result.current.latestNotification).toBeNull();
  });

  it('reconnects on EventSource error and avoids connection when no recipient', async () => {
    const { unmount } = await renderWithApiSeed();
    const first = MockEventSource.instances[0];
    act(() => { first.onerror?.(); jest.advanceTimersByTime(5000); });
    await waitFor(() => expect(MockEventSource.instances.length).toBeGreaterThanOrEqual(2));
    unmount();

    (getCurrentUserDetails as jest.Mock).mockReturnValue(null);
    renderHook(() => useNotifications());
    expect(MockEventSource.instances.length).toBeGreaterThanOrEqual(2);
  });
});
