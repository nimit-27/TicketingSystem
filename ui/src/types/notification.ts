export interface InAppNotificationPayload {
  code?: string;
  title?: string;
  message?: string;
  data?: Record<string, unknown>;
  timestamp?: string;
}

export interface NotificationApiResponse {
  id?: number | string;
  notificationId?: number | string;
  code?: string;
  title?: string;
  message?: string;
  data?: Record<string, unknown> | null;
  ticketId?: string;
  createdAt?: string;
  read?: boolean;
}

export interface NotificationPageApiResponse {
  items: NotificationApiResponse[];
  hasMore: boolean;
  total?: number;
  page?: number;
  size?: number;
}

export interface NotificationItem {
  id: string;
  code?: string;
  title?: string;
  message?: string;
  data?: Record<string, unknown>;
  timestamp: string;
  read: boolean;
}
