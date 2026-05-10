'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Zap, Crown, Star, ChevronLeft, Check, Clock, TrendingUp, Eye } from 'lucide-react';
import api from '@/lib/api';
import useAuthStore from '@/lib/store';
import toast from 'react-hot-toast';
import Link from 'next/link';
import PaymentModal from '@/components/payment/PaymentModal';

const PLANS = [
  {
    plan: 'DAY',
    label: '24 heures',
    price: '1 000',
    icon: Zap,
    color: 'from-amber-400 to-orange-500',
    bg: 'bg-amber-50 border-amber-200',
    features: ['Profil en tête 24h', 'Badge ⚡ Boosté', 'Plus de visibilité'],
  },
  {
    plan: 'WEEK',
    label: '7 jours',
    price: '5 000',
    icon: Star,
    color: 'from-brand-400 to-pink-500',
    bg: 'bg-brand-50 border-brand-200',
    badge: 'Populaire',
    features: ['Profil en tête 7 jours', 'Badge ⚡ Boosté', 'Page d\'accueil vedette', 'Statistiques boost'],
  },
  {
    plan: 'MONTH',
    label: '30 jours',
    price: '15 000',
    icon: Crown,
    color: 'from-purple-500 to-indigo-600',
    bg: 'bg-purple-50 border-purple-200',
    features: ['Profil en tête 30 jours', 'Badge ⚡ Boosté', 'Page d\'accueil vedette', 'Priorité maximale', 'Stats avancées'],
  },
];

