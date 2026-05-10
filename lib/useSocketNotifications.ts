'use client';
import { useEffect } from 'react';
import { io, Socket } from 'socket.io-client';
import useAuthStore from '@/lib/store';
import useNotificationStore from '@/lib/notificationStore';
import api from '@/lib/api';

let socket: Socket | null = null;

export const useSocketNotifications = () => {
  const { user, isAuthenticated } = useAuthStore();
  const { addNotification, setNotifications } = useNotificationStore();

  // Charger les notifs depuis l'API au login
  useEffect(() => {
    if (!isAuthenticated) return;
    api.get('/notifications')
      .then(res => setNotifications(res.data.notifications, res.data.unreadCount))
      .catch(() => {});
  }, [isAuthenticated]);

  // Socket temps réel
  useEffect(() => {
    if (!isAuthenticated || !user) return;
    if (socket?.connected) return;

    socket = io(process.env.NEXT_PUBLIC_SOCKET_URL!, {
      transports: ['websocket'],
      reconnection: true,
      reconnectionDelay: 2000,
    });

    socket.on('connect', () => { socket?.emit('auth', user.id); });

    // Nouvelles notifs persistées (MESSAGE, REVIEW, FAVORITE)
    socket.on('notification:new', (notif: any) => {
      addNotification(notif);
      try {
        const ctx = new AudioContext();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain); gain.connect(ctx.destination);
        osc.frequency.value = 520;
        gain.gain.setValueAtTime(0.08, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);
        osc.start(ctx.currentTime); osc.stop(ctx.currentTime + 0.3);
      } catch {}
    });

    // Rétrocompatibilité anciens événements
    socket.on('notification:message', (data: any) => {
      addNotification({ type: 'message', title: `Nouveau message de ${data.senderName || 'quelqu\'un'}`, body: data.content, href: '/messages' });
    });

    socket.on('disconnect', () => {});
    return () => { socket?.disconnect(); socket = null; };
  }, [isAuthenticated, user?.id]);
};

export const getSocket = () => socket;
