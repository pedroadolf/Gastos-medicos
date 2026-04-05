// apps/web/src/types/notification.ts

export type NotificationPriority = 'critical' | 'high' | 'medium' | 'low';
export type NotificationCategory = 'document' | 'system' | 'tramite' | 'audit';

export interface Notification {
  id: string;
  user_id: string;
  priority: NotificationPriority;
  category: NotificationCategory;
  title: string;
  description: string;
  metadata: {
    tramiteId?: string;
    documentId?: string;
    actionUrl?: string;
    actionLabel?: string;
    [key: string]: any;
  };
  read: boolean;
  dismissed: boolean;
  created_at: string;
  expires_at?: string | null;
}
