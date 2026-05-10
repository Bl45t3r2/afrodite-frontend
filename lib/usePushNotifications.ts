'use client';
import { useState, useEffect, useCallback } from 'react';
import api from '@/lib/api';
import useAuthStore from '@/lib/store';

function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = window.atob(base64);
  return Uint8Array.from([...rawData].map(char => char.charCodeAt(0)));
}

export type PushState = 'unsupported' | 'default' | 'granted' | 'denied' | 'loading';

export function usePushNotifications() {
  const { isAuthenticated } = useAuthStore();
  const [state, setState] = useState<PushState>('default');
  const [subscription, setSubscription] = useState<PushSubscription | null>(null);

  // Vérifier l'état actuel au montage
  useEffect(() => {
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
      setState('unsupported');
      return;
    }
    const perm = Notification.permission;
    if (perm === 'granted') setState('granted');
    else if (perm === 'denied') setState('denied');
    else setState('default');
  }, []);

  // Enregistrer le Service Worker
  const registerSW = useCallback(async () => {
    if (!('serviceWorker' in navigator)) return null;
    try {
      const reg = await navigator.serviceWorker.register('/sw.js');
      return reg;
    } catch (err) {
      console.error('SW register error:', err);
      return null;
    }
  }, []);

  // Activer les notifications push
  const subscribe = useCallback(async (): Promise<boolean> => {
    if (!isAuthenticated) return false;
    setState('loading');

    try {
      // 1. Récupérer la clé publique VAPID
      const { data } = await api.get('/push/vapid-key');
      if (!data.publicKey) throw new Error('VAPID non configuré');

      // 2. Enregistrer le SW
      const reg = await registerSW();
      if (!reg) throw new Error('SW non disponible');

      // 3. Demander la permission
      const perm = await Notification.requestPermission();
      if (perm !== 'granted') {
        setState('denied');
        return false;
      }

      // 4. Créer l'abonnement push
      const sub = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(data.publicKey),
      });

      // 5. Envoyer au backend
      await api.post('/push/subscribe', { subscription: sub.toJSON() });

      setSubscription(sub);
      setState('granted');
      return true;
    } catch (err) {
      console.error('Push subscribe error:', err);
      setState('default');
      return false;
    }
  }, [isAuthenticated, registerSW]);

  // Désactiver les notifications push
  const unsubscribe = useCallback(async (): Promise<boolean> => {
    if (!subscription) return false;
    try {
      await api.delete('/push/unsubscribe', { data: { endpoint: subscription.endpoint } });
      await subscription.unsubscribe();
      setSubscription(null);
      setState('default');
      return true;
    } catch (err) {
      console.error('Push unsubscribe error:', err);
      return false;
    }
  }, [subscription]);

  return { state, subscription, subscribe, unsubscribe };
}
