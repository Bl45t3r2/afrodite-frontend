'use client';
import { useState } from 'react';
import { Check, Zap, Crown, Shield, ArrowRight } from 'lucide-react';
import useAuthStore from '@/lib/store';
import { useRouter } from 'next/navigation';
import PaymentModal from '@/components/payment/PaymentModal';

const PLANS = [
  {
    name: 'Basic',
    price: '0',
    fcfa: '0 FCFA',
    period: 'Gratuit pour toujours',
    description: 'Pour débuter',
    icon: Shield,
    iconColor: 'text-white/40',
    features: [
      'Profil visible publiquement',
      '5 messages par jour',
      '3 photos maximum',
      'Apparition dans les résultats',
    ],
    cta: 'Commencer gratuitement',
    href: '/auth/register',
    highlight: false,
    plan: null,
    accentColor: 'border-white/10',
    badgeBg: '',
  },
  {
    name: 'Premium',
    price: '9 990',
    fcfa: '9 990 FCFA',
    period: '/mois',
    description: 'Le plus populaire',
    icon: Zap,
    iconColor: 'text-brand-400',
    highlight: true,
    badge: 'Le plus populaire',
    features: [
      'Messages illimités',
      'Badge Premium visible',
      'Photos illimitées + privées',
      'Mise en avant dans les résultats',
      'Statistiques de vues',
      'Support prioritaire',
      'Avis vérifiés',
    ],
    cta: 'Choisir Premium',
    plan: 'premium',
    accentColor: 'border-brand-500/50',
    badgeBg: 'bg-brand-500',
  },
  {
    name: 'VIP',
    price: '24 990',
    fcfa: '24 990 FCFA',
    period: '/mois',
    description: 'Visibilité maximale',
    icon: Crown,
    iconColor: 'text-amber-400',
    highlight: false,
    features: [
      'Tout ce qu\'inclut Premium',
      'Top des résultats de recherche',
      'Badge VIP exclusif doré',
      'Statistiques avancées',
      'Support dédié 24/7',
      'Mise en avant page d\'accueil',
      'Boost mensuel offert',
    ],
    cta: 'Choisir VIP',
    plan: 'vip',
    accentColor: 'border-amber-500/30',
    badgeBg: 'bg-amber-500',
  },
];

const PAYMENT_METHODS = [
  { label: 'MTN Mobile Money', color: 'text-yellow-400', bg: 'bg-yellow-400/10 border-yellow-400/20' },
  { label: 'Moov Money', color: 'text-blue-400', bg: 'bg-blue-400/10 border-blue-400/20' },
  { label: 'Wave', color: 'text-cyan-400', bg: 'bg-cyan-400/10 border-cyan-400/20' },
  { label: 'Orange Money', color: 'text-orange-400', bg: 'bg-orange-400/10 border-orange-400/20' },
  { label: 'Visa / Mastercard', color: 'text-white/60', bg: 'bg-white/5 border-white/10' },
];

