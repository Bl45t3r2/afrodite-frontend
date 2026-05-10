'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Mail, Lock, Loader, AlertCircle, Flame } from 'lucide-react';
import useAuthStore from '@/lib/store';
import api from '@/lib/api';
import toast from 'react-hot-toast';

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get('redirect') || '/dashboard';
  const { login } = useAuthStore();
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [unverified, setUnverified] = useState<string | null>(null);
  const [resending, setResending] = useState(false);
  const [resent, setResent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setUnverified(null);
    try {
      await login(form.email, form.password);
      toast.success('Connexion réussie !');
      router.push(redirect);
    } catch (err: any) {
      const data = err.response?.data;
      if (data?.error === 'email_not_verified') {
        setUnverified(data.email || form.email);
      } else {
        toast.error(data?.error || 'Identifiants incorrects');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (!unverified) return;
    setResending(true);
    try {
      await api.post('/auth/resend-verification', { email: unverified });
      setResent(true);
      toast.success('Email de confirmation renvoyé !');
    } catch {
      toast.error("Erreur lors de l'envoi");
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-12 bg-[#0f0f0f]">
      {/* Background glow */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[300px] bg-brand-500/5 blur-[120px] rounded-full" />
      </div>

      <div className="relative w-full max-w-sm">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 group mb-4">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-brand-400 to-brand-600 flex items-center justify-center shadow-md shadow-brand-500/30">
              <Flame size={16} className="text-white" />
            </div>
            <span className="font-display text-2xl font-bold text-white">Afrodite</span>
          </Link>
          <p className="text-white/35 text-sm">
            {redirect !== '/dashboard' ? 'Connectez-vous pour accéder à ce profil' : 'Bienvenue sur Afrodite'}
          </p>
        </div>

        {/* Protected profile banner */}
        {redirect !== '/dashboard' && redirect.startsWith('/profiles/') && (
          <div className="mb-4 bg-brand-500/10 border border-brand-500/20 rounded-xl p-4 flex gap-3">
            <span className="text-brand-400 text-lg shrink-0">🔒</span>
            <p className="text-sm text-brand-300/80">
              Les détails des profils sont réservés aux membres. Connectez-vous ou créez un compte gratuit.
            </p>
          </div>
        )}

        {/* Unverified email alert */}
        {unverified && (
          <div className="mb-4 bg-amber-500/10 border border-amber-500/20 rounded-xl p-4">
            <div className="flex gap-3">
              <AlertCircle size={16} className="text-amber-400 shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-amber-300 mb-1">Email non confirmé</p>
                <p className="text-xs text-amber-400/60 mb-3">Confirmez votre email avant de vous connecter.</p>
                {resent ? (
                  <p className="text-xs text-emerald-400 font-medium">✅ Email renvoyé !</p>
                ) : (
                  <button onClick={handleResend} disabled={resending}
                    className="text-xs font-semibold text-amber-400 underline underline-offset-2 hover:text-amber-300 disabled:opacity-50 transition-colors">
                    {resending ? 'Envoi…' : 'Renvoyer le lien de confirmation'}
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Form card */}
        <div className="bg-[#141414] border border-white/10 rounded-2xl p-8">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-white/35 mb-1.5 uppercase tracking-wider">
                Email ou téléphone
              </label>
              <div className="relative">
                <Mail size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/25 pointer-events-none" />
                <input
                  type="text"
                  className="input pl-10"
                  placeholder="votre@email.com"
                  value={form.email}
                  onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                  required
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-medium text-white/35 uppercase tracking-wider">Mot de passe</label>
                <Link href="/auth/forgot-password" className="text-xs text-brand-400 hover:text-brand-300 transition-colors">
                  Oublié ?
                </Link>
              </div>
              <div className="relative">
                <Lock size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/25 pointer-events-none" />
                <input
                  type="password"
                  className="input pl-10"
                  placeholder="••••••••"
                  value={form.password}
                  onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full py-3 flex items-center justify-center gap-2 disabled:opacity-50 mt-2">
              {loading ? (
                <><Loader size={14} className="animate-spin" /> Connexion…</>
              ) : (
                'Se connecter'
              )}
            </button>
          </form>

          <div className="relative my-5">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-white/8" />
            </div>
            <div className="relative flex justify-center">
              <span className="bg-[#141414] px-3 text-xs text-white/20">ou</span>
            </div>
          </div>

          <p className="text-center text-sm text-white/30">
            Pas encore de compte ?{' '}
            <Link
              href={`/auth/register${redirect !== '/dashboard' ? `?redirect=${redirect}` : ''}`}
              className="text-brand-400 font-semibold hover:text-brand-300 transition-colors">
              S'inscrire gratuitement
            </Link>
          </p>
        </div>

        <p className="text-center text-xs text-white/15 mt-5">
          En continuant, vous acceptez nos{' '}
          <Link href="/legal/cgu" className="hover:text-white/35 transition-colors underline">CGU</Link>
          {' '}et notre{' '}
          <Link href="/legal/confidentialite" className="hover:text-white/35 transition-colors underline">
            politique de confidentialité
          </Link>
        </p>
      </div>
    </div>
  );
}
