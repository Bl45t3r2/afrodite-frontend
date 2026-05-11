'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Mail, Lock, User, MapPin, Calendar, Loader } from 'lucide-react';
import api from '@/lib/api';
import toast from 'react-hot-toast';

const CITIES = ['Cotonou', 'Porto-Novo', 'Lomé', 'Abidjan', 'Dakar', 'Accra', 'Lagos', 'Douala'];

export default function RegisterPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get('redirect') || '/dashboard';
  const [referralCode, setReferralCode] = useState(searchParams.get('ref') || '');
  const [form, setForm] = useState({ email: '', password: '', displayName: '', age: '', city: '', phone: '' });
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.email || !form.password || !form.displayName || !form.age || !form.city) {
      toast.error('Remplissez tous les champs'); return;
    }
    if (parseInt(form.age) < 18) { toast.error('Vous devez avoir au moins 18 ans'); return; }

    setLoading(true);
    try {
      const payload: any = { ...form, age: parseInt(form.age) };
      if (!payload.phone) delete payload.phone;
      await api.post('/auth/register', payload);
      setDone(true);
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Erreur lors de l\'inscription');
    } finally {
      setLoading(false);
    }
  };

  if (done) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center px-4">
        <div className="card p-12 text-center max-w-md w-full">
          <div className="w-20 h-20 bg-brand-50 rounded-full flex items-center justify-center mx-auto mb-6">
            <Mail size={36} className="text-brand-400" />
          </div>
          <h1 className="font-display text-2xl font-bold text-gray-900 mb-3">Vérifiez votre email !</h1>
          <p className="text-gray-500 leading-relaxed mb-2">
            Un email de confirmation a été envoyé à<br />
            <span className="font-semibold text-gray-700">{form.email}</span>
          </p>
          <p className="text-sm text-gray-400 mb-8">
            Cliquez sur le lien dans l'email pour activer votre compte. Le lien est valable 24 heures.
          </p>
          <div className="space-y-3">
            <div className="flex items-start gap-3 bg-amber-50 border border-amber-100 rounded-xl p-4 text-left">
              <span className="text-amber-500 mt-0.5">💡</span>
              <p className="text-sm text-amber-700">
                Vous ne trouvez pas l'email ? Vérifiez vos <strong>spams</strong> ou demandez un nouveau lien.
              </p>
            </div>
            <button
              onClick={() => router.push('/auth/verify-email')}
              className="btn-outline w-full text-sm"
            >
              Renvoyer le lien de confirmation
            </button>
            <Link href="/auth/login" className="block text-center text-sm text-gray-400 hover:text-gray-600">
              ← Retour à la connexion
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="font-display text-3xl font-bold text-brand-400">Afrodite</Link>
          <p className="text-gray-500 text-sm mt-2">Créez votre compte gratuitement</p>
        </div>

        <div className="card p-8">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1.5">Nom affiché</label>
              <div className="relative">
                <User size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                <input className="input pl-10" placeholder="Votre prénom ou pseudo" value={form.displayName}
                  onChange={e => setForm(f => ({ ...f, displayName: e.target.value }))} />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1.5">Âge</label>
                <div className="relative">
                  <Calendar size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input className="input pl-10" type="number" min="18" max="99" placeholder="18" value={form.age}
                    onChange={e => setForm(f => ({ ...f, age: e.target.value }))} />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1.5">Ville</label>
                <div className="relative">
                  <MapPin size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                  <select className="input pl-10 appearance-none" value={form.city}
                    onChange={e => setForm(f => ({ ...f, city: e.target.value }))}>
                    <option value="">Choisir</option>
                    {CITIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1.5">
                Numéro de téléphone <span className="text-gray-300">(optionnel)</span>
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 text-sm">📱</span>
                <input className="input pl-10" type="tel" placeholder="+229 01 23 45 67" value={form.phone}
                  onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} />
              </div>
              <p className="text-xs text-gray-400 mt-1">Vous pourrez aussi vous connecter avec ce numéro</p>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1.5">Adresse email</label>
              <div className="relative">
                <Mail size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                <input className="input pl-10" type="email" placeholder="votre@email.com" value={form.email}
                  onChange={e => setForm(f => ({ ...f, email: e.target.value }))} />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1.5">Mot de passe</label>
              <div className="relative">
                <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                <input className="input pl-10" type="password" placeholder="8 caractères minimum" value={form.password}
                  onChange={e => setForm(f => ({ ...f, password: e.target.value }))} />
              </div>
              <p className="text-xs text-gray-400 mt-1">Minimum 8 caractères</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Code de parrainage <span className="text-gray-400 font-normal">(optionnel)</span>
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-lg">🎁</span>
                <input
                  type="text"
                  value={referralCode}
                  onChange={e => setReferralCode(e.target.value.toUpperCase())}
                  placeholder="Ex: AFR3K2"
                  maxLength={10}
                  className="input pl-10 uppercase tracking-widest"
                />
              </div>
              {referralCode && (
                <p className="text-xs text-emerald-600 mt-1 flex items-center gap-1">
                  ✓ Code de parrainage appliqué
                </p>
              )}
            </div>

            <button type="submit" disabled={loading} className="btn-primary w-full py-3 flex items-center justify-center gap-2 disabled:opacity-60 mt-2">
              {loading ? <><Loader size={15} className="animate-spin" /> Création…</> : 'Créer mon compte'}
            </button>
          </form>

          <p className="text-center text-sm text-gray-400 mt-6">
            Déjà un compte ?{' '}
            <Link href="/auth/login" className="text-brand-400 font-medium hover:underline">Se connecter</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export const dynamic = 'force-dynamic';