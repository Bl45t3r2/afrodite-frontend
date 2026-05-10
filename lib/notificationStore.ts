import { create } from 'zustand';

interface Notification {
  id: string;
  type: 'MESSAGE' | 'REVIEW' | 'FAVORITE' | 'SYSTEM' | 'message' | 'review' | 'favorite';
  title: string;
  body: string;
  read: boolean;
  createdAt: string | Date;
  link?: string;
  href?: string;
}

interface NotificationStore {
  notifications: Notification[];
  unreadCount: number;
  setNotifications: (notifs: Notification[], count: number) => void;
  addNotification: (n: any) => void;
  markAllRead: () => void;
  markRead: (id: string) => void;
  clear: () => void;
}

const useNotificationStore = create<NotificationStore>((set) => ({
  notifications: [],
  unreadCount: 0,

  setNotifications: (notifications, unreadCount) =>
    set({ notifications, unreadCount }),

  addNotification: (n) => {
    const notif: Notification = n.id ? n : {
      ...n,
      id: Math.random().toString(36).slice(2),
      read: false,
      createdAt: new Date().toISOString(),
    };
    set(state => ({
      notifications: [notif, ...state.notifications].slice(0, 20),
      unreadCount: state.unreadCount + 1,
    }));
  },

  markAllRead: () => set(state => ({
    notifications: state.notifications.map(n => ({ ...n, read: true })),
    unreadCount: 0,
  })),

  markRead: (id) => set(state => {
    const notif = state.notifications.find(n => n.id === id);
    if (!notif || notif.read) return state;
    return {
      notifications: state.notifications.map(n => n.id === id ? { ...n, read: true } : n),
      unreadCount: Math.max(0, state.unreadCount - 1),
    };
  }),

  clear: () => set({ notifications: [], unreadCount: 0 }),
}));

export default useNotificationStore;
