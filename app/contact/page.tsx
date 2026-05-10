'use client';
import { useState } from 'react';
import Link from 'next/link';
import { Mail, MessageCircle, Phone, MapPin, ChevronLeft, Send, CheckCircle, Loader, HelpCircle, Shield, CreditCard } from 'lucide-react';
import toast from 'react-hot-toast';

const TOPICS = [
  { value: 'account', label: '👤 Problème de compte', icon: Shield },
  { value: 'payment', label: '💳 Question sur l\'abonnement', icon: CreditCard },
  { value: 'report', label: '🚨 Signaler un profil', icon: Shield },
  { value: 'technical', label: '🔧 Problème technique', icon: HelpCircle },
  { value: 'other', label: '💬 Autre question', icon: MessageCircle },
];

const FAQ = [
  {
    q: 'Comment vérifier mon profil ?',
    a: 'Soumettez votre profil via le dashboard. Notre équipe l\'examine sous 24h et vous envoie une notification dès qu\'il est approuvé.',
  },
  {
    q: 'Comment annuler mon abonnement ?',
    a: 'Rendez-vous dans votre dashboard → Abonnement → Annuler. Vous gardez l\'accès Premium jusqu\'à la fin de la période payée.',
  },
  {
    q: 'Mes photos sont-elles visibles par tous ?',
    a: 'Seules les photos que vous marquez comme publiques sont visibles. Vous pouvez aussi définir des photos privées accessibles uniquement sur demande.',
  },
  {
    q: 'Comment supprimer mon compte ?',
    a: 'Contactez-nous via ce formulaire avec l\'objet "Suppression de compte". Nous traitons la demande sous 48h.',
  },
  {
    q: 'Puis-je changer mon email ou téléphone ?',
    a: 'Oui, depuis le dashboard → Profil → Modifier. Un email de vérification sera envoyé à la nouvelle adresse.',
  },
];

