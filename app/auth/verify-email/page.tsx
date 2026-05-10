'use client';
import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { CheckCircle, XCircle, Loader, Mail, RefreshCw } from 'lucide-react';
import api from '@/lib/api';
import useAuthStore from '@/lib/store';
import Link from 'next/link';

type State = 'loading' | 'success' | 'error' | 'expired' | 'resend';

export default function VerifyEmailPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { setAuth } = useAuthStore();
  const token = searchParams.get('token');

  const [state, setState] = useState<State>(token ? 'loading' : 'resend');
  const [message, setMessage] = useState('');
  const [email, setEmail] = useState('');
  const [resending, setResending] = useState(false);
  const [resent, setResent] = useState(false);

  useEffect(() => {
    if (!token) return;
    api.get(`/auth/verify-email?token=${token}`)
      .then(res => {
        setState('success');
        // Connecter automatiquement
        if (res.data.accessToken) {
          setAuth(res.data.user, res.data.accessToken, res.data.refreshToken);
          setTimeout(() => router.push('/dashboard'), 2500);
        }
      })
      .catch(err => {
        const msg = err.response?.data?.error || '';
        if (msg.includes('expiré')) setState('expired');
        else setState('error');
        setMessage(err.response?.data?.message || 'Lien invalide ou expiré.');
      });
  }, [token]);

  const handleResend = async () => {
    if (!email) return;
    setResending(true);
    try {
      await api.post('/auth/resend-verification', { email });
      setResent(true);
    } catch (err: any) {
      setMessage(err.response?.data?.error || 'Erreur lors de l\'envoi');
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      <div className="w-full max-w-md">

        {/* LOADING */}
        {state === 'loading' && (
          <div className="card p-12 text-center">
            <div className="w-16 h-16 bg-brand-50 rounded-full flex items-center justify-center mx-auto mb-5">
              <Loader size={28} className="text-brand-400 animate-spin" />
            </div>
            <h1 className="font-display text-2xl font-bold text-gray-900 mb-2">Vérification en cours…</h1>
            <p className="text-gray-400 text-sm">Patientez quelques secondes.</p>
          </div>
        )}

        {/* SUCCESS */}
        {state === 'success' && (
          <div className="card p-12 text-center">
            <div className="w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-5 animate-bounce">
              <CheckCircle size={32} className="text-emerald-500" />
            </div>
            <h1 className="font-display text-2xl font-bold text-gray-900 mb-2">Email confirmé ! 🎉</h1>
            <p className="text-gray-500 text-sm mb-6">
              Votre compte est activé. Vous allez être redirigé vers votre tableau de bord…
            </p>
            <Link href="/dashboard" className="btn-primary inline-block">
              Aller au dashboard
            </Link>
          </div>
        )}

        {/* ERROR */}
        {(state === 'error' || state === 'expired') && (
          <div className="card p-10 text-center">
            <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-5">
              <XCircle size={32} className="text-red-400" />
            </div>
            <h1 className="font-display text-2xl font-bold text-gray-900 mb-2">
              {state === 'expired' ? 'Lien expiré' : 'Lien invalide'}
            </h1>
            <p className="text-gray-500 text-sm mb-6">
              {state === 'expired'
                ? 'Ce lien a expiré (24h). Demandez-en un nouveau ci-dessous.'
                : 'Ce lien est invalide ou a déjà été utilisé.'}
            </p>
            <button onClick={() => setState('resend')} className="btn-primary flex items-center gap-2 mx-auto">
              <RefreshCw size={15} /> Recevoir un nouveau lien
            </button>
          </div>
        )}

        {/* RESEND FORM */}
        {state === 'resend' && (
          <div className="card p-10">
            <div className="w-14 h-14 bg-brand-50 rounded-2xl flex items-center justify-center mx-auto mb-5">
              <Mail size={24} className="text-brand-400" />
            </div>
            {resent ? (
              <div className="text-center">
                <div className="w-12 h-12 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle size={24} className="text-emerald-500" />
                </div>
                <h2 className="font-display text-xl font-bold text-gray-900 mb-2">Email envoyé !</h2>
                <p className="text-gray-500 text-sm mb-6">Vérifiez votre boîte mail et cliquez sur le lien de confirmation.</p>
                <Link href="/auth/login" className="text-sm text-brand-400 hover:underline">← Retour à la connexion</Link>
              </div>
            ) : (
              <>
                <h1 className="font-display text-2xl font-bold text-gray-900 text-center mb-2">Confirmer votre email</h1>
                <p className="text-gray-500 text-sm text-center mb-6">
                  Entrez votre adresse email pour recevoir un nouveau lien de confirmation.
                </p>
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1.5">Adresse email</label>
                    <input
                      type="email"
                      className="input"
                      placeholder="votre@email.com"
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      onKeyDown={e => e.key === 'Enter' && handleResend()}
                    />
                  </div>
                  {message && <p className="text-red-500 text-sm">{message}</p>}
                  <button
                    onClick={handleResend}
                    disabled={resending || !email}
                    className="btn-primary w-full py-3 disabled:opacity-60 flex items-center justify-center gap-2"
                  >
                    {resending ? <><Loader size={15} className="animate-spin" /> Envoi…</> : 'Renvoyer le lien'}
                  </button>
                  <p className="text-center text-sm text-gray-400">
                    <Link href="/auth/login" className="text-brand-400 hover:underline">← Retour à la connexion</Link>
                  </p>
                </div>
              </>
            )}
          </div>
        )}

      </div>
    </div>
  );
}
