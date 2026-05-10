'use client';
import { useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import useAuthStore from '@/lib/store';

let socket: Socket | null = null;

export const useSocket = () => {
  const { user, isAuthenticated } = useAuthStore();
  const initialized = useRef(false);

  useEffect(() => {
    if (!isAuthenticated || !user || initialized.current) return;

    socket = io(process.env.NEXT_PUBLIC_SOCKET_URL!, { transports: ['websocket'] });

    socket.on('connect', () => {
      socket?.emit('auth', user.id);
      initialized.current = true;
    });

    socket.on('disconnect', () => {
      initialized.current = false;
    });

    return () => {
      socket?.disconnect();
      socket = null;
      initialized.current = false;
    };
  }, [isAuthenticated, user]);

  return socket;
};

export const getSocket = () => socket;
