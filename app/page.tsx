'use client';
import Link from 'next/link';
import { Search, MapPin, Flame, Shield, Star, SlidersHorizontal, X, Grid3X3, Rows3, ChevronRight, ArrowRight, Users, CheckCircle, Zap, Crown, Eye, MessageCircle, TrendingUp } from 'lucide-react';
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
    <Link href={`/profiles/${profile.id}`}
      className={`group relative flex flex-col rounded-xl overflow-hidden border transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl ${
        isBoosted ? 'border-brand-500/40 bg-[#1a1510] hover:border-brand-400/60 hover:shadow-brand-500/15'
          : 'border-white/8 bg-[#181818] hover:border-white/18 hover:shadow-black/50'}`}>
      {isBoosted && <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-brand-400/70 to-transparent z-10" />}
      <div className={`relative overflow-hidden bg-[#0d0d0d] ${size === 'lg' ? 'aspect-[3/4]' : 'aspect-[3/4]'}`}>
        {photo ? (
          <img src={photo.url} alt={profile.displayName} className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-700" />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center overflow-hidden"
            style={{ background: `linear-gradient(135deg, ${['#1a0f2e','#0f1a2e','#1a1a0f','#2e0f1a','#0f2e1a','#1a0f0f'][(profile.displayName?.charCodeAt(0) || 0) % 6]} 0%, #0d0d0d 100%)` }}>
            <div style={{ position:'absolute', width:'180px', height:'180px', borderRadius:'50%', background:'radial-gradient(circle, rgba(212,83,126,0.2), transparent)', top:'-30px', right:'-30px' }} />
            <div style={{ position:'absolute', width:'120px', height:'120px', borderRadius:'50%', background:'radial-gradient(circle, rgba(212,83,126,0.15), transparent)', bottom:'-20px', left:'-20px' }} />
            <div style={{ width:'72px', height:'72px', borderRadius:'16px', background:'linear-gradient(135deg, rgba(212,83,126,0.5), rgba(153,53,86,0.7))', border:'1.5px solid rgba(212,83,126,0.4)', boxShadow:'0 8px 24px rgba(212,83,126,0.3)', display:'flex', alignItems:'center', justifyContent:'center', marginBottom:'8px' }}>
              <span style={{ fontFamily:'serif', fontSize:'32px', fontWeight:'700', color:'rgba(255,255,255,0.95)' }}>
                {profile.displayName?.[0]?.toUpperCase()}
              </span>
            </div>
            <p style={{ color:'rgba(255,255,255,0.5)', fontSize:'11px', fontWeight:'500', textAlign:'center', padding:'0 12px', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap', width:'100%' }}>
              {profile.displayName}
            </p>
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/15 to-transparent" />
        <div className="absolute top-2.5 left-2.5 flex flex-col gap-1">
          {isBoosted && <span className="flex items-center gap-1 bg-brand-500 text-white text-[9px] font-black px-2 py-0.5 rounded-full shadow-md uppercase tracking-wide"><Flame size={7} /> VIP</span>}
          {isVerified && <span className="flex items-center gap-1 bg-emerald-900/200/90 text-white text-[9px] font-bold px-2 py-0.5 rounded-full shadow-md"><Shield size={7} /> Vérifié</span>}
        </div>
        {isOnline && (
          <div className="absolute top-2.5 right-2.5">
            <span className="flex items-center gap-1 bg-black/50 backdrop-blur text-emerald-400 text-[9px] font-semibold px-2 py-0.5 rounded-full">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" /> En ligne
            </span>
          </div>
        )}
        <div className="absolute bottom-0 left-0 right-0 p-3">
          <p className="text-white font-bold text-sm leading-tight truncate">
            {profile.displayName}
            {profile.age && <span className="text-white/40 font-normal text-xs ml-1">{profile.age} ans</span>}
          </p>
          <div className="flex items-center gap-1.5 mt-0.5">
            <MapPin size={9} className="text-brand-400 shrink-0" />
            <span className="text-white/50 text-[10px] truncate">{profile.city}</span>
            {avgRating && <><span className="text-white/20">·</span><Star size={8} className="text-amber-400 fill-amber-400 shrink-0" /><span className="text-white/50 text-[10px]">{avgRating}</span></>}
          </div>
          {profile.pricePerHour && (
            <p className="text-brand-300 text-xs font-bold mt-1">{Number(profile.pricePerHour).toLocaleString()} <span className="text-white/25 font-normal">FCFA/h</span></p>
          )}
        </div>
      </div>
    </Link>
  );
}

function Skeleton() {
  return <div className="rounded-xl overflow-hidden bg-white/4 border border-white/5 aspect-[3/4] animate-pulse" />;
}
function FilterPill({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button onClick={onClick} className={`text-xs px-3.5 py-1.5 rounded-full border transition-all whitespace-nowrap shrink-0 font-medium ${
      active ? 'bg-brand-500 border-brand-500 text-white shadow-md shadow-brand-500/25'
        : 'border-white/10 text-white/40 hover:text-white/70 hover:border-white/20 bg-white/3'}`}>
      {label}
    </button>
  );
}

export default function HomePage() {
  const { isAuthenticated } = useAuthStore();
  const [profiles, setProfiles] = useState<any[]>([]);
  const [boosted, setBoosted] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [onlineCount, setOnlineCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [city, setCity] = useState('');
  const [category, setCategory] = useState('');
  const [onlineOnly, setOnlineOnly] = useState(false);
  const [verifiedOnly, setVerifiedOnly] = useState(false);
  const [ageFilter, setAgeFilter] = useState('');
  const [sortBy, setSortBy] = useState<'default' | 'online' | 'new' | 'rating'>('default');
  const [gridCols, setGridCols] = useState(4);
  const [showFilters, setShowFilters] = useState(false);
  const [showLanding, setShowLanding] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const params: any = { limit: 48 };
      if (city) params.city = city;
      if (category) params.category = category;
      if (onlineOnly) params.isOnline = true;
      if (verifiedOnly) params.isVerified = true;
      if (search) params.search = search;
      if (ageFilter) { const [min, max] = ageFilter.replace('+','').split('-'); params.ageMin = min; params.ageMax = max || 99; }
      const res = await api.get('/profiles', { params });
      const all = res.data.profiles || res.data;
      const tot = res.data.total || all.length;
      const online = all.filter((p: any) => p.isOnline).length;
      const vip = all.filter((p: any) => p.boosts?.length > 0);
      const rest = all.filter((p: any) => !p.boosts?.length);
      setBoosted(vip);
      setProfiles(rest);
      setTotal(tot);
      setOnlineCount(online);
    } catch { } finally { setLoading(false); }
  }, [city, category, onlineOnly, verifiedOnly, search, ageFilter]);

  useEffect(() => { load(); }, [load]);

  const doSearch = (e: React.FormEvent) => { e.preventDefault(); setShowLanding(false); load(); };
  const resetFilters = () => { setCity(''); setCategory(''); setOnlineOnly(false); setVerifiedOnly(false); setAgeFilter(''); setSearch(''); };
  const activeFilterCount = [city, category, onlineOnly, verifiedOnly, ageFilter].filter(Boolean).length;

  const sorted = [...profiles].sort((a, b) => {
    if (sortBy === 'online') return (b.isOnline ? 1 : 0) - (a.isOnline ? 1 : 0);
    if (sortBy === 'new') return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    if (sortBy === 'rating') {
      const ra = a.reviews?.length ? a.reviews.reduce((s: number, r: any) => s + r.rating, 0) / a.reviews.length : 0;
      const rb = b.reviews?.length ? b.reviews.reduce((s: number, r: any) => s + r.rating, 0) / b.reviews.length : 0;
      return rb - ra;
    }
    return 0;
  });

  return (
    <div className="min-h-screen bg-[#0f0f0f]">

      {/* ══════════ HERO LANDING ══════════ */}
      <div className="relative overflow-hidden bg-[#0a0a0a]">
        {/* Glow effects */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[500px] bg-brand-500/6 blur-[140px] rounded-full" />
          <div className="absolute bottom-0 right-1/4 w-[400px] h-[300px] bg-purple-900/200/4 blur-[100px] rounded-full" />
          <div className="absolute top-1/2 left-0 w-[200px] h-[400px] bg-brand-400/3 blur-[80px] rounded-full" />
        </div>

        <div className="relative max-w-6xl mx-auto px-4 pt-16 pb-12">
          {/* Badge */}
          <div className="flex justify-center mb-8">
            <div className="flex items-center gap-2 bg-brand-500/10 border border-brand-500/25 text-brand-300 text-xs font-semibold px-4 py-2 rounded-full">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              {onlineCount.toLocaleString()} profils en ligne · Afrique de l&apos;Ouest
            </div>
          </div>

          {/* Headline */}
          <h1 className="font-display text-4xl sm:text-5xl md:text-6xl font-bold text-white text-center mb-5 leading-tight">
            Découvrez des profils
            <br />
            <span className="bg-gradient-to-r from-brand-400 via-pink-400 to-brand-300 bg-clip-text text-transparent">
              vérifiés près de vous
            </span>
          </h1>
          <p className="text-white/40 text-base md:text-lg text-center mb-10 max-w-2xl mx-auto leading-relaxed">
            La plateforme de référence en Afrique de l&apos;Ouest. Des profils authentiques, des disponibilités en temps réel, une expérience sécurisée.
          </p>

          {/* Search bar */}
          <form onSubmit={doSearch} className="flex gap-2 max-w-2xl mx-auto mb-6">
            <div className="flex-1 relative">
              <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30 pointer-events-none" />
              <input type="text" value={search} onChange={e => setSearch(e.target.value)}
                placeholder="Rechercher un profil, une ville…"
                className="w-full bg-white/6 border border-white/12 rounded-xl pl-11 pr-4 py-3.5 text-sm text-white placeholder:text-white/25 focus:outline-none focus:border-brand-500/60 focus:bg-white/8 transition-all" />
            </div>
            <select value={city} onChange={e => setCity(e.target.value)}
              className="bg-white/6 border border-white/12 rounded-xl px-4 py-3.5 text-sm text-white/60 focus:outline-none focus:border-brand-500/60 transition-all hidden sm:block">
              <option value="">Toutes les villes</option>
              {CITIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
            <button type="submit" className="bg-brand-500 hover:bg-brand-400 text-white text-sm font-semibold px-6 py-3.5 rounded-xl transition-all shadow-lg shadow-brand-500/30 shrink-0">
              Rechercher
            </button>
          </form>

          {/* City pills */}
          <div className="flex items-center justify-center gap-2 flex-wrap mb-10">
            {CITIES.slice(0, 6).map(c => (
              <button key={c} onClick={() => { setCity(city === c ? '' : c); setShowLanding(false); }}
                className={`text-xs px-3.5 py-1.5 rounded-full border transition-all font-medium ${
                  city === c ? 'bg-brand-500/20 border-brand-500/50 text-brand-300' : 'border-white/10 text-white/35 hover:text-white/70 hover:border-white/20'}`}>
                {c}
              </button>
            ))}
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 max-w-lg mx-auto">
            {[
              { value: total.toLocaleString() + '+', label: 'Profils vérifiés' },
              { value: '10', label: 'Villes couvertes' },
              { value: '100%', label: 'Sécurisé' },
            ].map(s => (
              <div key={s.label} className="text-center">
                <div className="font-display text-2xl font-bold text-white mb-0.5">{s.value}</div>
                <div className="text-white/30 text-xs">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ══════════ COMMENT ÇA MARCHE (pour non-connectés) ══════════ */}
      {!isAuthenticated && showLanding && (
        <div className="bg-[#0d0d0d] border-y border-white/5 py-16 px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="font-display text-2xl md:text-3xl font-bold text-white text-center mb-2">Comment ça marche</h2>
            <p className="text-white/35 text-sm text-center mb-12">Simple, rapide et sécurisé</p>
            <div className="grid md:grid-cols-3 gap-6">
              {[
                { icon: Search, step: '01', title: 'Parcourez les profils', desc: 'Filtrez par ville, catégorie, disponibilité. Trouvez le profil idéal en quelques secondes.', color: 'from-brand-500 to-pink-500' },
                { icon: MessageCircle, step: '02', title: 'Contactez directement', desc: 'Envoyez un message sécurisé. Discutez des détails et convenez d\'un rendez-vous.', color: 'from-purple-500 to-brand-500' },
                { icon: CheckCircle, step: '03', title: 'Profitez en toute sécurité', desc: 'Tous les profils sont vérifiés manuellement. Votre expérience est garantie.', color: 'from-emerald-500 to-brand-500' },
              ].map(({ icon: Icon, step, title, desc, color }) => (
                <div key={step} className="relative bg-white/3 border border-white/8 rounded-2xl p-6 hover:border-white/15 transition-all">
                  <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${color} flex items-center justify-center mb-4 shadow-lg`}>
                    <Icon size={20} className="text-white" />
                  </div>
                  <div className="text-white/10 font-display text-5xl font-bold absolute top-4 right-5">{step}</div>
                  <h3 className="font-semibold text-white mb-2">{title}</h3>
                  <p className="text-white/40 text-sm leading-relaxed">{desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ══════════ AVANTAGES (pour non-connectés) ══════════ */}
      {!isAuthenticated && showLanding && (
        <div className="py-16 px-4">
          <div className="max-w-5xl mx-auto">
            <div className="grid md:grid-cols-2 gap-8 items-center">
              <div>
                <span className="text-brand-400 text-xs font-bold uppercase tracking-widest mb-3 block">Pourquoi Afrodite</span>
                <h2 className="font-display text-2xl md:text-3xl font-bold text-white mb-6 leading-tight">
                  La plateforme la plus sûre<br />d&apos;Afrique de l&apos;Ouest
                </h2>
                <div className="space-y-4">
                  {[
                    { icon: Shield, title: 'Profils 100% vérifiés', desc: 'Chaque profil est vérifié manuellement par notre équipe avant publication.' },
                    { icon: Eye, title: 'Discrétion garantie', desc: 'Votre confidentialité est notre priorité. Paiements et données sécurisés.' },
                    { icon: Zap, title: 'Disponibilités en temps réel', desc: 'Voyez qui est disponible maintenant et réservez instantanément.' },
                    { icon: Crown, title: 'Premium & VIP', desc: 'Accès aux profils exclusifs avec l\'abonnement Premium pour une expérience unique.' },
                  ].map(({ icon: Icon, title, desc }) => (
                    <div key={title} className="flex items-start gap-4">
                      <div className="w-9 h-9 rounded-xl bg-brand-500/15 border border-brand-500/20 flex items-center justify-center shrink-0 mt-0.5">
                        <Icon size={15} className="text-brand-400" />
                      </div>
                      <div>
                        <p className="text-white text-sm font-semibold mb-0.5">{title}</p>
                        <p className="text-white/35 text-xs leading-relaxed">{desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="bg-gradient-to-br from-brand-900/30 to-[#111] border border-brand-500/20 rounded-2xl p-8 text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-brand-500 to-pink-500 rounded-2xl flex items-center justify-center mx-auto mb-5 shadow-lg shadow-brand-500/30">
                  <Flame size={28} className="text-white" />
                </div>
                <h3 className="font-display text-xl font-bold text-white mb-2">Créez votre profil</h3>
                <p className="text-white/40 text-sm mb-6 leading-relaxed">Rejoignez des milliers de profils vérifiés. Visibilité immédiate, totalement gratuit.</p>
                <div className="space-y-3">
                  <Link href="/auth/register" className="block w-full bg-brand-500 hover:bg-brand-400 text-white font-semibold py-3 rounded-xl text-sm transition-all shadow-md shadow-brand-500/25">
                    Créer mon profil gratuitement
                  </Link>
                  <Link href="/tarifs" className="block w-full border border-white/15 text-white/60 hover:text-white hover:border-white/30 font-medium py-3 rounded-xl text-sm transition-all">
                    Voir les tarifs Premium
                  </Link>
                </div>
                <p className="text-white/20 text-xs mt-4">✓ Gratuit · ✓ Sécurisé · ✓ Sans engagement</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ══════════ VILLES (pour non-connectés) ══════════ */}
      {!isAuthenticated && showLanding && (
        <div className="bg-[#0d0d0d] border-y border-white/5 py-16 px-4">
          <div className="max-w-5xl mx-auto">
            <h2 className="font-display text-2xl font-bold text-white text-center mb-2">Explorez par ville</h2>
            <p className="text-white/35 text-sm text-center mb-10">Des profils vérifiés dans les grandes villes d&apos;Afrique de l&apos;Ouest</p>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
              {CITIES.slice(0, 10).map(c => (
                <Link key={c} href={`/profiles?city=${c}`}
                  className="group flex flex-col items-center gap-2 bg-white/3 border border-white/8 rounded-xl p-4 hover:border-brand-500/30 hover:bg-brand-500/5 transition-all">
                  <MapPin size={18} className="text-brand-400 group-hover:scale-110 transition-transform" />
                  <span className="text-white/70 text-sm font-medium group-hover:text-white transition-colors">{c}</span>
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ══════════ FILTER BAR ══════════ */}
      <div className="bg-[#111] border-b border-white/6 sticky top-16 z-30">
        <div className="max-w-[1600px] mx-auto px-4">
          <div className="flex items-center gap-2 py-2.5 overflow-x-auto scrollbar-none">
            <FilterPill label="🔥 Tous" active={!city && !onlineOnly && !verifiedOnly && !category} onClick={() => { resetFilters(); setShowLanding(true); }} />
            <FilterPill label="🟢 En ligne" active={onlineOnly} onClick={() => { setOnlineOnly(o => !o); setShowLanding(false); }} />
            <FilterPill label="✓ Vérifiés" active={verifiedOnly} onClick={() => { setVerifiedOnly(v => !v); setShowLanding(false); }} />
            <div className="w-px h-4 bg-white/10 shrink-0 mx-1" />
            {CITIES.slice(0, 5).map(c => (
              <FilterPill key={c} label={c} active={city === c} onClick={() => { setCity(city === c ? '' : c); setShowLanding(false); }} />
            ))}
            <div className="w-px h-4 bg-white/10 shrink-0 mx-1" />
            {CATEGORIES.slice(0, 4).map(cat => (
              <FilterPill key={cat} label={cat} active={category === cat} onClick={() => { setCategory(category === cat ? '' : cat); setShowLanding(false); }} />
            ))}
            <button onClick={() => setShowFilters(f => !f)}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold border transition-all whitespace-nowrap shrink-0 ${
                showFilters || activeFilterCount > 0 ? 'bg-brand-500/15 border-brand-500/40 text-brand-300' : 'border-white/10 text-white/40 hover:border-white/25 bg-white/3'}`}>
              <SlidersHorizontal size={11} />
              Filtres avancés
              {activeFilterCount > 0 && <span className="w-4 h-4 bg-brand-500 text-white rounded-full text-[9px] font-black flex items-center justify-center">{activeFilterCount}</span>}
            </button>
          </div>
        </div>
      </div>

      {/* Advanced filters */}
      {showFilters && (
        <div className="bg-[#111] border-b border-white/8">
          <div className="max-w-[1600px] mx-auto px-4 py-5">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
              <div>
                <label className="text-[10px] text-white/30 uppercase tracking-widest font-bold mb-2 block">Ville</label>
                <div className="flex flex-wrap gap-1.5">
                  {CITIES.map(c => (
                    <button key={c} onClick={() => { setCity(city === c ? '' : c); setShowLanding(false); }}
                      className={`text-[11px] px-2.5 py-1 rounded-lg border transition-all ${city === c ? 'bg-brand-500 border-brand-500 text-white' : 'border-white/10 text-white/40 hover:border-white/20 bg-white/3'}`}>{c}</button>
                  ))}
                </div>
              </div>
              <div>
                <label className="text-[10px] text-white/30 uppercase tracking-widest font-bold mb-2 block">Catégorie</label>
                <div className="flex flex-wrap gap-1.5">
                  {CATEGORIES.map(cat => (
                    <button key={cat} onClick={() => { setCategory(category === cat ? '' : cat); setShowLanding(false); }}
                      className={`text-[11px] px-2.5 py-1 rounded-lg border transition-all ${category === cat ? 'bg-brand-500 border-brand-500 text-white' : 'border-white/10 text-white/40 hover:border-white/20 bg-white/3'}`}>{cat}</button>
                  ))}
                </div>
              </div>
              <div>
                <label className="text-[10px] text-white/30 uppercase tracking-widest font-bold mb-2 block">Âge</label>
                <div className="flex flex-wrap gap-1.5">
                  {AGES.map(a => (
                    <button key={a} onClick={() => setAgeFilter(ageFilter === a ? '' : a)}
                      className={`text-[11px] px-2.5 py-1 rounded-lg border transition-all ${ageFilter === a ? 'bg-brand-500 border-brand-500 text-white' : 'border-white/10 text-white/40 hover:border-white/20 bg-white/3'}`}>{a}</button>
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
              <button onClick={() => { load(); setShowFilters(false); setShowLanding(false); }}
                className="bg-brand-500 hover:bg-brand-400 text-white text-xs font-bold px-6 py-2.5 rounded-lg transition-all">Appliquer</button>
              <button onClick={resetFilters} className="text-xs text-white/30 hover:text-white/60 transition-colors flex items-center gap-1">
                <X size={10} /> Réinitialiser
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ══════════ PROFILS ══════════ */}
      <div className="max-w-[1600px] mx-auto px-4 py-6">
        {boosted.length > 0 && (
          <div className="mb-8">
            <div className="flex items-center justify-between mb-3">
              <span className="flex items-center gap-1.5 text-brand-400 text-xs font-black uppercase tracking-widest">
                <Flame size={11} /> Profils VIP
              </span>
              <Link href="/profiles?boosted=1" className="text-xs text-white/30 hover:text-white/60 flex items-center gap-0.5 transition-colors">
                Voir tout <ArrowRight size={10} />
              </Link>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2.5">
              {boosted.slice(0, 6).map((p: any) => <ProfileCard key={p.id} profile={p} />)}
            </div>
          </div>
        )}

        <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
          <p className="text-white/50 text-sm">
            <span className="text-white font-bold">{total.toLocaleString()}</span> profil{total > 1 ? 's' : ''}
            {(city || category || onlineOnly || verifiedOnly) && <span className="text-white/25 ml-1">· filtrés</span>}
          </p>
          <div className="flex items-center gap-2">
            <select value={sortBy} onChange={e => setSortBy(e.target.value as any)}
              className="bg-white/5 border border-white/10 text-white/50 text-xs px-3 py-1.5 rounded-lg focus:outline-none focus:border-brand-500/50 transition-all">
              <option value="default">Par défaut</option>
              <option value="online">En ligne d'abord</option>
              <option value="new">Nouveaux d'abord</option>
              <option value="rating">Mieux notés</option>
            </select>
            <div className="flex items-center bg-white/5 border border-white/10 rounded-lg overflow-hidden">
              <button onClick={() => setGridCols(4)} className={`p-1.5 transition-colors ${gridCols === 4 ? 'bg-brand-500 text-white' : 'text-white/30 hover:text-white/60'}`}><Rows3 size={14} /></button>
              <button onClick={() => setGridCols(6)} className={`p-1.5 transition-colors ${gridCols === 6 ? 'bg-brand-500 text-white' : 'text-white/30 hover:text-white/60'}`}><Grid3X3 size={14} /></button>
            </div>
          </div>
        </div>

        <div className={`grid gap-2.5 ${gridCols === 4 ? 'grid-cols-2 sm:grid-cols-3 md:grid-cols-4' : 'grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6'}`}>
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
                  <button onClick={resetFilters} className="text-brand-400 text-sm hover:text-brand-300 transition-colors">Réinitialiser les filtres</button>
                </div>
              )}
        </div>

        {!loading && sorted.length > 0 && sorted.length < total && (
          <div className="text-center mt-10">
            <Link href="/profiles" className="inline-flex items-center gap-2.5 bg-white/5 hover:bg-white/8 border border-white/10 hover:border-white/20 text-white/60 hover:text-white font-medium px-8 py-3.5 rounded-xl transition-all text-sm">
              Voir les {(total - sorted.length).toLocaleString()} autres profils <ChevronRight size={14} />
            </Link>
          </div>
        )}

        {/* CTA final */}
        {!isAuthenticated && !loading && (
          <div className="mt-14 rounded-2xl bg-gradient-to-br from-brand-900/40 via-[#111] to-purple-900/20 border border-brand-500/20 p-8 md:p-12 text-center">
            <p className="text-brand-400 text-xs font-bold uppercase tracking-widest mb-3">Rejoignez Afrodite</p>
            <h3 className="font-display text-2xl md:text-3xl font-bold text-white mb-3">Prêt à commencer ?</h3>
            <p className="text-white/40 text-sm mb-8 max-w-md mx-auto">
              Créez votre profil gratuitement et rejoignez des milliers de membres vérifiés. Visibilité immédiate, messages illimités avec Premium.
            </p>
            <div className="flex items-center justify-center gap-3 flex-wrap">
              <Link href="/auth/register" className="bg-brand-500 hover:bg-brand-400 text-white font-semibold px-8 py-3 rounded-xl text-sm transition-all shadow-lg shadow-brand-500/25">
                Créer mon profil — Gratuit
              </Link>
              <Link href="/tarifs" className="border border-white/15 text-white/60 hover:text-white hover:border-white/30 font-medium px-8 py-3 rounded-xl text-sm transition-all">
                Voir les tarifs
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
