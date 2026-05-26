'use client';
import { useEffect, useState, useCallback } from 'react';
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { useRouter } from 'next/navigation';
import {
  Users, LayoutGrid, Clock, MessageCircle, Check, X, Ban, ShieldCheck,
  Eye, Search, AlertTriangle, Camera, Video, TrendingUp, Zap, DollarSign,
  Activity, RefreshCw, ChevronUp, ChevronDown, MapPin, Crown, Wifi,
  FileText, Bell, Trash2, UserX,
} from 'lucide-react';
import useAuthStore, { useHasHydrated } from '@/lib/store';
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
      {/* Partners */}
      {/* Partners */}
      {/* Partners */}
      {/* Partners */}
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
        <p className="text-xs text-white/40 font-medium mb-0.5">{label}</p>
        <p className="font-display text-2xl font-bold text-white">{value?.toLocaleString() ?? '—'}</p>
        {sub && <p className="text-xs text-white/40 mt-0.5">{sub}</p>}
      </div>
      {trend !== undefined && (
        <div className={`flex items-center gap-0.5 text-xs font-semibold ${trend >= 0 ? 'text-emerald-500' : 'text-red-400'}`}>
          {trend >= 0 ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          {Math.abs(trend)}%
        </div>
      )}
      {/* Partners */}
      {/* Partners */}
      {/* Partners */}
      {/* Partners */}
    </div>
  );
}

