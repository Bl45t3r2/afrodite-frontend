'use client';
import { useEffect, useState } from 'react';
import { Copy, Check, Gift, Users, TrendingUp, Clock, Zap } from 'lucide-react';
import api from '@/lib/api';
import toast from 'react-hot-toast';

interface ReferralStats {
  referralCode: string | null;
  referralLink: string;
  totalReferrals: number;
  convertedReferrals: number;
  conversionRate: number;
  pendingRewards: number;
  appliedRewards: number;
  referrals: any[];
  rewards: any[];
}

const REWARD_LABELS: Record<string, string> = {
  FREE_BOOST_DAY: '⚡ 1 jour de boost gratuit',
  FREE_PREMIUM_DAY: '👑 1 jour Premium offert',
  DISCOUNT_PERCENT: '🏷️ Réduction sur abonnement',
  CASH_CREDIT: '💰 Crédit FCFA',
};

export default function ReferralTab() {
  const [stats, setStats] = useState<ReferralStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState<'code' | 'link' | null>(null);

  useEffect(() => {
    api.get('/referral/stats')
      .then(res => setStats(res.data))
      .catch(() => toast.error('Erreur chargement parrainage'))
      .finally(() => setLoading(false));
  }, []);

  const copy = async (type: 'code' | 'link') => {
    const text = type === 'code' ? stats?.referralCode : stats?.referralLink;
    if (!text) return;
    await navigator.clipboard.writeText(text);
    setCopied(type);
    toast.success(type === 'code' ? 'Code copié !' : 'Lien copié !');
    setTimeout(() => setCopied(null), 2000);
  };

  if (loading) return (
    <div className="space-y-4 animate-pulse">
      <div className="h-40 bg-gray-100 rounded-2xl" />
      <div className="h-32 bg-gray-100 rounded-2xl" />
      <div className="h-48 bg-gray-100 rounded-2xl" />
    </div>
  );

  if (!stats) return null;

  return (
    <div className="space-y-6">

      {/* Hero parrainage */}
      <div className="card overflow-hidden">
        <div className="bg-gradient-to-br from-brand-500 via-purple-600 to-pink-500 p-6 text-white">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h2 className="font-display text-2xl font-bold mb-1">Parrainez vos amis 🎁</h2>
              <p className="text-white/80 text-sm max-w-sm">
                Partagez votre code — obtenez <strong>1 jour de boost gratuit</strong> pour chaque ami qui s'abonne.
              </p>
            </div>
            <div className="w-14 h-14 bg-white/20 backdrop-blur rounded-2xl flex items-center justify-center shrink-0">
              <Gift size={26} className="text-white" />
            </div>
          </div>

          {/* Code de parrainage */}
          <div className="bg-white/10 backdrop-blur rounded-2xl p-4">
            <p className="text-white/60 text-xs mb-2 font-medium uppercase tracking-wide">Votre code</p>
            <div className="flex items-center gap-3">
              <span className="font-mono text-3xl font-bold tracking-widest text-white flex-1">
                {stats.referralCode || '—'}
              </span>
              <button
                onClick={() => copy('code')}
                className="w-10 h-10 bg-white/20 hover:bg-white/30 rounded-xl flex items-center justify-center transition-all"
              >
                {copied === 'code' ? <Check size={16} /> : <Copy size={16} />}
              </button>
            </div>
          </div>
        </div>

        {/* Lien de parrainage */}
        <div className="p-4 border-b border-gray-50">
          <p className="text-xs font-medium text-gray-500 mb-2">Lien de parrainage</p>
          <div className="flex items-center gap-2 bg-gray-50 rounded-xl px-3 py-2">
            <p className="text-xs text-gray-600 flex-1 truncate font-mono">{stats.referralLink}</p>
            <button
              onClick={() => copy('link')}
              className="w-7 h-7 bg-brand-100 hover:bg-brand-200 text-brand-600 rounded-lg flex items-center justify-center transition-all shrink-0"
            >
              {copied === 'link' ? <Check size={12} /> : <Copy size={12} />}
            </button>
          </div>
        </div>

        {/* Boutons partage */}
        <div className="p-4 flex gap-2 flex-wrap">
          <a
            href={`https://wa.me/?text=${encodeURIComponent(`Rejoins Afrodite avec mon code ${stats.referralCode} 🎁 ${stats.referralLink}`)}`}
            target="_blank" rel="noreferrer"
            className="flex-1 min-w-[120px] flex items-center justify-center gap-2 bg-[#25D366] text-white text-sm font-medium py-2.5 rounded-xl hover:opacity-90 transition-opacity"
          >
            <span>💬</span> WhatsApp
          </a>
          <button
            onClick={() => copy('link')}
            className="flex-1 min-w-[120px] flex items-center justify-center gap-2 bg-gray-900 text-white text-sm font-medium py-2.5 rounded-xl hover:bg-gray-700 transition-colors"
          >
            <Copy size={14} /> Copier le lien
          </button>
        </div>
      </div>

      {/* Statistiques */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: 'Filleuls', value: stats.totalReferrals, icon: Users, color: 'text-blue-500 bg-blue-50' },
          { label: 'Convertis', value: stats.convertedReferrals, icon: TrendingUp, color: 'text-emerald-500 bg-emerald-50' },
          { label: 'Taux', value: `${stats.conversionRate}%`, icon: TrendingUp, color: 'text-purple-500 bg-purple-50' },
          { label: 'Récompenses', value: stats.appliedRewards, icon: Gift, color: 'text-brand-500 bg-brand-50' },
        ].map(s => (
          <div key={s.label} className="card p-4 flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${s.color}`}>
              <s.icon size={18} />
            </div>
            <div>
              <p className="font-display text-xl font-bold text-gray-900">{s.value}</p>
              <p className="text-xs text-gray-400">{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Comment ça marche */}
      <div className="card p-6">
        <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Zap size={16} className="text-brand-400" /> Comment ça marche
        </h3>
        <div className="space-y-3">
          {[
            { step: '1', text: 'Partagez votre code ou lien avec vos amis', color: 'bg-brand-400' },
            { step: '2', text: 'Ils s\'inscrivent sur Afrodite avec votre code', color: 'bg-purple-500' },
            { step: '3', text: 'Dès leur premier abonnement, vous recevez 1 jour de boost gratuit', color: 'bg-emerald-500' },
          ].map(item => (
            <div key={item.step} className="flex items-start gap-3">
              <div className={`w-7 h-7 ${item.color} text-white rounded-full flex items-center justify-center text-xs font-bold shrink-0 mt-0.5`}>
                {item.step}
              </div>
              <p className="text-sm text-gray-600">{item.text}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Liste des filleuls */}
      {stats.referrals.length > 0 && (
        <div className="card p-6">
          <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Users size={16} className="text-brand-400" /> Mes filleuls ({stats.referrals.length})
          </h3>
          <div className="space-y-3">
            {stats.referrals.map((r: any) => {
              const hasSubscription = r.subscription && ['ACTIVE'].includes(r.subscription.status);
              const avatar = r.profile?.photos?.[0]?.url;
              return (
                <div key={r.id} className="flex items-center gap-3 py-2 border-b border-gray-50 last:border-0">
                  {avatar
                    ? <img src={avatar} alt="" className="w-9 h-9 rounded-full object-cover border border-gray-100" />
                    : <div className="w-9 h-9 rounded-full bg-brand-50 flex items-center justify-center border border-brand-100">
                        <span className="text-brand-400 font-bold text-sm">{r.profile?.displayName?.[0] || '?'}</span>
                      </div>
                  }
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{r.profile?.displayName || 'Utilisateur'}</p>
                    <p className="text-xs text-gray-400">{r.profile?.city} · Inscrit le {new Date(r.createdAt).toLocaleDateString('fr-FR')}</p>
                  </div>
                  <span className={`text-xs font-medium px-2.5 py-1 rounded-full shrink-0 ${
                    hasSubscription ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'
                  }`}>
                    {hasSubscription ? '✓ Abonné' : '⏳ Inscrit'}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Récompenses */}
      {stats.rewards.length > 0 && (
        <div className="card p-6">
          <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Gift size={16} className="text-brand-400" /> Mes récompenses
          </h3>
          <div className="space-y-3">
            {stats.rewards.map((r: any) => (
              <div key={r.id} className="flex items-center gap-3 py-2 border-b border-gray-50 last:border-0">
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                  r.status === 'APPLIED' ? 'bg-emerald-50' : 'bg-amber-50'
                }`}>
                  {r.status === 'APPLIED' ? <Check size={16} className="text-emerald-500" /> : <Clock size={16} className="text-amber-500" />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900">{REWARD_LABELS[r.type] || r.type}</p>
                  <p className="text-xs text-gray-400">{r.description}</p>
                </div>
                <span className={`text-xs font-medium px-2.5 py-1 rounded-full shrink-0 ${
                  r.status === 'APPLIED' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'
                }`}>
                  {r.status === 'APPLIED' ? 'Activée' : 'En attente'}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* État vide */}
      {stats.referrals.length === 0 && (
        <div className="card p-10 text-center">
          <div className="w-16 h-16 bg-brand-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <Users size={28} className="text-brand-300" />
          </div>
          <p className="font-semibold text-gray-600 mb-1">Pas encore de filleuls</p>
          <p className="text-sm text-gray-400">Partagez votre code ci-dessus pour commencer à parrainer.</p>
        </div>
      )}
    </div>
  );
}
