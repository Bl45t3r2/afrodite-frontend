'use client';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  MessageCircle, Heart, User, LogOut, Shield, Menu, X,
  Bell, CheckCheck, Flame, ChevronDown, Search
} from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import useAuthStore from '@/lib/store';
import useNotificationStore from '@/lib/notificationStore';
import { useSocketNotifications } from '@/lib/useSocketNotifications';
import clsx from 'clsx';

function NotificationPanel({ onClose }: { onClose: () => void }) {
  const { notifications, unreadCount, markAllRead, markRead } = useNotificationStore();
  const router = useRouter();

  const icons: Record<string, string> = {
    message: '💬', favorite: '❤️', review: '⭐',
  };

  const handleClick = async (n: any) => {
    markRead(n.id);
    if (!n.read) {
      try { await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/notifications/${n.id}/read`, { method: 'PATCH', credentials: 'include' }); } catch {}
    }
    onClose();
    const target = n.link || n.href;
    if (target) router.push(target);
  };

  return (
    <div className="absolute right-0 top-14 w-80 bg-[#1a1a1a] border border-white/10 rounded-2xl shadow-2xl shadow-black/50 z-50 overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3 border-b border-white/8">
        <h3 className="font-semibold text-white text-sm">Notifications</h3>
        {unreadCount > 0 && (
          <button onClick={markAllRead} className="flex items-center gap-1 text-xs text-brand-400 hover:text-brand-300 font-medium transition-colors">
            <CheckCheck size={12} /> Tout marquer lu
          </button>
        )}
      </div>
      <div className="max-h-80 overflow-y-auto">
        {notifications.length === 0 ? (
          <div className="py-10 text-center">
            <Bell size={28} className="text-white/20 mx-auto mb-2" />
            <p className="text-sm text-white/30">Aucune notification</p>
          </div>
        ) : (
          notifications.map(n => (
            <button key={n.id} onClick={() => handleClick(n)}
              className={`w-full text-left px-4 py-3 flex items-start gap-3 hover:bg-white/5 transition-colors border-b border-white/5 last:border-0 ${!n.read ? 'bg-brand-500/5' : ''}`}>
              <span className="text-base shrink-0 mt-0.5">{icons[n.type] || '🔔'}</span>
              <div className="flex-1 min-w-0">
                <p className={`text-sm text-white truncate ${!n.read ? 'font-semibold' : 'font-medium'}`}>{n.title}</p>
                <p className="text-xs text-white/40 truncate mt-0.5">{n.body}</p>
                <p className="text-[10px] text-white/25 mt-1">
                  {new Date(n.createdAt).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
              {!n.read && <span className="w-1.5 h-1.5 bg-brand-400 rounded-full shrink-0 mt-2" />}
            </button>
          ))
        )}
      </div>
    </div>
  );
}

export default function Navbar() {
  const { user, isAuthenticated, logout } = useAuthStore();
  const { unreadCount } = useNotificationStore();
  const router = useRouter();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [showNotifs, setShowNotifs] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);

  useSocketNotifications();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setShowNotifs(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleLogout = () => { logout(); router.push('/'); };

  const isActive = (href: string) => pathname === href || pathname.startsWith(href + '/');

  return (
    <nav className={clsx(
      'sticky top-0 z-50 transition-all duration-300',
      scrolled
        ? 'bg-[#0d0d0d]/95 backdrop-blur-xl border-b border-white/8 shadow-lg shadow-black/30'
        : 'bg-[#0d0d0d]/80 backdrop-blur-md border-b border-white/5'
    )}>
      <div className="max-w-[1600px] mx-auto px-4 h-16 flex items-center justify-between gap-4">

        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 shrink-0 group">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-brand-400 to-brand-600 flex items-center justify-center shadow-md shadow-brand-500/30 group-hover:shadow-brand-500/50 transition-shadow">
            <Flame size={14} className="text-white" />
          </div>
          <span className="font-display text-lg font-bold text-white tracking-tight">Afrodite</span>
        </Link>

        {/* Search bar (desktop) */}
        <div className="hidden lg:flex flex-1 max-w-md mx-6">
          <div className="relative w-full">
            <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/30" />
            <input
              type="text"
              placeholder="Rechercher une ville, une catégorie…"
              className="w-full bg-white/6 border border-white/10 rounded-full pl-10 pr-4 py-2 text-sm text-white placeholder:text-white/25 focus:outline-none focus:border-brand-500/50 focus:bg-white/8 transition-all"
              onFocus={e => e.target.select()}
            />
          </div>
        </div>

        {/* Desktop nav links */}
        <div className="hidden md:flex items-center gap-1">
          {[
            { href: '/profiles', label: 'Profils' },
            { href: '/tarifs', label: 'Tarifs' },
            ...(isAuthenticated ? [{ href: '/messages', label: 'Messages' }] : []),
          ].map(({ href, label }) => (
            <Link key={href} href={href}
              className={clsx(
                'px-3.5 py-2 rounded-lg text-sm font-medium transition-all',
                isActive(href)
                  ? 'bg-white/10 text-white'
                  : 'text-white/55 hover:text-white hover:bg-white/6'
              )}>
              {label}
            </Link>
          ))}
        </div>

        {/* Right actions */}
        <div className="hidden md:flex items-center gap-1.5">
          {isAuthenticated ? (
            <>
              {user?.role === 'ADMIN' && (
                <Link href="/admin" className="p-2 text-white/40 hover:text-red-400 transition-colors rounded-lg hover:bg-white/5">
                  <Shield size={17} />
                </Link>
              )}

              {/* Notifications */}
              <div ref={notifRef} className="relative">
                <button onClick={() => setShowNotifs(v => !v)}
                  className={clsx('relative p-2 rounded-lg transition-all',
                    showNotifs ? 'text-brand-400 bg-brand-500/15' : 'text-white/50 hover:text-white hover:bg-white/6')}>
                  <Bell size={17} />
                  {unreadCount > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 min-w-[17px] h-[17px] bg-brand-500 text-white text-[9px] font-black rounded-full flex items-center justify-center px-1 ring-2 ring-[#0d0d0d] animate-pulse">
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                  )}
                </button>
                {showNotifs && <NotificationPanel onClose={() => setShowNotifs(false)} />}
              </div>

              <Link href="/messages" className="p-2 text-white/50 hover:text-white hover:bg-white/6 rounded-lg transition-all">
                <MessageCircle size={17} />
              </Link>
              <Link href="/dashboard/favorites" className="p-2 text-white/50 hover:text-white hover:bg-white/6 rounded-lg transition-all">
                <Heart size={17} />
              </Link>

              {/* User menu */}
              <Link href="/dashboard"
                className="flex items-center gap-2 bg-white/8 hover:bg-white/12 border border-white/10 hover:border-white/20 rounded-xl px-3 py-1.5 transition-all ml-1">
                <div className="w-5 h-5 rounded-full bg-gradient-to-br from-brand-400 to-brand-600 flex items-center justify-center text-[10px] text-white font-bold">
                  {(user?.profile?.displayName || user?.email || 'U')[0].toUpperCase()}
                </div>
                <span className="text-white text-xs font-medium max-w-[90px] truncate">
                  {user?.profile?.displayName || 'Mon compte'}
                </span>
              </Link>

              <button onClick={handleLogout} className="p-2 text-white/30 hover:text-red-400 hover:bg-white/5 rounded-lg transition-all">
                <LogOut size={15} />
              </button>
            </>
          ) : (
            <>
              <Link href="/auth/login" className="px-4 py-2 text-sm font-medium text-white/70 hover:text-white transition-colors rounded-lg hover:bg-white/6">
                Connexion
              </Link>
              <Link href="/auth/register"
                className="px-4 py-2 text-sm font-semibold bg-brand-500 hover:bg-brand-400 text-white rounded-xl transition-all shadow-md shadow-brand-500/25 hover:shadow-brand-500/40">
                Créer un profil
              </Link>
            </>
          )}
        </div>

        {/* Mobile controls */}
        <div className="md:hidden flex items-center gap-1.5">
          {isAuthenticated && (
            <div ref={notifRef} className="relative">
              <button onClick={() => setShowNotifs(v => !v)} className="relative p-2 text-white/60">
                <Bell size={20} />
                {unreadCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 min-w-[15px] h-[15px] bg-brand-500 text-white text-[8px] font-black rounded-full flex items-center justify-center ring-2 ring-[#0d0d0d]">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </button>
              {showNotifs && <NotificationPanel onClose={() => setShowNotifs(false)} />}
            </div>
          )}
          <button className="p-2 text-white/60 hover:text-white" onClick={() => setOpen(!open)}>
            {open ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="md:hidden bg-[#111] border-t border-white/8 px-4 py-4 flex flex-col gap-1">
          {[
            { href: '/profiles', label: 'Profils' },
            { href: '/tarifs', label: 'Tarifs' },
            ...(isAuthenticated ? [
              { href: '/messages', label: 'Messages' },
              { href: '/dashboard', label: 'Mon compte' },
            ] : []),
          ].map(({ href, label }) => (
            <Link key={href} href={href} onClick={() => setOpen(false)}
              className={clsx('px-3 py-2.5 rounded-xl text-sm font-medium transition-colors',
                isActive(href) ? 'bg-white/10 text-white' : 'text-white/60 hover:text-white hover:bg-white/5')}>
              {label}
            </Link>
          ))}

          {isAuthenticated ? (
            <>
              {user?.role === 'ADMIN' && (
                <Link href="/admin" onClick={() => setOpen(false)} className="px-3 py-2.5 rounded-xl text-sm font-medium text-red-400">Administration</Link>
              )}
              <button onClick={handleLogout} className="px-3 py-2.5 rounded-xl text-sm text-left text-red-400/80 hover:text-red-400">Déconnexion</button>
            </>
          ) : (
            <div className="flex gap-2 mt-2 pt-2 border-t border-white/8">
              <Link href="/auth/login" onClick={() => setOpen(false)} className="flex-1 text-center py-2.5 border border-white/15 text-white/70 text-sm font-medium rounded-xl">Connexion</Link>
              <Link href="/auth/register" onClick={() => setOpen(false)} className="flex-1 text-center py-2.5 bg-brand-500 text-white text-sm font-semibold rounded-xl">Créer un profil</Link>
            </div>
          )}
        </div>
      )}
    </nav>
  );
}
