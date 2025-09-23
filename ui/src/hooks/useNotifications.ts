import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Client, IMessage, StompSubscription } from '@stomp/stompjs';
import SockJS from 'sockjs-client';

import { BASE_URL } from '../services/api';
import { getCurrentUserDetails } from '../config/config';
import { fetchNotifications } from '../services/NotificationService';
import { InAppNotificationPayload, NotificationApiResponse, NotificationItem } from '../types/notification';

const WS_ENDPOINT = `${BASE_URL}/ws`;

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

export const useNotifications = () => {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const subscriptionsRef = useRef<StompSubscription[]>([]);

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

  useEffect(() => {
    let isMounted = true;

    const loadNotifications = async () => {
      if (!recipientIds.length) {
        return;
      }

      try {
        const response = await fetchNotifications();
        const payload =
          response?.data?.data ??
          response?.data?.body?.data ??
          response?.data ??
          [];

        if (!isMounted) {
          return;
        }

        if (Array.isArray(payload)) {
          const mapped = payload.map(mapApiNotification);
          setNotifications(prev => {
            const existingIds = new Set(mapped.map(item => item.id));
            const merged = [...mapped];
            prev.forEach(item => {
              if (!existingIds.has(item.id)) {
                merged.push(item);
              }
            });
            return merged;
          });
        } else {
          console.error('Unexpected notifications payload', payload);
        }
      } catch (error) {
        if (isMounted) {
          console.error('Failed to load notifications', error);
        }
      }
    };

    loadNotifications();

    return () => {
      isMounted = false;
    };
  }, [recipientIds]);

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

  const markAllAsRead = useCallback(() => {
    setNotifications(prev => prev.map(notification => ({ ...notification, read: true })));
  }, []);

  const markAsRead = useCallback((id: string) => {
    setNotifications(prev =>
      prev.map(notification =>
        notification.id === id ? { ...notification, read: true } : notification
      )
    );
  }, []);

  return {
    notifications,
    unreadCount,
    markAllAsRead,
    markAsRead,
  };
};