export default function BoostPage() {
  const { isAuthenticated } = useAuthStore();
  const router = useRouter();
  const [activeBoost, setActiveBoost] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activating, setActivating] = useState<string | null>(null);
  const [payModal, setPayModal] = useState<{ plan: string; price: string; label: string } | null>(null);

  useEffect(() => {
    if (!isAuthenticated) { router.push('/auth/login'); return; }
    api.get('/boosts/my')
      .then(r => setActiveBoost(r.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [isAuthenticated]);

  const activateBoost = (plan: string, price: string, label: string) => {
    setPayModal({ plan, price: `${price} FCFA`, label: `Boost ${label}` });
  };

  const _oldActivateBoost = async (plan: string) => {
    setActivating(plan);
    try {
      const res = await api.post('/boosts', { plan });
      setActiveBoost(res.data.boost);
      toast.success(res.data.message);
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Erreur lors de l\'activation');
    } finally {
      setActivating(null);
    }
  };

  const timeLeft = (endAt: string) => {
    const diff = new Date(endAt).getTime() - Date.now();
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(hours / 24);
    if (days > 0) return `${days}j ${hours % 24}h restants`;
    return `${hours}h restantes`;
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <Link href="/dashboard" className="inline-flex items-center gap-1.5 text-sm text-gray-400 hover:text-gray-700 mb-8 transition-colors">
        <ChevronLeft size={15} /> Retour au dashboard
      </Link>

      <div className="text-center mb-10">
        <div className="w-16 h-16 bg-gradient-to-br from-amber-400 to-orange-500 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-amber-400/30">
          <Zap size={28} className="text-white" />
        </div>
        <h1 className="font-display text-3xl font-bold text-gray-900 mb-2">Booster mon profil</h1>
        <p className="text-gray-500 max-w-md mx-auto">Apparaissez en tête des recherches et sur la page d'accueil. Obtenez jusqu'à 10x plus de vues.</p>
      </div>

      {/* Boost actif */}
      {!loading && activeBoost && (
        <div className="card p-5 mb-8 bg-emerald-50 border-emerald-200 flex items-center gap-4">
          <div className="w-12 h-12 bg-emerald-500 rounded-xl flex items-center justify-center shrink-0">
            <Zap size={22} className="text-white" />
          </div>
          <div className="flex-1">
            <p className="font-semibold text-emerald-800">Boost actif ✅</p>
            <p className="text-sm text-emerald-600">
              Plan {activeBoost.plan} · <span className="font-medium">{timeLeft(activeBoost.endAt)}</span>
            </p>
          </div>
          <div className="text-right">
            <p className="text-xs text-emerald-500">Expire le</p>
            <p className="font-semibold text-emerald-800 text-sm">
              {new Date(activeBoost.endAt).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long' })}
            </p>
          </div>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-10">
        {[
          { icon: Eye, label: 'Plus de vues', value: '×10', color: 'text-blue-500 bg-blue-50' },
          { icon: TrendingUp, label: 'Position', value: 'Top 1', color: 'text-emerald-500 bg-emerald-50' },
          { icon: Star, label: 'Page accueil', value: 'Vedette', color: 'text-amber-500 bg-amber-50' },
        ].map(({ icon: Icon, label, value, color }) => (
          <div key={label} className="card p-4 text-center">
            <div className={`w-10 h-10 rounded-xl ${color} flex items-center justify-center mx-auto mb-2`}>
              <Icon size={18} />
            </div>
            <p className="font-display text-xl font-bold text-gray-900">{value}</p>
            <p className="text-xs text-gray-500">{label}</p>
          </div>
        ))}
      </div>

      {/* Plans */}
      <div className="grid md:grid-cols-3 gap-5">
        {PLANS.map(({ plan, label, price, icon: Icon, color, bg, badge, features }) => {
          const isActive = activeBoost?.plan === plan && activeBoost?.active;
          return (
            <div key={plan} className={`relative card p-6 border-2 ${isActive ? 'border-emerald-400 ring-2 ring-emerald-400/20' : 'border-gray-100 hover:border-brand-200'} transition-all hover:-translate-y-1 hover:shadow-lg`}>
              {badge && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-brand-400 text-white text-xs font-bold px-3 py-1 rounded-full">{badge}</span>
              )}
              {isActive && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-emerald-500 text-white text-xs font-bold px-3 py-1 rounded-full">✅ Actif</span>
              )}

              <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${color} flex items-center justify-center mb-4 shadow-lg`}>
                <Icon size={22} className="text-white" />
              </div>

              <h3 className="font-display text-xl font-bold text-gray-900 mb-1">{label}</h3>
              <div className="flex items-end gap-1 mb-5">
                <span className="font-display text-3xl font-bold text-gray-900">{price}</span>
                <span className="text-gray-400 text-sm mb-1">FCFA</span>
              </div>

              <ul className="space-y-2 mb-6">
                {features.map(f => (
                  <li key={f} className="flex items-center gap-2 text-xs text-gray-600">
                    <Check size={13} className="text-brand-400 shrink-0" />{f}
                  </li>
                ))}
              </ul>

              <button
                onClick={() => activateBoost(plan, price, label)}
                disabled={!!activating || isActive}
                className={`w-full py-2.5 rounded-xl font-medium text-sm transition-all disabled:opacity-60 flex items-center justify-center gap-2 ${isActive ? 'bg-emerald-100 text-emerald-700 cursor-default' : 'bg-gradient-to-r ' + color + ' text-white hover:opacity-90 hover:shadow-md'}`}
              >
                {activating === plan ? (
                  <><div className="w-4 h-4 border-2 border-white/50 border-t-white rounded-full animate-spin" /> Activation…</>
                ) : isActive ? (
                  <><Check size={15} /> Boost actif</>
                ) : (
                  <><Zap size={15} /> Booster {label}</>
                )}
              </button>
            </div>
          );
        })}
      </div>

      <p className="text-center text-xs text-gray-400 mt-8">
        💳 Paiement par Mobile Money (MTN, Moov) ou carte bancaire · Activation immédiate
      </p>
      {payModal && (
        <PaymentModal
          isOpen={!!payModal}
          onClose={() => setPayModal(null)}
          plan={payModal.plan}
          purpose="BOOST"
          price={payModal.price}
          label={payModal.label}
        />
      )}
    </div>
  );
}