// ── Badge statut ──
function StatusBadge({ status }: { status: string }) {
  const cfg: any = {
    ACTIVE:    'bg-emerald-900/20 text-emerald-400',
    PENDING:   'bg-amber-900/20 text-amber-400',
    BANNED:    'bg-red-900/20 text-red-400',
    SUSPENDED: 'bg-orange-50 text-orange-700',
    COMPLETED: 'bg-emerald-900/20 text-emerald-400',
    FAILED:    'bg-red-900/20 text-red-400',
    USER:      'bg-white/10 text-white/60',
    PREMIUM:   'bg-purple-900/20 text-purple-400',
    ADMIN:     'bg-red-900/20 text-red-600',
  };
  return (
    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wide ${cfg[status] || 'bg-white/10 text-white/50'}`}>
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
  const hasHydrated = useHasHydrated();
  const [notifForm, setNotifForm] = useState({ title: '', message: '', type: 'SYSTEM', targetUserId: '', link: '' });
  const [sendingNotif, setSendingNotif] = useState(false);
  const [tab, setTab] = useState<string>('dashboard');
  const [partners, setPartners] = useState<any[]>([]);
  const [partnerForm, setPartnerForm] = useState({ code: '', email: '', displayName: '' });
  const [partnerLoading, setPartnerLoading] = useState(false);
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
    if (!hasHydrated) return;
    if (!isAuthenticated || user?.role !== 'ADMIN') { router.push('/'); return; }
    loadAll();
  }, [hasHydrated, isAuthenticated]);

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
    { id: 'partners', label: '🤝 Partenaires' },
    { id: 'notifications', label: '🔔 Notifications' },
  ];

  if (loading) return (
    <div className="max-w-6xl mx-auto px-4 py-16 flex items-center justify-center">
      <div className="text-center">
        <div className="w-12 h-12 border-4 border-brand-400 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-white/40">Chargement du tableau de bord…</p>
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
            <h1 className="font-display text-2xl font-bold text-white">Administration</h1>
            <p className="text-sm text-white/40">Tableau de bord Afrodite</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {totalPending > 0 && (
            <div className="flex items-center gap-2 bg-amber-900/20 border border-amber-200 text-amber-400 text-sm font-medium px-4 py-2 rounded-xl">
              <AlertTriangle size={15} />
              {totalPending} action{totalPending > 1 ? 's' : ''} requise{totalPending > 1 ? 's' : ''}
            </div>
          )}
          <button onClick={refresh} disabled={refreshing}
            className="flex items-center gap-2 text-sm text-white/50 border border-white/10 px-4 py-2 rounded-xl hover:border-brand-300 hover:text-brand-500 transition-all">
            <RefreshCw size={14} className={refreshing ? 'animate-spin' : ''} />
            Actualiser
          </button>
        </div>
      </div>

      {/* ── Tabs ── */}
      <div className="flex gap-1 bg-white/10 rounded-xl p-1 mb-8 overflow-x-auto">
        {TABS.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className={`relative px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${
              tab === t.id ? 'bg-white text-white shadow-sm' : 'text-white/50 hover:text-white/70'
            }`}>
            {t.label}
            {t.badge ? (
              <span className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-red-900/200 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
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
              sub={`+${stats.newUsersToday} aujourd'hui`} color="bg-blue-900/200" />
            <KpiCard icon={LayoutGrid} label="Profils actifs" value={stats.activeProfiles}
              sub={`${stats.onlineProfiles} en ligne maintenant`} color="bg-emerald-900/200" />
            <KpiCard icon={Crown} label="Membres Premium" value={stats.premiumUsers}
              sub={`${stats.conversionRate}% de conversion`} color="bg-purple-900/200" />
            <KpiCard icon={DollarSign} label="Revenus total" value={`${(stats.totalRevenueFcfa || 0).toLocaleString()} FCFA`}
              color="bg-amber-900/200" />
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

          {/* KPIs revenus ce mois */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="card p-5 border-l-4 border-emerald-500">
              <p className="text-xs text-white/40 uppercase tracking-wide mb-1">Ce mois</p>
              <p className="font-display text-2xl font-bold text-white">{(stats.revenueThisMonth || 0).toLocaleString()}</p>
              <p className="text-xs text-white/40">FCFA</p>
            </div>
            <div className="card p-5 border-l-4 border-blue-400">
              <p className="text-xs text-white/40 uppercase tracking-wide mb-1">Mois dernier</p>
              <p className="font-display text-2xl font-bold text-white">{(stats.revenueLastMonth || 0).toLocaleString()}</p>
              <p className="text-xs text-white/40">FCFA</p>
            </div>
            {(stats.revenueByPlan || []).slice(0,2).map((p: any) => (
              <div key={p.plan} className="card p-5 border-l-4 border-brand-400">
                <p className="text-xs text-white/40 uppercase tracking-wide mb-1">{p.plan || 'N/A'}</p>
                <p className="font-display text-2xl font-bold text-white">{(p.amount || 0).toLocaleString()}</p>
                <p className="text-xs text-white/40">{p.count} paiements</p>
              </div>
            ))}
          </div>

          {/* Graphique revenus 30 jours */}
          {stats.revenuePerDay && stats.revenuePerDay.some((d: any) => d.amount > 0) && (
            <div className="card p-6">
              <h3 className="font-semibold text-white mb-4">Revenus — 30 derniers jours</h3>
              <ResponsiveContainer width="100%" height={200}>
                <AreaChart data={stats.revenuePerDay}>
                  <defs>
                    <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#D4537E" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#D4537E" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="date" tick={{ fontSize: 10 }} interval={6} />
                  <YAxis tick={{ fontSize: 10 }} tickFormatter={(v) => `${(v/1000).toFixed(0)}k`} />
                  <Tooltip formatter={(v: any) => [`${v.toLocaleString()} FCFA`, 'Revenus']} />
                  <Area type="monotone" dataKey="amount" stroke="#D4537E" fill="url(#revenueGrad)" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* Graphiques + Top villes */}
          <div className="grid md:grid-cols-3 gap-6">
            {/* Inscriptions 7 jours */}
            <div className="card p-6 md:col-span-2">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="font-semibold text-white">Inscriptions — 7 derniers jours</h3>
                  <p className="text-sm text-white/40 mt-0.5">
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
                      <span key={i} className="text-[10px] text-white/40 flex-1 text-center">{d.date}</span>
                    ))}
                  </div>
                </>
              )}
            </div>

            {/* Top villes */}
            <div className="card p-6">
              <div className="flex items-center gap-2 mb-4">
                <MapPin size={16} className="text-brand-400" />
                <h3 className="font-semibold text-white">Top villes</h3>
              </div>
              <div className="space-y-3">
                {stats.topCities?.map((c: any, i: number) => {
                  const pct = Math.round((c.count / stats.activeProfiles) * 100);
                  return (
                    <div key={c.city}>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-white/70 font-medium flex items-center gap-1.5">
                          <span className="text-white/40 text-xs">#{i+1}</span> {c.city}
                        </span>
                        <span className="text-white/40">{c.count} profils</span>
                      </div>
                      <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
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
                  <h3 className="font-semibold text-white">Derniers inscrits</h3>
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
                        <p className="text-sm font-medium text-white truncate">
                          {u.profile?.displayName || u.email}
                        </p>
                        <p className="text-xs text-white/40">
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
                  <h3 className="font-semibold text-white">Derniers paiements</h3>
                </div>
                {activity.recentPayments?.length === 0 ? (
                  <p className="text-sm text-white/40 text-center py-4">Aucun paiement encore</p>
                ) : (
                  <div className="space-y-3">
                    {activity.recentPayments?.map((p: any) => (
                      <div key={p.id} className="flex items-center gap-3 py-1">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                          p.provider === 'STRIPE' ? 'bg-blue-900/20' : 'bg-yellow-50'
                        }`}>
                          <DollarSign size={14} className={p.provider === 'STRIPE' ? 'text-blue-500' : 'text-yellow-500'} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-white truncate">
                            {p.user?.profile?.displayName || p.user?.email}
                          </p>
                          <p className="text-xs text-white/40">
                            {p.plan?.toUpperCase()} · {p.provider}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-semibold text-white">{(p.amount || 0).toLocaleString()} FCFA</p>
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
              <div className="card p-12 text-center text-white/40">
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
                  <p className="font-semibold text-white truncate">{profile.displayName}</p>
                  <p className="text-xs text-white/50">{profile.city} · {profile.age} ans</p>
                  <p className="text-xs text-white/40 truncate">{profile.user?.email}</p>
                </div>
                <Eye size={15} className="text-white/30 shrink-0" />
              </div>
            ))}
          </div>

          {/* Panel détail */}
          <div className="card p-6 sticky top-24 self-start max-h-[80vh] overflow-y-auto">
            {!selectedProfile ? (
              <div className="text-center text-white/30 py-16">
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
                    <p className="font-semibold text-white">{selectedProfile.displayName}</p>
                    <p className="text-xs text-white/40">{selectedProfile.user?.email}</p>
                  </div>
                </div>

                {/* Infos complètes */}
                <div className="grid grid-cols-2 gap-2 text-sm">
                  {[
                    ['Ville', selectedProfile.city],
                    ['Pays', selectedProfile.country || '—'],
                    ['Âge', selectedProfile.age ? `${selectedProfile.age} ans` : '—'],
                    ['Genre', selectedProfile.gender || '—'],
                    ['Tarif', selectedProfile.pricePerHour ? `${selectedProfile.pricePerHour} FCFA/h` : '—'],
                    ['Téléphone', selectedProfile.phone || '—'],
                    ['Catégories', selectedProfile.categories?.join(', ') || '—'],
                    ['Tags', selectedProfile.tags?.join(', ') || '—'],
                    ['Inscrit le', selectedProfile.createdAt ? new Date(selectedProfile.createdAt).toLocaleDateString('fr-FR') : '—'],
                    ['Vues', selectedProfile.viewCount || 0],
                  ].map(([k, v]) => (
                    <div key={k} className="bg-white/5 border border-white/10 rounded-xl p-3">
                      <p className="text-white/40 text-xs mb-0.5">{k}</p>
                      <p className="font-medium text-white truncate">{v}</p>
                    </div>
                  ))}
                </div>

                {/* Profil privé */}
                {selectedProfile.isPrivate && (
                  <div className="bg-amber-900/200/20 border border-amber-500/30 rounded-xl px-3 py-2 text-xs text-amber-300 font-medium">
                    🔒 Profil privé
                  </div>
                )}

                {/* Bio */}
                {selectedProfile.bio && (
                  <div>
                    <p className="text-xs text-white/40 mb-1 font-medium">Bio</p>
                    <div className="bg-white/5 border border-white/10 rounded-xl p-3 text-sm text-white/70 leading-relaxed max-h-32 overflow-y-auto">
                      {selectedProfile.bio}
                    </div>
                  </div>
                )}

                {/* Toutes les photos */}
                {selectedProfile.photos?.length > 0 && (
                  <div>
                    <p className="text-xs text-white/40 mb-2 font-medium">Photos ({selectedProfile.photos.length})</p>
                    <div className="grid grid-cols-3 gap-1.5">
                      {selectedProfile.photos.map((p: any) => (
                        <a key={p.id} href={p.url} target="_blank" rel="noreferrer"
                          className="aspect-square rounded-xl overflow-hidden bg-white/10 block hover:opacity-80 transition-opacity relative">
                          <Image src={p.url} alt="" width={120} height={120} className="w-full h-full object-cover" />
                          {p.isMain && <span className="absolute top-1 left-1 bg-brand-500 text-white text-[8px] px-1.5 py-0.5 rounded-full font-bold">MAIN</span>}
                          {p.isPrivate && <span className="absolute top-1 right-1 bg-black/60 text-white text-[8px] px-1.5 py-0.5 rounded-full">🔒</span>}
                        </a>
                      ))}
                    </div>
                  </div>
                )}

                {/* Lien profil public */}
                <a href={`/profiles/${selectedProfile.id}`} target="_blank" rel="noreferrer"
                  className="flex items-center justify-center gap-2 border border-brand-200 text-brand-500 text-sm font-medium py-2 rounded-xl hover:bg-brand-50 transition-colors">
                  👁 Voir le profil public
                </a>

                <div className="grid grid-cols-2 gap-2">
                  <button onClick={() => moderate(selectedProfile.id, 'approve')}
                    className="flex items-center justify-center gap-1.5 bg-emerald-900/200 hover:bg-emerald-600 text-white font-medium py-2.5 rounded-xl text-sm transition-colors">
                    <Check size={14} /> Approuver
                  </button>
                  <button onClick={() => moderate(selectedProfile.id, 'reject')}
                    className="flex items-center justify-center gap-1.5 bg-white/10 hover:bg-white/20 text-white/70 font-medium py-2.5 rounded-xl text-sm transition-colors">
                    <X size={14} /> Rejeter
                  </button>
                  <button onClick={() => moderate(selectedProfile.id, 'suspend')}
                    className="flex items-center justify-center gap-1.5 bg-amber-900/20 hover:bg-amber-100 text-amber-400 font-medium py-2.5 rounded-xl text-sm transition-colors">
                    <Clock size={14} /> Suspendre
                  </button>
                  <button onClick={() => moderate(selectedProfile.id, 'ban')}
                    className="flex items-center justify-center gap-1.5 bg-red-900/20 hover:bg-red-100 text-red-600 font-medium py-2.5 rounded-xl text-sm transition-colors">
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
            <h2 className="font-semibold text-white mb-4 flex items-center gap-2">
              <Camera size={17} className="text-brand-400" /> Photos en attente ({pendingMedia.photos.length})
            </h2>
            {pendingMedia.photos.length === 0 ? (
              <div className="card p-8 text-center text-white/40"><Check size={28} className="mx-auto mb-2 text-emerald-400" /><p>Aucune photo en attente 🎉</p></div>
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
                          className="flex-1 bg-emerald-900/200 hover:bg-emerald-600 text-white text-xs font-medium py-1.5 rounded-lg flex items-center justify-center gap-1">
                          <Check size={11} /> OK
                        </button>
                        <button onClick={() => rejectMedia('photo', photo.id)}
                          className="flex-1 bg-red-900/200 hover:bg-red-600 text-white text-xs font-medium py-1.5 rounded-lg flex items-center justify-center gap-1">
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
            <h2 className="font-semibold text-white mb-4 flex items-center gap-2">
              <Video size={17} className="text-brand-400" /> Vidéos en attente ({pendingMedia.videos.length})
            </h2>
            {pendingMedia.videos.length === 0 ? (
              <div className="card p-8 text-center text-white/40"><Check size={28} className="mx-auto mb-2 text-emerald-400" /><p>Aucune vidéo en attente 🎉</p></div>
            ) : (
              <div className="grid md:grid-cols-2 gap-4">
                {pendingMedia.videos.map((video: any) => (
                  <div key={video.id} className="card overflow-hidden">
                    <div className="relative aspect-video bg-gray-900">
                      {video.thumbnailUrl
                        ? <img src={video.thumbnailUrl} alt="" className="w-full h-full object-cover" />
                        : <div className="w-full h-full flex items-center justify-center"><Video size={32} className="text-white/60" /></div>
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
                        <button onClick={() => approveMedia('video', video.id)} className="flex-1 bg-emerald-900/200 hover:bg-emerald-600 text-white text-xs font-medium py-2 rounded-lg flex items-center justify-center gap-1"><Check size={11} /> Approuver</button>
                        <button onClick={() => rejectMedia('video', video.id)} className="flex-1 bg-red-900/200 hover:bg-red-600 text-white text-xs font-medium py-2 rounded-lg flex items-center justify-center gap-1"><X size={11} /> Refuser</button>
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
          <h2 className="font-semibold text-white flex items-center gap-2">
            <ShieldCheck size={17} className="text-brand-400" /> Demandes de vérification ({pendingVerifs.length})
          </h2>
          {pendingVerifs.length === 0 ? (
            <div className="card p-12 text-center text-white/40">
              <ShieldCheck size={36} className="mx-auto mb-3 text-emerald-400" />
              <p className="font-medium">Aucune demande en attente 🎉</p>
            </div>
          ) : pendingVerifs.map((verif: any) => (
            <div key={verif.id} className="card p-6 space-y-4">
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-semibold text-white">{verif.profile?.displayName}</p>
                  <p className="text-sm text-white/40">{verif.profile?.city} · {verif.profile?.age} ans · {verif.profile?.user?.email}</p>
                  <span className="inline-block mt-1 text-xs bg-brand-50 text-brand-500 font-semibold px-2 py-0.5 rounded-full">{verif.docType}</span>
                </div>
                <span className="text-xs text-white/40">{new Date(verif.submittedAt).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long' })}</span>
              </div>
              <div className="grid grid-cols-3 gap-3">
                {[['Recto', verif.docFrontUrl], verif.docBackUrl && ['Verso', verif.docBackUrl], ['Selfie', verif.selfieUrl]]
                  .filter(Boolean).map(([label, url]: any) => (
                  <div key={label}>
                    <p className="text-xs text-white/50 mb-1">{label}</p>
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
                  className="bg-emerald-900/200 hover:bg-emerald-600 text-white font-medium px-5 py-2 rounded-xl text-sm flex items-center gap-1.5">
                  <ShieldCheck size={14} /> Approuver
                </button>
                <button onClick={() => rejectVerif(verif.id)}
                  className="bg-red-900/200 hover:bg-red-600 text-white font-medium px-5 py-2 rounded-xl text-sm flex items-center gap-1.5">
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
              { status: 'PENDING', label: 'En attente', color: 'bg-amber-900/20 text-amber-400 border-amber-200' },
              { status: 'REVIEWED', label: 'Examinés', color: 'bg-blue-900/20 text-blue-400 border-blue-200' },
              { status: 'ACTION_TAKEN', label: 'Action prise', color: 'bg-red-900/20 text-red-400 border-red-500/30' },
              { status: 'DISMISSED', label: 'Ignorés', color: 'bg-white/5 text-white/60 border-white/10' },
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
            <div className="card p-12 text-center text-white/40"><p className="font-medium">Aucun signalement</p></div>
          ) : (
            <div className="card overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-white/5 border-b border-white/5">
                  <tr>
                    {['Profil signalé', 'Raison', 'Date', 'Statut', 'Actions'].map(h => (
                      <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-white/40 uppercase tracking-wide">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {reports.map((r: any) => (
                    <tr key={r.id} className="hover:bg-white/5/50">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          {r.profile?.photos?.[0] && <img src={r.profile.photos[0].url} className="w-8 h-8 rounded-lg object-cover" alt="" />}
                          <div>
                            <p className="font-medium text-white">{r.profile?.displayName}</p>
                            <p className="text-xs text-white/40">{r.profile?.city}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className="bg-red-900/20 text-red-400 text-xs font-medium px-2 py-1 rounded-full">
                          {r.reason === 'FAKE_PROFILE' ? 'Faux profil' : r.reason === 'INAPPROPRIATE_CONTENT' ? 'Contenu inapproprié' : r.reason === 'SCAM' ? 'Arnaque' : r.reason === 'UNDERAGE' ? 'Mineur' : r.reason === 'SPAM' ? 'Spam' : 'Autre'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-xs text-white/40">{new Date(r.createdAt).toLocaleDateString('fr-FR')}</td>
                      <td className="px-4 py-3"><StatusBadge status={r.status} /></td>
                      <td className="px-4 py-3">
                        <div className="flex gap-1.5">
                          <button onClick={async () => {
                            await api.patch(`/reports/${r.id}`, { status: 'ACTION_TAKEN', action: 'suspend' });
                            setReports(prev => prev.map(x => x.id === r.id ? { ...x, status: 'ACTION_TAKEN' } : x));
                            toast.success('Profil suspendu');
                          }} className="text-xs bg-red-900/20 text-red-600 hover:bg-red-100 px-2 py-1 rounded-lg font-medium">Suspendre</button>
                          <button onClick={async () => {
                            await api.patch(`/reports/${r.id}`, { status: 'DISMISSED' });
                            setReports(prev => prev.map(x => x.id === r.id ? { ...x, status: 'DISMISSED' } : x));
                            toast.success('Ignoré');
                          }} className="text-xs bg-white/5 text-white/60 hover:bg-white/10 px-2 py-1 rounded-lg font-medium">Ignorer</button>
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
            <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/40" />
            <input className="input pl-10" placeholder="Rechercher par email ou nom…"
              value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <div className="card overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-white/5 border-b border-white/5">
                <tr>
                  {['Utilisateur', 'Rôle', 'Statut', 'Plan', 'Inscrit le', 'Actions'].map(h => (
                    <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-white/40 uppercase tracking-wide">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filteredUsers.map((u: any) => (
                  <tr key={u.id} className="hover:bg-white/5/50">
                    <td className="px-4 py-3">
                      <p className="font-medium text-white">{u.profile?.displayName || '—'}</p>
                      <p className="text-white/40 text-xs">{u.email}</p>
                      <div className="flex items-center gap-1 mt-0.5">
                        <span className="font-mono text-[10px] text-white/30 truncate max-w-[120px]">{u.id}</span>
                        <button onClick={() => { navigator.clipboard.writeText(u.id); alert('ID copié !'); }}
                          className="text-white/30 hover:text-brand-400 text-[10px] shrink-0">📋</button>
                      </div>
                    </td>
                    <td className="px-4 py-3"><StatusBadge status={u.role} /></td>
                    <td className="px-4 py-3"><StatusBadge status={u.profile?.status || 'PENDING'} /></td>
                    <td className="px-4 py-3 text-xs text-white/40 capitalize">{u.subscription?.plan || 'basic'}</td>
                    <td className="px-4 py-3 text-xs text-white/40">
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
                          className="text-xs border border-white/10 rounded-lg px-2 py-1.5 bg-white focus:outline-none focus:ring-2 focus:ring-brand-400/30">
                          <option value="USER">USER</option>
                          <option value="PREMIUM">PREMIUM</option>
                          <option value="ADMIN">ADMIN</option>
                        </select>
                        {u.profile?.status !== 'BANNED' && (
                          <button onClick={() => banUser(u.id)} title="Bannir"
                            className="w-7 h-7 bg-red-900/20 hover:bg-red-100 text-red-500 rounded-lg flex items-center justify-center transition-colors">
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
              <div className="py-12 text-center text-white/40 text-sm">Aucun utilisateur trouvé</div>
            )}
          </div>
        </div>
      )}
      {/* Partners */}
      {/* Partners */}
      {/* Partners */}
      {/* Partners */}
      {tab === 'partners' && (
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-white/5 p-6">
            <h2 className="font-semibold text-white mb-4">🤝 Créer un code partenaire</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div>
                <label className="text-xs text-white/50 mb-1 block">Code (ex: PARTNER2026)</label>
                <input className="w-full border border-white/10 rounded-xl px-3 py-2 text-sm font-mono uppercase focus:outline-none focus:ring-2 focus:ring-brand-400/30"
                  placeholder="MONCODE" value={partnerForm.code}
                  onChange={e => setPartnerForm(f => ({ ...f, code: e.target.value.toUpperCase() }))} />
              </div>
              <div>
                <label className="text-xs text-white/50 mb-1 block">Email du partenaire</label>
                <input className="w-full border border-white/10 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-400/30"
                  placeholder="partenaire@email.com" value={partnerForm.email}
                  onChange={e => setPartnerForm(f => ({ ...f, email: e.target.value }))} />
              </div>
              <div>
                <label className="text-xs text-white/50 mb-1 block">Nom du partenaire</label>
                <input className="w-full border border-white/10 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-400/30"
                  placeholder="Nom affiché" value={partnerForm.displayName}
                  onChange={e => setPartnerForm(f => ({ ...f, displayName: e.target.value }))} />
              </div>
            </div>
            <button onClick={async () => {
                if (!partnerForm.code || !partnerForm.email) return;
                setPartnerLoading(true);
                try {
                  const res = await api.post('/referral/partner', partnerForm);
                  alert('Code créé ! Lien : ' + res.data.link);
                  setPartnerForm({ code: '', email: '', displayName: '' });
                  const list = await api.get('/referral/partners');
                  setPartners(list.data);
                } catch (err: any) {
                  alert('Erreur : ' + (err.response?.data?.error || err.message));
                } finally { setPartnerLoading(false); }
              }}
              disabled={partnerLoading || !partnerForm.code || !partnerForm.email}
              className="bg-brand-500 text-white px-6 py-2 rounded-xl text-sm font-semibold hover:bg-brand-400 disabled:opacity-50">
              {partnerLoading ? 'Création...' : '+ Créer le code'}
            </button>
          </div>
          <div className="bg-white rounded-2xl border border-white/5 overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-50">
              <h2 className="font-semibold text-white">Codes partenaires</h2>
              <button onClick={async () => { const r = await api.get('/referral/partners'); setPartners(r.data); }}
                className="text-xs text-brand-400 hover:underline">Charger</button>
            </div>
            {partners.length === 0 ? (
              <div className="p-8 text-center text-white/40 text-sm">Aucun code. Créez-en un ou cliquez sur Charger.</div>
            ) : (
              <table className="w-full text-sm">
                <thead className="bg-white/5 text-xs text-white/50 uppercase">
                  <tr>
                    <th className="px-4 py-3 text-left">Partenaire</th>
                    <th className="px-4 py-3 text-left">Code</th>
                    <th className="px-4 py-3 text-center">Filleuls</th>
                    <th className="px-4 py-3 text-center">Convertis</th>
                    <th className="px-4 py-3 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {partners.map((p: any) => (
                    <tr key={p.id} className="hover:bg-white/5">
                      <td className="px-4 py-3">
                        <p className="font-medium text-white">{p.displayName || p.email}</p>
                        <p className="text-xs text-white/40">{p.email}</p>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <span className="font-mono bg-white/10 px-2 py-1 rounded text-xs font-bold">{p.code}</span>
                          <button onClick={() => { navigator.clipboard.writeText(p.link); alert('Lien copié !'); }}
                            className="text-brand-400 text-xs">Copier</button>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-center font-semibold">{p.totalReferrals}</td>
                      <td className="px-4 py-3 text-center">
                        <span className={p.converted > 0 ? 'text-emerald-600 font-semibold' : 'text-white/40'}>{p.converted}</span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <button onClick={async () => {
                            if (!confirm('Supprimer ce code ?')) return;
                            await api.delete('/referral/partner/' + p.code);
                            setPartners((prev: any[]) => prev.filter((x: any) => x.id !== p.id));
                          }} className="text-red-400 hover:text-red-600 text-xs font-medium">Supprimer</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}
      {/* Notifications broadcast */}
      {tab === 'notifications' && (
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-white/5 p-6">
            <h2 className="font-semibold text-white mb-1">🔔 Envoyer une notification</h2>
            <p className="text-sm text-white/40 mb-6">Envoyez une notification à tous les utilisateurs ou à un utilisateur spécifique.</p>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-white/50 mb-1 block">Titre *</label>
                  <input className="w-full border border-white/10 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-400/30"
                    placeholder="Ex: 🎉 Nouveauté sur Afrodite" value={notifForm.title}
                    onChange={e => setNotifForm(f => ({ ...f, title: e.target.value }))} />
                </div>
                <div>
                  <label className="text-xs text-white/50 mb-1 block">Type</label>
                  <select className="w-full border border-white/10 rounded-xl px-3 py-2 text-sm text-white bg-white focus:outline-none"
                    value={notifForm.type} onChange={e => setNotifForm(f => ({ ...f, type: e.target.value }))}>
                    <option value="SYSTEM">Système</option>
                    <option value="PROMO">Promotion</option>
                    <option value="ALERT">Alerte</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="text-xs text-white/50 mb-1 block">Message *</label>
                <textarea className="w-full border border-white/10 rounded-xl px-3 py-2 text-sm text-white bg-white focus:outline-none focus:ring-2 focus:ring-brand-400/30 resize-none"
                  rows={3} placeholder="Contenu de la notification..." value={notifForm.message}
                  onChange={e => setNotifForm(f => ({ ...f, message: e.target.value }))} />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-white/50 mb-1 block">Lien (optionnel)</label>
                  <input className="w-full border border-white/10 rounded-xl px-3 py-2 text-sm text-white bg-white focus:outline-none"
                    placeholder="Ex: /profiles ou /tarifs" value={notifForm.link}
                    onChange={e => setNotifForm(f => ({ ...f, link: e.target.value }))} />
                </div>
                <div>
                  <label className="text-xs text-white/50 mb-1 block">ID utilisateur (laisser vide = tous)</label>
                  <input className="w-full border border-white/10 rounded-xl px-3 py-2 text-sm text-white bg-white font-mono focus:outline-none"
                    placeholder="cmp010... (optionnel)" value={notifForm.targetUserId}
                    onChange={e => setNotifForm(f => ({ ...f, targetUserId: e.target.value }))} />
                </div>
              </div>
              <div className="flex items-center gap-3 pt-2">
                <button onClick={async () => {
                    if (!notifForm.title || !notifForm.message) return;
                    if (!confirm(notifForm.targetUserId ? 'Envoyer à cet utilisateur ?' : 'Envoyer à TOUS les utilisateurs ?')) return;
                    setSendingNotif(true);
                    try {
                      const res = await api.post('/notifications/broadcast', notifForm);
                      alert('✅ Notification envoyée à ' + res.data.sent + ' utilisateur(s)');
                      setNotifForm({ title: '', message: '', type: 'SYSTEM', targetUserId: '', link: '' });
                    } catch (err: any) {
                      alert('Erreur : ' + (err.response?.data?.error || err.message));
                    } finally { setSendingNotif(false); }
                  }}
                  disabled={sendingNotif || !notifForm.title || !notifForm.message}
                  className="bg-brand-500 text-white px-6 py-2.5 rounded-xl text-sm font-semibold hover:bg-brand-400 disabled:opacity-50 flex items-center gap-2">
                  {sendingNotif ? '⏳ Envoi...' : notifForm.targetUserId ? '📨 Envoyer à cet utilisateur' : '📢 Envoyer à tous'}
                </button>
                <p className="text-xs text-white/40">
                  {notifForm.targetUserId ? 'Notification ciblée' : 'Diffusion générale à tous les membres'}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
// v2
// force
// v3
