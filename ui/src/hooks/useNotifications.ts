import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Client, IMessage, StompSubscription } from '@stomp/stompjs';
import SockJS from 'sockjs-client';

import { BASE_URL } from '../services/api';
import { getCurrentUserDetails } from '../config/config';
import { fetchNotifications, markNotificationsAsRead } from '../services/NotificationService';
import {
  InAppNotificationPayload,
  NotificationApiResponse,
  NotificationItem,
  NotificationPageApiResponse,
} from '../types/notification';

const WS_ENDPOINT = `${BASE_URL}/ws`;
const PAGE_SIZE = 7;

const buildNotification = (payload: InAppNotificationPayload): NotificationItem => {
  const timestamp = payload.timestamp || new Date().toISOString();
  const title = payload.title || payload.code || 'Notification';
  const message = payload.message || '';
  return {
    id: `${payload.code || 'notification'}-${timestamp}-${Math.random().toString(36).slice(2, 8)}`,
    code: payload.code,
    title,
    message,
    data: payload.data || undefined,
    timestamp,
    read: false,
  };
};

const mapApiNotification = (notification: NotificationApiResponse): NotificationItem => {
  const timestamp = notification.createdAt || new Date().toISOString();
  const baseId = notification.id ?? notification.notificationId;
  return {
    id:
      typeof baseId === 'number' || typeof baseId === 'string'
        ? String(baseId)
        : `${notification.code || 'notification'}-${timestamp}-${Math.random().toString(36).slice(2, 8)}`,
    code: notification.code,
    title: notification.title || notification.code || 'Notification',
    message: notification.message || '',
    data: (notification.data ?? undefined) as Record<string, unknown> | undefined,
    timestamp,
    read: Boolean(notification.read),
  };
};

const normalizePagePayload = (
  payload: unknown,
  fallbackPage: number
): NotificationPageApiResponse => {
  if (payload && typeof payload === 'object' && 'items' in (payload as Record<string, unknown>)) {
    const typed = payload as NotificationPageApiResponse;
    return {
      items: Array.isArray(typed.items) ? typed.items : [],
      hasMore: Boolean(typed.hasMore),
      total: typeof typed.total === 'number' ? typed.total : undefined,
      page: typeof typed.page === 'number' ? typed.page : fallbackPage,
      size: typeof typed.size === 'number' ? typed.size : undefined,
    };
  }

  if (Array.isArray(payload)) {
    return {
      items: payload as NotificationApiResponse[],
      hasMore: (payload as unknown[]).length === PAGE_SIZE,
      total: (payload as unknown[]).length,
      page: fallbackPage,
      size: PAGE_SIZE,
    };
  }

  return {
    items: [],
    hasMore: false,
    total: 0,
    page: fallbackPage,
    size: PAGE_SIZE,
  };
};

