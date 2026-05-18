'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { User, Camera, Star, Heart, Upload, Eye, MessageCircle, TrendingUp, BarChart2, Trash2, Crown, Zap, CalendarDays, ShieldCheck, Gift, Lock, CheckCircle } from 'lucide-react';
import useAuthStore from '@/lib/store';
import api from '@/lib/api';
import toast from 'react-hot-toast';
import Image from 'next/image';
import AvailabilityTab from '@/components/dashboard/AvailabilityTab';
import PushNotifToggle from '@/components/layout/PushNotifToggle';
import IdentityVerificationTab from '@/components/dashboard/IdentityVerificationTab';
import SecurityTab from '@/components/dashboard/SecurityTab';
import PaymentModal from '@/components/payment/PaymentModal';
import ReferralTab from '@/components/dashboard/ReferralTab';

const CATEGORIES = ['Escorte', 'Massage', 'Compagnie', 'VIP', 'Agence', 'Indépendant'];

export default function DashboardPage() {
  const { user, isAuthenticated } = useAuthStore();
  const router = useRouter();
  const [tab, setTab] = useState<'profile' | 'photos' | 'agenda' | 'verification' | 'referral' | 'stats' | 'subscription' | 'security'>('profile');
  const [form, setForm] = useState<any>({});
  const [photos, setPhotos] = useState<any[]>([]);
  const [videos, setVideos] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadingVideo, setUploadingVideo] = useState(false);
  const [videoProgress, setVideoProgress] = useState(0);
  const [isOnline, setIsOnline] = useState(false);
  const [payments, setPayments] = useState<any[]>([]);
  const [payModal, setPayModal] = useState<{ plan: string; price: string; label: string } | null>(null);

  useEffect(() => {
    if (!isAuthenticated) { router.push('/auth/login'); return; }
    api.get('/auth/me').then(res => {
      setPhotos(res.data.profile?.photos || []);
      setVideos(res.data.profile?.videos || []);
      setIsOnline(res.data.profile?.isOnline || false);
      setForm({
        displayName: res.data.profile?.displayName || '',
        age: res.data.profile?.age || '',
        city: res.data.profile?.city || '',
        bio: res.data.profile?.bio || '',
        pricePerHour: res.data.profile?.pricePerHour || '',
        categories: res.data.profile?.categories || [],
        tags: res.data.profile?.tags || [],
      });
    });
    api.get('/profiles/me/stats').then(res => setStats(res.data)).catch(() => {});
    api.get('/subscriptions/payments').then(res => setPayments(res.data)).catch(() => {});
  }, [isAuthenticated]);

  const toggleOnline = async () => {
    const newStatus = !isOnline;
    setIsOnline(newStatus);
    try {
      await api.put('/profiles/me', { ...form, isOnline: newStatus });
      toast.success(newStatus ? '🟢 Disponible !' : '⚫ Indisponible');
    } catch {
      setIsOnline(!newStatus);
      toast.error('Erreur lors de la mise à jour');
    }
  };

  const saveProfile = async () => {
    setSaving(true);
    try {
      await api.put('/profiles/me', form);
      toast.success('Profil mis à jour !');
    } catch { toast.error('Erreur lors de la sauvegarde'); }
    finally { setSaving(false); }
  };

  const uploadPhoto = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const data = new FormData();
    data.append('photo', file);
    try {
      const res = await api.post('/upload/photo', data, { headers: { 'Content-Type': 'multipart/form-data' } });
      setPhotos(prev => [...prev, res.data]);
      toast.success('Photo ajoutée !');
    } catch { toast.error('Erreur upload'); }
    finally { setUploading(false); }
  };

  const deletePhoto = async (photoId: string) => {
    await api.delete(`/upload/photo/${photoId}`);
    setPhotos(prev => prev.filter(p => p.id !== photoId));
    toast.success('Photo supprimée');
  };

  const uploadVideo = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (videos.length >= 5) { toast.error('Maximum 5 vidéos par profil'); return; }
    if (file.size > 100 * 1024 * 1024) { toast.error('Vidéo trop lourde (max 100MB)'); return; }
    setUploadingVideo(true);
    setVideoProgress(0);
    const data = new FormData();
    data.append('video', file);
    try {
      const res = await api.post('/upload/video', data, {
        headers: { 'Content-Type': 'multipart/form-data' },
        onUploadProgress: (e) => {
          const pct = Math.round((e.loaded * 100) / (e.total || 1));
          setVideoProgress(pct);
        },
      });
      setVideos(prev => [res.data, ...prev]);
      toast.success('Vidéo ajoutée !');
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Erreur upload vidéo');
    } finally {
      setUploadingVideo(false);
      setVideoProgress(0);
    }
  };

  const deleteVideo = async (videoId: string) => {
    await api.delete(`/upload/video/${videoId}`);
    setVideos(prev => prev.filter(v => v.id !== videoId));
    toast.success('Vidéo supprimée');
  };

  const setMainVideo = async (videoId: string) => {
    await api.patch(`/upload/video/${videoId}/main`);
    setVideos(prev => prev.map(v => ({ ...v, isMain: v.id === videoId })));
    toast.success('Vidéo principale mise à jour !');
  };

  const setMainPhoto = async (photoId: string) => {
    await api.patch(`/upload/photo/${photoId}/main`);
    setPhotos(prev => prev.map(p => ({ ...p, isMain: p.id === photoId })));
    toast.success('Photo principale mise à jour');
  };

  const toggleCategory = (cat: string) => {
    setForm((f: any) => ({
      ...f,
      categories: f.categories.includes(cat) ? f.categories.filter((c: string) => c !== cat) : [...f.categories, cat]
    }));
  };

  const addTag = (tag: string) => {
    const t = tag.trim().toLowerCase();
    if (!t || form.tags?.includes(t) || form.tags?.length >= 10) return;
    setForm((f: any) => ({ ...f, tags: [...(f.tags || []), t] }));
  };

  const removeTag = (tag: string) => {
    setForm((f: any) => ({ ...f, tags: f.tags.filter((t: string) => t !== tag) }));
  };

  const SUGGESTED_TAGS = ['massage', 'relaxation', 'escort', 'vip', 'luxe', 'discret', 'disponible', 'voyages', 'photos', 'videos', 'bilingue', 'sportive', 'naturelle', 'tatouage', 'blonde', 'brune'];

  const TABS = [
    { id: 'profile', label: 'Profil', icon: User },
    { id: 'photos', label: 'Photos', icon: Camera },
    { id: 'agenda', label: 'Agenda', icon: CalendarDays },
    { id: 'verification', label: 'Vérif.', icon: ShieldCheck },
    { id: 'referral', label: 'Parrain.', icon: Gift },
    { id: 'stats', label: 'Stats', icon: BarChart2 },
    { id: 'subscription', label: 'Abo.', icon: Crown },
    { id: 'security', label: 'Sécurité', icon: Lock },
  ];

  const maxViews = stats?.viewsPerDay ? Math.max(...stats.viewsPerDay.map((d: any) => d.views)) : 1;

  return (
    <div className="max-w-4xl mx-auto px-3 sm:px-4 py-4 sm:py-8">

      {/* ── HEADER MOBILE-FIRST ── */}
      <div className="mb-6">
        {/* Ligne 1 : Avatar + Nom + Email */}
        <div className="flex items-center gap-3 mb-3">
          <div className="relative shrink-0">
            <div className="w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-br from-brand-400 to-brand-600 rounded-2xl flex items-center justify-center text-white font-display text-xl sm:text-2xl font-bold">
              {user?.profile?.displayName?.[0] || '?'}
            </div>
            <span className={`absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full border-2 border-white ${isOnline ? 'bg-green-400' : 'bg-gray-300'}`} />
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="font-display text-lg sm:text-2xl font-bold text-gray-900 truncate">{user?.profile?.displayName || 'Mon espace'}</h1>
            <p className="text-xs sm:text-sm text-gray-400 truncate">{user?.email}</p>
          </div>
          <PushNotifToggle />
        </div>

        {/* Ligne 2 : Boutons d'action */}
        <div className="flex gap-2">
          <button
            onClick={toggleOnline}
            className={`flex-1 flex items-center justify-center gap-2 py-2 sm:py-2.5 rounded-xl border-2 font-medium text-sm transition-all ${
              isOnline
                ? 'bg-green-50 border-green-200 text-green-700'
                : 'bg-gray-50 border-gray-200 text-gray-500'
            }`}
          >
            <span className={`w-2.5 h-2.5 rounded-full ${isOnline ? 'bg-green-400 animate-pulse' : 'bg-gray-300'}`} />
            {isOnline ? 'Disponible' : 'Indisponible'}
          </button>
          <Link href="/dashboard/boost" className="flex-1 flex items-center justify-center gap-1.5 bg-gradient-to-r from-amber-400 to-orange-500 text-white font-semibold py-2 sm:py-2.5 rounded-xl text-sm hover:opacity-90 transition-all">
            <Zap size={14} /> Booster
          </Link>
        </div>
      </div>

      {/* ── Complétion du profil ── */}
      {(() => {
        const fields = [
          form.displayName, form.age, form.city, form.bio,
          form.pricePerHour, form.categories?.length > 0,
          photos.length > 0, form.tags?.length > 0,
        ];
        const done = fields.filter(Boolean).length;
        const pct = Math.round((done / fields.length) * 100);
        return pct < 100 ? (
          <div className="card p-3 sm:p-4 mb-4 sm:mb-6 flex items-center gap-3 sm:gap-4">
            <div className="relative w-10 h-10 sm:w-12 sm:h-12 shrink-0">
              <svg className="w-10 h-10 sm:w-12 sm:h-12 -rotate-90" viewBox="0 0 36 36">
                <circle cx="18" cy="18" r="15.9" fill="none" stroke="#f3f4f6" strokeWidth="3" />
                <circle cx="18" cy="18" r="15.9" fill="none" stroke="#d4537e" strokeWidth="3"
                  strokeDasharray={`${pct} ${100 - pct}`} strokeLinecap="round" />
              </svg>
              <span className="absolute inset-0 flex items-center justify-center text-xs font-bold text-brand-500">{pct}%</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-gray-900 mb-1">Profil à {pct}%</p>
              <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                <div className="h-full bg-brand-400 rounded-full transition-all duration-700" style={{ width: `${pct}%` }} />
              </div>
              <p className="text-xs text-gray-400 mt-1 truncate">
                {!form.bio && 'Bio · '}
                {!photos.length && 'Photo · '}
                {!form.categories?.length && 'Catégorie · '}
                {!form.tags?.length && 'Tags'}
              </p>
            </div>
          </div>
        ) : null;
      })()}

      {/* ── TABS ── */}
      <div className="overflow-x-auto mb-6 -mx-3 sm:mx-0 px-3 sm:px-0">
        <div className="flex gap-1 bg-gray-100 rounded-2xl p-1.5 min-w-max sm:min-w-0">
          {TABS.map(({ id, label, icon: Icon }) => (
            <button key={id} onClick={() => setTab(id as any)}
              className={`flex items-center justify-center gap-1.5 px-2.5 sm:px-3 py-2 sm:py-2.5 rounded-xl text-xs sm:text-sm font-medium transition-all whitespace-nowrap ${
                tab === id ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
              }`}>
              <Icon size={14} className="shrink-0" />
              <span>{label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* ── PROFIL ── */}
      {tab === 'profile' && (
        <div className="space-y-4">
          <div className="card p-4 sm:p-6 flex items-center gap-4 sm:gap-6">
            <div className="relative shrink-0">
              <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl overflow-hidden bg-brand-50 border-2 border-brand-100">
                {photos.find((p: any) => p.isMain) ? (
                  <Image src={photos.find((p: any) => p.isMain)!.url} alt="" width={96} height={96} className="w-full h-full object-cover" />
                ) : photos[0] ? (
                  <Image src={photos[0].url} alt="" width={96} height={96} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-brand-400 font-display font-bold text-3xl">
                    {form.displayName?.[0] || '?'}
                  </div>
                )}
              </div>
              <label className="absolute -bottom-2 -right-2 w-8 h-8 bg-brand-400 hover:bg-brand-600 text-white rounded-xl flex items-center justify-center cursor-pointer transition-colors shadow-md">
                <Camera size={14} />
                <input type="file" accept="image/*" className="hidden" onChange={uploadPhoto} disabled={uploading} />
              </label>
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-gray-900 text-base sm:text-lg truncate">{form.displayName || 'Votre nom'}</p>
              <p className="text-sm text-gray-400">{form.city || 'Ville'}{form.age ? ` · ${form.age} ans` : ''}</p>
              {form.pricePerHour && <p className="text-sm text-brand-400 font-medium mt-1">{Number(form.pricePerHour).toLocaleString()} FCFA/h</p>}
              <div className="flex flex-wrap gap-1 mt-2">
                {form.categories?.slice(0, 3).map((c: string) => (
                  <span key={c} className="text-[10px] bg-brand-50 text-brand-500 px-2 py-0.5 rounded-full font-medium">{c}</span>
                ))}
              </div>
            </div>
            <a href={`/profiles/${user?.profile?.id || '#'}`} target="_blank" rel="noreferrer"
              className="text-xs text-brand-400 hover:underline flex items-center gap-1 shrink-0">
              <Eye size={12} /> <span className="hidden sm:inline">Voir</span>
            </a>
          </div>

          <div className="card p-4 sm:p-6 space-y-4 sm:space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1.5">Nom affiché</label>
                <input className="input" value={form.displayName || ''} onChange={e => setForm((f: any) => ({ ...f, displayName: e.target.value }))} />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1.5">Âge</label>
                <input className="input" type="number" value={form.age || ''} onChange={e => setForm((f: any) => ({ ...f, age: e.target.value }))} />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1.5">Ville</label>
                <input className="input" value={form.city || ''} onChange={e => setForm((f: any) => ({ ...f, city: e.target.value }))} />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1.5">Prix / heure (FCFA)</label>
                <input className="input" type="number" value={form.pricePerHour || ''} onChange={e => setForm((f: any) => ({ ...f, pricePerHour: e.target.value }))} />
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1.5">Bio</label>
              <textarea className="input resize-none" rows={4} value={form.bio || ''} onChange={e => setForm((f: any) => ({ ...f, bio: e.target.value }))} placeholder="Décrivez-vous en quelques mots..." />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-2">Catégories</label>
              <div className="flex flex-wrap gap-2">
                {CATEGORIES.map(cat => (
                  <button key={cat} onClick={() => toggleCategory(cat)}
                    className={`px-3 py-1.5 rounded-xl text-sm font-medium border transition-all ${form.categories?.includes(cat) ? 'bg-brand-400 text-white border-brand-400' : 'bg-white text-gray-600 border-gray-200 hover:border-brand-300'}`}>
                    {cat}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-2">
                Tags <span className="text-gray-300 font-normal">({form.tags?.length || 0}/10)</span>
              </label>
              {form.tags?.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-3">
                  {form.tags.map((tag: string) => (
                    <span key={tag} className="flex items-center gap-1 bg-brand-50 text-brand-600 text-xs font-medium px-3 py-1.5 rounded-full border border-brand-100">
                      #{tag}
                      <button onClick={() => removeTag(tag)} className="ml-1 text-brand-300 hover:text-brand-600">×</button>
                    </span>
                  ))}
                </div>
              )}
              <div className="flex gap-2 mb-3">
                <input
                  className="input flex-1 text-sm"
                  placeholder="Ex: massage, vip, discret..."
                  onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addTag((e.target as HTMLInputElement).value); (e.target as HTMLInputElement).value = ''; } }}
                />
                <button
                  onClick={(e) => { const input = (e.currentTarget.previousSibling as HTMLInputElement); addTag(input.value); input.value = ''; }}
                  className="btn-outline text-sm px-4">
                  +
                </button>
              </div>
              <div className="flex flex-wrap gap-1.5">
                <span className="text-xs text-gray-400 self-center mr-1">Suggestions :</span>
                {SUGGESTED_TAGS.filter(t => !form.tags?.includes(t)).slice(0, 8).map(tag => (
                  <button key={tag} onClick={() => addTag(tag)}
                    className="text-xs text-gray-500 bg-gray-50 hover:bg-brand-50 hover:text-brand-600 border border-gray-200 hover:border-brand-200 px-2.5 py-1 rounded-full transition-all">
                    +{tag}
                  </button>
                ))}
              </div>
            </div>
            <button onClick={saveProfile} disabled={saving} className="btn-primary w-full py-3 flex items-center justify-center gap-2">
              {saving ? <><span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Sauvegarde…</> : 'Sauvegarder'}
            </button>
          </div>
        </div>
      )}

      {/* ── PHOTOS ── */}
      {tab === 'photos' && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4">
            {photos.map(photo => (
              <div key={photo.id} className="relative group aspect-[3/4] rounded-2xl overflow-hidden bg-gray-100">
                <Image src={photo.url} alt="" fill className="object-cover" />
                {photo.isMain && (
                  <span className="absolute top-2 left-2 bg-brand-400 text-white text-xs font-bold px-2 py-0.5 rounded-full">Principale</span>
                )}
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                  {!photo.isMain && (
                    <button onClick={() => setMainPhoto(photo.id)} className="bg-white text-gray-900 text-xs font-medium px-3 py-1.5 rounded-lg hover:bg-brand-50">
                      Principale
                    </button>
                  )}
                  <button onClick={() => deletePhoto(photo.id)} className="bg-red-500 text-white p-1.5 rounded-lg hover:bg-red-600">
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))}
            <label className="aspect-[3/4] rounded-2xl border-2 border-dashed border-gray-200 hover:border-brand-300 flex flex-col items-center justify-center gap-2 cursor-pointer transition-colors bg-gray-50 hover:bg-brand-50/30">
              <div className="w-10 h-10 bg-brand-100 rounded-xl flex items-center justify-center">
                {uploading ? <div className="w-5 h-5 border-2 border-brand-400 border-t-transparent rounded-full animate-spin" /> : <Upload size={20} className="text-brand-400" />}
              </div>
              <span className="text-xs sm:text-sm font-medium text-gray-500">{uploading ? 'Upload...' : 'Ajouter'}</span>
              <input type="file" accept="image/*" className="hidden" onChange={uploadPhoto} disabled={uploading} />
            </label>
          </div>
          <p className="text-xs text-gray-400 text-center">JPG, PNG, WebP · Max 10MB</p>

          <div className="mt-6">
            <h3 className="font-semibold text-gray-900 mb-1">Mes vidéos</h3>
            <p className="text-xs text-gray-400 mb-4">{videos.length}/5 · Max 100MB · MP4, MOV, AVI</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {videos.map(video => (
                <div key={video.id} className="relative group rounded-2xl overflow-hidden bg-gray-900 aspect-video">
                  {video.thumbnailUrl ? (
                    <img src={video.thumbnailUrl} alt="" className="w-full h-full object-cover opacity-80" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <svg className="w-12 h-12 text-gray-600" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>
                    </div>
                  )}
                  {video.isMain && (
                    <span className="absolute top-2 left-2 bg-brand-400 text-white text-xs font-bold px-2 py-0.5 rounded-full">Principale</span>
                  )}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-12 h-12 bg-white/20 backdrop-blur rounded-full flex items-center justify-center">
                      <svg className="w-6 h-6 text-white ml-1" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>
                    </div>
                  </div>
                  {video.duration && (
                    <span className="absolute bottom-2 right-2 bg-black/60 text-white text-xs px-2 py-0.5 rounded">
                      {Math.floor(video.duration / 60)}:{String(Math.floor(video.duration % 60)).padStart(2, '0')}
                    </span>
                  )}
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2">
                    {!video.isMain && (
                      <button onClick={() => setMainVideo(video.id)} className="bg-brand-400 text-white px-4 py-1.5 rounded-xl text-xs font-medium">
                        ⭐ Principale
                      </button>
                    )}
                    <button onClick={() => deleteVideo(video.id)} className="bg-red-500 text-white px-4 py-1.5 rounded-xl text-xs font-medium flex items-center gap-1.5">
                      <Trash2 size={12} /> Supprimer
                    </button>
                  </div>
                </div>
              ))}
              {videos.length < 5 && (
                <label className={`aspect-video rounded-2xl border-2 border-dashed flex flex-col items-center justify-center gap-3 cursor-pointer transition-colors ${uploadingVideo ? 'border-brand-300 bg-brand-50/30' : 'border-gray-200 hover:border-brand-300 bg-gray-50'}`}>
                  {uploadingVideo ? (
                    <>
                      <div className="w-full px-8">
                        <div className="bg-gray-200 rounded-full h-2 overflow-hidden">
                          <div className="h-full bg-brand-400 rounded-full transition-all duration-300" style={{ width: `${videoProgress}%` }} />
                        </div>
                        <p className="text-center text-sm text-brand-500 font-medium mt-2">{videoProgress}%</p>
                      </div>
                      <p className="text-sm text-brand-400 font-medium">Upload en cours…</p>
                    </>
                  ) : (
                    <>
                      <div className="w-12 h-12 bg-brand-100 rounded-xl flex items-center justify-center">
                        <svg className="w-6 h-6 text-brand-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.069A1 1 0 0121 8.82v6.362a1 1 0 01-1.447.894L15 14M3 8a2 2 0 012-2h8a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2V8z" />
                        </svg>
                      </div>
                      <p className="text-sm font-medium text-gray-600">Ajouter une vidéo</p>
                    </>
                  )}
                  <input type="file" accept="video/mp4,video/mov,video/avi,video/quicktime,video/*" className="hidden" onChange={uploadVideo} disabled={uploadingVideo} />
                </label>
              )}
            </div>
          </div>
        </div>
      )}

      {tab === 'agenda' && <AvailabilityTab />}
      {tab === 'verification' && <IdentityVerificationTab />}
      {tab === 'referral' && <ReferralTab />}

      {/* ── STATISTIQUES ── */}
      {tab === 'stats' && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-3 sm:gap-4">
            {[
              { icon: Eye, label: 'Vues totales', value: stats?.totalViews ?? '—', color: 'text-blue-500 bg-blue-50' },
              { icon: Heart, label: 'Favoris', value: stats?.favoritesCount ?? '—', color: 'text-pink-500 bg-pink-50' },
              { icon: MessageCircle, label: 'Messages', value: stats?.messagesCount ?? '—', color: 'text-purple-500 bg-purple-50' },
              { icon: Star, label: 'Note moy.', value: stats?.averageRating ? `${stats.averageRating.toFixed(1)}/5` : '—', color: 'text-amber-500 bg-amber-50' },
            ].map(({ icon: Icon, label, value, color }) => (
              <div key={label} className="card p-4 sm:p-6">
                <div className={`w-9 h-9 sm:w-10 sm:h-10 rounded-xl ${color} flex items-center justify-center mb-2 sm:mb-3`}>
                  <Icon size={16} />
                </div>
                <p className="font-display text-2xl sm:text-3xl font-bold text-gray-900">{value}</p>
                <p className="text-xs text-gray-600 font-medium mt-0.5">{label}</p>
              </div>
            ))}
          </div>
          <div className="card p-4 sm:p-6">
            <div className="flex items-center gap-2 mb-4 sm:mb-6">
              <TrendingUp size={18} className="text-brand-400" />
              <h3 className="font-semibold text-gray-900 text-sm sm:text-base">Vues — 7 derniers jours</h3>
            </div>
            {stats?.viewsPerDay ? (
              <div className="flex items-end gap-1 sm:gap-2 h-28 sm:h-32">
                {stats.viewsPerDay.map((d: any, i: number) => {
                  const pct = maxViews > 0 ? (d.views / maxViews) * 100 : 0;
                  return (
                    <div key={i} className="flex-1 flex flex-col items-center gap-1">
                      <span className="text-xs text-gray-400">{d.views}</span>
                      <div className="w-full bg-gray-100 rounded-lg relative" style={{ height: '70px' }}>
                        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-brand-600 to-brand-400 rounded-lg transition-all duration-500" style={{ height: `${Math.max(pct, 5)}%` }} />
                      </div>
                      <span className="text-xs text-gray-400 capitalize">{d.day}</span>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="h-32 flex items-center justify-center text-gray-300 text-sm">Chargement...</div>
            )}
          </div>
        </div>
      )}

      {/* ── ABONNEMENT ── */}
      {tab === 'subscription' && (
        <div className="space-y-4 sm:space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[
              { plan: 'premium', label: 'Premium', price: '9 990 FCFA', period: '/mois', features: ['Messages illimités', 'Profil en avant', 'Badge vérifié', 'Stats détaillées'] },
              { plan: 'vip', label: 'VIP', price: '24 990 FCFA', period: '/mois', features: ['Priorité maximale', 'Badge VIP doré', 'Support dédié', 'Boost mensuel offert'] },
            ].map(p => (
              <div key={p.plan} className="border-2 border-gray-100 rounded-2xl p-4 sm:p-6 hover:border-brand-300 transition-all">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-bold text-gray-900">{p.label}</h4>
                  <span className="font-display text-lg sm:text-xl font-bold text-brand-400">{p.price}<span className="text-xs font-normal text-gray-400">{p.period}</span></span>
                </div>
                <ul className="space-y-2 mb-4">
                  {p.features.map(f => (
                    <li key={f} className="text-sm text-gray-500 flex items-center gap-2">
                      <span className="w-4 h-4 bg-brand-50 rounded-full flex items-center justify-center text-brand-400 text-xs shrink-0">✓</span>{f}
                    </li>
                  ))}
                </ul>
                <button onClick={() => setPayModal({ plan: p.plan, price: p.price, label: p.label })} className="btn-primary w-full">
                  Choisir {p.label}
                </button>
              </div>
            ))}
          </div>
          {payments.length > 0 && (
            <div className="card p-4 sm:p-6">
              <h3 className="font-semibold text-gray-900 mb-4">Historique des paiements</h3>
              <div className="space-y-3">
                {payments.map((p: any) => (
                  <div key={p.id} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                    <div className="min-w-0 flex-1 mr-3">
                      <p className="text-sm font-medium text-gray-900 truncate">{p.plan?.toUpperCase()} — {p.purpose === 'SUBSCRIPTION' ? 'Abonnement' : 'Boost'}</p>
                      <p className="text-xs text-gray-400">{new Date(p.createdAt).toLocaleDateString('fr-FR')} · {p.provider}</p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className="font-semibold text-gray-900 text-sm">{(p.amount || 0).toLocaleString()} F</span>
                      <span className={`text-xs font-medium px-2 py-1 rounded-full ${p.status === 'COMPLETED' ? 'bg-emerald-50 text-emerald-600' : p.status === 'PENDING' ? 'bg-amber-50 text-amber-600' : 'bg-red-50 text-red-500'}`}>
                        {p.status === 'COMPLETED' ? '✓' : p.status === 'PENDING' ? '⏳' : '✗'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {tab === 'security' && <SecurityTab />}

      {payModal && (
        <PaymentModal
          isOpen={!!payModal}
          onClose={() => setPayModal(null)}
          plan={payModal.plan}
          purpose="SUBSCRIPTION"
          price={payModal.price}
          label={payModal.label}
        />
      )}
    </div>
  );
}
