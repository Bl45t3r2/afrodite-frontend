'use client';
import Link from 'next/link';
import { Search, MapPin, Flame, Shield, Star, SlidersHorizontal, X, Grid3X3, Rows3, ChevronRight, ArrowRight } from 'lucide-react';
import { useEffect, useState, useCallback } from 'react';
import api from '@/lib/api';
import useAuthStore from '@/lib/store';

const CITIES = ['Cotonou', 'Lomé', 'Abidjan', 'Dakar', 'Accra', 'Lagos', 'Douala', 'Porto-Novo', 'Nairobi', 'Abuja'];
const CATEGORIES = ['Escort', 'Massage', 'VIP', 'Compagnie', 'Agence', 'Indépendant', 'Couple'];
const AGES = ['18-25', '26-30', '31-40', '41+'];

function ProfileCard({ profile, size = 'md' }: { profile: any; size?: 'sm' | 'md' | 'lg' }) {
  const photo = profile.photos?.find((p: any) => p.isMain) || profile.photos?.[0];
  const isOnline = profile.isOnline;
  const isVerified = profile.isVerified;
  const isBoosted = profile.boosts?.length > 0;
  const avgRating = profile.reviews?.length
    ? (profile.reviews.reduce((s: number, r: any) => s + r.rating, 0) / profile.reviews.length).toFixed(1)
    : null;

  return (
    <Link
      href={`/profiles/${profile.id}`}
      className={`group relative flex flex-col rounded-xl overflow-hidden border transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl ${
        isBoosted
          ? 'border-brand-500/40 bg-[#1a1510] hover:border-brand-400/60 hover:shadow-brand-500/15'
          : 'border-white/8 bg-[#181818] hover:border-white/18 hover:shadow-black/50'
      }`}
    >
      {isBoosted && (
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-brand-400/70 to-transparent z-10" />
      )}

      <div className={`relative overflow-hidden bg-[#0d0d0d] ${
        size === 'lg' ? 'aspect-[3/4]' : size === 'sm' ? 'aspect-[4/5]' : 'aspect-[3/4]'
      }`}>
        {photo ? (
          <img
            src={photo.url}
            alt={profile.displayName}
            className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-700"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-brand-900/20 to-[#0d0d0d]">
            <span className="text-5xl font-bold text-brand-400/30">{profile.displayName?.[0]}</span>
          </div>
        )}

        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/15 to-transparent" />

        {/* Badges */}
        <div className="absolute top-2 left-2 flex flex-col gap-1">
          {isBoosted && (
            <span className="flex items-center gap-0.5 bg-brand-500 text-white text-[9px] font-black px-1.5 py-0.5 rounded-full uppercase shadow-md shadow-brand-500/40">
              <Flame size={7} /> VIP
            </span>
          )}
          {isVerified && (
            <span className="flex items-center gap-0.5 bg-emerald-500 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full shadow-sm">
              <Shield size={7} /> ✓
            </span>
          )}
        </div>

        {/* Online */}
        {isOnline && (
          <div className="absolute top-2 right-2 flex items-center gap-1 bg-black/50 backdrop-blur text-emerald-400 text-[9px] font-semibold px-1.5 py-0.5 rounded-full">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            Live
          </div>
        )}

        {/* Bottom info */}
        <div className="absolute bottom-0 left-0 right-0 p-2.5">
          <div className="flex items-end justify-between gap-1">
            <div className="min-w-0">
              <p className="font-bold text-white text-sm leading-tight truncate">
                {profile.displayName}
                {profile.age && <span className="text-white/35 font-normal text-xs ml-1">{profile.age}</span>}
              </p>
              <div className="flex items-center gap-1 mt-0.5">
                <MapPin size={8} className="text-brand-400 shrink-0" />
                <span className="text-white/45 text-[10px] truncate">{profile.city}</span>
                {avgRating && (
                  <>
                    <span className="text-white/20">·</span>
                    <Star size={8} className="text-amber-400 fill-amber-400 shrink-0" />
                    <span className="text-white/45 text-[10px]">{avgRating}</span>
                  </>
                )}
              </div>
            </div>
            {profile.pricePerHour && (
              <div className="shrink-0 text-right">
                <p className="text-brand-300 text-[10px] font-bold leading-tight">{Number(profile.pricePerHour).toLocaleString()}</p>
                <p className="text-white/25 text-[8px]">FCFA/h</p>
              </div>
            )}
          </div>
          {profile.categories?.length > 0 && (
            <div className="flex gap-1 mt-1.5 flex-wrap">
              {profile.categories.slice(0, 2).map((c: string) => (
                <span key={c} className="text-[8px] bg-white/8 text-white/35 px-1.5 py-0.5 rounded-full">{c}</span>
              ))}
            </div>
          )}
        </div>
      </div>
    </Link>
  );
}

