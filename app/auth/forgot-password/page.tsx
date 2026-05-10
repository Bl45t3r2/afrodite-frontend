'use client';
import { useState } from 'react';
import Link from 'next/link';
import { Mail, Loader, ChevronLeft, CheckCircle } from 'lucide-react';
import api from '@/lib/api';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) { setError('Entrez votre adresse email'); return; }
    setLoading(true);
    setError('');
    try {
      await api.post('/auth/forgot-password', { email });
      setSent(true);
    } catch {
      setError('Une erreur est survenue. Réessayez.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-sm">

        <Link href="/auth/login" className="inline-flex items-center gap-1.5 text-sm text-gray-400 hover:text-gray-700 mb-8 transition-colors">
          <ChevronLeft size={15} /> Retour à la connexion
        </Link>

        <div className="text-center mb-8">
          <Link href="/" className="font-display text-3xl font-bold text-brand-400">Afrodite</Link>
        </div>

        {sent ? (
          <div className="card p-10 text-center">
            <div className="w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-5">
              <CheckCircle size={30} className="text-emerald-500" />
            </div>
            <h1 className="font-display text-2xl font-bold text-gray-900 mb-3">Email envoyé !</h1>
            <p className="text-gray-500 text-sm leading-relaxed mb-2">
              Si un compte existe pour <span className="font-semibold text-gray-700">{email}</span>,
              vous recevrez un lien de réinitialisation dans quelques instants.
            </p>
            <p className="text-xs text-gray-400 mb-8">
              Le lien est valable <strong>1 heure</strong>. Vérifiez aussi vos spams.
            </p>
            <div className="space-y-3">
              <button
                onClick={() => { setSent(false); setEmail(''); }}
                className="btn-outline w-full text-sm"
              >
                Utiliser un autre email
              </button>
              <Link href="/auth/login" className="block text-center text-sm text-brand-400 hover:underline">
                ← Retour à la connexion
              </Link>
            </div>
          </div>
        ) : (
          <div className="card p-8">
            <div className="w-12 h-12 bg-brand-50 rounded-2xl flex items-center justify-center mx-auto mb-5">
              <Mail size={22} className="text-brand-400" />
            </div>
            <h1 className="font-display text-2xl font-bold text-gray-900 text-center mb-2">
              Mot de passe oublié ?
            </h1>
            <p className="text-gray-500 text-sm text-center mb-6">
              Entrez votre adresse email et nous vous enverrons un lien pour réinitialiser votre mot de passe.
            </p>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1.5">Adresse email</label>
                <div className="relative">
                  <Mail size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="email"
                    className="input pl-10"
                    placeholder="votre@email.com"
                    value={email}
                    onChange={e => { setEmail(e.target.value); setError(''); }}
                    autoFocus
                  />
                </div>
                {error && <p className="text-red-500 text-xs mt-1.5">{error}</p>}
              </div>

              <button
                type="submit"
                disabled={loading}
                className="btn-primary w-full py-3 flex items-center justify-center gap-2 disabled:opacity-60"
              >
                {loading
                  ? <><Loader size={15} className="animate-spin" /> Envoi en cours…</>
                  : 'Envoyer le lien de réinitialisation'
                }
              </button>
            </form>

            <p className="text-center text-sm text-gray-400 mt-6">
              Vous vous souvenez ?{' '}
              <Link href="/auth/login" className="text-brand-400 font-medium hover:underline">
                Se connecter
              </Link>
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
