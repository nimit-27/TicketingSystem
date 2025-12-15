export interface InAppNotificationPayload {
  code?: string;
  title?: string;
  message?: string;
  remark?: string;
  data?: Record<string, unknown>;
  redirectUrl?: string;
  timestamp?: string;
}

export interface NotificationApiResponse {
  id?: number | string;
  notificationId?: number | string;
  code?: string;
  title?: string;
  message?: string;
  remark?: string;
  data?: Record<string, unknown> | null;
  ticketId?: string;
  redirectUrl?: string | null;
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
  remark?: string;
  data?: Record<string, unknown>;
  redirectUrl?: string;
  timestamp: string;
  read: boolean;
}
