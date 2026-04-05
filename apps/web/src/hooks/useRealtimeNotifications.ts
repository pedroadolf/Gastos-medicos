// apps/web/src/hooks/useRealtimeNotifications.ts
'use client';

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/services/supabase';
import { Notification } from '@/types/notification';

export function useRealtimeNotifications(userId: string | undefined) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);

  const fetchNotifications = useCallback(async () => {
    if (!userId) return;

    setLoading(true);
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', userId)
      .eq('dismissed', false)
      .order('created_at', { ascending: false })
      .limit(50);

    if (error) {
      console.error('Error fetching notifications:', error);
    } else {
      setNotifications(data || []);
      setUnreadCount((data || []).filter(n => !n.read).length);
    }
    setLoading(false);
  }, [userId]);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  useEffect(() => {
    if (!userId) return;

    const channel = supabase
      .channel(`user-notifications:${userId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${userId}`,
        },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            const newNotif = payload.new as Notification;
            setNotifications(prev => [newNotif, ...prev]);
            setUnreadCount(prev => prev + 1);
            // Optional: play sound or show toast
          } else if (payload.eventType === 'UPDATE') {
            const updatedNotif = payload.new as Notification;
            setNotifications(prev => 
              prev.map(n => n.id === updatedNotif.id ? updatedNotif : n)
                  .filter(n => !n.dismissed)
            );
            setUnreadCount(prev => 
              notifications.filter(n => n.id !== updatedNotif.id ? !n.read : !updatedNotif.read).length
            );
          } else if (payload.eventType === 'DELETE') {
            setNotifications(prev => prev.filter(n => n.id !== payload.old.id));
          }
        }
      )
      .subscribe();

    return () => {
      channel.unsubscribe();
    };
  }, [userId, notifications]);

  const markAsRead = async (id: string) => {
    const { error } = await supabase
      .from('notifications')
      .update({ read: true })
      .eq('id', id);

    if (error) console.error('Error marking as read:', error);
  };

  const markAllAsRead = async () => {
    if (!userId) return;
    const { error } = await supabase
      .from('notifications')
      .update({ read: true })
      .eq('user_id', userId)
      .eq('read', false);

    if (error) console.error('Error marking all as read:', error);
  };

  const dismissNotification = async (id: string) => {
    const { error } = await supabase
      .from('notifications')
      .update({ dismissed: true })
      .eq('id', id);

    if (error) console.error('Error dismissing notification:', error);
  };

  return {
    notifications,
    loading,
    unreadCount,
    markAsRead,
    markAllAsRead,
    dismissNotification,
    refresh: fetchNotifications,
  };
}
