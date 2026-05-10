'use client';
import Link from 'next/link';
import Image from 'next/image';
import { MapPin, Star, Heart, Play, Shield, Flame, Clock } from 'lucide-react';
import { useState } from 'react';
import api from '@/lib/api';
import useAuthStore from '@/lib/store';
import toast from 'react-hot-toast';
import clsx from 'clsx';

interface Props {
  profile: {
    id: string;
    displayName: string;
    age: number;
    city: string;
    pricePerHour?: number;
    isOnline: boolean;
    isVerified: boolean;
    categories: string[];
    photos: { url: string; isMain?: boolean }[];
    videos?: { url: string; thumbnailUrl?: string; isMain?: boolean; duration?: number }[];
    _count?: { reviews: number; favoritedBy: number };
    boosts?: any[];
    distance?: number | null;
    reviews?: { rating: number }[];
  };
  variant?: 'default' | 'compact' | 'featured';
}

export default function ProfileCard({ profile, variant = 'default' }: Props) {
  const { isAuthenticated } = useAuthStore();
  const [favorited, setFavorited] = useState(false);
  const [hovering, setHovering] = useState(false);

  const mainPhoto = profile.photos?.find(p => p.isMain) || profile.photos?.[0];
  const mainVideo = profile.videos?.find(v => v.isMain) || profile.videos?.[0];
  const hasVideo = !!mainVideo;
  const isBoosted = (profile.boosts?.length ?? 0) > 0;
  const avgRating = profile.reviews?.length
    ? (profile.reviews.reduce((s, r) => s + r.rating, 0) / profile.reviews.length).toFixed(1)
    : null;

  const toggleFavorite = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isAuthenticated) { toast.error('Connectez-vous pour ajouter aux favoris'); return; }
    try {
      const res = await api.post(`/profiles/${profile.id}/favorite`);
      setFavorited(res.data.favorited);
      toast.success(res.data.favorited ? '❤️ Ajouté aux favoris' : 'Retiré des favoris');
    } catch {
      toast.error('Erreur');
    }
  };

  const isFeatured = variant === 'featured' || isBoosted;

  return (
    <Link
      href={`/profiles/${profile.id}`}
      className={clsx(
        'group relative flex flex-col rounded-xl overflow-hidden border transition-all duration-300',
        'hover:-translate-y-1 hover:shadow-2xl',
        isFeatured
          ? 'border-brand-500/40 bg-[#1a1510] hover:border-brand-400/60 hover:shadow-brand-500/15'
          : 'border-white/8 bg-[#181818] hover:border-white/20 hover:shadow-black/50'
      )}
      onMouseEnter={() => setHovering(true)}
      onMouseLeave={() => setHovering(false)}
    >
      {/* Featured glow strip */}
      {isFeatured && (
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-brand-400/80 to-transparent" />
      )}

      {/* Media block */}
      <div className={clsx(
        'relative overflow-hidden bg-[#0d0d0d]',
        variant === 'compact' ? 'aspect-[4/5]' : 'aspect-[3/4]'
      )}>

        {/* Photo */}
        {mainPhoto && (
          <Image
            src={mainPhoto.url}
            alt={profile.displayName}
            fill
            className={clsx(
              'object-cover object-top transition-all duration-700',
              hasVideo && hovering ? 'opacity-0 scale-110' : 'opacity-100 group-hover:scale-105'
            )}
          />
        )}

        {/* Fallback avatar */}
        {!mainPhoto && !hasVideo && (
          <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-brand-900/20 to-[#0d0d0d]">
            <span className="font-display text-6xl font-bold text-brand-400/30">
              {profile.displayName[0]}
            </span>
          </div>
        )}

        {/* Video overlay */}
        {hasVideo && (
          <div className={clsx('absolute inset-0 transition-opacity duration-500',
            mainPhoto ? (hovering ? 'opacity-100' : 'opacity-0') : 'opacity-100')}>
            {mainVideo?.thumbnailUrl && (
              <img src={mainVideo.thumbnailUrl} alt="" className="w-full h-full object-cover" />
            )}
            <div className="absolute inset-0 flex items-center justify-center bg-black/30">
              <div className={clsx(
                'w-12 h-12 rounded-full bg-white/15 backdrop-blur border border-white/30 flex items-center justify-center transition-all duration-300',
                hovering ? 'scale-110 bg-white/25' : 'scale-100'
              )}>
                <Play size={18} className="text-white ml-0.5" fill="currentColor" />
              </div>
            </div>
            {mainVideo?.duration && (
              <span className="absolute bottom-10 right-2 bg-black/60 backdrop-blur text-white text-[10px] px-1.5 py-0.5 rounded font-medium">
                {Math.floor(mainVideo.duration / 60)}:{String(Math.floor(mainVideo.duration % 60)).padStart(2, '0')}
              </span>
            )}
          </div>
        )}

        {/* Dark gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />

        {/* Top badges */}
        <div className="absolute top-2.5 left-2.5 flex flex-col gap-1">
          {isBoosted && (
            <span className="flex items-center gap-1 bg-brand-500 text-white text-[9px] font-black px-2 py-1 rounded-full shadow-md shadow-brand-500/40 uppercase tracking-wide">
              <Flame size={8} /> VIP
            </span>
          )}
          {profile.isVerified && (
            <span className="flex items-center gap-1 bg-emerald-500 text-white text-[9px] font-bold px-2 py-1 rounded-full shadow-md">
              <Shield size={8} /> Vérifié
            </span>
          )}
          {hasVideo && mainPhoto && (
            <span className="flex items-center gap-1 bg-black/60 backdrop-blur text-white text-[9px] font-medium px-2 py-1 rounded-full">
              <Play size={7} fill="currentColor" /> Vidéo
            </span>
          )}
        </div>

        {/* Online indicator */}
        <div className="absolute top-2.5 right-2.5 flex items-center gap-1.5">
          {profile.isOnline && (
            <span className="flex items-center gap-1 bg-black/50 backdrop-blur text-emerald-400 text-[9px] font-semibold px-2 py-1 rounded-full">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              En ligne
            </span>
          )}
        </div>

        {/* Favorite button */}
        <button
          onClick={toggleFavorite}
          className={clsx(
            'absolute bottom-[72px] right-2.5 w-8 h-8 rounded-full flex items-center justify-center backdrop-blur border transition-all duration-200',
            'opacity-0 group-hover:opacity-100 translate-y-1 group-hover:translate-y-0',
            favorited
              ? 'bg-brand-500 border-brand-400 text-white'
              : 'bg-black/50 border-white/20 text-white/70 hover:text-brand-400 hover:border-brand-400/50'
          )}>
          <Heart size={13} fill={favorited ? 'currentColor' : 'none'} />
        </button>

        {/* Bottom info */}
        <div className="absolute bottom-0 left-0 right-0 p-3">
          <div className="flex items-end justify-between gap-2">
            <div className="min-w-0">
              <p className="text-white font-bold text-sm leading-tight truncate">
                {profile.displayName}
                {profile.age && <span className="text-white/40 font-normal text-xs ml-1.5">{profile.age} ans</span>}
              </p>
              <div className="flex items-center gap-1.5 mt-0.5">
                <MapPin size={9} className="text-brand-400 shrink-0" />
                <span className="text-white/50 text-[10px] truncate">{profile.city}</span>
                {profile.distance != null && (
                  <span className="text-white/30 text-[9px]">· {profile.distance}km</span>
                )}
                {avgRating && (
                  <>
                    <span className="text-white/20">·</span>
                    <Star size={8} className="text-amber-400 fill-amber-400 shrink-0" />
                    <span className="text-white/50 text-[10px]">{avgRating}</span>
                  </>
                )}
              </div>
            </div>
            {profile.pricePerHour && (
              <div className="shrink-0 text-right">
                <p className="text-brand-300 text-xs font-bold leading-tight">{Number(profile.pricePerHour).toLocaleString()}</p>
                <p className="text-white/25 text-[9px]">FCFA/h</p>
              </div>
            )}
          </div>

          {/* Category tags */}
          {profile.categories?.length > 0 && (
            <div className="flex gap-1 mt-2 flex-wrap">
              {profile.categories.slice(0, 2).map((c: string) => (
                <span key={c} className="text-[9px] bg-white/8 hover:bg-white/12 text-white/40 px-2 py-0.5 rounded-full transition-colors">
                  {c}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
    </Link>
  );
}