function Skeleton() {
  return (
    <div className="rounded-xl overflow-hidden border border-white/5 bg-[#181818] animate-pulse">
      <div className="aspect-[3/4] bg-white/5" />
    </div>
  );
}

function FilterPill({ label, active, onClick }: any) {
  return (
    <button
      onClick={onClick}
      className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all whitespace-nowrap border ${
        active
          ? 'bg-brand-500 border-brand-500 text-white shadow-sm shadow-brand-500/30'
          : 'border-white/10 text-white/45 hover:border-white/25 hover:text-white/80 bg-white/3'
      }`}>
      {label}
    </button>
  );
}

export default function HomePage() {
  const [profiles, setProfiles] = useState<any[]>([]);
  const [boosted, setBoosted] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [onlineCount, setOnlineCount] = useState(0);

  const [search, setSearch] = useState('');
  const [city, setCity] = useState('');
  const [category, setCategory] = useState('');
  const [ageFilter, setAgeFilter] = useState('');
  const [onlineOnly, setOnlineOnly] = useState(false);
  const [verifiedOnly, setVerifiedOnly] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [gridCols, setGridCols] = useState<4 | 6>(6);
  const [sortBy, setSortBy] = useState<'default' | 'online' | 'new' | 'rating'>('default');

  const { isAuthenticated } = useAuthStore();

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const params: any = { limit: 36 };
      if (city) params.city = city;
      if (category) params.category = category;
      if (onlineOnly) params.isOnline = true;
      if (verifiedOnly) params.isVerified = true;
      if (search) params.search = search;

      const [p, b, o] = await Promise.all([
        api.get('/profiles', { params }),
        api.get('/boosts/featured'),
        api.get('/profiles', { params: { limit: 1, isOnline: true } }),
      ]);
      setProfiles(p.data.profiles || []);
      setTotal(p.data.total || 0);
      setBoosted(b.data || []);
      setOnlineCount(o.data.total || 0);
    } catch {}
    finally { setLoading(false); }
  }, [city, category, onlineOnly, verifiedOnly, search]);

  useEffect(() => { load(); }, [load]);

  const doSearch = (e: React.FormEvent) => { e.preventDefault(); load(); };

  const resetFilters = () => {
    setCity(''); setCategory(''); setAgeFilter('');
    setOnlineOnly(false); setVerifiedOnly(false); setSearch('');
  };

  const activeFilterCount = [city, category, ageFilter, onlineOnly && 'on', verifiedOnly && 'v'].filter(Boolean).length;

  const sorted = [...profiles].sort((a, b) => {
    if (sortBy === 'online') return (b.isOnline ? 1 : 0) - (a.isOnline ? 1 : 0);
    if (sortBy === 'new') return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
    if (sortBy === 'rating') {
      const ra = a.reviews?.length ? a.reviews.reduce((s: number, r: any) => s + r.rating, 0) / a.reviews.length : 0;
      const rb = b.reviews?.length ? b.reviews.reduce((s: number, r: any) => s + r.rating, 0) / b.reviews.length : 0;
      return rb - ra;
    }
    return 0;
  });

  return (
    <div className="min-h-screen bg-[#0f0f0f]">

      {/* ── HERO ─────────────────────────────────── */}
      <div className="relative overflow-hidden bg-[#0d0d0d] border-b border-white/5">
        {/* Background pattern */}
        <div className="absolute inset-0 opacity-30">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-brand-500/8 blur-[120px] rounded-full" />
          <div className="absolute bottom-0 left-1/4 w-[300px] h-[200px] bg-purple-500/5 blur-[80px] rounded-full" />
        </div>

        <div className="relative max-w-[1600px] mx-auto px-4 py-10 md:py-14">
          {/* Stats strip */}
          <div className="flex items-center gap-6 mb-6">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-emerald-400 text-sm font-semibold">{onlineCount.toLocaleString()} en ligne</span>
            </div>
            <span className="text-white/15">·</span>
            <span className="text-white/35 text-sm">{total.toLocaleString()} profils vérifiés</span>
            <span className="text-white/15">·</span>
            <span className="text-white/35 text-sm hidden sm:block">10 villes · Afrique de l'Ouest</span>
          </div>

          <h1 className="font-display text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-3 leading-tight">
            Découvrez des profils<br className="hidden md:block" />
            <span className="text-brand-400"> vérifiés près de vous</span>
          </h1>
          <p className="text-white/40 text-base md:text-lg mb-8 max-w-xl">
            La plateforme de référence en Afrique de l'Ouest. Profils authentiques, disponibilités en temps réel.
          </p>

          {/* Search bar */}
          <form onSubmit={doSearch} className="flex gap-2 max-w-2xl">
            <div className="flex-1 relative">
              <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30 pointer-events-none" />
              <input
                type="text"
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Rechercher un profil, une ville…"
                className="w-full bg-white/6 border border-white/12 rounded-xl pl-11 pr-4 py-3 text-sm text-white placeholder:text-white/25 focus:outline-none focus:border-brand-500/60 focus:bg-white/8 transition-all"
              />
            </div>
            <select
              value={city}
              onChange={e => setCity(e.target.value)}
              className="bg-white/6 border border-white/12 rounded-xl px-4 py-3 text-sm text-white/60 focus:outline-none focus:border-brand-500/60 transition-all hidden sm:block"
            >
              <option value="">Toutes les villes</option>
              {CITIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
            <button type="submit" className="bg-brand-500 hover:bg-brand-400 text-white text-sm font-semibold px-6 py-3 rounded-xl transition-all shadow-md shadow-brand-500/25 hover:shadow-brand-500/40 shrink-0">
              Rechercher
            </button>
          </form>

          {/* Quick city pills */}
          <div className="flex items-center gap-2 mt-4 overflow-x-auto scrollbar-none pb-1">
            <span className="text-white/25 text-xs shrink-0">Villes populaires :</span>
            {CITIES.slice(0, 6).map(c => (
              <button
                key={c}
                onClick={() => setCity(city === c ? '' : c)}
                className={`text-xs px-3 py-1 rounded-full border transition-all whitespace-nowrap shrink-0 ${
                  city === c
                    ? 'bg-brand-500/20 border-brand-500/50 text-brand-300'
                    : 'border-white/10 text-white/35 hover:text-white/70 hover:border-white/20'
                }`}>
                {c}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── FILTER BAR ───────────────────────────── */}
      <div className="bg-[#111] border-b border-white/6 sticky top-16 z-30">
        <div className="max-w-[1600px] mx-auto px-4">
          <div className="flex items-center gap-2 py-2.5 overflow-x-auto scrollbar-none">
            <FilterPill label="🔥 Tous" active={!city && !onlineOnly && !verifiedOnly && !category} onClick={resetFilters} />
            <FilterPill label="🟢 En ligne" active={onlineOnly} onClick={() => setOnlineOnly(o => !o)} />
            <FilterPill label="✓ Vérifiés" active={verifiedOnly} onClick={() => setVerifiedOnly(v => !v)} />

            <div className="w-px h-4 bg-white/10 shrink-0 mx-1" />

            {CITIES.slice(0, 5).map(c => (
              <FilterPill key={c} label={c} active={city === c} onClick={() => setCity(city === c ? '' : c)} />
            ))}

            <div className="w-px h-4 bg-white/10 shrink-0 mx-1" />

            {CATEGORIES.slice(0, 4).map(cat => (
              <FilterPill key={cat} label={cat} active={category === cat} onClick={() => setCategory(category === cat ? '' : cat)} />
            ))}

            <button
              onClick={() => setShowFilters(f => !f)}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold border transition-all whitespace-nowrap shrink-0 ${
                showFilters || activeFilterCount > 0
                  ? 'bg-brand-500/15 border-brand-500/40 text-brand-300'
                  : 'border-white/10 text-white/40 hover:border-white/25 bg-white/3'
              }`}>
              <SlidersHorizontal size={11} />
              Filtres avancés
              {activeFilterCount > 0 && (
                <span className="w-4 h-4 bg-brand-500 text-white rounded-full text-[9px] font-black flex items-center justify-center">
                  {activeFilterCount}
                </span>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* ── ADVANCED FILTERS ─────────────────────── */}
      {showFilters && (
        <div className="bg-[#111] border-b border-white/8">
          <div className="max-w-[1600px] mx-auto px-4 py-5">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
              <div>
                <label className="text-[10px] text-white/30 uppercase tracking-widest font-bold mb-2 block">Ville</label>
                <div className="flex flex-wrap gap-1.5">
                  {CITIES.map(c => (
                    <button key={c} onClick={() => setCity(city === c ? '' : c)}
                      className={`text-[11px] px-2.5 py-1 rounded-lg border transition-all ${
                        city === c ? 'bg-brand-500 border-brand-500 text-white' : 'border-white/10 text-white/40 hover:border-white/20 bg-white/3'
                      }`}>{c}</button>
                  ))}
                </div>
              </div>
              <div>
                <label className="text-[10px] text-white/30 uppercase tracking-widest font-bold mb-2 block">Catégorie</label>
                <div className="flex flex-wrap gap-1.5">
                  {CATEGORIES.map(cat => (
                    <button key={cat} onClick={() => setCategory(category === cat ? '' : cat)}
                      className={`text-[11px] px-2.5 py-1 rounded-lg border transition-all ${
                        category === cat ? 'bg-brand-500 border-brand-500 text-white' : 'border-white/10 text-white/40 hover:border-white/20 bg-white/3'
                      }`}>{cat}</button>
                  ))}
                </div>
              </div>
              <div>
                <label className="text-[10px] text-white/30 uppercase tracking-widest font-bold mb-2 block">Âge</label>
                <div className="flex flex-wrap gap-1.5">
                  {AGES.map(a => (
                    <button key={a} onClick={() => setAgeFilter(ageFilter === a ? '' : a)}
                      className={`text-[11px] px-2.5 py-1 rounded-lg border transition-all ${
                        ageFilter === a ? 'bg-brand-500 border-brand-500 text-white' : 'border-white/10 text-white/40 hover:border-white/20 bg-white/3'
                      }`}>{a}</button>
                  ))}
                </div>
              </div>
              <div>
                <label className="text-[10px] text-white/30 uppercase tracking-widest font-bold mb-2 block">Options</label>
                <div className="space-y-2.5">
                  {[
                    { label: 'En ligne seulement', value: onlineOnly, set: setOnlineOnly },
                    { label: 'Profils vérifiés uniquement', value: verifiedOnly, set: setVerifiedOnly },
                  ].map(({ label, value, set }) => (
                    <label key={label} className="flex items-center gap-2.5 cursor-pointer group">
                      <div onClick={() => set((v: boolean) => !v)}
                        className={`w-9 h-5 rounded-full transition-colors relative cursor-pointer shadow-inner ${value ? 'bg-brand-500' : 'bg-white/10'}`}>
                        <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-transform shadow-sm ${value ? 'translate-x-4' : 'translate-x-0.5'}`} />
                      </div>
                      <span className="text-[11px] text-white/40 group-hover:text-white/70 transition-colors">{label}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3 mt-5 pt-4 border-t border-white/8">
              <button onClick={() => { load(); setShowFilters(false); }}
                className="bg-brand-500 hover:bg-brand-400 text-white text-xs font-bold px-6 py-2.5 rounded-lg transition-all shadow-md shadow-brand-500/20">
                Appliquer
              </button>
              <button onClick={resetFilters} className="text-xs text-white/30 hover:text-white/60 transition-colors flex items-center gap-1">
                <X size={10} /> Réinitialiser
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── MAIN CONTENT ─────────────────────────── */}
      <div className="max-w-[1600px] mx-auto px-4 py-6">

        {/* VIP / Boosted profiles */}
        {boosted.length > 0 && (
          <div className="mb-8">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <span className="flex items-center gap-1.5 text-brand-400 text-xs font-black uppercase tracking-widest">
                  <Flame size={11} className="text-brand-400" /> Profils VIP
                </span>
                <div className="flex-1 h-px w-16 bg-gradient-to-r from-brand-500/40 to-transparent" />
              </div>
              <Link href="/profiles?boosted=1" className="text-xs text-white/30 hover:text-white/60 flex items-center gap-0.5 transition-colors">
                Voir tout <ArrowRight size={10} />
              </Link>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2.5">
              {boosted.slice(0, 6).map((p: any) => <ProfileCard key={p.id} profile={p} />)}
            </div>
          </div>
        )}

        {/* Controls bar */}
        <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
          <div className="flex items-center gap-3">
            <p className="text-white/50 text-sm">
              <span className="text-white font-bold">{total.toLocaleString()}</span> profil{total > 1 ? 's' : ''}
              {(city || category || onlineOnly || verifiedOnly) && (
                <span className="text-white/25 ml-1">· filtrés</span>
              )}
            </p>
            {activeFilterCount > 0 && (
              <button onClick={resetFilters} className="flex items-center gap-1 text-xs text-white/30 hover:text-white/60 transition-colors">
                <X size={10} /> Effacer les filtres
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            <select
              value={sortBy}
              onChange={e => setSortBy(e.target.value as any)}
              className="bg-white/5 border border-white/10 text-white/50 text-xs px-3 py-1.5 rounded-lg focus:outline-none focus:border-brand-500/50 hover:border-white/20 transition-all"
            >
              <option value="default">Par défaut</option>
              <option value="online">En ligne d'abord</option>
              <option value="new">Nouveaux d'abord</option>
              <option value="rating">Mieux notés</option>
            </select>

            <div className="flex items-center bg-white/5 border border-white/10 rounded-lg overflow-hidden">
              <button
                onClick={() => setGridCols(4)}
                className={`p-1.5 transition-colors ${gridCols === 4 ? 'bg-brand-500 text-white' : 'text-white/30 hover:text-white/60'}`}>
                <Rows3 size={14} />
              </button>
              <button
                onClick={() => setGridCols(6)}
                className={`p-1.5 transition-colors ${gridCols === 6 ? 'bg-brand-500 text-white' : 'text-white/30 hover:text-white/60'}`}>
                <Grid3X3 size={14} />
              </button>
            </div>
          </div>
        </div>

        {/* Section label */}
        <div className="flex items-center gap-2 mb-4">
          <span className="text-white/25 text-xs font-bold uppercase tracking-widest">
            {onlineOnly ? '🟢 En ligne' : '✦ Tous les profils'}
          </span>
          <div className="flex-1 h-px bg-white/5" />
        </div>

        {/* Profile grid */}
        <div className={`grid gap-2.5 ${
          gridCols === 4
            ? 'grid-cols-2 sm:grid-cols-3 md:grid-cols-4'
            : 'grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6'
        }`}>
          {loading
            ? Array.from({ length: 24 }).map((_, i) => <Skeleton key={i} />)
            : sorted.length > 0
              ? sorted.map(p => <ProfileCard key={p.id} profile={p} size={gridCols === 4 ? 'lg' : 'md'} />)
              : (
                <div className="col-span-6 text-center py-24">
                  <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/8 flex items-center justify-center mx-auto mb-4">
                    <Search size={24} className="text-white/20" />
                  </div>
                  <p className="text-white/30 mb-2 text-sm">Aucun profil trouvé</p>
                  <button onClick={resetFilters} className="text-brand-400 text-sm hover:text-brand-300 transition-colors">
                    Réinitialiser les filtres
                  </button>
                </div>
              )
          }
        </div>

        {/* Load more */}
        {!loading && sorted.length > 0 && sorted.length < total && (
          <div className="text-center mt-10">
            <Link
              href="/profiles"
              className="inline-flex items-center gap-2.5 bg-white/5 hover:bg-white/8 border border-white/10 hover:border-white/20 text-white/60 hover:text-white font-medium px-8 py-3.5 rounded-xl transition-all text-sm">
              Voir les {(total - sorted.length).toLocaleString()} autres profils
              <ChevronRight size={14} />
            </Link>
          </div>
        )}

        {/* Bottom CTA - for non-auth */}
        {!isAuthenticated && !loading && (
          <div className="mt-12 rounded-2xl bg-gradient-to-br from-brand-900/30 to-[#111] border border-brand-500/20 p-8 text-center">
            <p className="text-white/50 text-xs uppercase tracking-widest font-bold mb-3">Plateforme Afrodite</p>
            <h3 className="font-display text-2xl font-bold text-white mb-2">Créez votre profil gratuitement</h3>
            <p className="text-white/40 text-sm mb-6 max-w-md mx-auto">
              Rejoignez des milliers de profils vérifiés. Visibilité immédiate, messages illimités avec Premium.
            </p>
            <div className="flex items-center justify-center gap-3">
              <Link href="/auth/register" className="bg-brand-500 hover:bg-brand-400 text-white font-semibold px-6 py-2.5 rounded-xl text-sm transition-all shadow-md shadow-brand-500/25">
                Créer mon profil
              </Link>
              <Link href="/tarifs" className="border border-white/15 text-white/60 hover:text-white hover:border-white/30 font-medium px-6 py-2.5 rounded-xl text-sm transition-all">
                Voir les tarifs
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
