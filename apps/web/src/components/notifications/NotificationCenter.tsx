// apps/web/src/components/notifications/NotificationCenter.tsx
'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Bell, 
  FileText, 
  AlertCircle, 
  CheckCircle2, 
  Clock,
  X,
  ExternalLink,
  Settings
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';
import { useSession } from 'next-auth/react';
import { useRealtimeNotifications } from '@/hooks/useRealtimeNotifications';
import { Notification, NotificationPriority, NotificationCategory } from '@/types/notification';

export function NotificationCenter() {
  const { data: session } = useSession();
  const userId = (session?.user as any)?.id;
  const [isOpen, setIsOpen] = useState(false);
  const [filter, setFilter] = useState<'all' | 'unread'>('all');
  const bellRef = useRef<HTMLButtonElement>(null);

  const {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    dismissNotification,
  } = useRealtimeNotifications(userId);

  const filteredNotifications = filter === 'unread' 
    ? notifications.filter(n => !n.read)
    : notifications;

  const getPriorityStyles = (priority: NotificationPriority) => {
    const styles = {
      critical: 'bg-red-500/10 border-red-500/30 text-red-400',
      high: 'bg-amber-500/10 border-amber-500/30 text-amber-400',
      medium: 'bg-medical-cyan/10 border-medical-cyan/30 text-medical-cyan',
      low: 'bg-slate-500/10 border-slate-500/30 text-slate-400'
    };
    return styles[priority];
  };

  const getIcon = (category: NotificationCategory) => {
    const icons = {
      document: FileText,
      system: Settings,
      tramite: CheckCircle2,
      audit: Clock
    };
    return icons[category] || Bell;
  };

  return (
    <div className="relative">
      {/* Bell Trigger */}
      <button
        ref={bellRef}
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2.5 rounded-xl bg-slate-800/50 hover:bg-slate-700/50 
                   transition-all duration-300 group"
      >
        <Bell className="w-5 h-5 text-slate-300 group-hover:text-medical-cyan 
                        transition-colors" />
        
        {/* Badge */}
        <AnimatePresence>
          {unreadCount > 0 && (
            <motion.span
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0 }}
              className="absolute -top-1 -right-1 w-5 h-5 bg-gradient-to-br 
                         from-medical-cyan to-medical-violet rounded-full flex items-center 
                         justify-center text-[10px] font-bold text-white shadow-lg"
            >
              {unreadCount > 9 ? '9+' : unreadCount}
            </motion.span>
          )}
        </AnimatePresence>

        {/* Pulse effect when unread */}
        {unreadCount > 0 && (
          <span className="absolute inset-0 rounded-xl bg-medical-cyan/20 
                          animate-ping" />
        )}
      </button>

      {/* Dropdown */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 z-40"
            />

            {/* Panel */}
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.95 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="absolute right-0 top-full mt-3 w-screen max-w-[420px] sm:w-[420px] z-50
                         bg-slate-900/95 backdrop-blur-xl rounded-2xl 
                         border border-slate-700/50 shadow-2xl 
                         shadow-black/50 overflow-hidden"
            >
              {/* Header */}
              <div className="flex items-center justify-between p-4 
                            border-b border-slate-800">
                <div>
                  <h3 className="font-semibold text-slate-100 font-plus-jakarta">
                    Notificaciones
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {unreadCount} sin leer
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => markAllAsRead()}
                    className="text-xs text-medical-cyan hover:text-medical-cyan/80 
                             transition-colors px-2 py-1 rounded-lg
                             hover:bg-medical-cyan/10"
                  >
                    Marcar todo leído
                  </button>
                </div>
              </div>

              {/* Filters */}
              <div className="flex gap-1 p-2 bg-slate-950/50">
                {(['all', 'unread'] as const).map((f) => (
                  <button
                    key={f}
                    onClick={() => setFilter(f)}
                    className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-medium
                              transition-all duration-200 ${
                      filter === f
                        ? 'bg-slate-700 text-slate-100 shadow-sm'
                        : 'text-slate-500 hover:text-slate-300'
                    }`}
                  >
                    {f === 'all' ? 'Todas' : 'Sin leer'}
                  </button>
                ))}
              </div>

              {/* Notifications List */}
              <div className="max-h-[400px] overflow-y-auto">
                <AnimatePresence mode="popLayout">
                  {filteredNotifications.length === 0 ? (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="py-12 text-center"
                    >
                      <div className="w-16 h-16 mx-auto mb-4 rounded-full 
                                    bg-slate-800/50 flex items-center justify-center">
                        <Bell className="w-6 h-6 text-slate-600" />
                      </div>
                      <p className="text-slate-500 text-sm">
                        No hay notificaciones {filter === 'unread' ? 'sin leer' : ''}
                      </p>
                    </motion.div>
                  ) : (
                    filteredNotifications.map((notification) => (
                      <NotificationItem
                        key={notification.id}
                        notification={notification}
                        onDismiss={() => dismissNotification(notification.id)}
                        onMarkAsRead={() => markAsRead(notification.id)}
                      />
                    ))
                  )}
                </AnimatePresence>
              </div>

              {/* Footer */}
              <div className="p-3 border-t border-slate-800 bg-slate-950/30">
                <button className="w-full py-2 text-xs text-slate-400 
                                 hover:text-slate-200 transition-colors
                                 flex items-center justify-center gap-1.5">
                  Ver historial completo
                  <ExternalLink className="w-3 h-3" />
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

function NotificationItem({ 
  notification, 
  onDismiss, 
  onMarkAsRead 
}: {
  notification: Notification;
  onDismiss: () => void;
  onMarkAsRead: () => void;
}) {
  const Icon = notification.category === 'document' ? FileText :
               notification.category === 'system' ? Settings :
               notification.category === 'tramite' ? CheckCircle2 : Clock;
  
  const getPriorityStyles = (priority: NotificationPriority) => {
    const styles = {
      critical: 'bg-red-500/10 border-red-500/30 text-red-400',
      high: 'bg-amber-500/10 border-amber-500/30 text-amber-400',
      medium: 'bg-medical-cyan/10 border-medical-cyan/30 text-medical-cyan',
      low: 'bg-slate-500/10 border-slate-500/30 text-slate-400'
    };
    return styles[priority];
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      className={`group relative p-4 border-b border-slate-800/50 
                 hover:bg-slate-800/30 transition-all duration-200
                 ${!notification.read ? 'bg-slate-800/20' : ''}`}
    >
      {/* Unread indicator */}
      {!notification.read && (
        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 
                       bg-gradient-to-b from-medical-cyan to-medical-violet 
                       rounded-r-full" />
      )}

      <div className="flex gap-3">
        {/* Icon */}
        <div className={`flex-shrink-0 w-10 h-10 rounded-xl flex items-center 
                       justify-center border ${getPriorityStyles(notification.priority)}`}>
          <Icon className="w-5 h-5" />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0" onClick={() => !notification.read && onMarkAsRead()}>
          <div className="flex items-start justify-between gap-2">
            <h4 className={`text-sm font-medium truncate
                          ${!notification.read ? 'text-slate-100' : 'text-slate-400'}`}>
              {notification.title}
            </h4>
            <span className="text-[10px] text-slate-600 whitespace-nowrap">
              {formatDistanceToNow(new Date(notification.created_at), { 
                addSuffix: true,
                locale: es 
              })}
            </span>
          </div>
          
          <p className="text-xs text-slate-500 mt-1 line-clamp-2">
            {notification.description}
          </p>

          {/* Action Button */}
          {notification.metadata?.actionUrl && (
            <a
              href={notification.metadata.actionUrl}
              className="mt-2 text-xs font-medium text-medical-cyan 
                       hover:text-medical-cyan/80 flex items-center gap-1
                       transition-colors cursor-pointer"
            >
              {notification.metadata.actionLabel || 'Ver detalle'}
              <ExternalLink className="w-3 h-3" />
            </a>
          )}
        </div>

        {/* Dismiss */}
        <button
          onClick={onDismiss}
          className="opacity-0 group-hover:opacity-100 transition-opacity
                   p-1.5 hover:bg-slate-700/50 rounded-lg text-slate-500
                   hover:text-slate-300"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </motion.div>
  );
}
