'use client';

import React, { useEffect, useState } from 'react';
import { Bell, Info, AlertTriangle, CheckCircle, XCircle, Activity } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';

type NotificationType = 'error' | 'warning' | 'info' | 'success';

interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  is_read: boolean;
  created_at: string;
}

export function NotificationCenter() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [slo, setSlo] = useState<number>(1);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchData();
    // Polling cada 15 segundos para no saturar, pero mantener realismo
    const interval = setInterval(fetchData, 15000);
    return () => clearInterval(interval);
  }, []);

  const fetchData = async () => {
    try {
      const [notifsRes, sloRes] = await Promise.all([
        fetch('/api/notifications'),
        fetch('/api/slo')
      ]);

      if (notifsRes.ok) setNotifications(await notifsRes.json());
      if (sloRes.ok) {
        const sloData = await sloRes.json();
        setSlo(sloData.success_rate);
      }
    } catch (error) {
      console.error('Error fetching UX data:', error);
    }
  };

  const markAsRead = async () => {
    try {
      await fetch('/api/notifications', { method: 'POST' });
      // Update local state for immediate feedback
      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
    } catch (error) {
      console.error('Error marking as read:', error);
    }
  };

  const toggleOpen = () => {
    if (!isOpen) markAsRead();
    setIsOpen(!isOpen);
  };

  const unreadCount = notifications.filter(n => !n.is_read).length;

  const getSloColor = () => {
    if (slo >= 0.99) return 'bg-emerald-500';
    if (slo >= 0.95) return 'bg-amber-500';
    return 'bg-red-500';
  };

  const getSloLabel = () => {
    if (slo >= 0.99) return 'Estable';
    if (slo >= 0.95) return 'Degradado';
    return 'Inestable';
  };

  return (
    <div className="relative">
      {/* 🔔 Bell Icon with Pulse for unread */}
      <button
        onClick={toggleOpen}
        className={cn(
          "relative p-2 rounded-xl transition-all duration-300",
          isOpen ? "bg-indigo-100 text-indigo-600 dark:bg-indigo-900/40" : "text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
        )}
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute top-1.5 right-1.5 flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500 border-2 border-white dark:border-slate-950"></span>
          </span>
        )}
      </button>

      {/* 🧭 Panel Dropdown */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Overlay to close */}
            <div 
              className="fixed inset-0 z-40" 
              onClick={() => setIsOpen(false)} 
            />
            
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.95 }}
              className="absolute right-0 mt-3 z-50 w-80 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl overflow-hidden"
            >
              {/* Header with SLO status */}
              <div className="p-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
                <div className="flex items-center justify-between mb-1">
                  <h3 className="font-bold text-slate-900 dark:text-white">Notificaciones</h3>
                  <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                    <div className={cn("w-2 h-2 rounded-full", getSloColor())} />
                    <span className="text-[10px] font-bold text-slate-600 dark:text-slate-400 uppercase">{getSloLabel()}</span>
                  </div>
                </div>
                <div className="flex items-center gap-1 text-[10px] text-slate-500">
                  <Activity className="w-3 h-3" />
                  <span>Disponibilidad percibida (UX SLO): {(slo * 100).toFixed(2)}%</span>
                </div>
              </div>

              {/* List */}
              <div className="max-h-[350px] overflow-y-auto scrollbar-thin">
                {notifications.length === 0 ? (
                  <div className="p-10 text-center">
                    <div className="bg-slate-100 dark:bg-slate-800 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3">
                      <CheckCircle className="w-6 h-6 text-slate-400" />
                    </div>
                    <p className="text-sm font-medium text-slate-500">Todo en orden por aquí</p>
                  </div>
                ) : (
                  <div className="divide-y divide-slate-100 dark:divide-slate-800/50">
                    {notifications.map((n) => (
                      <div 
                        key={n.id} 
                        className={cn(
                          "p-4 transition-colors hover:bg-slate-50 dark:hover:bg-slate-800/50 flex gap-3",
                          !n.is_read && "bg-indigo-50/30 dark:bg-indigo-900/5"
                        )}
                      >
                        <div className="shrink-0 mt-0.5">
                          {n.type === 'error' && <XCircle className="w-4 h-4 text-red-500" />}
                          {n.type === 'warning' && <AlertTriangle className="w-4 h-4 text-amber-500" />}
                          {n.type === 'success' && <CheckCircle className="w-4 h-4 text-emerald-500" />}
                          {n.type === 'info' && <Info className="w-4 h-4 text-blue-500" />}
                        </div>
                        <div className="flex flex-col gap-0.5">
                          <p className="text-sm font-semibold text-slate-900 dark:text-white leading-tight">
                            {n.title}
                          </p>
                          <p className="text-xs text-slate-600 dark:text-slate-400 leading-normal">
                            {n.message}
                          </p>
                          <span className="text-[10px] text-slate-400 mt-1 uppercase font-medium">
                             hace {formatDistanceToNow(new Date(n.created_at), { locale: es })}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="p-3 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 text-center">
                <button 
                  className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 uppercase tracking-widest transition-colors"
                  onClick={() => setIsOpen(false)}
                >
                  Ver todo el historial
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
