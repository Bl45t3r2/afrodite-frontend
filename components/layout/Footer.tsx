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
    { label: 'CGU', href: '/legal/cgu' },
    { label: 'Mentions légales', href: '/legal/mentions' },
    { label: 'Confidentialité', href: '/legal/confidentialite' },
    { label: 'Cookies', href: '/legal/cookies' },
  ],
};

export default function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer className="bg-[#0d0810] text-white/70 mt-20">
      <div className="border-b border-white/10">
        <div className="max-w-7xl mx-auto px-5 py-8 md:py-12">
          {/* Brand */}
          <div className="mb-7 pb-7 border-b border-white/8">
            <Link href="/" className="font-display text-2xl font-bold text-white mb-2 block">
              Afrodite
            </Link>
            <p className="text-sm leading-relaxed text-white/50 mb-4 max-w-sm">
              La plateforme de référence pour des profils vérifiés en Afrique de l&apos;Ouest.
            </p>
            <div className="flex flex-wrap gap-x-5 gap-y-2 text-sm">
              <div className="flex items-center gap-1.5 text-white/50">
                <MapPin size={13} className="text-brand-400 shrink-0" />
                Cotonou, Bénin
              </div>
              <div className="flex items-center gap-1.5 text-white/50">
                <Mail size={13} className="text-brand-400 shrink-0" />
                contact@afrodite.com
              </div>
              <div className="flex items-center gap-1.5 text-white/50">
                <Shield size={13} className="text-brand-400 shrink-0" />
                Profils vérifiés manuellement
              </div>
            </div>
          </div>
          {/* Links 2 cols mobile, 3 cols desktop */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
            {Object.entries(LINKS).map(([title, items]) => (
              <div key={title}>
                <h4 className="text-white font-semibold text-xs mb-3 tracking-widest uppercase opacity-70">{title}</h4>
                <ul className="space-y-2">
                  {items.map(item => (
                    <li key={item.href}>
                      <Link href={item.href} className="text-sm text-white/45 hover:text-white transition-colors duration-200 leading-relaxed">
                        {item.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </div>
      {/* Bottom */}
      <div className="max-w-7xl mx-auto px-5 py-4 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-white/30">
        <p>© {year} Afrodite — Tous droits réservés.</p>
        <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-4">
          <span className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
            Plateforme opérationnelle
          </span>
          <span className="hidden sm:inline">·</span>
          <span>Réservé aux +18 ans</span>
        </div>
      </div>
    </footer>
  );
}
