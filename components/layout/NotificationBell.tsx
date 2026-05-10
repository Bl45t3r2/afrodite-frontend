'use client';
import { useEffect, useState, useRef } from 'react';
import { Bell, MessageCircle, Star, Heart, Info, Check, X } from 'lucide-react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import { getSocket } from '@/lib/useSocketNotifications';
import useAuthStore from '@/lib/store';

const TYPE_ICON: Record<string, any> = {
  MESSAGE:  { icon: MessageCircle, color: 'text-blue-500 bg-blue-50' },
  REVIEW:   { icon: Star,          color: 'text-amber-500 bg-amber-50' },
  FAVORITE: { icon: Heart,         color: 'text-pink-500 bg-pink-50' },
  SYSTEM:   { icon: Info,          color: 'text-gray-500 bg-gray-100' },
};

function timeAgo(date: string) {
  const diff = (Date.now() - new Date(date).getTime()) / 1000;
  if (diff < 60) return 'À l\'instant';
  if (diff < 3600) return `${Math.floor(diff / 60)} min`;
  if (diff < 86400) return `${Math.floor(diff / 3600)} h`;
  return `${Math.floor(diff / 86400)} j`;
}

export default function NotificationBell() {
  const { isAuthenticated } = useAuthStore();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [notifs, setNotifs] = useState<any[]>([]);
  const [unread, setUnread] = useState(0);
  const panelRef = useRef<HTMLDivElement>(null);

  // Charger les notifs au montage
  useEffect(() => {
    if (!isAuthenticated) return;
    api.get('/notifications').then(res => {
      setNotifs(res.data.notifications);
      setUnread(res.data.unreadCount);
    }).catch(() => {});
  }, [isAuthenticated]);

  // Écouter les nouvelles notifs via socket
  useEffect(() => {
    if (!isAuthenticated) return;
    const interval = setInterval(() => {
      const socket = getSocket();
      if (!socket) return;
      clearInterval(interval);
      socket.on('notification:new', (notif: any) => {
        setNotifs(prev => [notif, ...prev].slice(0, 20));
        setUnread(prev => prev + 1);
      });
    }, 500);
    return () => clearInterval(interval);
  }, [isAuthenticated]);

  // Fermer au clic extérieur
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const markAllRead = async () => {
    await api.patch('/notifications/read-all');
    setNotifs(prev => prev.map(n => ({ ...n, read: true })));
    setUnread(0);
  };

  const handleClick = async (notif: any) => {
    if (!notif.read) {
      await api.patch(`/notifications/${notif.id}/read`);
      setNotifs(prev => prev.map(n => n.id === notif.id ? { ...n, read: true } : n));
      setUnread(prev => Math.max(0, prev - 1));
    }
    setOpen(false);
    if (notif.link) router.push(notif.link);
  };

  if (!isAuthenticated) return null;

  return (
    <div className="relative" ref={panelRef}>
      {/* Cloche */}
      <button
        onClick={() => setOpen(v => !v)}
        className="relative p-2 text-gray-500 hover:text-gray-800 transition-colors"
      >
        <Bell size={20} />
        {unread > 0 && (
          <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] bg-brand-400 text-white text-[10px] font-bold rounded-full flex items-center justify-center px-1 animate-in zoom-in duration-200">
            {unread > 9 ? '9+' : unread}
          </span>
        )}
      </button>

      {/* Panneau */}
      {open && (
        <div className="absolute right-0 top-10 w-80 bg-white border border-gray-100 rounded-2xl shadow-xl z-50 overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
            <h3 className="font-semibold text-gray-900 text-sm">Notifications</h3>
            <div className="flex items-center gap-2">
              {unread > 0 && (
                <button onClick={markAllRead} className="text-xs text-brand-400 hover:text-brand-600 font-medium flex items-center gap-1">
                  <Check size={12} /> Tout lire
                </button>
              )}
              <button onClick={() => setOpen(false)} className="text-gray-300 hover:text-gray-500">
                <X size={15} />
              </button>
            </div>
          </div>

          {/* Liste */}
          <div className="max-h-80 overflow-y-auto divide-y divide-gray-50">
            {notifs.length === 0 ? (
              <div className="text-center py-10">
                <Bell size={28} className="text-gray-200 mx-auto mb-2" />
                <p className="text-sm text-gray-400">Aucune notification</p>
              </div>
            ) : notifs.map(notif => {
              const cfg = TYPE_ICON[notif.type] || TYPE_ICON.SYSTEM;
              const Icon = cfg.icon;
              return (
                <button
                  key={notif.id}
                  onClick={() => handleClick(notif)}
                  className={`w-full text-left flex items-start gap-3 px-4 py-3 hover:bg-gray-50 transition-colors ${!notif.read ? 'bg-brand-50/30' : ''}`}
                >
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 mt-0.5 ${cfg.color}`}>
                    <Icon size={16} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm ${!notif.read ? 'font-semibold text-gray-900' : 'font-medium text-gray-700'}`}>
                      {notif.title}
                    </p>
                    <p className="text-xs text-gray-500 mt-0.5 truncate">{notif.body}</p>
                    <p className="text-xs text-gray-300 mt-1">{timeAgo(notif.createdAt)}</p>
                  </div>
                  {!notif.read && (
                    <span className="w-2 h-2 bg-brand-400 rounded-full shrink-0 mt-2" />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
