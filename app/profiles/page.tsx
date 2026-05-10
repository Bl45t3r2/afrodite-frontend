'use client';
import { useState, useEffect, useCallback } from 'react';
import { Search, SlidersHorizontal, MapPin, X, Map, LayoutGrid, Tag, TrendingUp } from 'lucide-react';
import api from '@/lib/api';
import ProfileCard from '@/components/profile/ProfileCard';
import dynamic from 'next/dynamic';

const CityMap = dynamic(() => import('@/components/profile/CityMap'), { ssr: false });

const CITIES = ['Cotonou', 'Porto-Novo', 'Lomé', 'Abidjan', 'Dakar', 'Accra', 'Lagos', 'Douala'];
const CATEGORIES = ['Escorte', 'Massage', 'Compagnie', 'VIP', 'Agence'];

export default function ProfilesPage() {
  const [profiles, setProfiles] = useState<any[]>([]);
  const [allProfiles, setAllProfiles] = useState<any[]>([]);
  const [popularTags, setPopularTags] = useState<{ tag: string; count: number }[]>([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  const [showMap, setShowMap] = useState(false);
  const [tagInput, setTagInput] = useState('');

  const [filters, setFilters] = useState({
    search: '', city: '', category: '',
    isOnline: false, isVerified: false,
    minPrice: '', maxPrice: '',
    tags: [] as string[],
    radius: '' as string, // km
    userLat: null as number | null,
    userLng: null as number | null,
  });
  const [geoLoading, setGeoLoading] = useState(false);

  const fetchProfiles = useCallback(async () => {
    setLoading(true);
    try {
      const params: any = { page, limit: 12 };
      if (filters.search) params.search = filters.search;
      if (filters.city) params.city = filters.city;
      if (filters.category) params.category = filters.category;
      if (filters.isOnline) params.isOnline = true;
      if (filters.isVerified) params.isVerified = true;
      if (filters.minPrice) params.minPrice = filters.minPrice;
      if (filters.maxPrice) params.maxPrice = filters.maxPrice;
      if (filters.tags.length > 0) params.tags = filters.tags.join(',');
      if (filters.radius) params.radius = filters.radius;
      if (filters.userLat) params.lat = filters.userLat;
      if (filters.userLng) params.lng = filters.userLng;

      const res = await api.get('/profiles', { params });
      setProfiles(res.data.profiles);
      setTotal(res.data.total);
      setTotalPages(res.data.totalPages);
    } catch { setProfiles([]); }
    finally { setLoading(false); }
  }, [page, filters]);

  useEffect(() => { fetchProfiles(); }, [fetchProfiles]);

  useEffect(() => {
    if (showMap) api.get('/profiles', { params: { limit: 200 } }).then(r => setAllProfiles(r.data.profiles)).catch(() => {});
  }, [showMap]);

  useEffect(() => {
    api.get('/profiles/tags/popular').then(r => setPopularTags(r.data)).catch(() => {});
  }, []);

  const updateFilter = (key: string, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setPage(1);
  };

  const addTag = (tag: string) => {
    const t = tag.trim().toLowerCase();
    if (!t || filters.tags.includes(t)) return;
    updateFilter('tags', [...filters.tags, t]);
    setTagInput('');
  };

  const removeTag = (tag: string) => {
    updateFilter('tags', filters.tags.filter(t => t !== tag));
  };

  const locateMe = () => {
    if (!navigator.geolocation) return;
    setGeoLoading(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setFilters(prev => ({ ...prev, userLat: pos.coords.latitude, userLng: pos.coords.longitude, radius: prev.radius || '50' }));
        setPage(1);
        setGeoLoading(false);
      },
      () => { setGeoLoading(false); },
      { timeout: 8000 }
    );
  };

  const resetFilters = () => {
    setFilters({ search: '', city: '', category: '', isOnline: false, isVerified: false, minPrice: '', maxPrice: '', tags: [], radius: '', userLat: null, userLng: null });
    setPage(1);
  };

  const activeFiltersCount = [
    filters.search, filters.city, filters.category,
    filters.isOnline, filters.isVerified, filters.minPrice, filters.maxPrice, filters.radius
  ].filter(v => v && v !== '').length + filters.tags.length;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="font-display text-3xl font-bold text-gray-900 mb-1">Profils</h1>
        <p className="text-gray-400 text-sm">Découvrez des profils vérifiés près de chez vous</p>
      </div>

      {/* Barre de recherche principale */}
      <div className="flex flex-col md:flex-row gap-3 mb-4">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
          <input className="input pl-10" placeholder="Rechercher un profil..."
            value={filters.search} onChange={e => updateFilter('search', e.target.value)} />
        </div>
        <div className="relative">
          <MapPin size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
          <select className="input pl-9 pr-8 w-full md:w-48 appearance-none" value={filters.city}
            onChange={e => updateFilter('city', e.target.value)}>
            <option value="">Toutes les villes</option>
            {CITIES.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
        <button onClick={() => setShowFilters(!showFilters)} className="btn-outline flex items-center gap-2">
          <SlidersHorizontal size={16} />
          Filtres
          {activeFiltersCount > 0 && (
            <span className="bg-brand-400 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">{activeFiltersCount}</span>
          )}
        </button>
        <button onClick={() => setShowMap(!showMap)}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border text-sm font-medium transition-all ${showMap ? 'bg-brand-400 text-white border-brand-400' : 'border-gray-200 text-gray-600 hover:bg-gray-50'}`}>
          {showMap ? <LayoutGrid size={16} /> : <Map size={16} />}
          {showMap ? 'Liste' : 'Carte'}
        </button>
      </div>

      {/* Tags populaires */}
      {popularTags.length > 0 && filters.tags.length === 0 && (
        <div className="flex items-center gap-2 mb-4 flex-wrap">
          <div className="flex items-center gap-1.5 text-xs text-gray-400 shrink-0">
            <TrendingUp size={13} /> Populaires :
          </div>
          {popularTags.slice(0, 10).map(({ tag, count }) => (
            <button key={tag} onClick={() => addTag(tag)}
              className="flex items-center gap-1 text-xs bg-gray-50 hover:bg-brand-50 text-gray-600 hover:text-brand-600 border border-gray-200 hover:border-brand-200 px-3 py-1.5 rounded-full transition-all">
              #{tag}
              <span className="text-gray-300 text-[10px]">{count}</span>
            </button>
          ))}
        </div>
      )}

      {/* Filtres avancés */}
      {showFilters && (
        <div className="card p-6 mb-6 space-y-5">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <label className="text-xs font-medium text-gray-500 mb-2 block">Catégorie</label>
              <select className="input" value={filters.category} onChange={e => updateFilter('category', e.target.value)}>
                <option value="">Toutes</option>
                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs font-medium text-gray-500 mb-2 block">Prix min (FCFA/h)</label>
              <input className="input" type="number" placeholder="0" value={filters.minPrice}
                onChange={e => updateFilter('minPrice', e.target.value)} />
            </div>
            <div>
              <label className="text-xs font-medium text-gray-500 mb-2 block">Prix max (FCFA/h)</label>
              <input className="input" type="number" placeholder="50000" value={filters.maxPrice}
                onChange={e => updateFilter('maxPrice', e.target.value)} />
            </div>
            <div className="flex flex-col justify-end gap-2">
              <label className="flex items-center gap-2 text-sm cursor-pointer">
                <input type="checkbox" checked={filters.isOnline} onChange={e => updateFilter('isOnline', e.target.checked)} className="accent-brand-400" />
                En ligne uniquement
              </label>
              <label className="flex items-center gap-2 text-sm cursor-pointer">
                <input type="checkbox" checked={filters.isVerified} onChange={e => updateFilter('isVerified', e.target.checked)} className="accent-brand-400" />
                Vérifiés uniquement
              </label>
            </div>

            {/* Rayon géographique */}
            <div className="col-span-2 md:col-span-4 border-t border-gray-100 pt-4">
              <label className="text-xs font-medium text-gray-500 mb-3 block flex items-center gap-1.5">
                <MapPin size={12} className="text-brand-400" /> Recherche géographique
              </label>
              <div className="flex flex-wrap items-center gap-3">
                <button
                  onClick={locateMe}
                  disabled={geoLoading}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium border transition-all ${filters.userLat ? 'bg-brand-50 border-brand-300 text-brand-600' : 'bg-white border-gray-200 text-gray-600 hover:border-brand-300'}`}>
                  {geoLoading ? (
                    <span className="w-4 h-4 border-2 border-brand-400 border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <MapPin size={15} className={filters.userLat ? 'text-brand-400' : 'text-gray-400'} />
                  )}
                  {filters.userLat ? 'Position détectée ✓' : 'Utiliser ma position'}
                </button>

                {filters.userLat && (
                  <>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-500">dans un rayon de</span>
                      <select
                        value={filters.radius}
                        onChange={e => { updateFilter('radius', e.target.value); }}
                        className="input py-1.5 text-sm w-28">
                        {['10', '25', '50', '100', '200', '500'].map(r => (
                          <option key={r} value={r}>{r} km</option>
                        ))}
                      </select>
                    </div>
                    <button onClick={() => setFilters(prev => ({ ...prev, userLat: null, userLng: null, radius: '' }))}
                      className="text-xs text-red-400 hover:text-red-600">
                      Effacer position
                    </button>
                  </>
                )}

                {!filters.userLat && filters.city && (
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-400">ou autour de {filters.city} dans</span>
                    <select
                      value={filters.radius}
                      onChange={e => updateFilter('radius', e.target.value)}
                      className="input py-1.5 text-sm w-28">
                      <option value="">Ville exacte</option>
                      {['50', '100', '200', '500'].map(r => (
                        <option key={r} value={r}>{r} km</option>
                      ))}
                    </select>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Recherche par tags */}
          <div>
            <label className="text-xs font-medium text-gray-500 mb-2 block flex items-center gap-1.5">
              <Tag size={12} /> Filtrer par tags
            </label>

            {/* Tags sélectionnés */}
            {filters.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-3">
                {filters.tags.map(tag => (
                  <span key={tag} className="flex items-center gap-1 bg-brand-400 text-white text-xs font-medium px-3 py-1.5 rounded-full">
                    #{tag}
                    <button onClick={() => removeTag(tag)} className="ml-1 opacity-70 hover:opacity-100">×</button>
                  </span>
                ))}
              </div>
            )}

            {/* Input tag */}
            <div className="flex gap-2 mb-3">
              <div className="relative flex-1">
                <Tag size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input className="input pl-9 text-sm" placeholder="Ex: massage, vip, discret..."
                  value={tagInput}
                  onChange={e => setTagInput(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addTag(tagInput); } }} />
              </div>
              <button onClick={() => addTag(tagInput)} className="btn-outline text-sm px-4">Ajouter</button>
            </div>

            {/* Tags populaires dans les filtres */}
            {popularTags.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                <span className="text-xs text-gray-400 self-center mr-1">Suggestions :</span>
                {popularTags.filter(({ tag }) => !filters.tags.includes(tag)).slice(0, 12).map(({ tag }) => (
                  <button key={tag} onClick={() => addTag(tag)}
                    className="text-xs text-gray-500 bg-gray-50 hover:bg-brand-50 hover:text-brand-600 border border-gray-200 hover:border-brand-200 px-2.5 py-1 rounded-full transition-all">
                    +{tag}
                  </button>
                ))}
              </div>
            )}
          </div>

          {activeFiltersCount > 0 && (
            <button onClick={resetFilters} className="flex items-center gap-1 text-sm text-red-500 hover:text-red-600">
              <X size={14} /> Réinitialiser tous les filtres
            </button>
          )}
        </div>
      )}

      {/* Tags actifs (hors filtre ouvert) */}
      {!showFilters && filters.tags.length > 0 && (
        <div className="flex items-center gap-2 mb-4 flex-wrap">
          <span className="text-xs text-gray-400">Tags actifs :</span>
          {filters.tags.map(tag => (
            <span key={tag} className="flex items-center gap-1 bg-brand-400 text-white text-xs font-medium px-3 py-1.5 rounded-full">
              #{tag}
              <button onClick={() => removeTag(tag)} className="ml-1 opacity-70 hover:opacity-100">×</button>
            </span>
          ))}
          <button onClick={() => updateFilter('tags', [])} className="text-xs text-red-400 hover:text-red-600">Effacer</button>
        </div>
      )}

      {/* Carte */}
      {showMap && (
        <div className="mb-8">
          <CityMap profiles={allProfiles} selectedCity={filters.city}
            onCityClick={(city) => { updateFilter('city', city); setShowMap(false); }} />
          <p className="text-xs text-gray-400 text-center mt-2">Cliquez sur une ville pour filtrer</p>
        </div>
      )}

      {/* Résultats */}
      <p className="text-sm text-gray-500 mb-6">
        {loading ? 'Chargement...' : `${total} profil${total > 1 ? 's' : ''} trouvé${total > 1 ? 's' : ''}`}
        {filters.city && <span className="ml-2 text-brand-400 font-medium">· {filters.city}</span>}
        {filters.tags.length > 0 && <span className="ml-2 text-brand-400 font-medium">· #{filters.tags.join(' #')}</span>}
      </p>

      {/* Grille */}
      {loading ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="card aspect-[3/4] animate-pulse bg-gray-100 rounded-2xl" />
          ))}
        </div>
      ) : profiles.length === 0 ? (
        <div className="text-center py-24">
          <p className="text-2xl mb-2">😕</p>
          <p className="text-gray-500">Aucun profil trouvé avec ces critères.</p>
          <button onClick={resetFilters} className="btn-primary mt-4">Effacer les filtres</button>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
          {profiles.map(profile => <ProfileCard key={profile.id} profile={profile} />)}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center gap-2 mt-10">
          <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="btn-outline disabled:opacity-40">Précédent</button>
          {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
            const p = page <= 3 ? i + 1 : page - 2 + i;
            return p <= totalPages ? (
              <button key={p} onClick={() => setPage(p)}
                className={p === page ? 'btn-primary w-10 h-10 p-0 text-center' : 'btn-outline w-10 h-10 p-0 text-center'}>
                {p}
              </button>
            ) : null;
          })}
          <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="btn-outline disabled:opacity-40">Suivant</button>
        </div>
      )}
    </div>
  );
}
