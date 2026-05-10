'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import useAuthStore from '@/lib/store';
import ProfileCard from '@/components/profile/ProfileCard';
import { Heart } from 'lucide-react';

export default function FavoritesPage() {
  const { isAuthenticated } = useAuthStore();
  const router = useRouter();
  const [favorites, setFavorites] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated) { router.push('/auth/login'); return; }
    api.get('/profiles/favorites')
      .then(res => { setFavorites(res.data); setLoading(false); })
      .catch(() => setLoading(false));
  }, [isAuthenticated]);

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <h1 className="font-display text-2xl font-bold text-gray-900 mb-8 flex items-center gap-2">
        <Heart size={22} className="text-brand-400" fill="currentColor" /> Mes favoris
      </h1>

      {loading ? (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
          {Array.from({ length: 4 }).map((_, i) => <div key={i} className="card aspect-[3/4] animate-pulse bg-gray-100" />)}
        </div>
      ) : favorites.length === 0 ? (
        <div className="text-center py-24">
          <Heart size={48} className="mx-auto mb-4 text-gray-200" fill="currentColor" />
          <p className="text-gray-500 mb-4">Vous n'avez pas encore de favoris.</p>
          <button onClick={() => router.push('/profiles')} className="btn-primary">Parcourir les profils</button>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
          {favorites.map(profile => <ProfileCard key={profile.id} profile={profile} />)}
        </div>
      )}
    </div>
  );
}
