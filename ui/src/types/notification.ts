export interface InAppNotificationPayload {
  code?: string;
  title?: string;
  message?: string;
  data?: Record<string, unknown>;
  timestamp?: string;
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