export const useNotifications = () => {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const subscriptionsRef = useRef<StompSubscription[]>([]);
  const isMountedRef = useRef(true);
  const loadingRef = useRef(false);
  const markingRef = useRef(false);
  const nextPageRef = useRef(0);
  const [hasMore, setHasMore] = useState(false);
  const [loading, setLoading] = useState(false);

  const recipientIds = useMemo(() => {
    const user = getCurrentUserDetails();
    if (!user) return [] as string[];
    const ids = new Set<string>();
    if (user.userId) ids.add(user.userId);
    if (user.email) ids.add(user.email);
    if (user.username) ids.add(user.username);
    return Array.from(ids).filter(Boolean);
  }, []);

  const handleMessage = useCallback((message: IMessage) => {
    try {
      const payload: InAppNotificationPayload = JSON.parse(message.body);
      setNotifications(prev => [buildNotification(payload), ...prev]);
    } catch (error) {
      console.error('Failed to parse notification payload', error);
    }
  }, []);

  // useEffect(() => {
  //   return () => {
  //     isMountedRef.current = false;
  //   };
  // }, []);

  const loadPage = useCallback(
    async (pageToLoad: number, append: boolean) => {
      if (loadingRef.current) {
        return;
      }

      loadingRef.current = true;
      if (isMountedRef.current) {
        setLoading(true);
      }

      try {
        const response = await fetchNotifications(pageToLoad, PAGE_SIZE);
        // console.log(response)
        console.log(response?.data?.data)
        const payload =
          response?.data?.data ??
          response?.data?.body?.data ??
          response?.data ??
          [];

        const pagePayload = normalizePagePayload(payload, pageToLoad);
        const mapped = pagePayload.items.map(mapApiNotification);

        if (!isMountedRef.current) {
          return;
        }

        if (append) {
          setNotifications(prev => {
            const indexById = new Map(prev.map((item, index) => [item.id, index]));
            const merged = [...prev];
            mapped.forEach(item => {
              const existingIndex = indexById.get(item.id);
              if (existingIndex !== undefined) {
                merged[existingIndex] = item;
              } else {
                merged.push(item);
              }
            });
            return merged;
          });
        } else {
          setNotifications(prev => {
            const newIds = new Set(mapped.map(item => item.id));
            const merged = [...mapped];
            prev.forEach(item => {
              if (!newIds.has(item.id)) {
                merged.push(item);
              }
            });
            return merged;
          });
        }

        const currentPage = pagePayload.page ?? pageToLoad;
        const pageSize = pagePayload.size ?? PAGE_SIZE;
        const computedHasMore = pagePayload.hasMore ?? (mapped.length === pageSize);

        setHasMore(Boolean(computedHasMore));
        nextPageRef.current = currentPage + 1;
      } catch (error) {
        if (isMountedRef.current) {
          console.error('Failed to load notifications', error);
        }
      } finally {
        if (isMountedRef.current) {
          setLoading(false);
        }
        loadingRef.current = false;
      }
    },
    []
  );

  useEffect(() => {
    nextPageRef.current = 0;

    if (!recipientIds.length) {
      setHasMore(false);
    }

    void loadPage(0, false);
  }, [recipientIds, loadPage]);

  useEffect(() => {
    if (!recipientIds.length) {
      return undefined;
    }

    const client = new Client({
      reconnectDelay: 5000,
      webSocketFactory: () => new SockJS(WS_ENDPOINT),
      onConnect: () => {
        subscriptionsRef.current = recipientIds.map(id =>
          client.subscribe(`/topic/notifications/${id}`, handleMessage)
        );
      },
      onStompError: (frame: { headers: { [x: string]: any; }; }) => {
        console.error('STOMP error', frame.headers['message']);
      },
    });

    client.activate();
    return () => {
      subscriptionsRef.current.forEach(sub => sub.unsubscribe());
      subscriptionsRef.current = [];
      client.deactivate();
    };
  }, [handleMessage, recipientIds]);

  const unreadCount = useMemo(
    () => notifications.filter(notification => !notification.read).length,
    [notifications]
  );

  const markAllAsRead = useCallback(async () => {
    if (markingRef.current) {
      return;
    }

    markingRef.current = true;
    setNotifications(prev => prev.map(notification => ({ ...notification, read: true })));
    try {
      await markNotificationsAsRead();
    } catch (error) {
      if (isMountedRef.current) {
        console.error('Failed to mark notifications as read', error);
      }
    } finally {
      markingRef.current = false;
    }
  }, []);

  const markAsRead = useCallback((id: string) => {
    setNotifications(prev =>
      prev.map(notification =>
        notification.id === id ? { ...notification, read: true } : notification
      )
    );
  }, []);

  const loadMore = useCallback(async () => {
    if (!hasMore || loadingRef.current) {
      return;
    }

    await loadPage(nextPageRef.current, true);
  }, [hasMore, loadPage]);

  return {
    notifications,
    unreadCount,
    markAllAsRead,
    markAsRead,
    hasMore,
    loadMore,
    loading,
  };
};