export default function PricingPage() {
  const { isAuthenticated } = useAuthStore();
  const router = useRouter();
  const [modal, setModal] = useState<{ plan: string; label: string; price: string } | null>(null);

  const handleCta = (p: typeof PLANS[0]) => {
    if (!p.plan) { router.push('/auth/register'); return; }
    if (!isAuthenticated) { router.push(`/auth/login?redirect=/tarifs`); return; }
    setModal({ plan: p.plan, label: p.name, price: p.fcfa });
  };

  return (
    <div className="min-h-screen bg-[#0f0f0f]">

      {/* Hero section */}
      <div className="relative overflow-hidden bg-[#0d0d0d] border-b border-white/5 py-16 px-4">
        <div className="absolute inset-0 opacity-40">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-brand-500/10 blur-[100px] rounded-full" />
        </div>
        <div className="relative max-w-3xl mx-auto text-center">
          <span className="inline-block bg-brand-500/15 border border-brand-500/30 text-brand-400 text-xs font-semibold px-4 py-1.5 rounded-full mb-5 tracking-wider uppercase">
            Tarifs
          </span>
          <h1 className="font-display text-4xl md:text-5xl font-bold text-white mb-4 leading-tight">
            Choisissez votre plan
          </h1>
          <p className="text-white/40 text-lg">
            Payez via <span className="text-white/70">Mobile Money</span>, Wave ou carte bancaire.{' '}
            <span className="text-white/50">Résiliez à tout moment.</span>
          </p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-12">

        {/* Pricing cards */}
        <div className="grid md:grid-cols-3 gap-4 mb-12">
          {PLANS.map(plan => {
            const Icon = plan.icon;
            return (
              <div
                key={plan.name}
                className={`relative flex flex-col rounded-2xl border p-7 transition-all duration-300 hover:-translate-y-1 ${
                  plan.highlight
                    ? `bg-[#141414] ${plan.accentColor} border-2 shadow-xl shadow-brand-500/10`
                    : `bg-[#111] ${plan.accentColor} hover:border-white/20`
                }`}
              >
                {/* Featured gradient line */}
                {plan.highlight && (
                  <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-brand-400/70 to-transparent rounded-t-2xl" />
                )}

                {/* Badge */}
                {plan.badge && (
                  <div className={`absolute -top-3.5 left-1/2 -translate-x-1/2 ${plan.badgeBg} text-white text-[10px] font-bold px-4 py-1 rounded-full whitespace-nowrap uppercase tracking-wider`}>
                    {plan.badge}
                  </div>
                )}

                {/* Icon + name */}
                <div className="flex items-center gap-3 mb-5">
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                    plan.highlight ? 'bg-brand-500/20' : 'bg-white/5'
                  }`}>
                    <Icon size={18} className={plan.iconColor} />
                  </div>
                  <div>
                    <h2 className="text-white font-bold text-base">{plan.name}</h2>
                    <p className="text-white/30 text-xs">{plan.description}</p>
                  </div>
                </div>

                {/* Price */}
                <div className="mb-6">
                  <div className="flex items-baseline gap-1">
                    <span className={`font-display text-4xl font-bold ${
                      plan.highlight ? 'text-brand-400' : plan.name === 'VIP' ? 'text-amber-400' : 'text-white/60'
                    }`}>
                      {plan.price}
                    </span>
                    {plan.price !== '0' && (
                      <span className="text-white/25 text-sm">FCFA{plan.period}</span>
                    )}
                  </div>
                  {plan.price === '0' && (
                    <span className="text-white/25 text-xs">{plan.period}</span>
                  )}
                </div>

                {/* Features */}
                <ul className="flex flex-col gap-2.5 mb-7 flex-1">
                  {plan.features.map(f => (
                    <li key={f} className="flex items-start gap-2.5 text-sm">
                      <Check size={14} className={`shrink-0 mt-0.5 ${
                        plan.highlight ? 'text-brand-400' : plan.name === 'VIP' ? 'text-amber-400' : 'text-white/30'
                      }`} />
                      <span className="text-white/55">{f}</span>
                    </li>
                  ))}
                </ul>

                {/* CTA */}
                <button
                  onClick={() => handleCta(plan)}
                  className={`w-full py-3 rounded-xl font-semibold text-sm transition-all flex items-center justify-center gap-2 ${
                    plan.highlight
                      ? 'bg-brand-500 hover:bg-brand-400 text-white shadow-md shadow-brand-500/25 hover:shadow-brand-500/40'
                      : plan.name === 'VIP'
                      ? 'bg-amber-500/15 border border-amber-500/30 text-amber-400 hover:bg-amber-500/25'
                      : 'bg-white/6 border border-white/10 text-white/50 hover:text-white hover:bg-white/10'
                  }`}>
                  {plan.cta}
                  <ArrowRight size={14} />
                </button>
              </div>
            );
          })}
        </div>

        {/* Payment methods */}
        <div className="bg-[#111] border border-white/8 rounded-2xl p-8 text-center">
          <p className="text-white/40 text-xs uppercase tracking-widest font-bold mb-5">
            Méthodes de paiement acceptées
          </p>
          <div className="flex flex-wrap items-center justify-center gap-2.5 mb-5">
            {PAYMENT_METHODS.map(m => (
              <div key={m.label} className={`flex items-center gap-2 border rounded-xl px-4 py-2 text-sm font-medium ${m.bg} ${m.color}`}>
                {m.label}
              </div>
            ))}
          </div>
          <p className="text-white/20 text-xs">
            🔒 Paiement 100% sécurisé · Sans engagement · Résiliation en un clic
          </p>
        </div>

        {/* FAQ teaser */}
        <div className="mt-10 text-center">
          <p className="text-white/25 text-sm">
            Des questions ? <a href="/contact" className="text-brand-400 hover:text-brand-300 transition-colors">Contactez notre support</a>
          </p>
        </div>
      </div>

      {modal && (
        <PaymentModal
          isOpen={!!modal}
          onClose={() => setModal(null)}
          plan={modal.plan}
          purpose="SUBSCRIPTION"
          price={modal.price}
          label={modal.label}
        />
      )}
    </div>
  );
}
