'use client';
import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import {
  Users, LayoutGrid, Clock, MessageCircle, Check, X, Ban, ShieldCheck,
  Eye, Search, AlertTriangle, Camera, Video, TrendingUp, Zap, DollarSign,
  Activity, RefreshCw, ChevronUp, ChevronDown, MapPin, Crown, Wifi,
  FileText, Bell, Trash2, UserX,
} from 'lucide-react';
import useAuthStore from '@/lib/store';
import api from '@/lib/api';
import toast from 'react-hot-toast';
import Image from 'next/image';

// ── Mini graphique en barres ──
function MiniBarChart({ data }: { data: { date: string; count: number }[] }) {
  const max = Math.max(...data.map(d => d.count), 1);
  return (
    <div className="flex items-end gap-1 h-12">
      {data.map((d, i) => (
        <div key={i} className="flex-1 flex flex-col items-center gap-1">
          <div
            className="w-full bg-brand-400 rounded-t-sm transition-all duration-500 min-h-[2px]"
            style={{ height: `${Math.max((d.count / max) * 100, 4)}%` }}
            title={`${d.date}: ${d.count}`}
          />
        </div>
      ))}
    </div>
  );
}

// ── KPI Card ──
function KpiCard({ icon: Icon, label, value, sub, color, trend }: any) {
  return (
    <div className="card p-5 flex items-start gap-4">
      <div className={`w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 ${color}`}>
        <Icon size={20} className="text-white" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs text-gray-400 font-medium mb-0.5">{label}</p>
        <p className="font-display text-2xl font-bold text-gray-900">{value?.toLocaleString() ?? '—'}</p>
        {sub && <p className="text-xs text-gray-400 mt-0.5">{sub}</p>}
      </div>
      {trend !== undefined && (
        <div className={`flex items-center gap-0.5 text-xs font-semibold ${trend >= 0 ? 'text-emerald-500' : 'text-red-400'}`}>
          {trend >= 0 ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          {Math.abs(trend)}%
        </div>
      )}
    </div>
  );
}

// ── Badge statut ──
function StatusBadge({ status }: { status: string }) {
  const cfg: any = {
    ACTIVE:    'bg-emerald-50 text-emerald-700',
    PENDING:   'bg-amber-50 text-amber-700',
    BANNED:    'bg-red-50 text-red-700',
    SUSPENDED: 'bg-orange-50 text-orange-700',
    COMPLETED: 'bg-emerald-50 text-emerald-700',
    FAILED:    'bg-red-50 text-red-700',
    USER:      'bg-gray-100 text-gray-600',
    PREMIUM:   'bg-purple-50 text-purple-700',
    ADMIN:     'bg-red-50 text-red-600',
  };
  return (
    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wide ${cfg[status] || 'bg-gray-100 text-gray-500'}`}>
      {status}
    </span>
  );
}

export default function AdminPage() {
  const { user, isAuthenticated } = useAuthStore();
  const router = useRouter();

  const [stats, setStats] = useState<any>(null);
  const [activity, setActivity] = useState<any>(null);
  const [pending, setPending] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [reports, setReports] = useState<any[]>([]);
  const [reportCounts, setReportCounts] = useState<any[]>([]);
  const [pendingMedia, setPendingMedia] = useState<{ photos: any[]; videos: any[] }>({ photos: [], videos: [] });
  const [pendingVerifs, setPendingVerifs] = useState<any[]>([]);
  const [tab, setTab] = useState<string>('dashboard');
  const [search, setSearch] = useState('');
  const [selectedProfile, setSelectedProfile] = useState<any>(null);
  const [rejectNote, setRejectNote] = useState('');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadAll = useCallback(async () => {
    try {
      const [s, a, p, u, r, m, v] = await Promise.all([
        api.get('/admin/stats'),
        api.get('/admin/activity'),
        api.get('/admin/profiles/pending'),
        api.get('/admin/users'),
        api.get('/reports'),
        api.get('/admin/media/pending'),
        api.get('/admin/verifications/pending'),
      ]);
      setStats(s.data);
      setActivity(a.data);
      setPending(p.data);
      setUsers(u.data.users);
      setReports(r.data.reports);
      setReportCounts(r.data.counts);
      setPendingMedia(m.data);
      setPendingVerifs(v.data);
    } catch (err) {
      toast.error('Erreur de chargement');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    if (!isAuthenticated || user?.role !== 'ADMIN') { router.push('/'); return; }
    loadAll();
  }, [isAuthenticated]);

  const refresh = () => { setRefreshing(true); loadAll(); };

  const moderate = async (id: string, action: string) => {
    await api.patch(`/admin/profiles/${id}/moderate`, { action });
    setPending(prev => prev.filter(p => p.id !== id));
    setSelectedProfile(null);
    const labels: any = { approve: 'approuvé ✅', reject: 'rejeté', suspend: 'suspendu', ban: 'banni 🚫' };
    toast.success(`Profil ${labels[action]}`);
    setStats((s: any) => s ? { ...s, pendingProfiles: Math.max(0, s.pendingProfiles - 1) } : s);
  };

  const banUser = async (userId: string) => {
    await api.patch(`/admin/users/${userId}/ban`);
    setUsers(prev => prev.map(u => u.id === userId ? { ...u, profile: { ...u.profile, status: 'BANNED' } } : u));
    toast.success('Utilisateur banni 🚫');
  };

  const approveMedia = async (type: 'photo' | 'video', id: string) => {
    await api.patch(`/admin/${type}s/${id}/approve`);
    setPendingMedia(prev => ({
      ...prev,
      [type === 'photo' ? 'photos' : 'videos']: prev[type === 'photo' ? 'photos' : 'videos'].filter((m: any) => m.id !== id)
    }));
    toast.success(`${type === 'photo' ? 'Photo' : 'Vidéo'} approuvée ✅`);
  };

  const rejectMedia = async (type: 'photo' | 'video', id: string) => {
    await api.patch(`/admin/${type}s/${id}/reject`, { note: rejectNote });
    setPendingMedia(prev => ({
      ...prev,
      [type === 'photo' ? 'photos' : 'videos']: prev[type === 'photo' ? 'photos' : 'videos'].filter((m: any) => m.id !== id)
    }));
    setRejectNote('');
    toast.success('Contenu refusé');
  };

  const approveVerif = async (id: string) => {
    await api.patch(`/admin/verifications/${id}/approve`);
    setPendingVerifs(prev => prev.filter(v => v.id !== id));
    toast.success('Identité vérifiée ✅');
  };

  const rejectVerif = async (id: string) => {
    await api.patch(`/admin/verifications/${id}/reject`, { note: rejectNote });
    setPendingVerifs(prev => prev.filter(v => v.id !== id));
    setRejectNote('');
    toast.success('Vérification refusée');
  };

  const filteredUsers = users.filter(u =>
    u.email?.toLowerCase().includes(search.toLowerCase()) ||
    u.profile?.displayName?.toLowerCase().includes(search.toLowerCase())
  );

  const totalPending = pending.length + pendingMedia.photos.length + pendingMedia.videos.length + pendingVerifs.length;

  const TABS = [
    { id: 'dashboard', label: '📊 Dashboard' },
    { id: 'moderation', label: 'Profils', badge: pending.length },
    { id: 'media', label: 'Médias', badge: pendingMedia.photos.length + pendingMedia.videos.length },
    { id: 'verifications', label: 'Identités', badge: pendingVerifs.length },
    { id: 'reports', label: 'Signalements', badge: reports.filter((r: any) => r.status === 'PENDING').length },
    { id: 'users', label: 'Utilisateurs' },
  ];

  if (loading) return (
    <div className="max-w-6xl mx-auto px-4 py-16 flex items-center justify-center">
      <div className="text-center">
        <div className="w-12 h-12 border-4 border-brand-400 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-gray-400">Chargement du tableau de bord…</p>
      </div>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">

      {/* ── Header ── */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-orange-500 rounded-2xl flex items-center justify-center">
            <ShieldCheck size={22} className="text-white" />
          </div>
          <div>
            <h1 className="font-display text-2xl font-bold text-gray-900">Administration</h1>
            <p className="text-sm text-gray-400">Tableau de bord Afrodite</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {totalPending > 0 && (
            <div className="flex items-center gap-2 bg-amber-50 border border-amber-200 text-amber-700 text-sm font-medium px-4 py-2 rounded-xl">
              <AlertTriangle size={15} />
              {totalPending} action{totalPending > 1 ? 's' : ''} requise{totalPending > 1 ? 's' : ''}
            </div>
          )}
          <button onClick={refresh} disabled={refreshing}
            className="flex items-center gap-2 text-sm text-gray-500 border border-gray-200 px-4 py-2 rounded-xl hover:border-brand-300 hover:text-brand-500 transition-all">
            <RefreshCw size={14} className={refreshing ? 'animate-spin' : ''} />
            Actualiser
          </button>
        </div>
      </div>

      {/* ── Tabs ── */}
      <div className="flex gap-1 bg-gray-100 rounded-xl p-1 mb-8 overflow-x-auto">
        {TABS.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className={`relative px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${
              tab === t.id ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
            }`}>
            {t.label}
            {t.badge ? (
              <span className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                {t.badge > 99 ? '99+' : t.badge}
              </span>
            ) : null}
          </button>
        ))}
      </div>

      {/* ══════════════════════════════════════════════
          DASHBOARD PRINCIPAL
      ══════════════════════════════════════════════ */}
      {tab === 'dashboard' && stats && (
        <div className="space-y-6">

          {/* KPIs principaux */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <KpiCard icon={Users} label="Utilisateurs total" value={stats.totalUsers}
              sub={`+${stats.newUsersToday} aujourd'hui`} color="bg-blue-500" />
            <KpiCard icon={LayoutGrid} label="Profils actifs" value={stats.activeProfiles}
              sub={`${stats.onlineProfiles} en ligne maintenant`} color="bg-emerald-500" />
            <KpiCard icon={Crown} label="Membres Premium" value={stats.premiumUsers}
              sub={`${stats.conversionRate}% de conversion`} color="bg-purple-500" />
            <KpiCard icon={DollarSign} label="Revenus total" value={`${(stats.totalRevenueFcfa || 0).toLocaleString()} FCFA`}
              color="bg-amber-500" />
          </div>

          {/* KPIs secondaires */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <KpiCard icon={MessageCircle} label="Messages aujourd'hui" value={stats.messagesToday}
              sub={`${stats.messages7Days} cette semaine`} color="bg-brand-400" />
            <KpiCard icon={Clock} label="En attente de modération" value={stats.pendingProfiles}
              color="bg-orange-500" />
            <KpiCard icon={Camera} label="Médias à modérer" value={stats.pendingMedia}
              color="bg-pink-500" />
            <KpiCard icon={ShieldCheck} label="Vérifications identité" value={stats.pendingVerifs}
              color="bg-indigo-500" />
          </div>

          {/* Graphiques + Top villes */}
          <div className="grid md:grid-cols-3 gap-6">
            {/* Inscriptions 7 jours */}
            <div className="card p-6 md:col-span-2">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="font-semibold text-gray-900">Inscriptions — 7 derniers jours</h3>
                  <p className="text-sm text-gray-400 mt-0.5">
                    <span className="text-brand-500 font-semibold">+{stats.newUsers7Days}</span> nouveaux membres
                  </p>
                </div>
                <TrendingUp size={18} className="text-brand-400" />
              </div>
              {stats.registrationsPerDay && (
                <>
                  <MiniBarChart data={stats.registrationsPerDay} />
                  <div className="flex justify-between mt-2">
                    {stats.registrationsPerDay.map((d: any, i: number) => (
                      <span key={i} className="text-[10px] text-gray-400 flex-1 text-center">{d.date}</span>
                    ))}
                  </div>
                </>
              )}
            </div>

            {/* Top villes */}
            <div className="card p-6">
              <div className="flex items-center gap-2 mb-4">
                <MapPin size={16} className="text-brand-400" />
                <h3 className="font-semibold text-gray-900">Top villes</h3>
              </div>
              <div className="space-y-3">
                {stats.topCities?.map((c: any, i: number) => {
                  const pct = Math.round((c.count / stats.activeProfiles) * 100);
                  return (
                    <div key={c.city}>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-gray-700 font-medium flex items-center gap-1.5">
                          <span className="text-gray-400 text-xs">#{i+1}</span> {c.city}
                        </span>
                        <span className="text-gray-400">{c.count} profils</span>
                      </div>
                      <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                        <div className="h-full bg-brand-400 rounded-full transition-all duration-700"
                          style={{ width: `${pct}%` }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Activité récente */}
          {activity && (
            <div className="grid md:grid-cols-2 gap-6">
              {/* Derniers inscrits */}
              <div className="card p-6">
                <div className="flex items-center gap-2 mb-4">
                  <Activity size={16} className="text-brand-400" />
                  <h3 className="font-semibold text-gray-900">Derniers inscrits</h3>
                </div>
                <div className="space-y-3">
                  {activity.recentUsers?.map((u: any) => (
                    <div key={u.id} className="flex items-center gap-3 py-1">
                      <div className="w-8 h-8 bg-brand-50 rounded-full flex items-center justify-center shrink-0">
                        <span className="text-brand-500 font-bold text-sm">
                          {(u.profile?.displayName || u.email)[0].toUpperCase()}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {u.profile?.displayName || u.email}
                        </p>
                        <p className="text-xs text-gray-400">
                          {u.profile?.city} · {new Date(u.createdAt).toLocaleDateString('fr-FR')}
                        </p>
                      </div>
                      <StatusBadge status={u.role} />
                    </div>
                  ))}
                </div>
              </div>

              {/* Derniers paiements */}
              <div className="card p-6">
                <div className="flex items-center gap-2 mb-4">
                  <DollarSign size={16} className="text-brand-400" />
                  <h3 className="font-semibold text-gray-900">Derniers paiements</h3>
                </div>
                {activity.recentPayments?.length === 0 ? (
                  <p className="text-sm text-gray-400 text-center py-4">Aucun paiement encore</p>
                ) : (
                  <div className="space-y-3">
                    {activity.recentPayments?.map((p: any) => (
                      <div key={p.id} className="flex items-center gap-3 py-1">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                          p.provider === 'STRIPE' ? 'bg-blue-50' : 'bg-yellow-50'
                        }`}>
                          <DollarSign size={14} className={p.provider === 'STRIPE' ? 'text-blue-500' : 'text-yellow-500'} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">
                            {p.user?.profile?.displayName || p.user?.email}
                          </p>
                          <p className="text-xs text-gray-400">
                            {p.plan?.toUpperCase()} · {p.provider}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-semibold text-gray-900">{(p.amount || 0).toLocaleString()} FCFA</p>
                          <StatusBadge status={p.status} />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ══════════════════════════════════════════════
          MODÉRATION PROFILS
      ══════════════════════════════════════════════ */}
      {tab === 'moderation' && (
        <div className="grid md:grid-cols-2 gap-6">
          <div className="space-y-3">
            {pending.length === 0 ? (
              <div className="card p-12 text-center text-gray-400">
                <Check size={40} className="mx-auto mb-3 text-emerald-400 opacity-60" />
                <p className="font-medium">File de modération vide 🎉</p>
                <p className="text-sm mt-1">Tous les profils ont été traités.</p>
              </div>
            ) : pending.map(profile => (
              <div key={profile.id} onClick={() => setSelectedProfile(profile)}
                className={`card p-4 flex items-center gap-3 cursor-pointer transition-all hover:shadow-md ${selectedProfile?.id === profile.id ? 'border-brand-400 ring-2 ring-brand-400/20' : ''}`}>
                <div className="w-12 h-12 rounded-xl overflow-hidden bg-brand-50 shrink-0">
                  {profile.photos?.[0] ? (
                    <Image src={profile.photos[0].url} alt="" width={48} height={48} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center font-bold text-brand-400 text-lg">
                      {profile.displayName?.[0]}
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-gray-900 truncate">{profile.displayName}</p>
                  <p className="text-xs text-gray-500">{profile.city} · {profile.age} ans</p>
                  <p className="text-xs text-gray-400 truncate">{profile.user?.email}</p>
                </div>
                <Eye size={15} className="text-gray-300 shrink-0" />
              </div>
            ))}
          </div>

          {/* Panel détail */}
          <div className="card p-6 sticky top-24 self-start max-h-[80vh] overflow-y-auto">
            {!selectedProfile ? (
              <div className="text-center text-gray-300 py-16">
                <Eye size={40} className="mx-auto mb-3 opacity-30" />
                <p className="text-sm">Sélectionnez un profil</p>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl overflow-hidden bg-brand-50">
                    {selectedProfile.photos?.[0] ? (
                      <Image src={selectedProfile.photos[0].url} alt="" width={48} height={48} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center font-bold text-brand-400 text-xl">
                        {selectedProfile.displayName?.[0]}
                      </div>
                    )}
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">{selectedProfile.displayName}</p>
                    <p className="text-xs text-gray-400">{selectedProfile.user?.email}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 text-sm">
                  {[
                    ['Ville', selectedProfile.city],
                    ['Âge', `${selectedProfile.age} ans`],
                    ['Tarif', selectedProfile.pricePerHour ? `${selectedProfile.pricePerHour} FCFA/h` : '—'],
                    ['Catégories', selectedProfile.categories?.join(', ') || '—'],
                  ].map(([k, v]) => (
                    <div key={k} className="bg-gray-50 rounded-xl p-3">
                      <p className="text-gray-400 text-xs mb-0.5">{k}</p>
                      <p className="font-medium text-gray-900 truncate">{v}</p>
                    </div>
                  ))}
                </div>

                {selectedProfile.bio && (
                  <div className="bg-gray-50 rounded-xl p-3 text-sm text-gray-600 leading-relaxed max-h-24 overflow-y-auto">
                    {selectedProfile.bio}
                  </div>
                )}

                {selectedProfile.photos?.length > 0 && (
                  <div className="grid grid-cols-3 gap-1.5">
                    {selectedProfile.photos.slice(0, 6).map((p: any) => (
                      <div key={p.id} className="aspect-square rounded-xl overflow-hidden bg-gray-100">
                        <Image src={p.url} alt="" width={80} height={80} className="w-full h-full object-cover" />
                      </div>
                    ))}
                  </div>
                )}

                <div className="grid grid-cols-2 gap-2">
                  <button onClick={() => moderate(selectedProfile.id, 'approve')}
                    className="flex items-center justify-center gap-1.5 bg-emerald-500 hover:bg-emerald-600 text-white font-medium py-2.5 rounded-xl text-sm transition-colors">
                    <Check size={14} /> Approuver
                  </button>
                  <button onClick={() => moderate(selectedProfile.id, 'reject')}
                    className="flex items-center justify-center gap-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-2.5 rounded-xl text-sm transition-colors">
                    <X size={14} /> Rejeter
                  </button>
                  <button onClick={() => moderate(selectedProfile.id, 'suspend')}
                    className="flex items-center justify-center gap-1.5 bg-amber-50 hover:bg-amber-100 text-amber-700 font-medium py-2.5 rounded-xl text-sm transition-colors">
                    <Clock size={14} /> Suspendre
                  </button>
                  <button onClick={() => moderate(selectedProfile.id, 'ban')}
                    className="flex items-center justify-center gap-1.5 bg-red-50 hover:bg-red-100 text-red-600 font-medium py-2.5 rounded-xl text-sm transition-colors">
                    <Ban size={14} /> Bannir
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════
          MÉDIAS
      ══════════════════════════════════════════════ */}
      {tab === 'media' && (
        <div className="space-y-8">
          <div>
            <h2 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Camera size={17} className="text-brand-400" /> Photos en attente ({pendingMedia.photos.length})
            </h2>
            {pendingMedia.photos.length === 0 ? (
              <div className="card p-8 text-center text-gray-400"><Check size={28} className="mx-auto mb-2 text-emerald-400" /><p>Aucune photo en attente 🎉</p></div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {pendingMedia.photos.map((photo: any) => (
                  <div key={photo.id} className="card overflow-hidden">
                    <div className="relative aspect-[3/4]">
                      <Image src={photo.url} alt="" fill className="object-cover" />
                      <div className="absolute bottom-0 inset-x-0 bg-black/60 p-2">
                        <p className="text-white text-xs font-medium truncate">{photo.profile?.displayName}</p>
                        <p className="text-white/60 text-[10px]">{photo.profile?.city}</p>
                      </div>
                    </div>
                    <div className="p-3 space-y-2">
                      <input className="input text-xs py-1" placeholder="Note de refus" onChange={e => setRejectNote(e.target.value)} />
                      <div className="flex gap-2">
                        <button onClick={() => approveMedia('photo', photo.id)}
                          className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-medium py-1.5 rounded-lg flex items-center justify-center gap-1">
                          <Check size={11} /> OK
                        </button>
                        <button onClick={() => rejectMedia('photo', photo.id)}
                          className="flex-1 bg-red-500 hover:bg-red-600 text-white text-xs font-medium py-1.5 rounded-lg flex items-center justify-center gap-1">
                          <X size={11} /> Refus
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div>
            <h2 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Video size={17} className="text-brand-400" /> Vidéos en attente ({pendingMedia.videos.length})
            </h2>
            {pendingMedia.videos.length === 0 ? (
              <div className="card p-8 text-center text-gray-400"><Check size={28} className="mx-auto mb-2 text-emerald-400" /><p>Aucune vidéo en attente 🎉</p></div>
            ) : (
              <div className="grid md:grid-cols-2 gap-4">
                {pendingMedia.videos.map((video: any) => (
                  <div key={video.id} className="card overflow-hidden">
                    <div className="relative aspect-video bg-gray-900">
                      {video.thumbnailUrl
                        ? <img src={video.thumbnailUrl} alt="" className="w-full h-full object-cover" />
                        : <div className="w-full h-full flex items-center justify-center"><Video size={32} className="text-gray-600" /></div>
                      }
                      <a href={video.url} target="_blank" rel="noreferrer"
                        className="absolute inset-0 flex items-center justify-center bg-black/30 hover:bg-black/50">
                        <div className="w-10 h-10 bg-white/20 backdrop-blur rounded-full flex items-center justify-center">
                          <Eye size={18} className="text-white" />
                        </div>
                      </a>
                    </div>
                    <div className="p-4 space-y-2">
                      <p className="font-medium text-sm">{video.profile?.displayName} — {video.profile?.city}</p>
                      <input className="input text-xs py-1" placeholder="Note de refus" onChange={e => setRejectNote(e.target.value)} />
                      <div className="flex gap-2">
                        <button onClick={() => approveMedia('video', video.id)} className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-medium py-2 rounded-lg flex items-center justify-center gap-1"><Check size={11} /> Approuver</button>
                        <button onClick={() => rejectMedia('video', video.id)} className="flex-1 bg-red-500 hover:bg-red-600 text-white text-xs font-medium py-2 rounded-lg flex items-center justify-center gap-1"><X size={11} /> Refuser</button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════
          VÉRIFICATIONS
      ══════════════════════════════════════════════ */}
      {tab === 'verifications' && (
        <div className="space-y-4">
          <h2 className="font-semibold text-gray-900 flex items-center gap-2">
            <ShieldCheck size={17} className="text-brand-400" /> Demandes de vérification ({pendingVerifs.length})
          </h2>
          {pendingVerifs.length === 0 ? (
            <div className="card p-12 text-center text-gray-400">
              <ShieldCheck size={36} className="mx-auto mb-3 text-emerald-400" />
              <p className="font-medium">Aucune demande en attente 🎉</p>
            </div>
          ) : pendingVerifs.map((verif: any) => (
            <div key={verif.id} className="card p-6 space-y-4">
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-semibold text-gray-900">{verif.profile?.displayName}</p>
                  <p className="text-sm text-gray-400">{verif.profile?.city} · {verif.profile?.age} ans · {verif.profile?.user?.email}</p>
                  <span className="inline-block mt-1 text-xs bg-brand-50 text-brand-500 font-semibold px-2 py-0.5 rounded-full">{verif.docType}</span>
                </div>
                <span className="text-xs text-gray-400">{new Date(verif.submittedAt).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long' })}</span>
              </div>
              <div className="grid grid-cols-3 gap-3">
                {[['Recto', verif.docFrontUrl], verif.docBackUrl && ['Verso', verif.docBackUrl], ['Selfie', verif.selfieUrl]]
                  .filter(Boolean).map(([label, url]: any) => (
                  <div key={label}>
                    <p className="text-xs text-gray-500 mb-1">{label}</p>
                    <a href={url} target="_blank" rel="noreferrer">
                      <img src={url} alt={label} className="w-full h-28 object-cover rounded-xl border hover:opacity-80 transition-opacity" />
                    </a>
                  </div>
                ))}
              </div>
              <div className="flex gap-3">
                <input className="input flex-1 text-sm py-2" placeholder="Note de refus (optionnel)"
                  value={rejectNote} onChange={e => setRejectNote(e.target.value)} />
                <button onClick={() => approveVerif(verif.id)}
                  className="bg-emerald-500 hover:bg-emerald-600 text-white font-medium px-5 py-2 rounded-xl text-sm flex items-center gap-1.5">
                  <ShieldCheck size={14} /> Approuver
                </button>
                <button onClick={() => rejectVerif(verif.id)}
                  className="bg-red-500 hover:bg-red-600 text-white font-medium px-5 py-2 rounded-xl text-sm flex items-center gap-1.5">
                  <X size={14} /> Refuser
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ══════════════════════════════════════════════
          SIGNALEMENTS
      ══════════════════════════════════════════════ */}
      {tab === 'reports' && (
        <div className="space-y-4">
          <div className="flex gap-2 flex-wrap">
            {[
              { status: 'PENDING', label: 'En attente', color: 'bg-amber-50 text-amber-700 border-amber-200' },
              { status: 'REVIEWED', label: 'Examinés', color: 'bg-blue-50 text-blue-700 border-blue-200' },
              { status: 'ACTION_TAKEN', label: 'Action prise', color: 'bg-red-50 text-red-700 border-red-200' },
              { status: 'DISMISSED', label: 'Ignorés', color: 'bg-gray-50 text-gray-600 border-gray-200' },
            ].map(s => {
              const count = reportCounts.find((c: any) => c.status === s.status)?._count || 0;
              return (
                <button key={s.status}
                  onClick={() => api.get(`/reports?status=${s.status}`).then(r => setReports(r.data.reports))}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl border text-sm font-medium ${s.color}`}>
                  {s.label} <span className="font-bold">{count}</span>
                </button>
              );
            })}
          </div>
          {reports.length === 0 ? (
            <div className="card p-12 text-center text-gray-400"><p className="font-medium">Aucun signalement</p></div>
          ) : (
            <div className="card overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b border-gray-100">
                  <tr>
                    {['Profil signalé', 'Raison', 'Date', 'Statut', 'Actions'].map(h => (
                      <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wide">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {reports.map((r: any) => (
                    <tr key={r.id} className="hover:bg-gray-50/50">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          {r.profile?.photos?.[0] && <img src={r.profile.photos[0].url} className="w-8 h-8 rounded-lg object-cover" alt="" />}
                          <div>
                            <p className="font-medium text-gray-900">{r.profile?.displayName}</p>
                            <p className="text-xs text-gray-400">{r.profile?.city}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className="bg-red-50 text-red-700 text-xs font-medium px-2 py-1 rounded-full">
                          {r.reason === 'FAKE_PROFILE' ? 'Faux profil' : r.reason === 'INAPPROPRIATE_CONTENT' ? 'Contenu inapproprié' : r.reason === 'SCAM' ? 'Arnaque' : r.reason === 'UNDERAGE' ? 'Mineur' : r.reason === 'SPAM' ? 'Spam' : 'Autre'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-xs text-gray-400">{new Date(r.createdAt).toLocaleDateString('fr-FR')}</td>
                      <td className="px-4 py-3"><StatusBadge status={r.status} /></td>
                      <td className="px-4 py-3">
                        <div className="flex gap-1.5">
                          <button onClick={async () => {
                            await api.patch(`/reports/${r.id}`, { status: 'ACTION_TAKEN', action: 'suspend' });
                            setReports(prev => prev.map(x => x.id === r.id ? { ...x, status: 'ACTION_TAKEN' } : x));
                            toast.success('Profil suspendu');
                          }} className="text-xs bg-red-50 text-red-600 hover:bg-red-100 px-2 py-1 rounded-lg font-medium">Suspendre</button>
                          <button onClick={async () => {
                            await api.patch(`/reports/${r.id}`, { status: 'DISMISSED' });
                            setReports(prev => prev.map(x => x.id === r.id ? { ...x, status: 'DISMISSED' } : x));
                            toast.success('Ignoré');
                          }} className="text-xs bg-gray-50 text-gray-600 hover:bg-gray-100 px-2 py-1 rounded-lg font-medium">Ignorer</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* ══════════════════════════════════════════════
          UTILISATEURS
      ══════════════════════════════════════════════ */}
      {tab === 'users' && (
        <div className="space-y-4">
          <div className="relative">
            <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
            <input className="input pl-10" placeholder="Rechercher par email ou nom…"
              value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <div className="card overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  {['Utilisateur', 'Rôle', 'Statut', 'Plan', 'Inscrit le', 'Actions'].map(h => (
                    <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wide">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filteredUsers.map((u: any) => (
                  <tr key={u.id} className="hover:bg-gray-50/50">
                    <td className="px-4 py-3">
                      <p className="font-medium text-gray-900">{u.profile?.displayName || '—'}</p>
                      <p className="text-gray-400 text-xs">{u.email}</p>
                    </td>
                    <td className="px-4 py-3"><StatusBadge status={u.role} /></td>
                    <td className="px-4 py-3"><StatusBadge status={u.profile?.status || 'PENDING'} /></td>
                    <td className="px-4 py-3 text-xs text-gray-400 capitalize">{u.subscription?.plan || 'basic'}</td>
                    <td className="px-4 py-3 text-xs text-gray-400">
                      {u.createdAt ? new Date(u.createdAt).toLocaleDateString('fr-FR') : '—'}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <select value={u.role}
                          onChange={async e => {
                            await api.patch(`/admin/users/${u.id}/role`, { role: e.target.value });
                            setUsers(prev => prev.map(x => x.id === u.id ? { ...x, role: e.target.value } : x));
                            toast.success('Rôle mis à jour');
                          }}
                          className="text-xs border border-gray-200 rounded-lg px-2 py-1.5 bg-white focus:outline-none focus:ring-2 focus:ring-brand-400/30">
                          <option value="USER">USER</option>
                          <option value="PREMIUM">PREMIUM</option>
                          <option value="ADMIN">ADMIN</option>
                        </select>
                        {u.profile?.status !== 'BANNED' && (
                          <button onClick={() => banUser(u.id)} title="Bannir"
                            className="w-7 h-7 bg-red-50 hover:bg-red-100 text-red-500 rounded-lg flex items-center justify-center transition-colors">
                            <UserX size={13} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filteredUsers.length === 0 && (
              <div className="py-12 text-center text-gray-400 text-sm">Aucun utilisateur trouvé</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