export default function ContactPage() {
  const [form, setForm] = useState({ name: '', email: '', topic: '', message: '' });
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.topic || !form.message) {
      toast.error('Remplissez tous les champs'); return;
    }
    setLoading(true);
    // Simuler l'envoi (à connecter à un vrai service email)
    await new Promise(r => setTimeout(r, 1500));
    setSent(true);
    setLoading(false);
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-12">
      <Link href="/" className="inline-flex items-center gap-1.5 text-sm text-gray-400 hover:text-gray-700 mb-8 transition-colors">
        <ChevronLeft size={15} /> Retour à l'accueil
      </Link>

      <div className="text-center mb-12">
        <span className="text-brand-400 text-sm font-semibold tracking-widest uppercase mb-3 block">Support</span>
        <h1 className="font-display text-4xl font-bold text-gray-900 mb-4">Comment pouvons-nous vous aider ?</h1>
        <p className="text-gray-500 max-w-xl mx-auto">Notre équipe répond sous 24h en semaine. Pour les urgences, utilisez WhatsApp.</p>
      </div>

      <div className="grid lg:grid-cols-3 gap-8 mb-16">
        {/* Infos contact */}
        <div className="space-y-4">
          {[
            { icon: Mail, title: 'Email', value: 'contact@afrodite.com', sub: 'Réponse sous 24h', href: 'mailto:contact@afrodite.com' },
            { icon: Phone, title: 'WhatsApp', value: '+229 01 23 45 67', sub: 'Lun–Sam, 8h–20h', href: 'https://wa.me/22901234567' },
            { icon: MapPin, title: 'Adresse', value: 'Cotonou, Bénin', sub: 'Afrique de l\'Ouest', href: null },
          ].map(({ icon: Icon, title, value, sub, href }) => (
            <div key={title} className="card p-5 flex items-start gap-4">
              <div className="w-10 h-10 bg-brand-50 rounded-xl flex items-center justify-center shrink-0">
                <Icon size={18} className="text-brand-400" />
              </div>
              <div>
                <p className="font-semibold text-gray-900 text-sm">{title}</p>
                {href ? (
                  <a href={href} target="_blank" className="text-brand-400 hover:underline text-sm">{value}</a>
                ) : (
                  <p className="text-gray-600 text-sm">{value}</p>
                )}
                <p className="text-gray-400 text-xs mt-0.5">{sub}</p>
              </div>
            </div>
          ))}

          {/* Temps de réponse */}
          <div className="card p-5 bg-emerald-50 border-emerald-100">
            <div className="flex items-center gap-2 mb-2">
              <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
              <p className="font-semibold text-emerald-800 text-sm">Support actif</p>
            </div>
            <p className="text-emerald-700 text-xs leading-relaxed">Temps de réponse moyen : <strong>3 heures</strong> en semaine</p>
          </div>
        </div>

        {/* Formulaire */}
        <div className="lg:col-span-2">
          {sent ? (
            <div className="card p-12 text-center">
              <div className="w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-5">
                <CheckCircle size={30} className="text-emerald-500" />
              </div>
              <h2 className="font-display text-2xl font-bold text-gray-900 mb-2">Message envoyé !</h2>
              <p className="text-gray-500 mb-6">Nous avons bien reçu votre message et vous répondrons dans les plus brefs délais à <strong>{form.email}</strong>.</p>
              <button onClick={() => { setSent(false); setForm({ name: '', email: '', topic: '', message: '' }); }}
                className="btn-outline text-sm">Envoyer un autre message</button>
            </div>
          ) : (
            <div className="card p-8">
              <h2 className="font-semibold text-gray-900 text-lg mb-6">Envoyer un message</h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1.5">Nom complet</label>
                    <input className="input" placeholder="Votre prénom et nom" value={form.name}
                      onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1.5">Email</label>
                    <input className="input" type="email" placeholder="votre@email.com" value={form.email}
                      onChange={e => setForm(f => ({ ...f, email: e.target.value }))} />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-2">Sujet</label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                    {TOPICS.map(t => (
                      <button key={t.value} type="button" onClick={() => setForm(f => ({ ...f, topic: t.value }))}
                        className={`text-left px-3 py-2.5 rounded-xl border text-xs font-medium transition-all ${form.topic === t.value ? 'border-brand-400 bg-brand-50 text-brand-700' : 'border-gray-200 text-gray-600 hover:border-brand-200'}`}>
                        {t.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1.5">Message</label>
                  <textarea className="input resize-none" rows={5}
                    placeholder="Décrivez votre problème ou question en détail..."
                    value={form.message} onChange={e => setForm(f => ({ ...f, message: e.target.value }))} />
                  <p className="text-xs text-gray-400 mt-1">{form.message.length}/1000 caractères</p>
                </div>

                <button type="submit" disabled={loading}
                  className="btn-primary w-full py-3 flex items-center justify-center gap-2 disabled:opacity-60">
                  {loading ? <><Loader size={15} className="animate-spin" /> Envoi…</> : <><Send size={15} /> Envoyer le message</>}
                </button>
              </form>
            </div>
          )}
        </div>
      </div>

      {/* FAQ */}
      <div>
        <h2 className="font-display text-2xl font-bold text-gray-900 text-center mb-8">Questions fréquentes</h2>
        <div className="max-w-2xl mx-auto space-y-3">
          {FAQ.map((item, i) => (
            <div key={i} className="card overflow-hidden">
              <button onClick={() => setOpenFaq(openFaq === i ? null : i)}
                className="w-full flex items-center justify-between px-6 py-4 text-left hover:bg-gray-50 transition-colors">
                <span className="font-medium text-gray-900 text-sm">{item.q}</span>
                <span className={`text-brand-400 text-lg font-light transition-transform ${openFaq === i ? 'rotate-45' : ''}`}>+</span>
              </button>
              {openFaq === i && (
                <div className="px-6 pb-4">
                  <p className="text-sm text-gray-600 leading-relaxed">{item.a}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
