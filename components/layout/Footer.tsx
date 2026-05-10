import Link from 'next/link';
import { MapPin, Mail, Shield } from 'lucide-react';

const LINKS = {
  Plateforme: [
    { label: 'Parcourir les profils', href: '/profiles' },
    { label: 'Tarifs & Abonnements', href: '/tarifs' },
    { label: 'Créer mon profil', href: '/auth/register' },
    { label: 'Se connecter', href: '/auth/login' },
  ],
  Villes: [
    { label: 'Cotonou', href: '/profiles?city=Cotonou' },
    { label: 'Lomé', href: '/profiles?city=Lomé' },
    { label: 'Abidjan', href: '/profiles?city=Abidjan' },
    { label: 'Dakar', href: '/profiles?city=Dakar' },
    { label: 'Accra', href: '/profiles?city=Accra' },
    { label: 'Lagos', href: '/profiles?city=Lagos' },
  ],
  Légal: [
    { label: 'Contact & Support', href: '/contact' },
    { label: 'Conditions Générales d\'Utilisation', href: '/legal/cgu' },
    { label: 'Mentions légales', href: '/legal/mentions' },
    { label: 'Politique de confidentialité', href: '/legal/confidentialite' },
    { label: 'Cookies', href: '/legal/cookies' },
  ],
};

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="bg-[#0d0810] text-white/70 mt-20">
      {/* Top band */}
      <div className="border-b border-white/10">
        <div className="max-w-7xl mx-auto px-6 py-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">

          {/* Brand */}
          <div>
            <Link href="/" className="font-display text-2xl font-bold text-white mb-3 block">
              Afrodite
            </Link>
            <p className="text-sm leading-relaxed text-white/50 mb-5">
              La plateforme de référence pour découvrir des profils vérifiés en Afrique de l'Ouest.
            </p>
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2 text-white/50">
                <MapPin size={14} className="text-brand-400 shrink-0" />
                Cotonou, Bénin
              </div>
              <div className="flex items-center gap-2 text-white/50">
                <Mail size={14} className="text-brand-400 shrink-0" />
                contact@afrodite.com
              </div>
              <div className="flex items-center gap-2 text-white/50">
                <Shield size={14} className="text-brand-400 shrink-0" />
                Profils vérifiés manuellement
              </div>
            </div>
          </div>

          {/* Links */}
          {Object.entries(LINKS).map(([title, items]) => (
            <div key={title}>
              <h4 className="text-white font-semibold text-sm mb-4 tracking-wide">{title}</h4>
              <ul className="space-y-2.5">
                {items.map(item => (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className="text-sm text-white/50 hover:text-white transition-colors duration-200"
                    >
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom bar */}
      <div className="max-w-7xl mx-auto px-6 py-5 flex flex-col md:flex-row items-center justify-between gap-3 text-xs text-white/30">
        <p>© {year} Afrodite — Tous droits réservés.</p>
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
            Plateforme opérationnelle
          </span>
          <span>·</span>
          <span>Ce site est réservé aux personnes majeures (+18 ans)</span>
        </div>
      </div>
    </footer>
  );
}
