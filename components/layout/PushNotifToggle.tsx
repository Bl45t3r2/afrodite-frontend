'use client';
import { Bell, BellOff, BellRing, Loader } from 'lucide-react';
import { usePushNotifications } from '@/lib/usePushNotifications';
import toast from 'react-hot-toast';

export default function PushNotifToggle() {
  const { state, subscribe, unsubscribe } = usePushNotifications();

  if (state === 'unsupported') return null;

  const handleToggle = async () => {
    if (state === 'granted') {
      const ok = await unsubscribe();
      if (ok) toast.success('Notifications push désactivées');
    } else if (state !== 'denied') {
      const ok = await subscribe();
      if (ok) toast.success('🔔 Notifications push activées !');
      else if (Notification.permission === 'denied') {
        toast.error('Notifications bloquées — activez-les dans les paramètres du navigateur');
      }
    }
  };

  const configs = {
    loading:     { icon: Loader,    label: 'Chargement…',      cls: 'text-gray-400',  spin: true  },
    granted:     { icon: BellRing,  label: 'Push activé',      cls: 'text-brand-400', spin: false },
    default:     { icon: Bell,      label: 'Activer les push',  cls: 'text-gray-500',  spin: false },
    denied:      { icon: BellOff,   label: 'Push bloqué',       cls: 'text-red-400',   spin: false },
    unsupported: { icon: BellOff,   label: 'Non supporté',      cls: 'text-gray-300',  spin: false },
  };

  const cfg = configs[state];
  const Icon = cfg.icon;

  return (
    <button
      onClick={handleToggle}
      disabled={state === 'loading' || state === 'denied' || state === 'unsupported'}
      title={cfg.label}
      className={`flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium border transition-all
        ${state === 'granted' ? 'bg-brand-50 border-brand-200 text-brand-600 hover:bg-brand-100' :
          state === 'denied' ? 'bg-red-50 border-red-100 text-red-400 cursor-not-allowed' :
          'bg-gray-50 border-gray-200 text-gray-600 hover:border-brand-300 hover:bg-brand-50 hover:text-brand-600'
        }`}
    >
      <Icon size={15} className={`${cfg.cls} ${cfg.spin ? 'animate-spin' : ''}`} />
      {cfg.label}
    </button>
  );
}
