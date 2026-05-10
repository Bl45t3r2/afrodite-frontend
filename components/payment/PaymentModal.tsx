'use client';
import { useState } from 'react';
import { X, CreditCard, Phone, Loader, Check, ChevronDown } from 'lucide-react';
import api from '@/lib/api';
import toast from 'react-hot-toast';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  plan: string;
  purpose: 'SUBSCRIPTION' | 'BOOST';
  price: string;   // ex: "9 990 FCFA"
  label: string;   // ex: "Premium" ou "Boost 7 jours"
}

type PayMethod = 'card' | 'mobile';

const OPERATORS = [
  { value: 'MTN', label: 'MTN Mobile Money' },
  { value: 'MOOV', label: 'Moov Money' },
  { value: 'WAVE', label: 'Wave' },
  { value: 'ORANGE', label: 'Orange Money' },
];

export default function PaymentModal({ isOpen, onClose, plan, purpose, price, label }: Props) {
  const [method, setMethod] = useState<PayMethod>('mobile');
  const [phone, setPhone] = useState('');
  const [operator, setOperator] = useState('MTN');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const endpoint = purpose === 'SUBSCRIPTION'
    ? `/subscriptions/checkout/${method === 'card' ? 'stripe' : 'mobile-money'}`
    : `/boosts/checkout/${method === 'card' ? 'stripe' : 'mobile-money'}`;

  const handlePay = async () => {
    setLoading(true);
    try {
      const payload: any = { plan };
      if (method === 'mobile') {
        if (!phone.trim()) { toast.error('Entrez votre numéro de téléphone'); setLoading(false); return; }
        payload.phoneNumber = phone.trim();
        payload.operator = operator;
      }

      const res = await api.post(endpoint, payload);

      if (res.data.url) {
        // Rediriger vers la page de paiement (Stripe Checkout ou FedaPay)
        window.location.href = res.data.url;
      }
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Erreur lors du paiement');
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden">

        {/* Header */}
        <div className="bg-gradient-to-br from-brand-500 to-purple-600 p-6 text-white">
          <div className="flex items-start justify-between mb-4">
            <div>
              <p className="text-white/70 text-sm mb-1">Paiement sécurisé</p>
              <h2 className="font-display text-2xl font-bold">{label}</h2>
            </div>
            <button onClick={onClose} className="w-8 h-8 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center transition-colors">
              <X size={16} />
            </button>
          </div>
          <div className="bg-white/10 rounded-2xl px-5 py-3 inline-block">
            <span className="font-display text-3xl font-bold">{price}</span>
          </div>
        </div>

        <div className="p-6 space-y-5">

          {/* Choix de la méthode */}
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Mode de paiement</p>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setMethod('mobile')}
                className={`flex flex-col items-center gap-2 p-4 rounded-2xl border-2 transition-all ${
                  method === 'mobile' ? 'border-brand-400 bg-brand-50' : 'border-gray-100 hover:border-gray-200'
                }`}>
                <Phone size={22} className={method === 'mobile' ? 'text-brand-500' : 'text-gray-400'} />
                <span className={`text-sm font-medium ${method === 'mobile' ? 'text-brand-600' : 'text-gray-500'}`}>
                  Mobile Money
                </span>
                <span className="text-[10px] text-gray-400">MTN · Wave · Orange</span>
              </button>

              <button
                onClick={() => setMethod('card')}
                className={`flex flex-col items-center gap-2 p-4 rounded-2xl border-2 transition-all ${
                  method === 'card' ? 'border-brand-400 bg-brand-50' : 'border-gray-100 hover:border-gray-200'
                }`}>
                <CreditCard size={22} className={method === 'card' ? 'text-brand-500' : 'text-gray-400'} />
                <span className={`text-sm font-medium ${method === 'card' ? 'text-brand-600' : 'text-gray-500'}`}>
                  Carte bancaire
                </span>
                <span className="text-[10px] text-gray-400">Visa · Mastercard</span>
              </button>
            </div>
          </div>

          {/* Formulaire Mobile Money */}
          {method === 'mobile' && (
            <div className="space-y-3">
              <div>
                <label className="text-xs font-medium text-gray-500 mb-1.5 block">Opérateur</label>
                <div className="relative">
                  <select
                    value={operator}
                    onChange={e => setOperator(e.target.value)}
                    className="input appearance-none pr-8"
                  >
                    {OPERATORS.map(op => (
                      <option key={op.value} value={op.value}>{op.label}</option>
                    ))}
                  </select>
                  <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                </div>
              </div>

              <div>
                <label className="text-xs font-medium text-gray-500 mb-1.5 block">Numéro de téléphone</label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 text-sm">📱</span>
                  <input
                    type="tel"
                    value={phone}
                    onChange={e => setPhone(e.target.value)}
                    placeholder="+229 01 23 45 67"
                    className="input pl-10"
                  />
                </div>
                <p className="text-xs text-gray-400 mt-1">Vous recevrez une demande de confirmation sur ce numéro</p>
              </div>
            </div>
          )}

          {/* Info carte bancaire */}
          {method === 'card' && (
            <div className="bg-blue-50 border border-blue-100 rounded-xl p-4">
              <p className="text-sm text-blue-700 font-medium mb-1">💳 Paiement via Stripe</p>
              <p className="text-xs text-blue-600">
                Vous serez redirigé vers la page de paiement sécurisée Stripe. Vos données bancaires ne transitent jamais par nos serveurs.
              </p>
            </div>
          )}

          {/* Bouton payer */}
          <button
            onClick={handlePay}
            disabled={loading}
            className="btn-primary w-full py-4 text-base flex items-center justify-center gap-2 disabled:opacity-60"
          >
            {loading
              ? <><Loader size={18} className="animate-spin" /> Redirection en cours…</>
              : <><Check size={18} /> Payer {price}</>
            }
          </button>

          {/* Sécurité */}
          <div className="flex items-center justify-center gap-4 text-xs text-gray-400">
            <span>🔒 Paiement chiffré SSL</span>
            <span>·</span>
            <span>Sans engagement</span>
            <span>·</span>
            <span>Résiliation en 1 clic</span>
          </div>
        </div>
      </div>
    </div>
  );
}
