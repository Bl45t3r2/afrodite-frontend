'use client';
import { useEffect, useState, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import {
  MapPin, Star, Heart, MessageCircle, Shield, Eye, ChevronLeft, ChevronRight,
  X, Send, Flag, Phone, Clock, Check, Camera, Video, Play,
  Copy, Share2, ZoomIn, Calendar, Info, ChevronDown, Flame,
  Zap, Lock, User, Tag, CheckCircle, AlertTriangle,
} from 'lucide-react';
import api from '@/lib/api';
import useAuthStore from '@/lib/store';
import toast from 'react-hot-toast';
import AvailabilityWidget from '@/components/profile/AvailabilityWidget';

function StarRating({ value, onChange, size = 18 }: { value: number; onChange?: (v: number) => void; size?: number }) {
  const [hovered, setHovered] = useState(0);
  return (
    <div className="flex gap-0.5">
      {[1,2,3,4,5].map(s => (
        <button key={s} type="button" onClick={() => onChange?.(s)}
          onMouseEnter={() => onChange && setHovered(s)}
          onMouseLeave={() => onChange && setHovered(0)}
          className={onChange ? 'cursor-pointer' : 'cursor-default'}>
          <Star size={size}
            className={s <= (hovered || value) ? 'text-amber-400' : 'text-gray-600'}
            fill={s <= (hovered || value) ? 'currentColor' : 'none'} />
        </button>
      ))}
    </div>
  );
}

export default function ProfileDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const { isAuthenticated, user } = useAuthStore();

  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [favorited, setFavorited] = useState(false);
  const [selectedPhoto, setSelectedPhoto] = useState(0);
  const [lightbox, setLightbox] = useState<number | null>(null);
  const [review, setReview] = useState({ rating: 5, comment: '' });
  const [submitting, setSubmitting] = useState(false);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [hasMessaged, setHasMessaged] = useState(false);
  const [reportReason, setReportReason] = useState('');
  const [reportDetails, setReportDetails] = useState('');
  const [reportSubmitting, setReportSubmitting] = useState(false);
  const [reportDone, setReportDone] = useState(false);
  const [bioExpanded, setBioExpanded] = useState(false);
  const [activeMediaTab, setActiveMediaTab] = useState<'photos' | 'videos'>('photos');
  const [contactTab, setContactTab] = useState<'message' | 'share'>('message');

  useEffect(() => {
    api.get(`/profiles/${id}`)
      .then(res => { setProfile(res.data); setLoading(false); })
      .catch(() => setLoading(false));
    if (isAuthenticated) {
      api.get(`/profiles/${id}/can-review`).then(res => setHasMessaged(res.data.hasMessaged)).catch(() => {});
    }
  }, [id, isAuthenticated]);

  useEffect(() => {
    if (lightbox === null) return;
    const photos = profile?.photos || [];
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') setLightbox(i => (((i ?? 0) + 1) % photos.length));
      if (e.key === 'ArrowLeft') setLightbox(i => (((i ?? 0) - 1 + photos.length) % photos.length));
      if (e.key === 'Escape') setLightbox(null);
    };
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', handler);
    return () => { window.removeEventListener('keydown', handler); document.body.style.overflow = ''; };
  }, [lightbox, profile]);

  const handleContact = () => {
    if (!isAuthenticated) { router.push(`/auth/login?redirect=/profiles/${id}`); return; }
    router.push(`/messages?with=${profile.userId}`);
  };

  const toggleFavorite = async () => {
    if (!isAuthenticated) { router.push('/auth/login'); return; }
    const res = await api.post(`/profiles/${id}/favorite`);
    setFavorited(res.data.favorited);
    toast.success(res.data.favorited ? '❤️ Ajouté aux favoris' : 'Retiré des favoris');
  };

  const submitReport = async () => {
    if (!reportReason) { toast.error('Choisissez une raison'); return; }
    setReportSubmitting(true);
    try {
      await api.post('/reports', { profileId: id, reason: reportReason, details: reportDetails });
      setReportDone(true);
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Erreur');
    } finally { setReportSubmitting(false); }
  };

  const submitReview = async () => {
    if (!isAuthenticated || !review.comment.trim()) { toast.error('Écrivez un commentaire'); return; }
    setSubmitting(true);
    try {
      await api.post(`/profiles/${id}/review`, review);
      toast.success('Avis publié !');
      const res = await api.get(`/profiles/${id}`);
      setProfile(res.data);
      setShowReviewForm(false);
      setReview({ rating: 5, comment: '' });
    } catch { toast.error('Erreur envoi'); }
    finally { setSubmitting(false); }
  };

  if (loading) return (
    <div className="min-h-screen bg-[#111] flex items-center justify-center">
      <div className="w-10 h-10 border-4 border-brand-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  if (!profile) return (
    <div className="min-h-screen bg-[#111] flex items-center justify-center text-center px-4">
      <div>
        <p className="text-gray-400 mb-4">Profil introuvable.</p>
        <button onClick={() => router.back()} className="bg-brand-500 text-white px-6 py-2.5 rounded-xl text-sm font-medium">Retour</button>
      </div>
    </div>
  );

  const reviews = profile.reviews || [];
  const avgRating = reviews.length ? reviews.reduce((s: number, r: any) => s + r.rating, 0) / reviews.length : 0;
  const alreadyReviewed = reviews.some((r: any) => r.userId === user?.id || r.user?.id === user?.id);
  const isBoosted = profile.boosts?.length > 0;
  const photos = profile.photos || [];
  const videos = profile.videos || [];

  return (
    <div className="min-h-screen bg-[#111] text-white">

      {/* Breadcrumb */}
      <div className="bg-[#0d0d0d] border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-4 py-2 flex items-center gap-1.5 text-xs text-gray-600 overflow-x-auto whitespace-nowrap">
          <Link href="/" className="hover:text-brand-400 transition-colors">Accueil</Link>
          <span>/</span>
          <Link href="/profiles" className="hover:text-brand-400 transition-colors">Annuaire</Link>
          {profile.city && <><span>/</span><Link href={`/profiles?city=${profile.city}`} className="hover:text-brand-400 transition-colors">{profile.city}</Link></>}
          <span>/</span>
          <span className="text-gray-500 truncate max-w-[120px]">{profile.displayName}</span>
        </div>
      </div>

      {/* ══════════════════════════════════════════
          HERO — Galerie principale
      ══════════════════════════════════════════ */}
      <div className="relative bg-[#0d0d0d]">

        {/* Photo hero grande */}
        <div className="relative overflow-hidden cursor-zoom-in group"
          style={{ height: 'min(70vh, 600px)' }}
          onClick={() => photos.length > 0 && setLightbox(selectedPhoto)}>

          {photos[selectedPhoto] ? (
            <Image
              src={photos[selectedPhoto].url}
              alt={profile.displayName}
              fill
              className="object-cover object-top group-hover:scale-[1.02] transition-transform duration-700"
              priority
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-gray-900 to-[#1a1a1a]">
              <span className="text-9xl font-bold text-gray-700">{profile.displayName[0]}</span>
            </div>
          )}

          {/* Gradients overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#111] via-transparent to-black/30" />
          <div className="absolute inset-0 bg-gradient-to-r from-black/50 to-transparent" />

          {/* Badges haut gauche */}
          <div className="absolute top-3 left-3 flex gap-2">
            {isBoosted && (
              <span className="flex items-center gap-1 bg-brand-500 text-white text-[10px] font-black px-2.5 py-1 rounded-md shadow-lg shadow-brand-500/40 uppercase tracking-wide">
                <Flame size={9} /> VIP
              </span>
            )}
            {profile.isVerified && (
              <span className="flex items-center gap-1 bg-emerald-500 text-white text-[10px] font-black px-2.5 py-1 rounded-md shadow-lg shadow-emerald-500/40 uppercase tracking-wide">
                <Shield size={9} /> Vérifié
              </span>
            )}
          </div>

          {/* Statut + vues haut droite */}
          <div className="absolute top-3 right-3 flex flex-col items-end gap-1.5">
            {profile.isOnline ? (
              <span className="flex items-center gap-1.5 bg-emerald-500 text-white text-[10px] font-bold px-2.5 py-1 rounded-md shadow-lg uppercase">
                <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" /> En ligne
              </span>
            ) : (
              <span className="flex items-center gap-1.5 bg-black/60 backdrop-blur text-gray-400 text-[10px] px-2.5 py-1 rounded-md uppercase">
                <span className="w-1.5 h-1.5 bg-gray-500 rounded-full" /> Hors ligne
              </span>
            )}
            <span className="flex items-center gap-1 bg-black/50 backdrop-blur text-gray-400 text-[10px] px-2.5 py-1 rounded-md">
              <Eye size={9} /> {(profile.viewCount || 0).toLocaleString()}
            </span>
          </div>

          {/* Navigation photos */}
          {photos.length > 1 && (
            <>
              <button onClick={e => { e.stopPropagation(); setSelectedPhoto(i => (i - 1 + photos.length) % photos.length); }}
                className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 bg-black/60 hover:bg-black/90 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all">
                <ChevronLeft size={20} />
              </button>
              <button onClick={e => { e.stopPropagation(); setSelectedPhoto(i => (i + 1) % photos.length); }}
                className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 bg-black/60 hover:bg-black/90 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all">
                <ChevronRight size={20} />
              </button>
            </>
          )}

          {/* Compteur + zoom bas droite */}
          {photos.length > 0 && (
            <div className="absolute bottom-20 right-3 flex items-center gap-1.5">
              {photos.length > 1 && (
                <span className="bg-black/70 backdrop-blur text-white text-[10px] px-2.5 py-1 rounded-md flex items-center gap-1">
                  <Camera size={9} /> {selectedPhoto + 1}/{photos.length}
                </span>
              )}
              <span className="bg-black/70 backdrop-blur text-white text-[10px] px-2.5 py-1 rounded-md flex items-center gap-1">
                <ZoomIn size={9} /> Agrandir
              </span>
            </div>
          )}

          {/* Infos nom + prix bas */}
          <div className="absolute bottom-0 left-0 right-0 px-4 pb-5 md:px-6">
            <div className="max-w-7xl mx-auto flex items-end justify-between gap-4">
              <div>
                <h1 className="font-display text-3xl md:text-5xl font-bold text-white leading-tight drop-shadow-xl">
                  {profile.displayName}
                  {profile.age && <span className="text-white/50 font-normal text-2xl md:text-3xl ml-2">{profile.age} ans</span>}
                </h1>
                <div className="flex items-center flex-wrap gap-2 mt-1.5">
                  <span className="flex items-center gap-1 text-gray-300 text-sm">
                    <MapPin size={12} className="text-brand-400" /> {profile.city}
                  </span>
                  {avgRating > 0 && (
                    <>
                      <span className="text-gray-600">·</span>
                      <span className="flex items-center gap-1 text-gray-300 text-sm">
                        <Star size={12} className="text-amber-400 fill-amber-400" />
                        <span className="font-semibold">{avgRating.toFixed(1)}</span>
                        <span className="text-gray-500 text-xs">({reviews.length} avis)</span>
                      </span>
                    </>
                  )}
                  {profile.categories?.slice(0, 2).map((c: string) => (
                    <span key={c} className="text-[10px] bg-white/10 text-white/70 px-2 py-0.5 rounded-md">{c}</span>
                  ))}
                </div>
              </div>
              {profile.pricePerHour && (
                <div className="bg-brand-500 rounded-xl px-4 py-2.5 text-right shrink-0 shadow-xl shadow-brand-500/30">
                  <p className="text-white/70 text-[9px] font-bold uppercase tracking-widest">Tarif</p>
                  <p className="font-display text-xl font-bold text-white">{Number(profile.pricePerHour).toLocaleString()} <span className="text-xs font-normal">FCFA/h</span></p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Strip thumbnails */}
        {photos.length > 1 && (
          <div className="bg-[#0d0d0d] overflow-x-auto border-b border-gray-800/50">
            <div className="max-w-7xl mx-auto px-4 py-2 flex gap-1.5">
              {photos.map((p: any, i: number) => {
                const locked = !isAuthenticated && i > 0;
                return (
                  <button key={i} onClick={() => !locked && setSelectedPhoto(i)}
                    className={`relative w-14 h-14 md:w-16 md:h-16 rounded-md overflow-hidden shrink-0 border-2 transition-all ${
                      i === selectedPhoto ? 'border-brand-500 scale-105' : 'border-transparent opacity-40 hover:opacity-70'
                    } ${locked ? 'cursor-default' : ''}`}>
                    <Image src={p.url} alt="" fill className={`object-cover ${locked ? 'blur-sm' : ''}`} />
                    {locked && (
                      <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                        <Lock size={10} className="text-white" />
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* ══════════════════════════════════════════
          CONTENU — 2 colonnes
      ══════════════════════════════════════════ */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="grid lg:grid-cols-3 gap-5">

          {/* ── COLONNE PRINCIPALE ── */}
          <div className="lg:col-span-2 space-y-4">

            {/* CTA mobile */}
            <div className="lg:hidden space-y-2">
              {isAuthenticated ? (
                <button onClick={handleContact}
                  className="w-full bg-brand-500 hover:bg-brand-600 text-white font-bold py-4 rounded-xl flex items-center justify-center gap-2 text-base transition-all shadow-lg shadow-brand-500/30">
                  <MessageCircle size={18} /> Envoyer un message
                </button>
              ) : (
                <div className="grid grid-cols-2 gap-2">
                  <Link href={`/auth/login?redirect=/profiles/${id}`}
                    className="text-center font-semibold text-white border border-gray-700 py-3.5 rounded-xl text-sm hover:border-gray-500 transition-colors">
                    Connexion
                  </Link>
                  <Link href="/auth/register"
                    className="text-center font-bold bg-brand-500 text-white py-3.5 rounded-xl text-sm hover:bg-brand-600 transition-colors">
                    S'inscrire
                  </Link>
                </div>
              )}
              {isAuthenticated && (
                <div className="grid grid-cols-2 gap-2">
                  <button onClick={toggleFavorite}
                    className={`flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-medium border transition-all ${favorited ? 'bg-brand-500/15 border-brand-500/40 text-brand-300' : 'border-gray-700 text-gray-500 hover:border-gray-600'}`}>
                    <Heart size={14} fill={favorited ? 'currentColor' : 'none'} />
                    {favorited ? 'Favori ✓' : 'Ajouter'}
                  </button>
                  <button onClick={() => { navigator.clipboard.writeText(window.location.href); toast.success('Lien copié !'); }}
                    className="flex items-center justify-center gap-2 py-3 rounded-xl text-sm text-gray-500 border border-gray-700 hover:border-gray-600">
                    <Copy size={14} /> Copier
                  </button>
                </div>
              )}
            </div>

            {/* Infos rapides */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {[
                { label: 'Ville', value: profile.city, emoji: '📍' },
                { label: 'Âge', value: profile.age ? `${profile.age} ans` : null, emoji: '🎂' },
                { label: 'Tarif', value: profile.pricePerHour ? `${Number(profile.pricePerHour).toLocaleString()} F/h` : null, emoji: '💰' },
                { label: 'Statut', value: profile.isOnline ? 'En ligne' : 'Hors ligne', emoji: profile.isOnline ? '🟢' : '⚫', highlight: profile.isOnline },
              ].filter(i => i.value).map(({ label, value, emoji, highlight }: any) => (
                <div key={label} className={`rounded-xl p-3 text-center border ${highlight ? 'bg-emerald-500/10 border-emerald-500/20' : 'bg-[#1a1a1a] border-gray-800'}`}>
                  <p className="text-xl mb-1">{emoji}</p>
                  <p className={`font-bold text-sm ${highlight ? 'text-emerald-300' : 'text-white'}`}>{value}</p>
                  <p className="text-gray-600 text-[10px] uppercase tracking-wide mt-0.5">{label}</p>
                </div>
              ))}
            </div>

            {/* Catégories + Tags */}
            {(profile.categories?.length > 0 || profile.tags?.length > 0) && (
              <div className="bg-[#1a1a1a] border border-gray-800 rounded-xl p-4 space-y-3">
                {profile.categories?.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {profile.categories.map((c: string) => (
                      <Link key={c} href={`/profiles?category=${c}`}
                        className="text-xs bg-brand-500/10 text-brand-300 border border-brand-500/20 px-3 py-1.5 rounded-lg hover:bg-brand-500/20 transition-colors font-semibold">
                        {c}
                      </Link>
                    ))}
                  </div>
                )}
                {profile.tags?.length > 0 && (
                  <div className="flex flex-wrap gap-1.5">
                    {profile.tags.map((t: string) => (
                      <Link key={t} href={`/profiles?tags=${t}`}
                        className="text-[11px] bg-gray-800 text-gray-400 hover:text-white border border-gray-700/50 hover:border-gray-600 px-2.5 py-1 rounded-full transition-colors">
                        #{t}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Bio */}
            {profile.bio && (
              <div className="bg-[#1a1a1a] border border-gray-800 rounded-xl p-5">
                <h2 className="text-xs font-bold text-white mb-3 flex items-center gap-2 uppercase tracking-wider">
                  <Info size={12} className="text-brand-400" /> À propos
                </h2>
                <p className={`text-gray-400 text-sm leading-relaxed ${!bioExpanded && profile.bio.length > 280 ? 'line-clamp-4' : ''}`}>
                  {profile.bio}
                </p>
                {profile.bio.length > 280 && (
                  <button onClick={() => setBioExpanded(e => !e)}
                    className="flex items-center gap-1 text-brand-400 hover:text-brand-300 text-xs mt-2.5 font-medium">
                    {bioExpanded ? 'Réduire' : 'Lire la suite'}
                    <ChevronDown size={12} className={`transition-transform ${bioExpanded ? 'rotate-180' : ''}`} />
                  </button>
                )}
              </div>
            )}

            {/* ── GALERIE ── */}
            {(photos.length > 0 || videos.length > 0) && (
              <div className="bg-[#1a1a1a] border border-gray-800 rounded-xl overflow-hidden">
                <div className="flex border-b border-gray-800">
                  {photos.length > 0 && (
                    <button onClick={() => setActiveMediaTab('photos')}
                      className={`flex items-center gap-2 px-5 py-3 text-sm font-medium border-b-2 transition-colors ${
                        activeMediaTab === 'photos' ? 'text-white border-brand-500 bg-brand-500/5' : 'text-gray-500 border-transparent hover:text-gray-300'
                      }`}>
                      <Camera size={13} /> Photos <span className="text-xs text-gray-600">({photos.length})</span>
                    </button>
                  )}
                  {videos.length > 0 && (
                    <button onClick={() => setActiveMediaTab('videos')}
                      className={`flex items-center gap-2 px-5 py-3 text-sm font-medium border-b-2 transition-colors ${
                        activeMediaTab === 'videos' ? 'text-white border-brand-500 bg-brand-500/5' : 'text-gray-500 border-transparent hover:text-gray-300'
                      }`}>
                      <Video size={13} /> Vidéos <span className="text-xs text-gray-600">({videos.length})</span>
                    </button>
                  )}
                </div>

                <div className="p-3">
                  {/* Photos masonry */}
                  {activeMediaTab === 'photos' && photos.length > 0 && (
                    <div className="columns-2 sm:columns-3 gap-2 space-y-2">
                      {photos.map((p: any, i: number) => {
                        const locked = !isAuthenticated && i > 0;
                        const tall = i % 5 === 0 || i % 5 === 3;
                        return (
                          <div key={i}
                            className={`relative rounded-lg overflow-hidden bg-gray-900 break-inside-avoid cursor-zoom-in group/img ${tall ? 'aspect-[3/4]' : 'aspect-square'} ${locked ? 'cursor-default' : ''}`}
                            onClick={() => !locked && setLightbox(i)}>
                            <Image src={p.url} alt="" fill className={`object-cover transition-transform duration-500 ${!locked ? 'group-hover/img:scale-110' : 'blur-md'}`} />
                            {p.isMain && !locked && (
                              <span className="absolute top-1.5 left-1.5 bg-brand-500 text-white text-[9px] font-bold px-1.5 py-0.5 rounded">⭐</span>
                            )}
                            {locked ? (
                              <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/60">
                                <Lock size={14} className="text-white mb-1" />
                                <span className="text-white text-[9px] text-center px-2">Connexion requise</span>
                              </div>
                            ) : (
                              <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover/img:opacity-100 transition-opacity bg-black/20">
                                <ZoomIn size={18} className="text-white drop-shadow-lg" />
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {/* Vidéos */}
                  {activeMediaTab === 'videos' && (
                    !isAuthenticated ? (
                      <div className="relative rounded-lg overflow-hidden bg-gray-900 aspect-video flex items-center justify-center">
                        {videos[0]?.thumbnailUrl && <img src={videos[0].thumbnailUrl} alt="" className="absolute inset-0 w-full h-full object-cover opacity-20 blur-sm" />}
                        <div className="relative z-10 text-center p-6">
                          <Lock size={24} className="text-white/40 mx-auto mb-3" />
                          <p className="text-white font-bold mb-1">{videos.length} vidéo{videos.length > 1 ? 's' : ''}</p>
                          <p className="text-white/50 text-sm mb-4">Connectez-vous pour accéder aux vidéos</p>
                          <Link href={`/auth/login?redirect=/profiles/${id}`}
                            className="bg-brand-500 hover:bg-brand-600 text-white text-sm font-bold px-6 py-2.5 rounded-xl transition-colors">
                            Se connecter
                          </Link>
                        </div>
                      </div>
                    ) : (
                      <div className="grid grid-cols-2 gap-2">
                        {videos.map((v: any) => (
                          <div key={v.id} className="relative aspect-video rounded-lg overflow-hidden bg-gray-900 group cursor-pointer">
                            {v.thumbnailUrl
                              ? <img src={v.thumbnailUrl} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                              : <div className="w-full h-full flex items-center justify-center"><Video size={24} className="text-gray-600" /></div>
                            }
                            <div className="absolute inset-0 bg-black/30 group-hover:bg-black/50 flex items-center justify-center transition-colors">
                              <div className="w-11 h-11 bg-white/20 backdrop-blur rounded-full flex items-center justify-center">
                                <Play size={18} className="text-white ml-0.5" />
                              </div>
                            </div>
                            {v.duration && (
                              <span className="absolute bottom-1.5 right-1.5 bg-black/70 text-white text-[9px] px-1.5 py-0.5 rounded font-mono">
                                {Math.floor(v.duration/60)}:{String(Math.floor(v.duration%60)).padStart(2,'0')}
                              </span>
                            )}
                          </div>
                        ))}
                      </div>
                    )
                  )}
                </div>
              </div>
            )}

            {/* ── AVIS ── */}
            <div className="bg-[#1a1a1a] border border-gray-800 rounded-xl p-5">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <h2 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                    <Star size={12} className="text-amber-400" /> Avis
                  </h2>
                  {avgRating > 0 && (
                    <div className="flex items-center gap-1.5">
                      <span className="font-display text-2xl font-bold text-white">{avgRating.toFixed(1)}</span>
                      <div>
                        <StarRating value={Math.round(avgRating)} size={12} />
                        <p className="text-gray-600 text-[10px]">{reviews.length} avis</p>
                      </div>
                    </div>
                  )}
                </div>
                {isAuthenticated && !alreadyReviewed && !showReviewForm && (
                  <div className="flex flex-col items-end gap-1">
                    <button onClick={() => setShowReviewForm(true)}
                      className="flex items-center gap-1.5 text-xs font-semibold text-brand-400 hover:text-brand-300 border border-brand-500/30 hover:border-brand-500/50 px-3 py-1.5 rounded-lg transition-all">
                      <Star size={11} /> Laisser un avis
                    </button>
                    {!hasMessaged && (
                      <p className="text-[10px] text-gray-600">💬 Contactez pour un avis vérifié</p>
                    )}
                  </div>
                )}
              </div>

              {/* Formulaire avis */}
              {showReviewForm && (
                <div className="bg-[#111] border border-gray-700/50 rounded-xl p-4 mb-4">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-sm font-semibold text-white">Votre avis</h3>
                    {hasMessaged ? (
                      <span className="text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded-full">✓ Avis vérifié</span>
                    ) : (
                      <span className="text-[10px] bg-amber-500/10 text-amber-400 border border-amber-500/20 px-2 py-0.5 rounded-full">💬 Non vérifié</span>
                    )}
                  </div>
                  <StarRating value={review.rating} onChange={v => setReview(r => ({ ...r, rating: v }))} size={22} />
                  <textarea
                    className="w-full mt-3 bg-[#1a1a1a] border border-gray-700 rounded-xl px-3 py-2.5 text-gray-300 text-sm placeholder-gray-600 focus:outline-none focus:border-brand-500 resize-none"
                    rows={3} placeholder="Partagez votre expérience..." value={review.comment}
                    onChange={e => setReview(r => ({ ...r, comment: e.target.value }))} />
                  <div className="flex gap-2 mt-3">
                    <button onClick={() => setShowReviewForm(false)} className="flex-1 border border-gray-700 text-gray-400 py-2.5 rounded-xl text-sm hover:text-white transition-colors">Annuler</button>
                    <button onClick={submitReview} disabled={submitting || !review.comment.trim()}
                      className="flex-1 bg-brand-500 hover:bg-brand-600 text-white font-bold py-2.5 rounded-xl text-sm disabled:opacity-50 flex items-center justify-center gap-1.5 transition-colors">
                      {submitting ? 'Envoi...' : <><Send size={13} /> Publier</>}
                    </button>
                  </div>
                </div>
              )}

              {/* Liste avis */}
              {reviews.length === 0 ? (
                <div className="text-center py-8 text-gray-600">
                  <Star size={24} className="mx-auto mb-2 opacity-30" />
                  <p className="text-sm">Aucun avis encore. Soyez le premier !</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {reviews.slice(0, 5).map((r: any, i: number) => (
                    <div key={i} className="border-t border-gray-800 pt-3 first:border-0 first:pt-0">
                      <div className="flex items-start justify-between gap-3 mb-1.5">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 bg-gray-800 rounded-full flex items-center justify-center text-xs font-bold text-gray-400">
                            {(r.user?.profile?.displayName || 'U')[0]}
                          </div>
                          <div>
                            <p className="text-white text-xs font-semibold">{r.user?.profile?.displayName || 'Utilisateur'}</p>
                            <div className="flex items-center gap-1.5">
                              <StarRating value={r.rating} size={10} />
                              {r.isVerified && (
                                <span className="text-[9px] bg-emerald-500/10 text-emerald-400 px-1.5 py-0.5 rounded-full border border-emerald-500/20 font-bold">✓ Vérifié</span>
                              )}
                            </div>
                          </div>
                        </div>
                        <span className="text-[10px] text-gray-600 shrink-0">
                          {new Date(r.createdAt).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}
                        </span>
                      </div>
                      {r.comment && <p className="text-gray-400 text-xs leading-relaxed pl-9">{r.comment}</p>}
                    </div>
                  ))}
                </div>
              )}

              {!isAuthenticated && (
                <div className="mt-4 pt-4 border-t border-gray-800 text-center">
                  <p className="text-gray-500 text-xs mb-2">Connectez-vous pour laisser un avis</p>
                  <div className="flex gap-2 justify-center">
                    <Link href={`/auth/login?redirect=/profiles/${id}`} className="text-xs border border-gray-700 text-gray-400 hover:text-white px-4 py-1.5 rounded-lg transition-colors">Se connecter</Link>
                    <Link href="/auth/register" className="text-xs bg-brand-500 hover:bg-brand-600 text-white px-4 py-1.5 rounded-lg transition-colors font-semibold">Créer un compte</Link>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* ── SIDEBAR ── */}
          <div className="space-y-4 lg:sticky lg:top-20 self-start">

            {/* CTA Principal */}
            <div className="bg-[#1a1a1a] border border-gray-800 rounded-xl overflow-hidden">
              {/* Header prix */}
              {profile.pricePerHour && (
                <div className="bg-gradient-to-r from-brand-600 to-brand-500 p-4 text-center">
                  <p className="text-white/70 text-[10px] font-bold uppercase tracking-widest mb-1">Tarif</p>
                  <p className="font-display text-3xl font-bold text-white">
                    {Number(profile.pricePerHour).toLocaleString()} <span className="text-base font-normal">FCFA</span>
                  </p>
                  <p className="text-white/60 text-xs">par heure</p>
                </div>
              )}

              <div className="p-4 space-y-2.5">
                {/* Bouton contact */}
                {isAuthenticated ? (
                  <button onClick={handleContact}
                    className="w-full bg-brand-500 hover:bg-brand-600 text-white font-bold py-3.5 rounded-xl flex items-center justify-center gap-2 transition-all shadow-lg shadow-brand-500/20 text-sm">
                    <MessageCircle size={16} /> Envoyer un message
                  </button>
                ) : (
                  <div className="space-y-2">
                    <div className="bg-[#111] border border-gray-700/50 rounded-xl p-4 text-center">
                      <p className="text-xs font-bold text-white mb-1">🔒 Contactez ce profil</p>
                      <p className="text-[11px] text-gray-500 mb-3">Créez un compte gratuit pour envoyer des messages</p>
                      <div className="flex gap-2">
                        <Link href={`/auth/login?redirect=/profiles/${id}`}
                          className="flex-1 text-center text-xs font-semibold text-gray-300 border border-gray-700 py-2 rounded-lg hover:border-gray-500 transition-colors">
                          Connexion
                        </Link>
                        <Link href="/auth/register"
                          className="flex-1 text-center text-xs font-bold text-white bg-brand-500 hover:bg-brand-600 py-2 rounded-lg transition-colors">
                          S'inscrire
                        </Link>
                      </div>
                    </div>
                  </div>
                )}

                {/* Favori */}
                {isAuthenticated && (
                  <button onClick={toggleFavorite}
                    className={`w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-medium border transition-all ${
                      favorited ? 'bg-brand-500/10 border-brand-500/30 text-brand-300' : 'border-gray-700 text-gray-500 hover:border-gray-600 hover:text-gray-300'
                    }`}>
                    <Heart size={14} fill={favorited ? 'currentColor' : 'none'} />
                    {favorited ? 'Dans vos favoris ✓' : 'Ajouter aux favoris'}
                  </button>
                )}

                {/* Partage */}
                <div className="grid grid-cols-3 gap-1.5 pt-1">
                  <button onClick={() => window.open(`https://wa.me/?text=${encodeURIComponent(window.location.href)}`, '_blank')}
                    className="flex flex-col items-center gap-1 py-2.5 rounded-lg border border-gray-800 hover:bg-green-500/10 hover:border-green-500/30 transition-all">
                    <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                    <span className="text-[9px] text-gray-600">WhatsApp</span>
                  </button>
                  <button onClick={() => window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}`, '_blank', 'width=600,height=400')}
                    className="flex flex-col items-center gap-1 py-2.5 rounded-lg border border-gray-800 hover:bg-blue-500/10 hover:border-blue-500/30 transition-all">
                    <svg className="w-4 h-4 text-blue-500" fill="currentColor" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
                    <span className="text-[9px] text-gray-600">Facebook</span>
                  </button>
                  <button onClick={() => { navigator.clipboard.writeText(window.location.href); toast.success('Lien copié !'); }}
                    className="flex flex-col items-center gap-1 py-2.5 rounded-lg border border-gray-800 hover:bg-gray-700/40 transition-all">
                    <Copy size={14} className="text-gray-500" />
                    <span className="text-[9px] text-gray-600">Copier</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Badges */}
            {(profile.isVerified || isBoosted) && (
              <div className="bg-[#1a1a1a] border border-gray-800 rounded-xl p-4 space-y-2">
                {profile.isVerified && (
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 bg-emerald-500/10 rounded-lg flex items-center justify-center shrink-0">
                      <Shield size={14} className="text-emerald-400" />
                    </div>
                    <div>
                      <p className="text-white text-xs font-bold">Profil vérifié</p>
                      <p className="text-gray-600 text-[10px]">Identité contrôlée par Afrodite</p>
                    </div>
                  </div>
                )}
                {isBoosted && (
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 bg-brand-500/10 rounded-lg flex items-center justify-center shrink-0">
                      <Flame size={14} className="text-brand-400" />
                    </div>
                    <div>
                      <p className="text-white text-xs font-bold">Profil VIP</p>
                      <p className="text-gray-600 text-[10px]">Mise en avant prioritaire</p>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Disponibilités */}
            <div className="bg-[#1a1a1a] border border-gray-800 rounded-xl p-4">
              <h3 className="text-xs font-bold text-white uppercase tracking-wider mb-3 flex items-center gap-2">
                <Calendar size={11} className="text-brand-400" /> Disponibilités
              </h3>
              <AvailabilityWidget profileId={profile.id} />
            </div>

            {/* Profils similaires */}
            {profile.similar?.length > 0 && (
              <div className="bg-[#1a1a1a] border border-gray-800 rounded-xl p-4">
                <h3 className="text-xs font-bold text-white uppercase tracking-wider mb-3 flex items-center gap-2">
                  <User size={11} className="text-brand-400" /> Profils similaires
                </h3>
                <div className="space-y-2">
                  {profile.similar.slice(0, 4).map((s: any) => {
                    const sPhoto = s.photos?.find((p: any) => p.isMain) || s.photos?.[0];
                    return (
                      <Link key={s.id} href={`/profiles/${s.id}`}
                        className="flex items-center gap-2.5 group hover:bg-white/5 rounded-lg p-1.5 -mx-1.5 transition-colors">
                        <div className="relative w-10 h-12 rounded-md overflow-hidden bg-gray-800 shrink-0">
                          {sPhoto
                            ? <Image src={sPhoto.url} alt="" fill className="object-cover group-hover:scale-105 transition-transform" />
                            : <div className="w-full h-full flex items-center justify-center text-gray-600 font-bold text-sm">{s.displayName?.[0]}</div>
                          }
                          {s.isOnline && <span className="absolute bottom-0.5 right-0.5 w-2 h-2 bg-emerald-400 rounded-full border border-black" />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-white text-xs font-semibold truncate group-hover:text-brand-300 transition-colors">{s.displayName}</p>
                          {s.age && <p className="text-gray-600 text-[10px]">{s.age} ans · {s.city}</p>}
                          {s.pricePerHour && <p className="text-brand-400 text-[10px] font-bold">{Number(s.pricePerHour).toLocaleString()} FCFA/h</p>}
                        </div>
                        <ChevronRight size={12} className="text-gray-700 group-hover:text-brand-400 shrink-0" />
                      </Link>
                    );
                  })}
                </div>
                <Link href={`/profiles?city=${profile.city}`}
                  className="flex items-center justify-center gap-1 mt-3 pt-3 border-t border-gray-800 text-[11px] text-brand-400 hover:text-brand-300 transition-colors">
                  Voir tous à {profile.city} <ChevronRight size={11} />
                </Link>
              </div>
            )}

            {/* Signaler */}
            {isAuthenticated && (
              <button onClick={() => setShowReportModal(true)}
                className="w-full flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs text-gray-700 hover:text-red-400 hover:bg-red-500/5 border border-transparent hover:border-red-500/20 transition-all">
                <Flag size={10} /> Signaler ce profil
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ── LIGHTBOX ── */}
      {lightbox !== null && photos[lightbox] && (
        <div className="fixed inset-0 z-50 bg-black/98 flex items-center justify-center" onClick={() => setLightbox(null)}>
          <button onClick={() => setLightbox(null)}
            className="absolute top-4 right-4 w-10 h-10 bg-white/10 hover:bg-white/20 text-white rounded-full flex items-center justify-center z-10">
            <X size={20} />
          </button>
          <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-black/60 backdrop-blur text-white text-xs px-3 py-1.5 rounded-full">
            {lightbox + 1} / {photos.length}
          </div>
          {photos.length > 1 && (
            <>
              <button onClick={e => { e.stopPropagation(); setLightbox((lightbox - 1 + photos.length) % photos.length); }}
                className="absolute left-4 w-12 h-12 bg-white/10 hover:bg-white/25 text-white rounded-full flex items-center justify-center z-10">
                <ChevronLeft size={24} />
              </button>
              <button onClick={e => { e.stopPropagation(); setLightbox((lightbox + 1) % photos.length); }}
                className="absolute right-4 w-12 h-12 bg-white/10 hover:bg-white/25 text-white rounded-full flex items-center justify-center z-10">
                <ChevronRight size={24} />
              </button>
            </>
          )}
          <div className="relative max-w-5xl max-h-[85vh] w-full h-full mx-16" onClick={e => e.stopPropagation()}>
            <Image src={photos[lightbox].url} alt={profile.displayName} fill className="object-contain" sizes="90vw" />
          </div>
          {photos.length > 1 && (
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5 px-4 overflow-x-auto max-w-full pb-1">
              {photos.map((p: any, i: number) => (
                <button key={i} onClick={e => { e.stopPropagation(); setLightbox(i); }}
                  className={`relative w-12 h-12 rounded-md overflow-hidden shrink-0 border-2 transition-all ${i === lightbox ? 'border-brand-500 scale-110' : 'border-white/20 opacity-50 hover:opacity-100'}`}>
                  <Image src={p.url} alt="" fill className="object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── MODAL SIGNALEMENT ── */}
      {showReportModal && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4" onClick={() => setShowReportModal(false)}>
          <div className="bg-[#1a1a1a] border border-gray-700 rounded-2xl w-full max-w-md p-6" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-semibold text-white flex items-center gap-2 text-sm"><Flag size={14} className="text-red-400" /> Signaler ce profil</h2>
              <button onClick={() => setShowReportModal(false)} className="text-gray-600 hover:text-white"><X size={18} /></button>
            </div>
            {reportDone ? (
              <div className="text-center py-6">
                <div className="w-14 h-14 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Check size={24} className="text-emerald-400" />
                </div>
                <h3 className="font-semibold text-white mb-2">Signalement envoyé</h3>
                <p className="text-sm text-gray-400 mb-4">Notre équipe va examiner ce profil. Merci.</p>
                <button onClick={() => { setShowReportModal(false); setReportDone(false); setReportReason(''); }}
                  className="bg-gray-700 hover:bg-gray-600 text-white px-5 py-2 rounded-xl text-sm">Fermer</button>
              </div>
            ) : (
              <div className="space-y-2">
                {[
                  { value: 'FAKE_PROFILE', label: '🎭 Faux profil' },
                  { value: 'INAPPROPRIATE_CONTENT', label: '🚫 Contenu inapproprié' },
                  { value: 'SCAM', label: '💸 Arnaque' },
                  { value: 'UNDERAGE', label: '⚠️ Mineur potentiel' },
                  { value: 'SPAM', label: '📧 Spam' },
                  { value: 'OTHER', label: '❓ Autre' },
                ].map(r => (
                  <label key={r.value} className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all ${reportReason === r.value ? 'border-red-500/40 bg-red-500/5 text-white' : 'border-gray-800 text-gray-400 hover:border-gray-700'}`}>
                    <input type="radio" name="reason" value={r.value} checked={reportReason === r.value} onChange={() => setReportReason(r.value)} className="accent-red-500" />
                    <span className="text-sm">{r.label}</span>
                  </label>
                ))}
                <textarea className="w-full bg-[#0d0d0d] border border-gray-800 rounded-xl px-3 py-2.5 text-gray-300 text-sm placeholder-gray-600 focus:outline-none focus:border-gray-600 resize-none mt-1"
                  rows={2} placeholder="Détails (optionnel)" value={reportDetails} onChange={e => setReportDetails(e.target.value)} />
                <div className="flex gap-2 pt-1">
                  <button onClick={() => setShowReportModal(false)} className="flex-1 border border-gray-700 text-gray-400 py-2.5 rounded-xl text-sm hover:text-white">Annuler</button>
                  <button onClick={submitReport} disabled={reportSubmitting || !reportReason}
                    className="flex-1 bg-red-500 hover:bg-red-600 text-white font-bold py-2.5 rounded-xl text-sm disabled:opacity-50 flex items-center justify-center gap-1.5">
                    {reportSubmitting ? 'Envoi...' : <><Flag size={12} /> Signaler</>}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
