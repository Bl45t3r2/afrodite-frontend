'use client';
import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Lock, Loader, CheckCircle, XCircle, Eye, EyeOff, ShieldCheck } from 'lucide-react';
import api from '@/lib/api';

type State = 'validating' | 'form' | 'invalid' | 'success';

function StrengthBar({ password }: { password: string }) {
  const checks = [
    password.length >= 8,
    /[A-Z]/.test(password),
    /[0-9]/.test(password),
    /[^A-Za-z0-9]/.test(password),
  ];
  const score = checks.filter(Boolean).length;
  const colors = ['bg-gray-200', 'bg-red-400', 'bg-amber-400', 'bg-blue-400', 'bg-emerald-400'];
  const labels = ['', 'Faible', 'Moyen', 'Bon', 'Excellent'];

  if (!password) return null;

  return (
    <div className="mt-2">
      <div className="flex gap-1 mb-1">
        {[1, 2, 3, 4].map(i => (
          <div key={i} className={`h-1 flex-1 rounded-full transition-all duration-300 ${i <= score ? colors[score] : 'bg-gray-100'}`} />
        ))}
      </div>
      <p className={`text-xs font-medium ${score <= 1 ? 'text-red-500' : score === 2 ? 'text-amber-500' : score === 3 ? 'text-blue-500' : 'text-emerald-500'}`}>
        {labels[score]}
      </p>
    </div>
  );
}

export default function ResetPasswordPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get('token');

  const [state, setState] = useState<State>('validating');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [showPwd, setShowPwd] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Valider le token au chargement
  useEffect(() => {
    if (!token) { setState('invalid'); return; }
    api.get(`/auth/reset-password/validate?token=${token}`)
      .then(res => {
        if (res.data.valid) {
          setEmail(res.data.email || '');
          setState('form');
        } else {
          setState('invalid');
        }
      })
      .catch(() => setState('invalid'));
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password.length < 8) { setError('Le mot de passe doit contenir au moins 8 caractères'); return; }
    if (password !== confirm) { setError('Les mots de passe ne correspondent pas'); return; }

    setLoading(true);
    try {
      await api.post('/auth/reset-password', { token, password });
      setState('success');
      setTimeout(() => router.push('/auth/login'), 3000);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Erreur lors de la réinitialisation');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <Link href="/" className="font-display text-3xl font-bold text-brand-400">Afrodite</Link>
        </div>

        {/* VALIDATING */}
        {state === 'validating' && (
          <div className="card p-12 text-center">
            <Loader size={32} className="text-brand-400 animate-spin mx-auto mb-4" />
            <p className="text-gray-500 text-sm">Vérification du lien…</p>
          </div>
        )}

        {/* INVALID */}
        {state === 'invalid' && (
          <div className="card p-10 text-center">
            <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-5">
              <XCircle size={30} className="text-red-400" />
            </div>
            <h1 className="font-display text-2xl font-bold text-gray-900 mb-2">Lien invalide</h1>
            <p className="text-gray-500 text-sm mb-6">
              Ce lien est invalide ou a expiré (validité 1h). Faites une nouvelle demande.
            </p>
            <Link href="/auth/forgot-password" className="btn-primary inline-block">
              Nouvelle demande
            </Link>
            <p className="mt-4 text-sm text-gray-400">
              <Link href="/auth/login" className="text-brand-400 hover:underline">← Connexion</Link>
            </p>
          </div>
        )}

        {/* FORM */}
        {state === 'form' && (
          <div className="card p-8">
            <div className="w-12 h-12 bg-brand-50 rounded-2xl flex items-center justify-center mx-auto mb-5">
              <ShieldCheck size={22} className="text-brand-400" />
            </div>
            <h1 className="font-display text-2xl font-bold text-gray-900 text-center mb-1">
              Nouveau mot de passe
            </h1>
            {email && (
              <p className="text-center text-xs text-gray-400 mb-6">
                Pour le compte <span className="font-medium text-gray-600">{email}</span>
              </p>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1.5">
                  Nouveau mot de passe
                </label>
                <div className="relative">
                  <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type={showPwd ? 'text' : 'password'}
                    className="input pl-10 pr-10"
                    placeholder="8 caractères minimum"
                    value={password}
                    onChange={e => { setPassword(e.target.value); setError(''); }}
                    autoFocus
                  />
                  <button
                    type="button"
                    onClick={() => setShowPwd(v => !v)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPwd ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
                <StrengthBar password={password} />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1.5">
                  Confirmer le mot de passe
                </label>
                <div className="relative">
                  <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type={showConfirm ? 'text' : 'password'}
                    className={`input pl-10 pr-10 ${confirm && password !== confirm ? 'border-red-300 focus:border-red-400 focus:ring-red-400/30' : confirm && password === confirm ? 'border-emerald-300 focus:border-emerald-400 focus:ring-emerald-400/30' : ''}`}
                    placeholder="Répétez votre mot de passe"
                    value={confirm}
                    onChange={e => { setConfirm(e.target.value); setError(''); }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirm(v => !v)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showConfirm ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
                {confirm && password !== confirm && (
                  <p className="text-red-500 text-xs mt-1.5">Les mots de passe ne correspondent pas</p>
                )}
                {confirm && password === confirm && (
                  <p className="text-emerald-500 text-xs mt-1.5 flex items-center gap-1">
                    <CheckCircle size={12} /> Mots de passe identiques
                  </p>
                )}
              </div>

              {error && (
                <div className="bg-red-50 border border-red-100 rounded-xl p-3 text-sm text-red-600">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading || !password || !confirm}
                className="btn-primary w-full py-3 flex items-center justify-center gap-2 disabled:opacity-60 mt-2"
              >
                {loading
                  ? <><Loader size={15} className="animate-spin" /> Mise à jour…</>
                  : 'Enregistrer le nouveau mot de passe'
                }
              </button>
            </form>
          </div>
        )}

        {/* SUCCESS */}
        {state === 'success' && (
          <div className="card p-10 text-center">
            <div className="w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-5 animate-bounce">
              <CheckCircle size={30} className="text-emerald-500" />
            </div>
            <h1 className="font-display text-2xl font-bold text-gray-900 mb-2">
              Mot de passe mis à jour !
            </h1>
            <p className="text-gray-500 text-sm mb-6">
              Votre mot de passe a été modifié avec succès. Vous allez être redirigé vers la page de connexion…
            </p>
            <Link href="/auth/login" className="btn-primary inline-block">
              Se connecter maintenant
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
 
export const dynamic = 'force-dynamic'; 
